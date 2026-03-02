module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Section", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: true },
    class_id: { type: DataTypes.INTEGER, allowNull: false },
    section_name: { type: DataTypes.STRING(20), allowNull: false }
  }, {
    tableName: "sections",
    underscored: true,
    indexes: [
      { unique: true, fields: ["tenant_id", "class_id", "section_name"] },
      { fields: ["tenant_id"] },
      { fields: ["class_id"] }
    ]
  });
};
