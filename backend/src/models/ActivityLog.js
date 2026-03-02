module.exports = (sequelize, DataTypes) => {
  return sequelize.define("ActivityLog", {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    user_id: { type: DataTypes.INTEGER, allowNull: true },
    action: { type: DataTypes.STRING, allowNull: false },
    entity: { type: DataTypes.STRING, allowNull: false },
    entity_id: { type: DataTypes.STRING, allowNull: true },
    details: { type: DataTypes.JSON, allowNull: true },
    ip: { type: DataTypes.STRING, allowNull: true },
    user_agent: { type: DataTypes.STRING, allowNull: true }
  }, {
    tableName: "activity_logs",
    underscored: true,
    createdAt: "created_at",
    updatedAt: false,
    indexes: [{ fields: ["tenant_id"] }]
  });
};
