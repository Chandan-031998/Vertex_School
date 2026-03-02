module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Notification", {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    student_id: { type: DataTypes.INTEGER, allowNull: true },
    type: { type: DataTypes.ENUM("FEE_REMINDER","GENERAL"), allowNull: false, defaultValue: "GENERAL" },
    title: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    channel: { type: DataTypes.ENUM("IN_APP","EMAIL"), allowNull: false, defaultValue: "IN_APP" },
    status: { type: DataTypes.ENUM("PENDING","SENT","FAILED"), allowNull: false, defaultValue: "PENDING" },
    scheduled_at: { type: DataTypes.DATE, allowNull: true },
    sent_at: { type: DataTypes.DATE, allowNull: true },
    meta: { type: DataTypes.JSON, allowNull: true }
  }, {
    tableName: "notifications",
    underscored: true,
    indexes: [{ fields: ["tenant_id"] }]
  });
};
