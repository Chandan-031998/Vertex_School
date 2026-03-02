module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Payment", {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    invoice_id: { type: DataTypes.BIGINT, allowNull: false },
    receipt_no: { type: DataTypes.STRING, allowNull: false, unique: true },
    amount_paid: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    payment_mode: { type: DataTypes.ENUM("CASH","ONLINE"), allowNull: false },
    transaction_ref: { type: DataTypes.STRING, allowNull: true },
    paid_at: { type: DataTypes.DATE, allowNull: false },
    recorded_by: { type: DataTypes.INTEGER, allowNull: true }
  }, {
    tableName: "payments",
    underscored: true,
    indexes: [{ fields: ["tenant_id"] }]
  });
};
