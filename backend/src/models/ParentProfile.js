module.exports = (sequelize, DataTypes) => {
  return sequelize.define("ParentProfile", {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    user_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    phone: { type: DataTypes.STRING(40), allowNull: true },
    address: { type: DataTypes.TEXT, allowNull: true },
    preferred_language: { type: DataTypes.STRING(10), allowNull: false, defaultValue: "en" },
    notification_preferences_json: { type: DataTypes.JSON, allowNull: false, defaultValue: {} }
  }, {
    tableName: "parent_profiles",
    underscored: true,
    indexes: [{ fields: ["tenant_id"] }, { unique: true, fields: ["user_id"] }]
  });
};
