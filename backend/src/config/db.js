const { Sequelize } = require("sequelize");
const env = require("./env");

const sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
  host: env.DB_HOST,
  port: env.DB_PORT,
  dialect: "mysql",
  logging: false,
  pool: { max: 10, min: 0, idle: 10000 }
});

module.exports = { sequelize };
