const express = require("express");
const validate = require("../middleware/validate");
const { loginRules } = require("../validators/auth.validators");
const { login, me } = require("../controllers/auth.controller");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/login", loginRules, validate, login);
router.get("/me", auth, me);

module.exports = router;
