const bcrypt = require("bcryptjs");

function isBcryptHash(value) {
  return typeof value === "string" && value.startsWith("$2");
}

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Supports:
 * - bcrypt hashes
 * - plaintext stored in DB (not recommended, but allowed as per request)
 */
async function verifyPassword(password, stored) {
  if (!stored) return false;

  if (isBcryptHash(stored)) {
    return bcrypt.compare(password, stored);
  }

  // Plaintext fallback
  return password === stored;
}

module.exports = { hashPassword, verifyPassword };
