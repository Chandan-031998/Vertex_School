module.exports = (sequelize, DataTypes) => {
  return sequelize.define("AttendanceSetting", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: true, unique: true },
    mode: { type: DataTypes.ENUM("DAILY", "PERIOD"), allowNull: false, defaultValue: "DAILY" },
    cutoff_time: { type: DataTypes.TIME, allowNull: true },
    allow_edit_days: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    auto_absent_after_cutoff: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    leave_types_json: { type: DataTypes.JSON, allowNull: false, defaultValue: ["SICK", "CASUAL", "OFFICIAL"] }
  }, {
    tableName: "attendance_settings",
    underscored: true,
    indexes: [{ unique: true, fields: ["tenant_id"] }]
  });
};
