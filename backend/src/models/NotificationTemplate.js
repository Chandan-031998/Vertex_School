module.exports = (sequelize, DataTypes) => {
  return sequelize.define("NotificationTemplate", {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    key: { type: DataTypes.STRING(80), allowNull: false },
    subject: { type: DataTypes.STRING(255), allowNull: true },
    body: { type: DataTypes.TEXT, allowNull: false },
    channel: { type: DataTypes.ENUM("SMS", "EMAIL", "WHATSAPP"), allowNull: false, defaultValue: "EMAIL" },
    language: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "en" }
  }, {
    tableName: "notification_templates",
    underscored: true,
    indexes: [{ unique: true, fields: ["tenant_id", "key", "channel", "language"] }, { fields: ["tenant_id"] }]
  });
};
