const multer = require("multer");
const path = require("path");
const fs = require("fs");
const os = require("os");
const env = require("../config/env");

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }

function uploadRoot() {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join(os.tmpdir(), env.UPLOAD_DIR);
  }
  return path.join(process.cwd(), env.UPLOAD_DIR);
}

function makeUploader(subdir) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dest = path.join(uploadRoot(), subdir);
      try {
        ensureDir(dest);
        cb(null, dest);
      } catch (err) {
        cb(err);
      }
    },
    filename: (req, file, cb) => {
      const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
      cb(null, Date.now() + "_" + safe);
    }
  });
  return multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });
}

module.exports = { makeUploader };
