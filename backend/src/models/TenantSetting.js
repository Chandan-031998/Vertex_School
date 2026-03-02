module.exports = (sequelize, DataTypes) => {
  return sequelize.define("TenantSetting", {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: false },
    category: { type: DataTypes.STRING(80), allowNull: false },
    settings_json: { type: DataTypes.JSON, allowNull: false, defaultValue: {} }
  }, {
    tableName: "tenant_settings",
    underscored: true,
    indexes: [{ unique: true, fields: ["tenant_id", "category"] }]
  });
};
