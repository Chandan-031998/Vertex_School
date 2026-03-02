module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Subject", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: true },
    class_id: { type: DataTypes.INTEGER, allowNull: false },
    subject_name: { type: DataTypes.STRING(120), allowNull: false }
  }, {
    tableName: "subjects",
    underscored: true,
    indexes: [
      { fields: ["tenant_id"] },
      { fields: ["class_id"] }
    ]
  });
};
