module.exports = (sequelize, DataTypes) => {
  return sequelize.define("FeeStructure", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    class_name: { type: DataTypes.STRING, allowNull: false },
    fee_name: { type: DataTypes.STRING, allowNull: false, defaultValue: "Tuition" },
    amount: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    frequency: { type: DataTypes.ENUM("MONTHLY","QUARTERLY","YEARLY"), allowNull: false, defaultValue: "MONTHLY" },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
  }, {
    tableName: "fee_structures",
    underscored: true,
    indexes: [{ unique: true, fields: ["tenant_id", "class_name","fee_name","frequency"] }, { fields: ["tenant_id"] }]
  });
};
