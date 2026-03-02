import api from "./http";

export const listVehicles = () => api.get("/transport/vehicles").then((r) => r.data);
export const createVehicle = (payload) => api.post("/transport/vehicles", payload).then((r) => r.data);
export const updateVehicle = (id, payload) => api.put(`/transport/vehicles/${id}`, payload).then((r) => r.data);
export const deleteVehicle = (id) => api.delete(`/transport/vehicles/${id}`).then((r) => r.data);

export const listDrivers = () => api.get("/transport/drivers").then((r) => r.data);
export const createDriver = (payload) => api.post("/transport/drivers", payload).then((r) => r.data);
export const updateDriver = (id, payload) => api.put(`/transport/drivers/${id}`, payload).then((r) => r.data);
export const deleteDriver = (id) => api.delete(`/transport/drivers/${id}`).then((r) => r.data);

export const listRoutes = () => api.get("/transport/routes").then((r) => r.data);
export const createRoute = (payload) => api.post("/transport/routes", payload).then((r) => r.data);
export const updateRoute = (id, payload) => api.put(`/transport/routes/${id}`, payload).then((r) => r.data);
export const deleteRoute = (id) => api.delete(`/transport/routes/${id}`).then((r) => r.data);
export const createStop = (routeId, payload) => api.post(`/transport/routes/${routeId}/stops`, payload).then((r) => r.data);
export const updateStop = (stopId, payload) => api.put(`/transport/stops/${stopId}`, payload).then((r) => r.data);
export const deleteStop = (stopId) => api.delete(`/transport/stops/${stopId}`).then((r) => r.data);

export const listAssignments = () => api.get("/transport/assignments").then((r) => r.data);
export const createAssignment = (payload) => api.post("/transport/assignments", payload).then((r) => r.data);
export const updateAssignment = (id, payload) => api.put(`/transport/assignments/${id}`, payload).then((r) => r.data);
export const deleteAssignment = (id) => api.delete(`/transport/assignments/${id}`).then((r) => r.data);

export const listAllocations = (params = {}) => api.get("/transport/allocations", { params }).then((r) => r.data);
export const createAllocation = (payload) => api.post("/transport/allocations", payload).then((r) => r.data);
export const updateAllocation = (id, payload) => api.put(`/transport/allocations/${id}`, payload).then((r) => r.data);
export const deleteAllocation = (id) => api.delete(`/transport/allocations/${id}`).then((r) => r.data);

export const listTrips = (params = {}) => api.get("/transport/trips", { params }).then((r) => r.data);
export const startTrip = (payload) => api.post("/transport/trips/start", payload).then((r) => r.data);
export const endTrip = (tripId) => api.post(`/transport/trips/${tripId}/end`).then((r) => r.data);
export const upsertTripEvent = (tripId, payload) => api.post(`/transport/trips/${tripId}/student-event`, payload).then((r) => r.data);

export const listTransportRequests = (params = {}) => api.get("/transport/requests", { params }).then((r) => r.data);
export const approveTransportRequest = (id, payload = {}) => api.put(`/transport/requests/${id}/approve`, payload).then((r) => r.data);
export const rejectTransportRequest = (id, payload = {}) => api.put(`/transport/requests/${id}/reject`, payload).then((r) => r.data);

export const notifyTransport = (payload) => api.post("/transport/notify", payload).then((r) => r.data);
