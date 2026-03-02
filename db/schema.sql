-- Vertex School Manager - MySQL Schema
-- Database: vertex_school_manager

SET FOREIGN_KEY_CHECKS=0;

CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name ENUM('ADMIN','TEACHER','ACCOUNTANT') NOT NULL UNIQUE,
  description VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role_id INT NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  last_login_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS staff (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  employee_code VARCHAR(50) UNIQUE,
  designation VARCHAR(120) NULL,
  phone VARCHAR(40) NULL,
  assigned_classes JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_staff_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS admissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_no VARCHAR(40) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  dob DATE NULL,
  gender ENUM('Male','Female','Other') NULL,
  applying_class VARCHAR(50) NOT NULL,
  section VARCHAR(10) NULL,
  parent_name VARCHAR(255) NULL,
  parent_phone VARCHAR(40) NULL,
  address TEXT NULL,
  status ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  remarks VARCHAR(255) NULL,
  documents JSON NULL,
  verified_by INT NULL,
  verified_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_admissions_verified_by FOREIGN KEY (verified_by) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admission_id INT NULL UNIQUE,
  admission_no VARCHAR(40) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  dob DATE NULL,
  gender ENUM('Male','Female','Other') NULL,
  class_name VARCHAR(50) NOT NULL,
  section VARCHAR(10) NOT NULL DEFAULT 'A',
  roll_no INT NULL,
  parent_name VARCHAR(255) NULL,
  parent_phone VARCHAR(40) NULL,
  contact_email VARCHAR(255) NULL,
  address TEXT NULL,
  documents JSON NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_students_admission FOREIGN KEY (admission_id) REFERENCES admissions(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  INDEX idx_students_class_section (class_name, section),
  INDEX idx_students_active (is_active)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS attendance (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  class_name VARCHAR(50) NOT NULL,
  section VARCHAR(10) NOT NULL,
  date DATE NOT NULL,
  status ENUM('P','A') NOT NULL,
  marked_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_attendance_student_day (student_id, date),
  CONSTRAINT fk_attendance_student FOREIGN KEY (student_id) REFERENCES students(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_attendance_marked_by FOREIGN KEY (marked_by) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  INDEX idx_attendance_class_date (class_name, section, date)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS fee_structures (
  id INT AUTO_INCREMENT PRIMARY KEY,
  class_name VARCHAR(50) NOT NULL,
  fee_name VARCHAR(100) NOT NULL DEFAULT 'Tuition',
  amount DECIMAL(10,2) NOT NULL,
  frequency ENUM('MONTHLY','QUARTERLY','YEARLY') NOT NULL DEFAULT 'MONTHLY',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_fee_structure (class_name, fee_name, frequency)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS fee_invoices (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  invoice_no VARCHAR(50) NOT NULL UNIQUE,
  student_id INT NOT NULL,
  class_name VARCHAR(50) NOT NULL,
  section VARCHAR(10) NOT NULL,
  billing_month VARCHAR(7) NOT NULL, -- YYYY-MM
  total_amount DECIMAL(10,2) NOT NULL,
  status ENUM('UNPAID','PARTIAL','PAID') NOT NULL DEFAULT 'UNPAID',
  created_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_invoice_student_month (student_id, billing_month),
  CONSTRAINT fk_invoice_student FOREIGN KEY (student_id) REFERENCES students(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_invoice_created_by FOREIGN KEY (created_by) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  INDEX idx_invoice_month (billing_month),
  INDEX idx_invoice_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS payments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  invoice_id BIGINT NOT NULL,
  receipt_no VARCHAR(50) NOT NULL UNIQUE,
  amount_paid DECIMAL(10,2) NOT NULL,
  payment_mode ENUM('CASH','ONLINE') NOT NULL,
  transaction_ref VARCHAR(120) NULL,
  paid_at DATETIME NOT NULL,
  recorded_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_payment_invoice FOREIGN KEY (invoice_id) REFERENCES fee_invoices(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_payment_recorded_by FOREIGN KEY (recorded_by) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  INDEX idx_payment_paid_at (paid_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NULL,
  type ENUM('FEE_REMINDER','GENERAL') NOT NULL DEFAULT 'GENERAL',
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  channel ENUM('IN_APP','EMAIL') NOT NULL DEFAULT 'IN_APP',
  status ENUM('PENDING','SENT','FAILED') NOT NULL DEFAULT 'PENDING',
  scheduled_at DATETIME NULL,
  sent_at DATETIME NULL,
  meta JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_notification_student FOREIGN KEY (student_id) REFERENCES students(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  INDEX idx_notification_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS activity_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  action VARCHAR(80) NOT NULL,
  entity VARCHAR(80) NOT NULL,
  entity_id VARCHAR(80) NULL,
  details JSON NULL,
  ip VARCHAR(60) NULL,
  user_agent VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_activity_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  INDEX idx_activity_action (action),
  INDEX idx_activity_entity (entity)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tenants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tenant_settings (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  category VARCHAR(80) NOT NULL,
  settings_json JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_tenant_settings_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  UNIQUE KEY uq_tenant_settings_tenant_category (tenant_id, category)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS feature_flags (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  `key` VARCHAR(120) NOT NULL,
  enabled TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_feature_flags_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  UNIQUE KEY uq_feature_flags_tenant_key (tenant_id, `key`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS integrations (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  type ENUM('smtp','sms','payment','whatsapp') NOT NULL,
  config_json JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_integrations_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  UNIQUE KEY uq_integrations_tenant_type (tenant_id, type)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ai_settings (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  enabled TINYINT(1) NOT NULL DEFAULT 0,
  provider VARCHAR(80) NULL,
  model VARCHAR(120) NULL,
  quota_json JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_ai_settings_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  UNIQUE KEY uq_ai_settings_tenant (tenant_id)
) ENGINE=InnoDB;

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
