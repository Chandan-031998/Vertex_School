module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Driver", {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    full_name: { type: DataTypes.STRING(120), allowNull: false },
    phone: { type: DataTypes.STRING(40), allowNull: false },
    license_no: { type: DataTypes.STRING(100), allowNull: false },
    license_expiry: { type: DataTypes.DATEONLY, allowNull: true },
    type: { type: DataTypes.ENUM("DRIVER", "ATTENDANT"), allowNull: false, defaultValue: "DRIVER" },
    status: { type: DataTypes.ENUM("ACTIVE", "INACTIVE"), allowNull: false, defaultValue: "ACTIVE" }
  }, {
    tableName: "drivers",
    underscored: true,
    indexes: [{ fields: ["tenant_id"] }, { unique: true, fields: ["tenant_id", "license_no"] }]
  });
};
