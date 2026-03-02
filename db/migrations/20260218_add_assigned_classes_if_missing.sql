-- Adds staff.assigned_classes if missing (MySQL 8+)
SET @col_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'staff'
    AND column_name = 'assigned_classes'
);

SET @sql := IF(
  @col_exists = 0,
  'ALTER TABLE staff ADD COLUMN assigned_classes JSON NULL AFTER phone;',
  'SELECT "staff.assigned_classes already exists";'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
