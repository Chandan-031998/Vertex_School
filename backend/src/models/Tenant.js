module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Tenant", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    status: { type: DataTypes.ENUM("ACTIVE", "INACTIVE"), allowNull: false, defaultValue: "ACTIVE" }
  }, {
    tableName: "tenants",
    underscored: true
  });
};
