const { TenantSetting, FeatureFlag, AiSetting } = require("../models");
const { FEATURE_FLAGS } = require("../config/constants");

const BRANDING_CATEGORY = "branding";
const SCHOOL_CATEGORY = "school_profile";

const defaultBranding = {
  logo_url: null,
  favicon_url: null,
  primary_color: "#2563eb",
  secondary_color: "#0f172a",
  font_family: "system-ui",
  product_name: "Vertex School Manager"
};

const defaultSchool = {
  school_name: "Vertex School",
  address: null,
  phone: null,
  email: null,
  website: null,
  principal_name: null
};

const defaultFeatures = {
  [FEATURE_FLAGS.AI_ASSISTANT]: false,
  [FEATURE_FLAGS.AI_INSIGHTS]: false,
  [FEATURE_FLAGS.AI_FEES_PREDICT]: false,
  [FEATURE_FLAGS.AI_OCR]: false,
  [FEATURE_FLAGS.AI_REPORTS]: false,
  [FEATURE_FLAGS.AI_TIMETABLE]: false,
  [FEATURE_FLAGS.AI_MESSAGING]: false,
  [FEATURE_FLAGS.NOTIFICATIONS]: true
};

const defaultAi = {
  enabled: false,
  provider: null,
  model: null,
  quota_json: {}
};

async function getBranding(tenantId) {
  const row = await TenantSetting.findOne({ where: { tenant_id: tenantId, category: BRANDING_CATEGORY } });
  return { ...defaultBranding, ...(row?.settings_json || {}) };
}

async function putBranding(tenantId, payload) {
  const current = await getBranding(tenantId);
  const merged = { ...current, ...payload };
  await TenantSetting.upsert({ tenant_id: tenantId, category: BRANDING_CATEGORY, settings_json: merged });
  return merged;
}

async function getSchoolProfile(tenantId) {
  const row = await TenantSetting.findOne({ where: { tenant_id: tenantId, category: SCHOOL_CATEGORY } });
  return { ...defaultSchool, ...(row?.settings_json || {}) };
}

async function putSchoolProfile(tenantId, payload) {
  const current = await getSchoolProfile(tenantId);
  const merged = { ...current, ...payload };
  await TenantSetting.upsert({ tenant_id: tenantId, category: SCHOOL_CATEGORY, settings_json: merged });
  return merged;
}

async function ensureDefaultFeatureRows(tenantId) {
  const keys = Object.keys(defaultFeatures);
  for (const key of keys) {
    await FeatureFlag.findOrCreate({
      where: { tenant_id: tenantId, key },
      defaults: { tenant_id: tenantId, key, enabled: defaultFeatures[key] }
    });
  }
}

async function getFeatures(tenantId) {
  await ensureDefaultFeatureRows(tenantId);
  const rows = await FeatureFlag.findAll({ where: { tenant_id: tenantId }, order: [["key", "ASC"]] });
  const features = {};
  for (const row of rows) features[row.key] = !!row.enabled;
  return features;
}

function normalizeFeaturesPayload(body) {
  if (body && typeof body.features === "object" && !Array.isArray(body.features)) {
    return body.features;
  }
  if (Array.isArray(body?.features)) {
    const next = {};
    for (const item of body.features) {
      if (!item || typeof item !== "object") continue;
      if (!item.key) continue;
      next[String(item.key)] = !!item.enabled;
    }
    return next;
  }
  return null;
}

async function putFeatures(tenantId, body) {
  const normalized = normalizeFeaturesPayload(body);
  if (!normalized) return null;

  for (const [key, enabled] of Object.entries(normalized)) {
    await FeatureFlag.upsert({ tenant_id: tenantId, key, enabled: !!enabled });
  }

  if (Object.prototype.hasOwnProperty.call(normalized, FEATURE_FLAGS.AI_ASSISTANT)) {
    const ai = await AiSetting.findOne({ where: { tenant_id: tenantId } });
    if (!ai) {
      await AiSetting.create({ tenant_id: tenantId, enabled: !!normalized[FEATURE_FLAGS.AI_ASSISTANT] });
    } else {
      ai.enabled = !!normalized[FEATURE_FLAGS.AI_ASSISTANT];
      await ai.save();
    }
  }

  return getFeatures(tenantId);
}

async function getAi(tenantId) {
  const row = await AiSetting.findOne({ where: { tenant_id: tenantId } });
  return row ? row.toJSON() : { ...defaultAi, tenant_id: tenantId };
}

async function putAi(tenantId, payload) {
  const current = await getAi(tenantId);
  const merged = {
    ...current,
    ...payload,
    quota_json: typeof payload.quota_json === "object" && payload.quota_json !== null
      ? payload.quota_json
      : current.quota_json
  };

  await AiSetting.upsert({
    tenant_id: tenantId,
    enabled: !!merged.enabled,
    provider: merged.provider || null,
    model: merged.model || null,
    quota_json: merged.quota_json || {}
  });

  await FeatureFlag.upsert({
    tenant_id: tenantId,
    key: FEATURE_FLAGS.AI_ASSISTANT,
    enabled: !!merged.enabled
  });

  return getAi(tenantId);
}

module.exports = {
  getBranding,
  putBranding,
  getSchoolProfile,
  putSchoolProfile,
  getFeatures,
  putFeatures,
  getAi,
  putAi
};
