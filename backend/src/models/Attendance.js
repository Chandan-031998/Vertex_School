module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Attendance", {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    student_id: { type: DataTypes.INTEGER, allowNull: false },
    class_name: { type: DataTypes.STRING, allowNull: false },
    section: { type: DataTypes.STRING, allowNull: false },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    status: { type: DataTypes.ENUM("P","A"), allowNull: false },
    marked_by: { type: DataTypes.INTEGER, allowNull: true }
  }, {
    tableName: "attendance",
    underscored: true,
    indexes: [{ unique: true, fields: ["tenant_id", "student_id", "date"] }, { fields: ["tenant_id"] }]
  });
};
