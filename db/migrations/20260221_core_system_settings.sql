-- Core System Settings (safe, MySQL 8+)
SET FOREIGN_KEY_CHECKS=0;

CREATE TABLE IF NOT EXISTS academic_years (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NULL,
  name VARCHAR(40) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_academic_years_tenant (tenant_id),
  INDEX idx_academic_years_tenant_active (tenant_id, is_active),
  CONSTRAINT fk_academic_years_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS classes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NULL,
  class_name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_classes_tenant_class_name (tenant_id, class_name),
  INDEX idx_classes_tenant (tenant_id),
  CONSTRAINT fk_classes_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NULL,
  class_id INT NOT NULL,
  section_name VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_sections_tenant_class_section (tenant_id, class_id, section_name),
  INDEX idx_sections_tenant (tenant_id),
  INDEX idx_sections_class (class_id),
  CONSTRAINT fk_sections_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_sections_class FOREIGN KEY (class_id) REFERENCES classes(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NULL,
  class_id INT NOT NULL,
  subject_name VARCHAR(120) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_subjects_tenant (tenant_id),
  INDEX idx_subjects_class (class_id),
  CONSTRAINT fk_subjects_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_subjects_class FOREIGN KEY (class_id) REFERENCES classes(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS holidays (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NULL,
  title VARCHAR(180) NOT NULL,
  date DATE NOT NULL,
  type ENUM('HOLIDAY','EVENT') NOT NULL DEFAULT 'HOLIDAY',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_holidays_tenant_date_title (tenant_id, date, title),
  INDEX idx_holidays_tenant (tenant_id),
  INDEX idx_holidays_date (date),
  CONSTRAINT fk_holidays_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS fee_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  receipt_prefix VARCHAR(40) NOT NULL DEFAULT 'VSM-REC',
  invoice_prefix VARCHAR(40) NOT NULL DEFAULT 'VSM-INV',
  late_fee_enabled TINYINT(1) NOT NULL DEFAULT 0,
  late_fee_type ENUM('FIXED','PERCENT') NOT NULL DEFAULT 'FIXED',
  late_fee_value DECIMAL(10,2) NOT NULL DEFAULT 0,
  grace_days INT NOT NULL DEFAULT 0,
  payment_methods_json JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_fee_settings_tenant (tenant_id),
  CONSTRAINT fk_fee_settings_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS attendance_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NULL,
  mode ENUM('DAILY','PERIOD') NOT NULL DEFAULT 'DAILY',
  cutoff_time TIME NULL,
  allow_edit_days INT NOT NULL DEFAULT 1,
  auto_absent_after_cutoff TINYINT(1) NOT NULL DEFAULT 0,
  leave_types_json JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_attendance_settings_tenant (tenant_id),
  CONSTRAINT fk_attendance_settings_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS security_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NULL,
  password_min_length INT NOT NULL DEFAULT 8,
  password_require_upper TINYINT(1) NOT NULL DEFAULT 1,
  password_require_number TINYINT(1) NOT NULL DEFAULT 1,
  password_require_symbol TINYINT(1) NOT NULL DEFAULT 0,
  session_timeout_minutes INT NOT NULL DEFAULT 120,
  enable_2fa TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_security_settings_tenant (tenant_id),
  CONSTRAINT fk_security_settings_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS=1;
