const multer = require("multer");
const path = require("path");
const fs = require("fs");
const env = require("../config/env");

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }

function makeUploader(subdir) {
  const dest = path.join(process.cwd(), env.UPLOAD_DIR, subdir);
  ensureDir(dest);
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, dest),
    filename: (req, file, cb) => {
      const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
      cb(null, Date.now() + "_" + safe);
    }
  });
  return multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });
}

module.exports = { makeUploader };
