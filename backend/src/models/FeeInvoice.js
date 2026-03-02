module.exports = (sequelize, DataTypes) => {
  return sequelize.define("FeeInvoice", {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    invoice_no: { type: DataTypes.STRING, allowNull: false, unique: true },
    student_id: { type: DataTypes.INTEGER, allowNull: false },
    class_name: { type: DataTypes.STRING, allowNull: false },
    section: { type: DataTypes.STRING, allowNull: false },
    billing_month: { type: DataTypes.STRING(7), allowNull: false }, // YYYY-MM
    total_amount: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    status: { type: DataTypes.ENUM("UNPAID","PARTIAL","PAID"), allowNull: false, defaultValue: "UNPAID" },
    created_by: { type: DataTypes.INTEGER, allowNull: true }
  }, {
    tableName: "fee_invoices",
    underscored: true,
    indexes: [{ unique: true, fields: ["tenant_id", "student_id","billing_month"] }, { fields: ["tenant_id"] }]
  });
};
