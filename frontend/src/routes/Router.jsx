import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/auth/Login";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

import AdminDashboard from "../pages/admin/AdminDashboard";
import Admissions from "../pages/admin/Admissions";
import Students from "../pages/admin/Students";
import Attendance from "../pages/admin/Attendance";
import Fees from "../pages/admin/Fees";
import Staff from "../pages/admin/Staff";
import AssignClasses from "../pages/admin/AssignClasses";
import Reports from "../pages/admin/Reports";
import Notifications from "../pages/admin/Notifications";
import Settings from "../pages/admin/Settings";
import SettingsAcademicYears from "../pages/admin/SettingsAcademicYears";
import SettingsClasses from "../pages/admin/SettingsClasses";
import SettingsSubjects from "../pages/admin/SettingsSubjects";
import SettingsHolidays from "../pages/admin/SettingsHolidays";
import SettingsPolicies from "../pages/admin/SettingsPolicies";
import SettingsSchoolProfile from "../pages/admin/SettingsSchoolProfile";
import SettingsRolesPermissions from "../pages/admin/SettingsRolesPermissions";
import SettingsNotificationTemplates from "../pages/admin/SettingsNotificationTemplates";
import SettingsIntegrations from "../pages/admin/SettingsIntegrations";
import SettingsAI from "../pages/admin/SettingsAI";
import SettingsAuditLogs from "../pages/admin/SettingsAuditLogs";
import SettingsSubscription from "../pages/admin/SettingsSubscription";
import SettingsFeatureFlags from "../pages/admin/SettingsFeatureFlags";
import SettingsAICapabilities from "../pages/admin/SettingsAICapabilities";
import SettingsTimetable from "../pages/admin/SettingsTimetable";
import AdminTransportVehicles from "../pages/admin/transport/AdminTransportVehicles";
import AdminTransportRoutes from "../pages/admin/transport/AdminTransportRoutes";
import AdminTransportDrivers from "../pages/admin/transport/AdminTransportDrivers";
import AdminTransportAssignments from "../pages/admin/transport/AdminTransportAssignments";
import AdminTransportAllocations from "../pages/admin/transport/AdminTransportAllocations";
import AdminTransportTrips from "../pages/admin/transport/AdminTransportTrips";
import AdminTransportRequests from "../pages/admin/transport/AdminTransportRequests";
import AdminTransportNotifications from "../pages/admin/transport/AdminTransportNotifications";
import AdminParentsList from "../pages/admin/parents/AdminParentsList";
import AdminParentNew from "../pages/admin/parents/AdminParentNew";
import AdminParentEdit from "../pages/admin/parents/AdminParentEdit";

import TeacherDashboard from "../pages/teacher/TeacherDashboard";
import AttendanceEntry from "../pages/teacher/AttendanceEntry";
import StudentList from "../pages/teacher/StudentList";
import TeacherStudentProfile from "../pages/teacher/TeacherStudentProfile";
import TeacherAttendanceReport from "../pages/teacher/TeacherAttendanceReport";
import TeacherHomework from "../pages/teacher/TeacherHomework";
import TeacherExams from "../pages/teacher/TeacherExams";
import TeacherTimetable from "../pages/teacher/TeacherTimetable";
import TeacherMessages from "../pages/teacher/TeacherMessages";
import TeacherProfile from "../pages/teacher/TeacherProfile";

import AccountantDashboard from "../pages/accountant/AccountantDashboard";
import FeeInvoices from "../pages/accountant/FeeInvoices";
import Dues from "../pages/accountant/Dues";
import AccNotifications from "../pages/accountant/Notifications";
import ParentTransport from "../pages/parent/ParentTransport";
import ParentRequests from "../pages/parent/ParentRequests";
import ParentNotifications from "../pages/parent/ParentNotifications";
import ParentDashboard from "../pages/parent/ParentDashboard";
import ParentChildren from "../pages/parent/ParentChildren";
import ParentAttendance from "../pages/parent/ParentAttendance";
import ParentFees from "../pages/parent/ParentFees";
import ParentSettings from "../pages/parent/ParentSettings";

import NotFound from "../pages/NotFound";

export default function Router() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={
        <ProtectedRoute>
          <Navigate to="/login" replace />
        </ProtectedRoute>
      } />

      {/* Admin */}
      <Route path="/admin" element={
        <ProtectedRoute><RoleRoute roles={["ADMIN"]}><AdminDashboard /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/admin/admissions" element={
        <ProtectedRoute><RoleRoute roles={["ADMIN"]}><Admissions /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/admin/students" element={
        <ProtectedRoute><RoleRoute roles={["ADMIN"]}><Students /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/admin/attendance" element={
        <ProtectedRoute><RoleRoute roles={["ADMIN"]}><Attendance /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/admin/fees" element={
        <ProtectedRoute><RoleRoute roles={["ADMIN"]}><Fees /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/admin/staff" element={
        <ProtectedRoute><RoleRoute roles={["ADMIN"]}><Staff /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/admin/parents" element={
        <ProtectedRoute><RoleRoute roles={["ADMIN"]}><AdminParentsList /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/admin/parents/new" element={
        <ProtectedRoute><RoleRoute roles={["ADMIN"]}><AdminParentNew /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/admin/parents/:id/edit" element={
        <ProtectedRoute><RoleRoute roles={["ADMIN"]}><AdminParentEdit /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/admin/staff/assign-classes" element={
        <ProtectedRoute><RoleRoute roles={["ADMIN"]}><AssignClasses /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/admin/reports" element={
        <ProtectedRoute><RoleRoute roles={["ADMIN"]}><Reports /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/admin/notifications" element={
        <ProtectedRoute><RoleRoute roles={["ADMIN"]}><Notifications /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/admin/timetable" element={
        <ProtectedRoute><RoleRoute roles={["ADMIN"]}><SettingsTimetable /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/admin/settings" element={
        <ProtectedRoute><RoleRoute roles={["ADMIN"]}><Settings /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/admin/settings/academic-years" element={
        <ProtectedRoute><RoleRoute roles={["ADMIN"]}><SettingsAcademicYears /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/admin/settings/school-profile" element={
        <ProtectedRoute><RoleRoute roles={["ADMIN"]}><SettingsSchoolProfile /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/admin/settings/classes" element={
        <ProtectedRoute><RoleRoute roles={["ADMIN"]}><SettingsClasses /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/admin/settings/subjects" element={
        <ProtectedRoute><RoleRoute roles={["ADMIN"]}><SettingsSubjects /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/admin/settings/holidays" element={
        <ProtectedRoute><RoleRoute roles={["ADMIN"]}><SettingsHolidays /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/admin/settings/policies" element={
        <ProtectedRoute><RoleRoute roles={["ADMIN"]}><SettingsPolicies /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/admin/settings/roles-permissions" element={
        <ProtectedRoute><RoleRoute roles={["ADMIN"]}><SettingsRolesPermissions /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/admin/settings/notification-templates" element={
        <ProtectedRoute><RoleRoute roles={["ADMIN"]}><SettingsNotificationTemplates /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/admin/settings/integrations" element={
        <ProtectedRoute><RoleRoute roles={["ADMIN"]}><SettingsIntegrations /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/admin/settings/ai" element={
        <ProtectedRoute><RoleRoute roles={["ADMIN"]}><SettingsAI /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/admin/settings/audit-logs" element={
        <ProtectedRoute><RoleRoute roles={["ADMIN"]}><SettingsAuditLogs /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/admin/settings/subscription" element={
        <ProtectedRoute><RoleRoute roles={["ADMIN"]}><SettingsSubscription /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/admin/settings/feature-flags" element={
        <ProtectedRoute><RoleRoute roles={["ADMIN"]}><SettingsFeatureFlags /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/admin/settings/ai-capabilities" element={
        <ProtectedRoute><RoleRoute roles={["ADMIN"]}><SettingsAICapabilities /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/admin/settings/timetable" element={
        <ProtectedRoute><RoleRoute roles={["ADMIN"]}><SettingsTimetable /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/admin/transport/vehicles" element={
        <ProtectedRoute><RoleRoute roles={["ADMIN", "TRANSPORT_MANAGER"]}><AdminTransportVehicles /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/admin/transport/routes" element={
        <ProtectedRoute><RoleRoute roles={["ADMIN", "TRANSPORT_MANAGER"]}><AdminTransportRoutes /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/admin/transport/drivers" element={
        <ProtectedRoute><RoleRoute roles={["ADMIN", "TRANSPORT_MANAGER"]}><AdminTransportDrivers /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/admin/transport/assignments" element={
        <ProtectedRoute><RoleRoute roles={["ADMIN", "TRANSPORT_MANAGER"]}><AdminTransportAssignments /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/admin/transport/allocations" element={
        <ProtectedRoute><RoleRoute roles={["ADMIN", "TRANSPORT_MANAGER"]}><AdminTransportAllocations /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/admin/transport/trips" element={
        <ProtectedRoute><RoleRoute roles={["ADMIN", "TRANSPORT_MANAGER"]}><AdminTransportTrips /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/admin/transport/requests" element={
        <ProtectedRoute><RoleRoute roles={["ADMIN", "TRANSPORT_MANAGER"]}><AdminTransportRequests /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/admin/transport/notifications" element={
        <ProtectedRoute><RoleRoute roles={["ADMIN", "TRANSPORT_MANAGER"]}><AdminTransportNotifications /></RoleRoute></ProtectedRoute>
      } />

      {/* Teacher */}
      <Route path="/teacher" element={
        <ProtectedRoute><RoleRoute roles={["TEACHER"]}><TeacherDashboard /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/teacher/attendance" element={
        <ProtectedRoute><RoleRoute roles={["TEACHER"]}><AttendanceEntry /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/teacher/students" element={
        <ProtectedRoute><RoleRoute roles={["TEACHER"]}><StudentList /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/teacher/students/:id" element={
        <ProtectedRoute><RoleRoute roles={["TEACHER"]}><TeacherStudentProfile /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/teacher/reports" element={
        <ProtectedRoute><RoleRoute roles={["TEACHER"]}><TeacherAttendanceReport /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/teacher/homework" element={
        <ProtectedRoute><RoleRoute roles={["TEACHER"]}><TeacherHomework /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/teacher/exams" element={
        <ProtectedRoute><RoleRoute roles={["TEACHER"]}><TeacherExams /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/teacher/timetable" element={
        <ProtectedRoute><RoleRoute roles={["TEACHER"]}><TeacherTimetable /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/teacher/messages" element={
        <ProtectedRoute><RoleRoute roles={["TEACHER"]}><TeacherMessages /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/teacher/profile" element={
        <ProtectedRoute><RoleRoute roles={["TEACHER"]}><TeacherProfile /></RoleRoute></ProtectedRoute>
      } />

      {/* Accountant */}
      <Route path="/accountant" element={
        <ProtectedRoute><RoleRoute roles={["ACCOUNTANT"]}><AccountantDashboard /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/accountant/fees" element={
        <ProtectedRoute><RoleRoute roles={["ACCOUNTANT"]}><FeeInvoices /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/accountant/dues" element={
        <ProtectedRoute><RoleRoute roles={["ACCOUNTANT"]}><Dues /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/accountant/notifications" element={
        <ProtectedRoute><RoleRoute roles={["ACCOUNTANT"]}><AccNotifications /></RoleRoute></ProtectedRoute>
      } />

      {/* Parent */}
      <Route path="/parent/dashboard" element={
        <ProtectedRoute><RoleRoute roles={["PARENT"]}><ParentDashboard /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/parent/children" element={
        <ProtectedRoute><RoleRoute roles={["PARENT"]}><ParentChildren /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/parent/attendance" element={
        <ProtectedRoute><RoleRoute roles={["PARENT"]}><ParentAttendance /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/parent/fees" element={
        <ProtectedRoute><RoleRoute roles={["PARENT"]}><ParentFees /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/parent/transport" element={
        <ProtectedRoute><RoleRoute roles={["PARENT"]}><ParentTransport /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/parent/requests" element={
        <ProtectedRoute><RoleRoute roles={["PARENT"]}><ParentRequests /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/parent/notifications" element={
        <ProtectedRoute><RoleRoute roles={["PARENT"]}><ParentNotifications /></RoleRoute></ProtectedRoute>
      } />
      <Route path="/parent/settings" element={
        <ProtectedRoute><RoleRoute roles={["PARENT"]}><ParentSettings /></RoleRoute></ProtectedRoute>
      } />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
