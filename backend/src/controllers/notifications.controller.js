const { Notification } = require("../models");
const { ok, created, bad } = require("../utils/response");
const { sendPendingNotifications } = require("../services/notification.service");

function tenantIdFromReq(req) {
  return Number(req.tenant?.id || 1);
}

async function listNotifications(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const rows = await Notification.findAll({ where: { tenant_id }, order: [["created_at","DESC"]], limit: 200 });
  return ok(res, rows);
}

async function createNotification(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const { student_id, type, title, message, channel, scheduled_at } = req.body;
  const row = await Notification.create({ tenant_id, student_id: student_id || null, type, title, message, channel: channel || "IN_APP", status: "PENDING", scheduled_at: scheduled_at || null });
  return created(res, row, "Notification created");
}

async function runDispatcher(req, res) {
  const result = await sendPendingNotifications(tenantIdFromReq(req));
  return ok(res, result, "Dispatch executed");
}

async function updateNotification(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await Notification.findOne({ where: { id: req.params.id, tenant_id } });
  if (!row) return bad(res, "Not found");

  const patch = {};
  if (req.body.student_id !== undefined) patch.student_id = req.body.student_id || null;
  if (req.body.type) patch.type = req.body.type;
  if (req.body.title) patch.title = req.body.title;
  if (req.body.message) patch.message = req.body.message;
  if (req.body.channel) patch.channel = req.body.channel;
  if (req.body.status) patch.status = req.body.status;
  if (req.body.scheduled_at !== undefined) patch.scheduled_at = req.body.scheduled_at || null;
  if (req.body.sent_at !== undefined) patch.sent_at = req.body.sent_at || null;
  if (req.body.meta !== undefined) patch.meta = req.body.meta;

  await row.update(patch);
  return ok(res, row, "Updated");
}

async function deleteNotification(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await Notification.findOne({ where: { id: req.params.id, tenant_id } });
  if (!row) return bad(res, "Not found");
  await row.destroy();
  return ok(res, null, "Deleted");
}

module.exports = { listNotifications, createNotification, runDispatcher, updateNotification, deleteNotification };
