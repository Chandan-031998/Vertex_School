module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Vehicle", {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    bus_no: { type: DataTypes.STRING(50), allowNull: false },
    registration_no: { type: DataTypes.STRING(100), allowNull: false },
    capacity: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.ENUM("ACTIVE", "INACTIVE"), allowNull: false, defaultValue: "ACTIVE" },
    insurance_expiry: { type: DataTypes.DATEONLY, allowNull: true },
    fitness_expiry: { type: DataTypes.DATEONLY, allowNull: true }
  }, {
    tableName: "vehicles",
    underscored: true,
    indexes: [{ fields: ["tenant_id"] }, { unique: true, fields: ["tenant_id", "bus_no"] }]
  });
};
