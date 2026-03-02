SET FOREIGN_KEY_CHECKS=0;

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS teacher_remarks TEXT NULL AFTER address;

ALTER TABLE staff
  ADD COLUMN IF NOT EXISTS address TEXT NULL AFTER phone,
  ADD COLUMN IF NOT EXISTS photo_url VARCHAR(255) NULL AFTER address;

CREATE TABLE IF NOT EXISTS homework (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL DEFAULT 1,
  class_name VARCHAR(50) NOT NULL,
  section VARCHAR(20) NOT NULL,
  subject_id INT NULL,
  title VARCHAR(180) NOT NULL,
  description TEXT NULL,
  due_date DATE NULL,
  attachments_json JSON NOT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_homework_tenant (tenant_id),
  INDEX idx_homework_class_section (class_name, section),
  INDEX idx_homework_created_by (created_by),
  CONSTRAINT fk_homework_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_homework_subject FOREIGN KEY (subject_id) REFERENCES subjects(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_homework_creator FOREIGN KEY (created_by) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS exams (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL DEFAULT 1,
  class_name VARCHAR(50) NOT NULL,
  section VARCHAR(20) NOT NULL,
  subject_id INT NOT NULL,
  exam_name VARCHAR(120) NOT NULL,
  exam_date DATE NOT NULL,
  max_marks DECIMAL(10,2) NOT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_exams_tenant (tenant_id),
  INDEX idx_exams_class_section (class_name, section),
  INDEX idx_exams_created_by (created_by),
  CONSTRAINT fk_exams_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_exams_subject FOREIGN KEY (subject_id) REFERENCES subjects(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_exams_creator FOREIGN KEY (created_by) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS marks (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL DEFAULT 1,
  exam_id BIGINT NOT NULL,
  student_id INT NOT NULL,
  marks_obtained DECIMAL(10,2) NOT NULL,
  remarks VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_marks_exam_student (exam_id, student_id),
  INDEX idx_marks_tenant (tenant_id),
  CONSTRAINT fk_marks_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_marks_exam FOREIGN KEY (exam_id) REFERENCES exams(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_marks_student FOREIGN KEY (student_id) REFERENCES students(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS timetables (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL DEFAULT 1,
  academic_year_id INT NULL,
  timetable_json JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_timetables_tenant (tenant_id),
  CONSTRAINT fk_timetables_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_timetables_academic_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS message_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL DEFAULT 1,
  student_id INT NULL,
  class_name VARCHAR(50) NULL,
  section VARCHAR(20) NULL,
  channel ENUM('SMS','WHATSAPP','EMAIL') NOT NULL,
  message TEXT NOT NULL,
  sent_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_message_logs_tenant (tenant_id),
  INDEX idx_message_logs_sent_by (sent_by),
  CONSTRAINT fk_message_logs_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_message_logs_student FOREIGN KEY (student_id) REFERENCES students(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_message_logs_sender FOREIGN KEY (sent_by) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS=1;
