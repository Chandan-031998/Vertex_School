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

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use(rateLimit({ windowMs: 60 * 1000, max: 300 }));
app.use(tenantResolver);

app.get("/health", (req, res) => res.json({ ok: true }));

// Serve uploads
app.use("/uploads", express.static(path.join(process.cwd(), env.UPLOAD_DIR)));

app.use("/api", routes);

app.use(errorHandler);

module.exports = app;
