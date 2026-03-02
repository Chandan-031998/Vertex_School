module.exports = (sequelize, DataTypes) => {
  return sequelize.define("RolePermission", {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    role_name: { type: DataTypes.STRING(40), allowNull: false },
    resource: { type: DataTypes.STRING(80), allowNull: false },
    can_create: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    can_read: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    can_update: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    can_delete: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
  }, {
    tableName: "role_permissions",
    underscored: true,
    indexes: [{ unique: true, fields: ["tenant_id", "role_name", "resource"] }, { fields: ["tenant_id"] }]
  });
};
