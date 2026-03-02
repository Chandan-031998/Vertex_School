module.exports = (sequelize, DataTypes) => {
  return sequelize.define("AiSetting", {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: false },
    enabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    provider: { type: DataTypes.STRING(80), allowNull: true },
    model: { type: DataTypes.STRING(120), allowNull: true },
    quota_json: { type: DataTypes.JSON, allowNull: false, defaultValue: {} }
  }, {
    tableName: "ai_settings",
    underscored: true,
    indexes: [{ unique: true, fields: ["tenant_id"] }]
  });
};
