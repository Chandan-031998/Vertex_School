module.exports = (sequelize, DataTypes) => {
  return sequelize.define("TransportRequest", {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    parent_user_id: { type: DataTypes.INTEGER, allowNull: false },
    student_id: { type: DataTypes.INTEGER, allowNull: false },
    request_type: {
      type: DataTypes.ENUM("STOP_CHANGE", "PICKUP_CHANGE", "DROP_CHANGE", "PAUSE_TRANSPORT", "RESUME_TRANSPORT"),
      allowNull: false
    },
    payload_json: { type: DataTypes.JSON, allowNull: false, defaultValue: {} },
    status: { type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED"), allowNull: false, defaultValue: "PENDING" },
    admin_note: { type: DataTypes.TEXT, allowNull: true }
  }, {
    tableName: "transport_requests",
    underscored: true,
    indexes: [{ fields: ["tenant_id"] }, { fields: ["parent_user_id"] }, { fields: ["student_id"] }, { fields: ["status"] }]
  });
};
