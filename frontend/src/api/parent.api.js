import api from "./http";

export const parentMe = () => api.get("/parent/me").then((r) => r.data);
export const parentDashboard = () => api.get("/parent/dashboard").then((r) => r.data);
export const parentChildren = () => api.get("/parent/children").then((r) => r.data);
export const parentAttendance = (params) => api.get("/parent/attendance", { params }).then((r) => r.data);
export const parentFees = (params) => api.get("/parent/fees", { params }).then((r) => r.data);
export const parentTransport = (params) => api.get("/parent/transport", { params }).then((r) => r.data);
export const parentNotifications = () => api.get("/parent/notifications").then((r) => r.data);
export const createParentRequest = (payload) => api.post("/parent/requests", payload).then((r) => r.data);
export const parentRequests = () => api.get("/parent/requests").then((r) => r.data);
export const updateParentSettings = (payload) => api.put("/parent/settings", payload).then((r) => r.data);

// backward compatibility
export const parentStudents = parentChildren;
export const parentStudentTransport = (studentId) => parentTransport({ student_id: studentId });
