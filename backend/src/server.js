const app = require("./app");
const env = require("./config/env");
const { sequelize } = require("./models");
const logger = require("./utils/logger");

async function start() {
  try {
    await sequelize.authenticate();
    logger.info("DB connected");
    if (env.DB_SYNC) {
      await sequelize.sync();
      logger.info("DB sync complete");
    }
    app.listen(env.PORT, () => logger.info(`API running on :${env.PORT}`));
  } catch (e) {
    logger.error("Startup error", e);
    process.exit(1);
  }
}
start();
