const { body, param, query } = require("express-validator");

const idParamRule = [param("id").isInt()];
const routeIdParamRule = [param("routeId").isInt()];
const stopIdParamRule = [param("stopId").isInt()];
const tripIdParamRule = [param("tripId").isInt()];

const vehicleRules = [
  body("bus_no").isString().notEmpty(),
  body("registration_no").isString().notEmpty(),
  body("capacity").isInt({ min: 1 }),
  body("status").optional().isIn(["ACTIVE", "INACTIVE"]),
  body("insurance_expiry").optional({ nullable: true }).isISO8601(),
  body("fitness_expiry").optional({ nullable: true }).isISO8601()
];

const driverRules = [
  body("full_name").isString().notEmpty(),
  body("phone").isString().notEmpty(),
  body("license_no").isString().notEmpty(),
  body("license_expiry").optional({ nullable: true }).isISO8601(),
  body("type").optional().isIn(["DRIVER", "ATTENDANT"]),
  body("status").optional().isIn(["ACTIVE", "INACTIVE"])
];

const routeRules = [
  body("route_name").isString().notEmpty(),
  body("start_point").isString().notEmpty(),
  body("end_point").isString().notEmpty(),
  body("status").optional().isIn(["ACTIVE", "INACTIVE"])
];

const stopRules = [
  body("stop_name").isString().notEmpty(),
  body("pickup_time").optional({ nullable: true }).matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/),
  body("drop_time").optional({ nullable: true }).matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/),
  body("latitude").optional({ nullable: true }).isFloat(),
  body("longitude").optional({ nullable: true }).isFloat(),
  body("stop_order").isInt({ min: 1 })
];

const assignmentRules = [
  body("vehicle_id").isInt(),
  body("route_id").isInt(),
  body("driver_id").isInt(),
  body("attendant_id").optional({ nullable: true }).isInt()
];

const allocationRules = [
  body("student_id").isInt(),
  body("route_id").isInt(),
  body("stop_id").isInt(),
  body("vehicle_id").isInt(),
  body("pickup_enabled").optional().isBoolean(),
  body("drop_enabled").optional().isBoolean(),
  body("monthly_fee").optional({ nullable: true }).isFloat({ min: 0 }),
  body("status").optional().isIn(["ACTIVE", "PAUSED", "CANCELLED"])
];

const tripsStartRules = [
  body("vehicle_id").isInt(),
  body("route_id").isInt(),
  body("trip_date").isISO8601(),
  body("trip_type").isIn(["PICKUP", "DROP"])
];

const tripsFilterRules = [
  query("trip_date").optional().isISO8601(),
  query("vehicle_id").optional().isInt(),
  query("route_id").optional().isInt()
];

const studentEventRules = [
  ...tripIdParamRule,
  body("student_id").isInt(),
  body("boarded").optional().isBoolean(),
  body("dropped").optional().isBoolean(),
  body("remarks").optional({ nullable: true }).isString()
];

const requestStatusFilterRules = [query("status").optional().isIn(["PENDING", "APPROVED", "REJECTED"])];

const notifyRules = [
  body("target").isIn(["CLASS", "STUDENT", "ROUTE"]),
  body("class_name").optional().isString(),
  body("section").optional().isString(),
  body("student_id").optional().isInt(),
  body("route_id").optional().isInt(),
  body("title").isString().notEmpty(),
  body("message").isString().notEmpty()
];

module.exports = {
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
};
