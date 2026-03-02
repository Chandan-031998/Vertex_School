const { FeatureFlag } = require("../models");
const { forbidden } = require("../utils/response");
const { FEATURE_FLAGS } = require("../config/constants");

const fallbackDefaults = {
  [FEATURE_FLAGS.NOTIFICATIONS]: true,
  [FEATURE_FLAGS.AI_ASSISTANT]: false
};

function requireFeature(key) {
  return async (req, res, next) => {
    try {
      const tenantId = req.tenant?.id || 1;
      const row = await FeatureFlag.findOne({ where: { tenant_id: tenantId, key } });
      const enabled = row ? !!row.enabled : !!fallbackDefaults[key];
      if (!enabled) return forbidden(res, `Feature '${key}' is disabled for this tenant`);
      return next();
    } catch (err) {
      const enabled = !!fallbackDefaults[key];
      if (!enabled) return forbidden(res, `Feature '${key}' is disabled for this tenant`);
      return next();
    }
  };
}

module.exports = { requireFeature };
