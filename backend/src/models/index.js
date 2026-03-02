const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Role = require("./Role")(sequelize, DataTypes);
const User = require("./User")(sequelize, DataTypes);
const Staff = require("./Staff")(sequelize, DataTypes);
const Admission = require("./Admission")(sequelize, DataTypes);
const Student = require("./Student")(sequelize, DataTypes);
const Attendance = require("./Attendance")(sequelize, DataTypes);
const FeeStructure = require("./FeeStructure")(sequelize, DataTypes);
const FeeInvoice = require("./FeeInvoice")(sequelize, DataTypes);
const Payment = require("./Payment")(sequelize, DataTypes);
const Notification = require("./Notification")(sequelize, DataTypes);
const ActivityLog = require("./ActivityLog")(sequelize, DataTypes);
const Tenant = require("./Tenant")(sequelize, DataTypes);
const TenantSetting = require("./TenantSetting")(sequelize, DataTypes);
const FeatureFlag = require("./FeatureFlag")(sequelize, DataTypes);
const Integration = require("./Integration")(sequelize, DataTypes);
const AiSetting = require("./AiSetting")(sequelize, DataTypes);
const AcademicYear = require("./AcademicYear")(sequelize, DataTypes);
const SchoolClass = require("./SchoolClass")(sequelize, DataTypes);
const Section = require("./Section")(sequelize, DataTypes);
const Subject = require("./Subject")(sequelize, DataTypes);
const Holiday = require("./Holiday")(sequelize, DataTypes);
const FeeSetting = require("./FeeSetting")(sequelize, DataTypes);
const AttendanceSetting = require("./AttendanceSetting")(sequelize, DataTypes);
const SecuritySetting = require("./SecuritySetting")(sequelize, DataTypes);
const RolePermission = require("./RolePermission")(sequelize, DataTypes);
const NotificationTemplate = require("./NotificationTemplate")(sequelize, DataTypes);
const Subscription = require("./Subscription")(sequelize, DataTypes);
const TimetableEntry = require("./TimetableEntry")(sequelize, DataTypes);
const Homework = require("./Homework")(sequelize, DataTypes);
const Exam = require("./Exam")(sequelize, DataTypes);
const Mark = require("./Mark")(sequelize, DataTypes);
const Timetable = require("./Timetable")(sequelize, DataTypes);
const MessageLog = require("./MessageLog")(sequelize, DataTypes);
const Vehicle = require("./Vehicle")(sequelize, DataTypes);
const Driver = require("./Driver")(sequelize, DataTypes);
const TransportRoute = require("./TransportRoute")(sequelize, DataTypes);
const RouteStop = require("./RouteStop")(sequelize, DataTypes);
const VehicleAssignment = require("./VehicleAssignment")(sequelize, DataTypes);
const StudentTransport = require("./StudentTransport")(sequelize, DataTypes);
const TransportTrip = require("./TransportTrip")(sequelize, DataTypes);
const TransportStudentEvent = require("./TransportStudentEvent")(sequelize, DataTypes);
const TransportRequest = require("./TransportRequest")(sequelize, DataTypes);
const Parent = require("./Parent")(sequelize, DataTypes);
const ParentStudent = require("./ParentStudent")(sequelize, DataTypes);
const ParentProfile = require("./ParentProfile")(sequelize, DataTypes);

Role.hasMany(User, { foreignKey: "role_id", as: "users" });
User.belongsTo(Role, { foreignKey: "role_id", as: "role" });

User.hasOne(Staff, { foreignKey: "user_id", as: "staff_profile" });
Staff.belongsTo(User, { foreignKey: "user_id", as: "user" });

Admission.belongsTo(User, { foreignKey: "verified_by", as: "verifier" });

Admission.hasOne(Student, { foreignKey: "admission_id", as: "student" });
Student.belongsTo(Admission, { foreignKey: "admission_id", as: "admission" });

Student.hasMany(Attendance, { foreignKey: "student_id", as: "attendance" });
Attendance.belongsTo(Student, { foreignKey: "student_id", as: "student" });

Student.hasMany(FeeInvoice, { foreignKey: "student_id", as: "invoices" });
FeeInvoice.belongsTo(Student, { foreignKey: "student_id", as: "student" });

FeeInvoice.hasMany(Payment, { foreignKey: "invoice_id", as: "payments" });
Payment.belongsTo(FeeInvoice, { foreignKey: "invoice_id", as: "invoice" });

Student.hasMany(Notification, { foreignKey: "student_id", as: "notifications" });
Notification.belongsTo(Student, { foreignKey: "student_id", as: "student" });

User.hasMany(ActivityLog, { foreignKey: "user_id", as: "activities" });
ActivityLog.belongsTo(User, { foreignKey: "user_id", as: "user" });

Tenant.hasMany(TenantSetting, { foreignKey: "tenant_id", as: "settings" });
TenantSetting.belongsTo(Tenant, { foreignKey: "tenant_id", as: "tenant" });

Tenant.hasMany(FeatureFlag, { foreignKey: "tenant_id", as: "feature_flags" });
FeatureFlag.belongsTo(Tenant, { foreignKey: "tenant_id", as: "tenant" });

Tenant.hasMany(Integration, { foreignKey: "tenant_id", as: "integrations" });
Integration.belongsTo(Tenant, { foreignKey: "tenant_id", as: "tenant" });

Tenant.hasOne(AiSetting, { foreignKey: "tenant_id", as: "ai_setting" });
AiSetting.belongsTo(Tenant, { foreignKey: "tenant_id", as: "tenant" });

Tenant.hasMany(AcademicYear, { foreignKey: "tenant_id", as: "academic_years" });
AcademicYear.belongsTo(Tenant, { foreignKey: "tenant_id", as: "tenant" });

Tenant.hasMany(SchoolClass, { foreignKey: "tenant_id", as: "classes" });
SchoolClass.belongsTo(Tenant, { foreignKey: "tenant_id", as: "tenant" });

SchoolClass.hasMany(Section, { foreignKey: "class_id", as: "sections", onDelete: "CASCADE" });
Section.belongsTo(SchoolClass, { foreignKey: "class_id", as: "class" });
Tenant.hasMany(Section, { foreignKey: "tenant_id", as: "sections" });
Section.belongsTo(Tenant, { foreignKey: "tenant_id", as: "tenant" });

SchoolClass.hasMany(Subject, { foreignKey: "class_id", as: "subjects", onDelete: "CASCADE" });
Subject.belongsTo(SchoolClass, { foreignKey: "class_id", as: "class" });
Tenant.hasMany(Subject, { foreignKey: "tenant_id", as: "subjects" });
Subject.belongsTo(Tenant, { foreignKey: "tenant_id", as: "tenant" });

SchoolClass.hasMany(TimetableEntry, { foreignKey: "class_id", as: "timetable_entries", onDelete: "CASCADE" });
TimetableEntry.belongsTo(SchoolClass, { foreignKey: "class_id", as: "class" });
Section.hasMany(TimetableEntry, { foreignKey: "section_id", as: "timetable_entries", onDelete: "CASCADE" });
TimetableEntry.belongsTo(Section, { foreignKey: "section_id", as: "section" });
Tenant.hasMany(TimetableEntry, { foreignKey: "tenant_id", as: "timetable_entries" });
TimetableEntry.belongsTo(Tenant, { foreignKey: "tenant_id", as: "tenant" });

Tenant.hasMany(Holiday, { foreignKey: "tenant_id", as: "holidays" });
Holiday.belongsTo(Tenant, { foreignKey: "tenant_id", as: "tenant" });

Tenant.hasOne(FeeSetting, { foreignKey: "tenant_id", as: "fee_setting" });
FeeSetting.belongsTo(Tenant, { foreignKey: "tenant_id", as: "tenant" });

Tenant.hasOne(AttendanceSetting, { foreignKey: "tenant_id", as: "attendance_setting" });
AttendanceSetting.belongsTo(Tenant, { foreignKey: "tenant_id", as: "tenant" });

Tenant.hasOne(SecuritySetting, { foreignKey: "tenant_id", as: "security_setting" });
SecuritySetting.belongsTo(Tenant, { foreignKey: "tenant_id", as: "tenant" });

Tenant.hasMany(RolePermission, { foreignKey: "tenant_id", as: "role_permissions" });
RolePermission.belongsTo(Tenant, { foreignKey: "tenant_id", as: "tenant" });

Tenant.hasMany(NotificationTemplate, { foreignKey: "tenant_id", as: "notification_templates" });
NotificationTemplate.belongsTo(Tenant, { foreignKey: "tenant_id", as: "tenant" });

Tenant.hasOne(Subscription, { foreignKey: "tenant_id", as: "subscription" });
Subscription.belongsTo(Tenant, { foreignKey: "tenant_id", as: "tenant" });

Tenant.hasMany(Homework, { foreignKey: "tenant_id", as: "homework" });
Homework.belongsTo(Tenant, { foreignKey: "tenant_id", as: "tenant" });
User.hasMany(Homework, { foreignKey: "created_by", as: "created_homework" });
Homework.belongsTo(User, { foreignKey: "created_by", as: "creator" });
Subject.hasMany(Homework, { foreignKey: "subject_id", as: "homework" });
Homework.belongsTo(Subject, { foreignKey: "subject_id", as: "subject" });

Tenant.hasMany(Exam, { foreignKey: "tenant_id", as: "exams" });
Exam.belongsTo(Tenant, { foreignKey: "tenant_id", as: "tenant" });
User.hasMany(Exam, { foreignKey: "created_by", as: "created_exams" });
Exam.belongsTo(User, { foreignKey: "created_by", as: "creator" });
Subject.hasMany(Exam, { foreignKey: "subject_id", as: "exams" });
Exam.belongsTo(Subject, { foreignKey: "subject_id", as: "subject" });

Tenant.hasMany(Mark, { foreignKey: "tenant_id", as: "marks" });
Mark.belongsTo(Tenant, { foreignKey: "tenant_id", as: "tenant" });
Exam.hasMany(Mark, { foreignKey: "exam_id", as: "marks", onDelete: "CASCADE" });
Mark.belongsTo(Exam, { foreignKey: "exam_id", as: "exam" });
Student.hasMany(Mark, { foreignKey: "student_id", as: "marks", onDelete: "CASCADE" });
Mark.belongsTo(Student, { foreignKey: "student_id", as: "student" });

Tenant.hasMany(Timetable, { foreignKey: "tenant_id", as: "timetables" });
Timetable.belongsTo(Tenant, { foreignKey: "tenant_id", as: "tenant" });
AcademicYear.hasMany(Timetable, { foreignKey: "academic_year_id", as: "timetables" });
Timetable.belongsTo(AcademicYear, { foreignKey: "academic_year_id", as: "academic_year" });

Tenant.hasMany(MessageLog, { foreignKey: "tenant_id", as: "message_logs" });
MessageLog.belongsTo(Tenant, { foreignKey: "tenant_id", as: "tenant" });
Student.hasMany(MessageLog, { foreignKey: "student_id", as: "message_logs" });
MessageLog.belongsTo(Student, { foreignKey: "student_id", as: "student" });
User.hasMany(MessageLog, { foreignKey: "sent_by", as: "sent_messages" });
MessageLog.belongsTo(User, { foreignKey: "sent_by", as: "sender" });

Tenant.hasMany(Vehicle, { foreignKey: "tenant_id", as: "vehicles" });
Vehicle.belongsTo(Tenant, { foreignKey: "tenant_id", as: "tenant" });

Tenant.hasMany(Driver, { foreignKey: "tenant_id", as: "drivers" });
Driver.belongsTo(Tenant, { foreignKey: "tenant_id", as: "tenant" });

Tenant.hasMany(TransportRoute, { foreignKey: "tenant_id", as: "transport_routes" });
TransportRoute.belongsTo(Tenant, { foreignKey: "tenant_id", as: "tenant" });

Tenant.hasMany(RouteStop, { foreignKey: "tenant_id", as: "route_stops" });
RouteStop.belongsTo(Tenant, { foreignKey: "tenant_id", as: "tenant" });
TransportRoute.hasMany(RouteStop, { foreignKey: "route_id", as: "stops", onDelete: "CASCADE" });
RouteStop.belongsTo(TransportRoute, { foreignKey: "route_id", as: "route" });

Tenant.hasMany(VehicleAssignment, { foreignKey: "tenant_id", as: "vehicle_assignments" });
VehicleAssignment.belongsTo(Tenant, { foreignKey: "tenant_id", as: "tenant" });
Vehicle.hasMany(VehicleAssignment, { foreignKey: "vehicle_id", as: "assignments" });
VehicleAssignment.belongsTo(Vehicle, { foreignKey: "vehicle_id", as: "vehicle" });
TransportRoute.hasMany(VehicleAssignment, { foreignKey: "route_id", as: "assignments" });
VehicleAssignment.belongsTo(TransportRoute, { foreignKey: "route_id", as: "route" });
Driver.hasMany(VehicleAssignment, { foreignKey: "driver_id", as: "driver_assignments" });
VehicleAssignment.belongsTo(Driver, { foreignKey: "driver_id", as: "driver" });
Driver.hasMany(VehicleAssignment, { foreignKey: "attendant_id", as: "attendant_assignments" });
VehicleAssignment.belongsTo(Driver, { foreignKey: "attendant_id", as: "attendant" });

Tenant.hasMany(StudentTransport, { foreignKey: "tenant_id", as: "student_transport" });
StudentTransport.belongsTo(Tenant, { foreignKey: "tenant_id", as: "tenant" });
Student.hasOne(StudentTransport, { foreignKey: "student_id", as: "transport" });
StudentTransport.belongsTo(Student, { foreignKey: "student_id", as: "student" });
TransportRoute.hasMany(StudentTransport, { foreignKey: "route_id", as: "student_allocations" });
StudentTransport.belongsTo(TransportRoute, { foreignKey: "route_id", as: "route" });
RouteStop.hasMany(StudentTransport, { foreignKey: "stop_id", as: "student_allocations" });
StudentTransport.belongsTo(RouteStop, { foreignKey: "stop_id", as: "stop" });
Vehicle.hasMany(StudentTransport, { foreignKey: "vehicle_id", as: "student_allocations" });
StudentTransport.belongsTo(Vehicle, { foreignKey: "vehicle_id", as: "vehicle" });

Tenant.hasMany(TransportTrip, { foreignKey: "tenant_id", as: "transport_trips" });
TransportTrip.belongsTo(Tenant, { foreignKey: "tenant_id", as: "tenant" });
Vehicle.hasMany(TransportTrip, { foreignKey: "vehicle_id", as: "trips" });
TransportTrip.belongsTo(Vehicle, { foreignKey: "vehicle_id", as: "vehicle" });
TransportRoute.hasMany(TransportTrip, { foreignKey: "route_id", as: "trips" });
TransportTrip.belongsTo(TransportRoute, { foreignKey: "route_id", as: "route" });

Tenant.hasMany(TransportStudentEvent, { foreignKey: "tenant_id", as: "transport_student_events" });
TransportStudentEvent.belongsTo(Tenant, { foreignKey: "tenant_id", as: "tenant" });
TransportTrip.hasMany(TransportStudentEvent, { foreignKey: "trip_id", as: "student_events", onDelete: "CASCADE" });
TransportStudentEvent.belongsTo(TransportTrip, { foreignKey: "trip_id", as: "trip" });
Student.hasMany(TransportStudentEvent, { foreignKey: "student_id", as: "trip_events" });
TransportStudentEvent.belongsTo(Student, { foreignKey: "student_id", as: "student" });

Tenant.hasMany(TransportRequest, { foreignKey: "tenant_id", as: "transport_requests" });
TransportRequest.belongsTo(Tenant, { foreignKey: "tenant_id", as: "tenant" });
User.hasMany(TransportRequest, { foreignKey: "parent_user_id", as: "transport_requests" });
TransportRequest.belongsTo(User, { foreignKey: "parent_user_id", as: "parent_user" });
Student.hasMany(TransportRequest, { foreignKey: "student_id", as: "transport_requests" });
TransportRequest.belongsTo(Student, { foreignKey: "student_id", as: "student" });

Tenant.hasMany(Parent, { foreignKey: "tenant_id", as: "parents" });
Parent.belongsTo(Tenant, { foreignKey: "tenant_id", as: "tenant" });
User.hasOne(Parent, { foreignKey: "user_id", as: "parent_profile" });
Parent.belongsTo(User, { foreignKey: "user_id", as: "user" });

Tenant.hasMany(ParentProfile, { foreignKey: "tenant_id", as: "parent_profiles" });
ParentProfile.belongsTo(Tenant, { foreignKey: "tenant_id", as: "tenant" });
User.hasOne(ParentProfile, { foreignKey: "user_id", as: "parent_profile_v2" });
ParentProfile.belongsTo(User, { foreignKey: "user_id", as: "user" });

Tenant.hasMany(ParentStudent, { foreignKey: "tenant_id", as: "parent_students" });
ParentStudent.belongsTo(Tenant, { foreignKey: "tenant_id", as: "tenant" });
User.hasMany(ParentStudent, { foreignKey: "parent_user_id", as: "linked_students" });
ParentStudent.belongsTo(User, { foreignKey: "parent_user_id", as: "parent_user" });
Student.hasMany(ParentStudent, { foreignKey: "student_id", as: "linked_parents" });
ParentStudent.belongsTo(Student, { foreignKey: "student_id", as: "student" });

module.exports = {
  sequelize,
  Role, User, Staff,
  Admission, Student,
  Attendance,
  FeeStructure, FeeInvoice, Payment,
  Notification, ActivityLog,
  Tenant, TenantSetting, FeatureFlag, Integration, AiSetting,
  AcademicYear, SchoolClass, Section, Subject, Holiday,
  FeeSetting, AttendanceSetting, SecuritySetting,
  RolePermission, NotificationTemplate, Subscription,
  TimetableEntry,
  Homework, Exam, Mark, Timetable, MessageLog
  , Vehicle, Driver, TransportRoute, RouteStop, VehicleAssignment, StudentTransport,
  TransportTrip, TransportStudentEvent, TransportRequest, Parent, ParentStudent, ParentProfile
};
