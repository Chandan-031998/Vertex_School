const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const path = require("path");

const env = require("./config/env");
const routes = require("./routes");
const errorHandler = require("./middleware/errorHandler");
const tenantResolver = require("./middleware/tenant");

const app = express();

/**
 * ✅ Read CORS from either CORS_ORIGIN or CORS_ORIGINS (to avoid env naming mistakes)
 * Value must be comma-separated:
 *   CORS_ORIGIN=https://schoolerp.vertexsoftware.in,http://localhost:5173
 */
const originsRaw = String(env.CORS_ORIGIN || process.env.CORS_ORIGINS || "");

const configuredOrigins = originsRaw
  .split(",")
  .map((v) => v.trim())
  .filter(Boolean);

function normalizeOrigin(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

function wildcardToRegex(pattern) {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  return new RegExp(`^${escaped}$`);
}

function matchesConfiguredOrigin(origin) {
  const normalizedOrigin = normalizeOrigin(origin);
  return configuredOrigins.some((allowed) => {
    const normalizedAllowed = normalizeOrigin(allowed);
    if (!normalizedAllowed) return false;

    if (normalizedAllowed === normalizedOrigin) return true;

    // support wildcard patterns like https://*.vertexsoftware.in
    if (normalizedAllowed.includes("*")) {
      return wildcardToRegex(normalizedAllowed).test(normalizedOrigin);
    }

    return false;
  });
}

function isAllowedOrigin(origin) {
  // allow curl/postman/mobile apps
  if (!origin) return true;

  // allow configured origins
  if (matchesConfiguredOrigin(origin)) return true;

  // optional: allow Vercel preview domains
  const normalized = normalizeOrigin(origin);
  if (/^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/.test(normalized)) return true;

  return false;
}

// ✅ Single cors options used for both normal + preflight
const corsOptions = {
  origin: (origin, cb) => {
    if (isAllowedOrigin(origin)) return cb(null, true);
    return cb(null, false); // IMPORTANT: don't throw error for preflight
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Tenant-Id"],
  optionsSuccessStatus: 204,
};

app.use(helmet());

// ✅ CORS MUST be before routes
app.use(cors(corsOptions));

// ✅ Respond to preflight
app.options("*", cors(corsOptions));

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use(rateLimit({ windowMs: 60 * 1000, max: 300 }));
app.use(tenantResolver);

// Health endpoints
app.get("/health", (req, res) => res.json({ ok: true }));
app.get("/api/health", (req, res) => res.json({ ok: true }));

// Serve uploads
app.use("/uploads", express.static(path.join(process.cwd(), env.UPLOAD_DIR || "uploads")));

// API routes
app.use("/api", routes);

// Error handler
app.use(errorHandler);

module.exports = app;