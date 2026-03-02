module.exports = (sequelize, DataTypes) => {
  return sequelize.define("SecuritySetting", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: true, unique: true },
    password_min_length: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 8 },
    password_require_upper: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    password_require_number: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    password_require_symbol: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    session_timeout_minutes: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 120 },
    enable_2fa: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
  }, {
    tableName: "security_settings",
    underscored: true,
    indexes: [{ unique: true, fields: ["tenant_id"] }]
  });
};
