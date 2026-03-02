module.exports = (sequelize, DataTypes) => {
  return sequelize.define("SchoolClass", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: true },
    class_name: { type: DataTypes.STRING(50), allowNull: false }
  }, {
    tableName: "classes",
    underscored: true,
    indexes: [
      { unique: true, fields: ["tenant_id", "class_name"] },
      { fields: ["tenant_id"] }
    ]
  });
};
