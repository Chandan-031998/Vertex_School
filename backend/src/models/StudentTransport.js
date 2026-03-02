module.exports = (sequelize, DataTypes) => {
  return sequelize.define("StudentTransport", {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    student_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    route_id: { type: DataTypes.BIGINT, allowNull: false },
    stop_id: { type: DataTypes.BIGINT, allowNull: false },
    vehicle_id: { type: DataTypes.BIGINT, allowNull: false },
    pickup_enabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    drop_enabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    monthly_fee: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    status: { type: DataTypes.ENUM("ACTIVE", "PAUSED", "CANCELLED"), allowNull: false, defaultValue: "ACTIVE" }
  }, {
    tableName: "student_transport",
    underscored: true,
    indexes: [{ fields: ["tenant_id"] }, { fields: ["route_id"] }, { fields: ["vehicle_id"] }, { fields: ["stop_id"] }]
  });
};
