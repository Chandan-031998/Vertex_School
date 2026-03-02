function ok(res, data = {}, message = "OK") {
  return res.json({ success: true, message, data });
}
function created(res, data = {}, message = "Created") {
  return res.status(201).json({ success: true, message, data });
}
function bad(res, message = "Bad Request", details) {
  return res.status(400).json({ success: false, message, details });
}
function unauthorized(res, message = "Unauthorized") {
  return res.status(401).json({ success: false, message });
}
function forbidden(res, message = "Forbidden") {
  return res.status(403).json({ success: false, message });
}
module.exports = { ok, created, bad, unauthorized, forbidden };
