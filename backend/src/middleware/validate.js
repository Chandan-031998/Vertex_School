const { validationResult } = require("express-validator");
const { bad } = require("../utils/response");

module.exports = function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return bad(res, "Validation failed", errors.array());
  }
  next();
};
