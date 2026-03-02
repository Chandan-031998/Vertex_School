module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Subscription", {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: false, unique: true, defaultValue: 1 },
    plan: { type: DataTypes.ENUM("BASIC", "PRO", "ENTERPRISE"), allowNull: false, defaultValue: "BASIC" },
    status: { type: DataTypes.ENUM("ACTIVE", "EXPIRED"), allowNull: false, defaultValue: "ACTIVE" },
    start_date: { type: DataTypes.DATEONLY, allowNull: true },
    end_date: { type: DataTypes.DATEONLY, allowNull: true },
    limits_json: { type: DataTypes.JSON, allowNull: false, defaultValue: {} }
  }, {
    tableName: "subscriptions",
    underscored: true,
    indexes: [{ unique: true, fields: ["tenant_id"] }]
  });
};
