module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Role", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.ENUM("ADMIN","TEACHER","ACCOUNTANT","PARENT","TRANSPORT_MANAGER"), allowNull: false, unique: true },
    description: { type: DataTypes.STRING, allowNull: true }
  }, {
    tableName: "roles",
    underscored: true
  });
};
