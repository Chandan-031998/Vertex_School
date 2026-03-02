module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Homework", {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    class_name: { type: DataTypes.STRING(50), allowNull: false },
    section: { type: DataTypes.STRING(20), allowNull: false },
    subject_id: { type: DataTypes.INTEGER, allowNull: true },
    title: { type: DataTypes.STRING(180), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    due_date: { type: DataTypes.DATEONLY, allowNull: true },
    attachments_json: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    created_by: { type: DataTypes.INTEGER, allowNull: false }
  }, {
    tableName: "homework",
    underscored: true,
    indexes: [
      { fields: ["tenant_id"] },
      { fields: ["class_name", "section"] },
      { fields: ["created_by"] }
    ]
  });
};
