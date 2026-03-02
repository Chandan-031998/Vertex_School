SET FOREIGN_KEY_CHECKS=0;

ALTER TABLE roles
  MODIFY COLUMN name ENUM('ADMIN','TEACHER','ACCOUNTANT','PARENT','TRANSPORT_MANAGER') NOT NULL;

INSERT INTO roles (name, description, created_at, updated_at)
SELECT 'PARENT', 'Parent portal user', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name='PARENT');

CREATE TABLE IF NOT EXISTS parent_profiles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL DEFAULT 1,
  user_id INT NOT NULL UNIQUE,
  phone VARCHAR(40) NULL,
  address TEXT NULL,
  preferred_language VARCHAR(10) NOT NULL DEFAULT 'en',
  notification_preferences_json JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_parent_profiles_tenant (tenant_id),
  CONSTRAINT fk_parent_profiles_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_parent_profiles_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS parent_students (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL DEFAULT 1,
  parent_user_id INT NOT NULL,
  student_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_parent_students_parent_student (parent_user_id, student_id),
  INDEX idx_parent_students_tenant (tenant_id),
  CONSTRAINT fk_parent_students_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_parent_students_user FOREIGN KEY (parent_user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_parent_students_student FOREIGN KEY (student_id) REFERENCES students(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS=1;
