module.exports = (sequelize, DataTypes) => {
  return sequelize.define("TransportRoute", {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    route_name: { type: DataTypes.STRING(120), allowNull: false },
    start_point: { type: DataTypes.STRING(180), allowNull: false },
    end_point: { type: DataTypes.STRING(180), allowNull: false },
    status: { type: DataTypes.ENUM("ACTIVE", "INACTIVE"), allowNull: false, defaultValue: "ACTIVE" }
  }, {
    tableName: "routes",
    underscored: true,
    indexes: [{ fields: ["tenant_id"] }, { unique: true, fields: ["tenant_id", "route_name"] }]
  });
};
