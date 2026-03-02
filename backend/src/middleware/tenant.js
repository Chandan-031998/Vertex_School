const { Tenant } = require("../models");

function getSubdomain(host = "") {
  const value = String(host || "").split(":")[0];
  const parts = value.split(".").filter(Boolean);
  if (parts.length < 3) return null;
  return parts[0];
}

module.exports = async function tenantResolver(req, res, next) {
  try {
    const headerTenantId = Number(req.headers["x-tenant-id"]);
    const host = req.headers.host || "";
    const subdomain = getSubdomain(host);

    let tenant = null;
    if (Number.isInteger(headerTenantId) && headerTenantId > 0) {
      tenant = await Tenant.findOne({ where: { id: headerTenantId, status: "ACTIVE" } });
    }

    if (!tenant && subdomain) {
      tenant = await Tenant.findOne({ where: { slug: subdomain, status: "ACTIVE" } });
    }

    if (!tenant) {
      tenant = await Tenant.findOne({ where: { id: 1 } });
    }

    if (!tenant) {
      tenant = await Tenant.findOne({ where: { status: "ACTIVE" }, order: [["id", "ASC"]] });
    }

    if (!tenant) {
      tenant = await Tenant.create({ id: 1, name: "Default Tenant", slug: "default", status: "ACTIVE" });
    }

    req.tenant = { id: tenant.id, name: tenant.name, slug: tenant.slug, status: tenant.status };
    return next();
  } catch (err) {
    // Keep auth and existing endpoints functional even if tenant tables are not ready.
    req.tenant = { id: 1, name: "Default Tenant", slug: "default", status: "ACTIVE" };
    return next();
  }
};
