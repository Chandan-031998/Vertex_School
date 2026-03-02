module.exports = (sequelize, DataTypes) => {
  return sequelize.define("ParentStudent", {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    parent_user_id: { type: DataTypes.INTEGER, allowNull: false },
    student_id: { type: DataTypes.INTEGER, allowNull: false }
  }, {
    tableName: "parent_students",
    underscored: true,
    indexes: [{ fields: ["tenant_id"] }, { unique: true, fields: ["parent_user_id", "student_id"] }]
  });
};
