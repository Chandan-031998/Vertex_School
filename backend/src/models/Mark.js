module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Mark", {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    exam_id: { type: DataTypes.BIGINT, allowNull: false },
    student_id: { type: DataTypes.INTEGER, allowNull: false },
    marks_obtained: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    remarks: { type: DataTypes.STRING(255), allowNull: true }
  }, {
    tableName: "marks",
    underscored: true,
    indexes: [
      { fields: ["tenant_id"] },
      { unique: true, fields: ["exam_id", "student_id"] }
    ]
  });
};
