module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Integration", {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: false },
    type: { type: DataTypes.ENUM("smtp", "sms", "payment", "whatsapp"), allowNull: false },
    config_json: { type: DataTypes.JSON, allowNull: false, defaultValue: {} }
  }, {
    tableName: "integrations",
    underscored: true,
    indexes: [{ unique: true, fields: ["tenant_id", "type"] }]
  });
};
