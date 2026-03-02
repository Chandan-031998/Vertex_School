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

// ✅ Read both env names (prevents mistakes on Render)
const originsRaw = String(
  env.CORS_ORIGIN ||
    process.env.CORS_ORIGIN ||
    env.CORS_ORIGINS ||
    process.env.CORS_ORIGINS ||
    ""
);

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

    // allow wildcard patterns like https://*.vertexsoftware.in
    if (normalizedAllowed.includes("*")) {
      return wildcardToRegex(normalizedAllowed).test(normalizedOrigin);
    }

    return false;
  });
}

function isAllowedOrigin(origin) {
  if (!origin) return true; // curl/postman/mobile apps

  const normalized = normalizeOrigin(origin);

  // ✅ Allow configured origins from env
  if (matchesConfiguredOrigin(normalized)) return true;

  // ✅ Allow your whole domain family (fixes your issue even if env is wrong)
  try {
    const host = new URL(normalized).hostname;
    if (host === "vertexsoftware.in" || host.endsWith(".vertexsoftware.in")) return true;
  } catch {}

  // ✅ optional: allow Vercel preview domains
  if (/^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/.test(normalized)) return true;

  return false;
}

// ✅ Use ONE corsOptions for both normal + preflight
const corsOptions = {
  origin: (origin, cb) => {
    if (isAllowedOrigin(origin)) return cb(null, true);
    // IMPORTANT: do NOT throw Error() here; it breaks preflight
    return cb(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Tenant-Id"],
  optionsSuccessStatus: 204,
};

app.use(helmet());

// ✅ CORS must be before routes
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use(rateLimit({ windowMs: 60 * 1000, max: 300 }));
app.use(tenantResolver);

app.get("/health", (req, res) => res.json({ ok: true }));
app.get("/api/health", (req, res) => res.json({ ok: true }));

// Serve uploads
app.use("/uploads", express.static(path.join(process.cwd(), env.UPLOAD_DIR)));

app.use("/api", routes);

app.use(errorHandler);

module.exports = app;