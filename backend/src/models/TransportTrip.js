module.exports = (sequelize, DataTypes) => {
  return sequelize.define("TransportTrip", {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    vehicle_id: { type: DataTypes.BIGINT, allowNull: false },
    route_id: { type: DataTypes.BIGINT, allowNull: false },
    trip_date: { type: DataTypes.DATEONLY, allowNull: false },
    trip_type: { type: DataTypes.ENUM("PICKUP", "DROP"), allowNull: false },
    start_time: { type: DataTypes.DATE, allowNull: true },
    end_time: { type: DataTypes.DATE, allowNull: true },
    status: { type: DataTypes.ENUM("SCHEDULED", "RUNNING", "COMPLETED", "CANCELLED"), allowNull: false, defaultValue: "SCHEDULED" }
  }, {
    tableName: "transport_trips",
    underscored: true,
    indexes: [{ fields: ["tenant_id"] }, { fields: ["trip_date"] }, { fields: ["vehicle_id"] }, { fields: ["route_id"] }]
  });
};
