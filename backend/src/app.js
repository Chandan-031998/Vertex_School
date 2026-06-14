const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const path = require("path");

const env = require("./config/env");
const errorHandler = require("./middleware/errorHandler");

const app = express();

const originsRaw = String(
  env.CORS_ORIGIN ||
    process.env.CORS_ORIGIN ||
    env.CORS_ORIGINS ||
    process.env.CORS_ORIGINS ||
    ""
);

const defaultOrigins = [
  "http://localhost:5173",
  "https://schoolerp.vertexsoftware.in",
  "https://vertex-school-oleu.vercel.app",
];

const configuredOrigins = [
  ...defaultOrigins,
  ...originsRaw.split(","),
]
  .map((v) => String(v).trim().replace(/\/+$/, ""))
  .filter(Boolean);

function isAllowedOrigin(origin) {
  if (!origin) return true;

  const normalized = String(origin).trim().replace(/\/+$/, "");

  if (configuredOrigins.includes(normalized)) return true;

  if (/^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/.test(normalized)) {
    return true;
  }

  return false;
}

const corsOptions = {
  origin: (origin, cb) => {
    if (isAllowedOrigin(origin)) return cb(null, true);
    return cb(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Tenant-Id"],
  optionsSuccessStatus: 204,
};

app.use(helmet());

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use(rateLimit({ windowMs: 60 * 1000, max: 300 }));

app.get("/health", (req, res) => res.json({ ok: true }));
app.get("/api/health", (req, res) => res.json({ ok: true }));

const uploadsRoot = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
  ? path.join(require("os").tmpdir(), env.UPLOAD_DIR)
  : path.join(process.cwd(), env.UPLOAD_DIR);

// Serve uploads
app.use("/uploads", express.static(uploadsRoot));

app.use((req, res, next) => {
  const tenantResolver = require("./middleware/tenant");
  return tenantResolver(req, res, next);
});

app.use("/api", (req, res, next) => {
  try {
    const routes = require("./routes");
    return routes(req, res, next);
  } catch (err) {
    return next(err);
  }
});

app.use(errorHandler);

module.exports = app;
