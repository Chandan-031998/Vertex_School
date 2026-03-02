SET FOREIGN_KEY_CHECKS=0;

CREATE TABLE IF NOT EXISTS timetable_entries (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL DEFAULT 1,
  class_id INT NOT NULL,
  section_id INT NOT NULL,
  day_of_week ENUM('MON','TUE','WED','THU','FRI','SAT','SUN') NOT NULL,
  period_no INT NOT NULL,
  subject_name VARCHAR(120) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  teacher_name VARCHAR(120) NULL,
  room_no VARCHAR(40) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_timetable_unique_slot (tenant_id, class_id, section_id, day_of_week, period_no),
  INDEX idx_timetable_tenant (tenant_id),
  CONSTRAINT fk_timetable_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_timetable_class FOREIGN KEY (class_id) REFERENCES classes(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_timetable_section FOREIGN KEY (section_id) REFERENCES sections(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS=1;
