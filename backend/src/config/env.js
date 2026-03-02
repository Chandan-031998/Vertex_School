const dotenv = require("dotenv");
dotenv.config();

function required(name, fallback) {
  const v = process.env[name] ?? fallback;
  if (v === undefined || v === null || v === "") {
    throw new Error(`Missing env: ${name}`);
  }
  return v;
}

module.exports = {
  PORT: Number(process.env.PORT || 4000),
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",
  JWT_SECRET: required("JWT_SECRET", "replace_me"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  DB_HOST: required("DB_HOST", "localhost"),
  DB_PORT: Number(process.env.DB_PORT || 3306),
  DB_NAME: required("DB_NAME", "vertex_school_manager"),
  DB_USER: required("DB_USER", "root"),
  DB_PASSWORD: required("DB_PASSWORD", ""),
  DB_SYNC: String(process.env.DB_SYNC || "true") === "true",
  UPLOAD_DIR: process.env.UPLOAD_DIR || "uploads",
  SMTP: {
    HOST: process.env.SMTP_HOST || "",
    PORT: Number(process.env.SMTP_PORT || 587),
    USER: process.env.SMTP_USER || "",
    PASS: process.env.SMTP_PASS || "",
    FROM: process.env.SMTP_FROM || "Vertex School <no-reply@vertexschool.local>",
  },
  SEED: {
    ADMIN_EMAIL: process.env.SEED_ADMIN_EMAIL || "admin@vertexschool.local",
    ADMIN_PASSWORD: process.env.SEED_ADMIN_PASSWORD || "Admin@12345",
    TEACHER_EMAIL: process.env.SEED_TEACHER_EMAIL || "teacher@vertexschool.local",
    TEACHER_PASSWORD: process.env.SEED_TEACHER_PASSWORD || "Teacher@12345",
    ACCOUNTANT_EMAIL: process.env.SEED_ACCOUNTANT_EMAIL || "accountant@vertexschool.local",
    ACCOUNTANT_PASSWORD: process.env.SEED_ACCOUNTANT_PASSWORD || "Accountant@12345",
  }
};
