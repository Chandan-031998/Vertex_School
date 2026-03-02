module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Timetable", {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    academic_year_id: { type: DataTypes.INTEGER, allowNull: true },
    timetable_json: { type: DataTypes.JSON, allowNull: false, defaultValue: {} }
  }, {
    tableName: "timetables",
    underscored: true,
    indexes: [{ fields: ["tenant_id"] }]
  });
};
