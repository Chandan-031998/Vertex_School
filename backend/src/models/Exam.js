module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Exam", {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    class_name: { type: DataTypes.STRING(50), allowNull: false },
    section: { type: DataTypes.STRING(20), allowNull: false },
    subject_id: { type: DataTypes.INTEGER, allowNull: false },
    exam_name: { type: DataTypes.STRING(120), allowNull: false },
    exam_date: { type: DataTypes.DATEONLY, allowNull: false },
    max_marks: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    created_by: { type: DataTypes.INTEGER, allowNull: false }
  }, {
    tableName: "exams",
    underscored: true,
    indexes: [
      { fields: ["tenant_id"] },
      { fields: ["class_name", "section"] },
      { fields: ["created_by"] }
    ]
  });
};
