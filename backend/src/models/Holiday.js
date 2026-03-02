module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Holiday", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: true },
    title: { type: DataTypes.STRING(180), allowNull: false },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    type: { type: DataTypes.ENUM("HOLIDAY", "EVENT"), allowNull: false, defaultValue: "HOLIDAY" }
  }, {
    tableName: "holidays",
    underscored: true,
    indexes: [
      { unique: true, fields: ["tenant_id", "date", "title"] },
      { fields: ["tenant_id"] },
      { fields: ["date"] }
    ]
  });
};
