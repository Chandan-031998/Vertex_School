module.exports = (sequelize, DataTypes) => {
  return sequelize.define("TimetableEntry", {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    class_id: { type: DataTypes.INTEGER, allowNull: false },
    section_id: { type: DataTypes.INTEGER, allowNull: false },
    day_of_week: { type: DataTypes.ENUM("MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"), allowNull: false },
    period_no: { type: DataTypes.INTEGER, allowNull: false },
    subject_name: { type: DataTypes.STRING(120), allowNull: false },
    start_time: { type: DataTypes.TIME, allowNull: false },
    end_time: { type: DataTypes.TIME, allowNull: false },
    teacher_name: { type: DataTypes.STRING(120), allowNull: true },
    room_no: { type: DataTypes.STRING(40), allowNull: true }
  }, {
    tableName: "timetable_entries",
    underscored: true,
    indexes: [
      { name: "idx_timetable_tenant", fields: ["tenant_id"] },
      { name: "uq_timetable_unique_slot", unique: true, fields: ["tenant_id", "class_id", "section_id", "day_of_week", "period_no"] }
    ]
  });
};
