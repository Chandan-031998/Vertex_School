module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Admission", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    application_no: { type: DataTypes.STRING, allowNull: false, unique: true },
    full_name: { type: DataTypes.STRING, allowNull: false },
    dob: { type: DataTypes.DATEONLY, allowNull: true },
    gender: { type: DataTypes.ENUM("Male","Female","Other"), allowNull: true },
    applying_class: { type: DataTypes.STRING, allowNull: false },
    section: { type: DataTypes.STRING, allowNull: true },
    parent_name: { type: DataTypes.STRING, allowNull: true },
    parent_phone: { type: DataTypes.STRING, allowNull: true },
    address: { type: DataTypes.TEXT, allowNull: true },
    status: { type: DataTypes.ENUM("PENDING","APPROVED","REJECTED"), allowNull: false, defaultValue: "PENDING" },
    remarks: { type: DataTypes.STRING, allowNull: true },
    documents: { type: DataTypes.JSON, allowNull: true },
    verified_by: { type: DataTypes.INTEGER, allowNull: true },
    verified_at: { type: DataTypes.DATE, allowNull: true }
  }, {
    tableName: "admissions",
    underscored: true,
    indexes: [{ fields: ["tenant_id"] }]
  });
};
