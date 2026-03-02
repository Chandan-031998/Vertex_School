module.exports = (sequelize, DataTypes) => {
  return sequelize.define("TransportStudentEvent", {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    trip_id: { type: DataTypes.BIGINT, allowNull: false },
    student_id: { type: DataTypes.INTEGER, allowNull: false },
    boarded: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    dropped: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    boarded_at: { type: DataTypes.DATE, allowNull: true },
    dropped_at: { type: DataTypes.DATE, allowNull: true },
    remarks: { type: DataTypes.STRING(255), allowNull: true }
  }, {
    tableName: "transport_student_events",
    underscored: true,
    indexes: [{ fields: ["tenant_id"] }, { unique: true, fields: ["trip_id", "student_id"] }]
  });
};
