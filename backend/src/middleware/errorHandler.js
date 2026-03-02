const { bad } = require("../utils/response");

module.exports = function errorHandler(err, req, res, next) {
  console.error(err);
  if (res.headersSent) return next(err);
  return bad(res, err.message || "Server Error");
};
