module.exports = (sequelize, DataTypes) => {
  return sequelize.define("VehicleAssignment", {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    vehicle_id: { type: DataTypes.BIGINT, allowNull: false },
    route_id: { type: DataTypes.BIGINT, allowNull: false },
    driver_id: { type: DataTypes.BIGINT, allowNull: false },
    attendant_id: { type: DataTypes.BIGINT, allowNull: true },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
  }, {
    tableName: "vehicle_assignments",
    underscored: true,
    indexes: [{ fields: ["tenant_id"] }, { fields: ["vehicle_id"] }, { fields: ["route_id"] }, { fields: ["driver_id"] }]
  });
};
