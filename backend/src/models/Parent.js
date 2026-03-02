module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Parent", {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    user_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    phone: { type: DataTypes.STRING(40), allowNull: true },
    address: { type: DataTypes.TEXT, allowNull: true }
  }, {
    tableName: "parents",
    underscored: true,
    indexes: [{ fields: ["tenant_id"] }]
  });
};
