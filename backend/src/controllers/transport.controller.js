const { Op } = require("sequelize");
const {
  Vehicle,
  Driver,
  TransportRoute,
  RouteStop,
  VehicleAssignment,
  StudentTransport,
  TransportTrip,
  TransportStudentEvent,
  TransportRequest,
  Student,
  Notification,
  ParentStudent,
  ActivityLog
} = require("../models");
const { ok, bad } = require("../utils/response");

function tenantIdFromReq(req) {
  return Number(req.tenant?.id || 1);
}

async function log(req, action, entity, entity_id, details) {
  const tenant_id = tenantIdFromReq(req);
  await ActivityLog.create({ tenant_id, user_id: req.user.id, action, entity, entity_id: String(entity_id || ""), details: details || null });
}

async function listVehicles(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const rows = await Vehicle.findAll({ where: { tenant_id }, order: [["created_at", "DESC"]] });
  return ok(res, rows);
}
async function createVehicle(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await Vehicle.create({ tenant_id, ...req.body });
  await log(req, "CREATE", "VEHICLE", row.id, req.body);
  return ok(res, row);
}
async function getVehicle(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await Vehicle.findOne({ where: { tenant_id, id: req.params.id } });
  if (!row) return bad(res, "Vehicle not found");
  return ok(res, row);
}
async function updateVehicle(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await Vehicle.findOne({ where: { tenant_id, id: req.params.id } });
  if (!row) return bad(res, "Vehicle not found");
  await row.update(req.body || {});
  await log(req, "UPDATE", "VEHICLE", row.id, req.body);
  return ok(res, row);
}
async function deleteVehicle(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await Vehicle.findOne({ where: { tenant_id, id: req.params.id } });
  if (!row) return bad(res, "Vehicle not found");
  await row.update({ status: "INACTIVE" });
  await log(req, "DELETE", "VEHICLE", row.id);
  return ok(res, row);
}

async function listDrivers(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const rows = await Driver.findAll({ where: { tenant_id }, order: [["created_at", "DESC"]] });
  return ok(res, rows);
}
async function createDriver(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await Driver.create({ tenant_id, ...req.body });
  await log(req, "CREATE", "DRIVER", row.id, req.body);
  return ok(res, row);
}
async function updateDriver(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await Driver.findOne({ where: { tenant_id, id: req.params.id } });
  if (!row) return bad(res, "Driver not found");
  await row.update(req.body || {});
  await log(req, "UPDATE", "DRIVER", row.id, req.body);
  return ok(res, row);
}
async function deleteDriver(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await Driver.findOne({ where: { tenant_id, id: req.params.id } });
  if (!row) return bad(res, "Driver not found");
  await row.update({ status: "INACTIVE" });
  await log(req, "DELETE", "DRIVER", row.id);
  return ok(res, row);
}

async function listRoutes(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const rows = await TransportRoute.findAll({
    where: { tenant_id },
    include: [{ model: RouteStop, as: "stops" }],
    order: [["created_at", "DESC"], [{ model: RouteStop, as: "stops" }, "stop_order", "ASC"]]
  });
  return ok(res, rows);
}
async function createRoute(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await TransportRoute.create({ tenant_id, ...req.body });
  await log(req, "CREATE", "ROUTE", row.id, req.body);
  return ok(res, row);
}
async function updateRoute(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await TransportRoute.findOne({ where: { tenant_id, id: req.params.id } });
  if (!row) return bad(res, "Route not found");
  await row.update(req.body || {});
  await log(req, "UPDATE", "ROUTE", row.id, req.body);
  return ok(res, row);
}
async function deleteRoute(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await TransportRoute.findOne({ where: { tenant_id, id: req.params.id } });
  if (!row) return bad(res, "Route not found");
  await row.update({ status: "INACTIVE" });
  await log(req, "DELETE", "ROUTE", row.id);
  return ok(res, row);
}

async function createRouteStop(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const route = await TransportRoute.findOne({ where: { tenant_id, id: req.params.routeId } });
  if (!route) return bad(res, "Route not found");
  const row = await RouteStop.create({ tenant_id, route_id: route.id, ...req.body });
  await log(req, "CREATE", "ROUTE_STOP", row.id, req.body);
  return ok(res, row);
}
async function updateRouteStop(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await RouteStop.findOne({ where: { tenant_id, id: req.params.stopId } });
  if (!row) return bad(res, "Stop not found");
  await row.update(req.body || {});
  await log(req, "UPDATE", "ROUTE_STOP", row.id, req.body);
  return ok(res, row);
}
async function deleteRouteStop(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await RouteStop.findOne({ where: { tenant_id, id: req.params.stopId } });
  if (!row) return bad(res, "Stop not found");
  await row.destroy();
  await log(req, "DELETE", "ROUTE_STOP", req.params.stopId);
  return ok(res, { deleted: true });
}

async function listAssignments(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const rows = await VehicleAssignment.findAll({
    where: { tenant_id },
    include: [
      { model: Vehicle, as: "vehicle" },
      { model: TransportRoute, as: "route" },
      { model: Driver, as: "driver" },
      { model: Driver, as: "attendant" }
    ],
    order: [["created_at", "DESC"]]
  });
  return ok(res, rows);
}
async function createAssignment(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await VehicleAssignment.create({ tenant_id, ...req.body, active: true });
  await log(req, "CREATE", "VEHICLE_ASSIGNMENT", row.id, req.body);
  return ok(res, row);
}
async function updateAssignment(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await VehicleAssignment.findOne({ where: { tenant_id, id: req.params.id } });
  if (!row) return bad(res, "Assignment not found");
  await row.update(req.body || {});
  await log(req, "UPDATE", "VEHICLE_ASSIGNMENT", row.id, req.body);
  return ok(res, row);
}
async function deleteAssignment(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await VehicleAssignment.findOne({ where: { tenant_id, id: req.params.id } });
  if (!row) return bad(res, "Assignment not found");
  await row.update({ active: false });
  await log(req, "DELETE", "VEHICLE_ASSIGNMENT", row.id);
  return ok(res, row);
}

async function listAllocations(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const whereStudent = { tenant_id };
  if (req.query.class_name) whereStudent.class_name = req.query.class_name;
  if (req.query.section) whereStudent.section = req.query.section;
  if (req.query.q) {
    whereStudent[Op.or] = [
      { full_name: { [Op.like]: `%${req.query.q}%` } },
      { admission_no: { [Op.like]: `%${req.query.q}%` } }
    ];
  }
  const rows = await StudentTransport.findAll({
    where: { tenant_id },
    include: [
      { model: Student, as: "student", where: whereStudent, required: true },
      { model: TransportRoute, as: "route" },
      { model: RouteStop, as: "stop" },
      { model: Vehicle, as: "vehicle" }
    ],
    order: [["created_at", "DESC"]]
  });
  return ok(res, rows);
}
async function createAllocation(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const [row] = await StudentTransport.findOrCreate({
    where: { tenant_id, student_id: req.body.student_id },
    defaults: { tenant_id, ...req.body }
  });
  if (row && row.student_id === req.body.student_id && row.route_id !== req.body.route_id) {
    await row.update({ ...req.body, status: req.body.status || "ACTIVE" });
  }
  await log(req, "CREATE", "STUDENT_TRANSPORT", row.id, req.body);
  return ok(res, row);
}
async function updateAllocation(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await StudentTransport.findOne({ where: { tenant_id, id: req.params.id } });
  if (!row) return bad(res, "Allocation not found");
  await row.update(req.body || {});
  await log(req, "UPDATE", "STUDENT_TRANSPORT", row.id, req.body);
  return ok(res, row);
}
async function deleteAllocation(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await StudentTransport.findOne({ where: { tenant_id, id: req.params.id } });
  if (!row) return bad(res, "Allocation not found");
  await row.update({ status: "CANCELLED" });
  await log(req, "DELETE", "STUDENT_TRANSPORT", row.id);
  return ok(res, row);
}

async function startTrip(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await TransportTrip.create({
    tenant_id,
    vehicle_id: req.body.vehicle_id,
    route_id: req.body.route_id,
    trip_date: req.body.trip_date,
    trip_type: req.body.trip_type,
    start_time: new Date(),
    status: "RUNNING"
  });
  await log(req, "START_TRIP", "TRANSPORT_TRIP", row.id, req.body);
  return ok(res, row);
}
async function endTrip(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await TransportTrip.findOne({ where: { tenant_id, id: req.params.tripId } });
  if (!row) return bad(res, "Trip not found");
  await row.update({ status: "COMPLETED", end_time: new Date() });
  await log(req, "END_TRIP", "TRANSPORT_TRIP", row.id);
  return ok(res, row);
}
async function listTrips(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const where = { tenant_id };
  if (req.query.trip_date) where.trip_date = req.query.trip_date;
  if (req.query.vehicle_id) where.vehicle_id = Number(req.query.vehicle_id);
  if (req.query.route_id) where.route_id = Number(req.query.route_id);
  const rows = await TransportTrip.findAll({
    where,
    include: [{ model: Vehicle, as: "vehicle" }, { model: TransportRoute, as: "route" }],
    order: [["created_at", "DESC"]]
  });
  return ok(res, rows);
}
async function upsertTripStudentEvent(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const trip = await TransportTrip.findOne({ where: { tenant_id, id: req.params.tripId } });
  if (!trip) return bad(res, "Trip not found");
  const payload = {
    tenant_id,
    trip_id: trip.id,
    student_id: req.body.student_id,
    boarded: !!req.body.boarded,
    dropped: !!req.body.dropped,
    boarded_at: req.body.boarded ? new Date() : null,
    dropped_at: req.body.dropped ? new Date() : null,
    remarks: req.body.remarks || null
  };
  await TransportStudentEvent.upsert(payload);
  await log(req, "UPSERT", "TRANSPORT_STUDENT_EVENT", `${trip.id}:${payload.student_id}`, req.body);
  return ok(res, payload);
}

async function listRequests(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const where = { tenant_id };
  if (req.query.status) where.status = req.query.status;
  const rows = await TransportRequest.findAll({
    where,
    include: [{ model: Student, as: "student", attributes: ["id", "full_name", "class_name", "section"] }],
    order: [["created_at", "DESC"]]
  });
  return ok(res, rows);
}
async function approveRequest(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await TransportRequest.findOne({ where: { tenant_id, id: req.params.id } });
  if (!row) return bad(res, "Request not found");
  if (row.status !== "PENDING") return bad(res, "Only pending request can be approved");

  const allocation = await StudentTransport.findOne({ where: { tenant_id, student_id: row.student_id } });
  if (!allocation) return bad(res, "Student transport allocation not found");
  const payload = row.payload_json || {};
  const patch = {};
  if (row.request_type === "STOP_CHANGE" || row.request_type === "PICKUP_CHANGE" || row.request_type === "DROP_CHANGE") {
    if (payload.stop_id) patch.stop_id = payload.stop_id;
    if (payload.route_id) patch.route_id = payload.route_id;
    if (payload.vehicle_id) patch.vehicle_id = payload.vehicle_id;
  }
  if (row.request_type === "PAUSE_TRANSPORT") patch.status = "PAUSED";
  if (row.request_type === "RESUME_TRANSPORT") patch.status = "ACTIVE";
  await allocation.update(patch);

  await row.update({ status: "APPROVED", admin_note: req.body.admin_note || null });
  await log(req, "APPROVE", "TRANSPORT_REQUEST", row.id, patch);
  return ok(res, row);
}
async function rejectRequest(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const row = await TransportRequest.findOne({ where: { tenant_id, id: req.params.id } });
  if (!row) return bad(res, "Request not found");
  await row.update({ status: "REJECTED", admin_note: req.body.admin_note || null });
  await log(req, "REJECT", "TRANSPORT_REQUEST", row.id, req.body);
  return ok(res, row);
}

async function notifyTransport(req, res) {
  const tenant_id = tenantIdFromReq(req);
  const { target, class_name, section, student_id, route_id, title, message } = req.body;
  const students = [];
  if (target === "STUDENT" && student_id) {
    const s = await Student.findOne({ where: { tenant_id, id: student_id } });
    if (s) students.push(s);
  } else if (target === "CLASS" && class_name && section) {
    const rows = await Student.findAll({ where: { tenant_id, class_name, section, is_active: true } });
    students.push(...rows);
  } else if (target === "ROUTE" && route_id) {
    const allocations = await StudentTransport.findAll({ where: { tenant_id, route_id, status: "ACTIVE" } });
    const ids = allocations.map((a) => a.student_id);
    if (ids.length) {
      const rows = await Student.findAll({ where: { tenant_id, id: { [Op.in]: ids } } });
      students.push(...rows);
    }
  } else {
    return bad(res, "Invalid target payload");
  }

  for (const s of students) {
    await Notification.create({
      tenant_id,
      student_id: s.id,
      type: "GENERAL",
      title,
      message,
      channel: "IN_APP",
      status: "SENT",
      sent_at: new Date(),
      meta: { module: "TRANSPORT", route_id: route_id || null }
    });
  }
  await log(req, "NOTIFY", "TRANSPORT_NOTIFICATION", target, { count: students.length });
  return ok(res, { count: students.length });
}

async function parentStudentIds(tenant_id, parent_user_id) {
  const rows = await ParentStudent.findAll({ where: { tenant_id, parent_user_id }, attributes: ["student_id"] });
  return rows.map((r) => r.student_id);
}

module.exports = {
  listVehicles,
  createVehicle,
  getVehicle,
  updateVehicle,
  deleteVehicle,
  listDrivers,
  createDriver,
  updateDriver,
  deleteDriver,
  listRoutes,
  createRoute,
  updateRoute,
  deleteRoute,
  createRouteStop,
  updateRouteStop,
  deleteRouteStop,
  listAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  listAllocations,
  createAllocation,
  updateAllocation,
  deleteAllocation,
  startTrip,
  endTrip,
  listTrips,
  upsertTripStudentEvent,
  listRequests,
  approveRequest,
  rejectRequest,
  notifyTransport,
  parentStudentIds
};
