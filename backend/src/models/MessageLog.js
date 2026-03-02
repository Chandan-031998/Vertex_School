module.exports = (sequelize, DataTypes) => {
  return sequelize.define("MessageLog", {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    student_id: { type: DataTypes.INTEGER, allowNull: true },
    class_name: { type: DataTypes.STRING(50), allowNull: true },
    section: { type: DataTypes.STRING(20), allowNull: true },
    channel: { type: DataTypes.ENUM("SMS", "WHATSAPP", "EMAIL"), allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    sent_by: { type: DataTypes.INTEGER, allowNull: false }
  }, {
    tableName: "message_logs",
    underscored: true,
    indexes: [{ fields: ["tenant_id"] }, { fields: ["sent_by"] }]
  });
};
