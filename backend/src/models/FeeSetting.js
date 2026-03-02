module.exports = (sequelize, DataTypes) => {
  return sequelize.define("FeeSetting", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: true, unique: true },
    currency: { type: DataTypes.STRING(10), allowNull: false, defaultValue: "INR" },
    receipt_prefix: { type: DataTypes.STRING(40), allowNull: false, defaultValue: "VSM-REC" },
    invoice_prefix: { type: DataTypes.STRING(40), allowNull: false, defaultValue: "VSM-INV" },
    late_fee_enabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    late_fee_type: { type: DataTypes.ENUM("FIXED", "PERCENT"), allowNull: false, defaultValue: "FIXED" },
    late_fee_value: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    grace_days: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    payment_methods_json: { type: DataTypes.JSON, allowNull: false, defaultValue: ["CASH", "ONLINE", "UPI"] }
  }, {
    tableName: "fee_settings",
    underscored: true,
    indexes: [{ unique: true, fields: ["tenant_id"] }]
  });
};
