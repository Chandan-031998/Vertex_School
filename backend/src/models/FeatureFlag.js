module.exports = (sequelize, DataTypes) => {
  return sequelize.define("FeatureFlag", {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: false },
    key: { type: DataTypes.STRING(120), allowNull: false },
    enabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
  }, {
    tableName: "feature_flags",
    underscored: true,
    indexes: [{ unique: true, fields: ["tenant_id", "key"] }]
  });
};
