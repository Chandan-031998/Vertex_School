module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Staff", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    user_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    employee_code: { type: DataTypes.STRING, allowNull: true, unique: true },
    designation: { type: DataTypes.STRING, allowNull: true },
    phone: { type: DataTypes.STRING, allowNull: true },
    address: { type: DataTypes.TEXT, allowNull: true },
    photo_url: { type: DataTypes.STRING, allowNull: true },
    assigned_classes: { type: DataTypes.JSON, allowNull: true }
  }, {
    tableName: "staff",
    underscored: true,
    indexes: [{ fields: ["tenant_id"] }]
  });
};
