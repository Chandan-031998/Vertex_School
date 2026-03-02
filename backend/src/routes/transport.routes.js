const express = require("express");
const validate = require("../middleware/validate");
const { requireRole } = require("../middleware/rbac");
const { ROLES } = require("../config/constants");
const {
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
  notifyTransport
} = require("../controllers/transport.controller");
const {
  idParamRule,
  routeIdParamRule,
  stopIdParamRule,
  tripIdParamRule,
  vehicleRules,
  driverRules,
  routeRules,
  stopRules,
  assignmentRules,
  allocationRules,
  tripsStartRules,
  tripsFilterRules,
  studentEventRules,
  requestStatusFilterRules,
  notifyRules
} = require("../validators/transport.validators");

const router = express.Router();
router.use(requireRole([ROLES.ADMIN, ROLES.TRANSPORT_MANAGER]));

router.get("/vehicles", listVehicles);
router.post("/vehicles", vehicleRules, validate, createVehicle);
router.get("/vehicles/:id", idParamRule, validate, getVehicle);
router.put("/vehicles/:id", idParamRule, validate, updateVehicle);
router.delete("/vehicles/:id", idParamRule, validate, deleteVehicle);

router.get("/drivers", listDrivers);
router.post("/drivers", driverRules, validate, createDriver);
router.put("/drivers/:id", idParamRule, validate, updateDriver);
router.delete("/drivers/:id", idParamRule, validate, deleteDriver);

router.get("/routes", listRoutes);
router.post("/routes", routeRules, validate, createRoute);
router.put("/routes/:id", idParamRule, validate, updateRoute);
router.delete("/routes/:id", idParamRule, validate, deleteRoute);

router.post("/routes/:routeId/stops", [...routeIdParamRule, ...stopRules], validate, createRouteStop);
router.put("/stops/:stopId", stopIdParamRule, validate, updateRouteStop);
router.delete("/stops/:stopId", stopIdParamRule, validate, deleteRouteStop);

router.get("/assignments", listAssignments);
router.post("/assignments", assignmentRules, validate, createAssignment);
router.put("/assignments/:id", idParamRule, validate, updateAssignment);
router.delete("/assignments/:id", idParamRule, validate, deleteAssignment);

router.get("/allocations", listAllocations);
router.post("/allocations", allocationRules, validate, createAllocation);
router.put("/allocations/:id", idParamRule, validate, updateAllocation);
router.delete("/allocations/:id", idParamRule, validate, deleteAllocation);

router.post("/trips/start", tripsStartRules, validate, startTrip);
router.post("/trips/:tripId/end", tripIdParamRule, validate, endTrip);
router.get("/trips", tripsFilterRules, validate, listTrips);
router.post("/trips/:tripId/student-event", studentEventRules, validate, upsertTripStudentEvent);

router.get("/requests", requestStatusFilterRules, validate, listRequests);
router.put("/requests/:id/approve", idParamRule, validate, approveRequest);
router.put("/requests/:id/reject", idParamRule, validate, rejectRequest);

router.post("/notify", notifyRules, validate, notifyTransport);

module.exports = router;
