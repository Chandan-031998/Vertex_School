const { bad, ok } = require("../utils/response");
const settingsService = require("../services/settings.service");

async function getBranding(req, res) {
  const data = await settingsService.getBranding(req.tenant.id);
  return ok(res, data);
}

async function putBranding(req, res) {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return bad(res, "Invalid payload. Expected branding settings object.");
  }
  const data = await settingsService.putBranding(req.tenant.id, req.body);
  return ok(res, data, "Branding settings updated");
}

async function getFeatures(req, res) {
  const data = await settingsService.getFeatures(req.tenant.id);
  return ok(res, { features: data });
}

async function getSchool(req, res) {
  const data = await settingsService.getSchoolProfile(req.tenant.id);
  return ok(res, data);
}

async function putSchool(req, res) {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return bad(res, "Invalid payload. Expected school profile object.");
  }
  const data = await settingsService.putSchoolProfile(req.tenant.id, req.body);
  return ok(res, data, "School profile updated");
}

async function putFeatures(req, res) {
  const data = await settingsService.putFeatures(req.tenant.id, req.body || {});
  if (!data) return bad(res, "Invalid payload. Use { features: { KEY: true|false } } or array form.");
  return ok(res, { features: data }, "Feature flags updated");
}

async function getAi(req, res) {
  const data = await settingsService.getAi(req.tenant.id);
  return ok(res, data);
}

async function putAi(req, res) {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return bad(res, "Invalid payload. Expected AI settings object.");
  }
  const data = await settingsService.putAi(req.tenant.id, req.body);
  return ok(res, data, "AI settings updated");
}

async function uploadBrandingLogo(req, res) {
  if (!req.file) return bad(res, "Logo file is required");
  const logoUrl = `/uploads/branding/${req.file.filename}`;
  const data = await settingsService.putBranding(req.tenant.id, { logo_url: logoUrl });
  return ok(res, data, "Logo uploaded");
}

module.exports = { getBranding, putBranding, getSchool, putSchool, getFeatures, putFeatures, getAi, putAi, uploadBrandingLogo };
