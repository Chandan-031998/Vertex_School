module.exports = (sequelize, DataTypes) => {
  return sequelize.define("AcademicYear", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: true },
    name: { type: DataTypes.STRING(40), allowNull: false },
    start_date: { type: DataTypes.DATEONLY, allowNull: false },
    end_date: { type: DataTypes.DATEONLY, allowNull: false },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
  }, {
    tableName: "academic_years",
    underscored: true,
    indexes: [
      { fields: ["tenant_id"] },
      { fields: ["tenant_id", "is_active"] }
    ]
  });
};
