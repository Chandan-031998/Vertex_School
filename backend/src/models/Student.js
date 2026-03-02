module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Student", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    admission_id: { type: DataTypes.INTEGER, allowNull: true, unique: true },
    admission_no: { type: DataTypes.STRING, allowNull: false, unique: true },
    full_name: { type: DataTypes.STRING, allowNull: false },
    dob: { type: DataTypes.DATEONLY, allowNull: true },
    gender: { type: DataTypes.ENUM("Male","Female","Other"), allowNull: true },
    class_name: { type: DataTypes.STRING, allowNull: false },
    section: { type: DataTypes.STRING, allowNull: false, defaultValue: "A" },
    roll_no: { type: DataTypes.INTEGER, allowNull: true },
    parent_name: { type: DataTypes.STRING, allowNull: true },
    parent_phone: { type: DataTypes.STRING, allowNull: true },
    contact_email: { type: DataTypes.STRING, allowNull: true },
    address: { type: DataTypes.TEXT, allowNull: true },
    teacher_remarks: { type: DataTypes.TEXT, allowNull: true },
    documents: { type: DataTypes.JSON, allowNull: true },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
  }, {
    tableName: "students",
    underscored: true,
    indexes: [{ fields: ["tenant_id"] }]
  });
};
