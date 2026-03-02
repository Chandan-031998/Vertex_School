const { body } = require("express-validator");

const putBrandingRules = [
  body("logo_url").optional({ nullable: true }).isString(),
  body("favicon_url").optional({ nullable: true }).isString(),
  body("primary_color").optional({ nullable: true }).isString(),
  body("secondary_color").optional({ nullable: true }).isString(),
  body("font_family").optional({ nullable: true }).isString(),
  body("product_name").optional({ nullable: true }).isString()
];

const putSchoolRules = [
  body("school_name").optional({ nullable: true }).isString(),
  body("address").optional({ nullable: true }).isString(),
  body("phone").optional({ nullable: true }).isString(),
  body("email").optional({ nullable: true }).isString(),
  body("website").optional({ nullable: true }).isString(),
  body("principal_name").optional({ nullable: true }).isString()
];

const putFeaturesRules = [
  body("features").exists().withMessage("features is required")
];

const putAiRules = [
  body("enabled").optional().isBoolean(),
  body("provider").optional({ nullable: true }).isString(),
  body("model").optional({ nullable: true }).isString(),
  body("quota_json").optional().isObject()
];

module.exports = { putBrandingRules, putSchoolRules, putFeaturesRules, putAiRules };
