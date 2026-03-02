const { body } = require("express-validator");

const loginRules = [
  body("email").isEmail().withMessage("Valid email required"),
  body("password").isString().isLength({ min: 6 }).withMessage("Password min 6 chars")
];

module.exports = { loginRules };
