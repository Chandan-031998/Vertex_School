module.exports = (sequelize, DataTypes) => {
  return sequelize.define("RouteStop", {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    route_id: { type: DataTypes.BIGINT, allowNull: false },
    stop_name: { type: DataTypes.STRING(180), allowNull: false },
    pickup_time: { type: DataTypes.TIME, allowNull: true },
    drop_time: { type: DataTypes.TIME, allowNull: true },
    latitude: { type: DataTypes.DECIMAL(10, 7), allowNull: true },
    longitude: { type: DataTypes.DECIMAL(10, 7), allowNull: true },
    stop_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 }
  }, {
    tableName: "route_stops",
    underscored: true,
    indexes: [{ fields: ["tenant_id"] }, { fields: ["route_id"] }]
  });
};
