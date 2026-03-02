module.exports = (sequelize, DataTypes) => {
  return sequelize.define("User", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    role_id: { type: DataTypes.INTEGER, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING, allowNull: false },
    full_name: { type: DataTypes.STRING, allowNull: false },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    last_login_at: { type: DataTypes.DATE, allowNull: true }
  }, {
    tableName: "users",
    underscored: true,
    indexes: [{ fields: ["tenant_id"] }]
  });
};
