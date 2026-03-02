SET FOREIGN_KEY_CHECKS=0;

ALTER TABLE roles
  MODIFY COLUMN name ENUM('ADMIN','TEACHER','ACCOUNTANT','PARENT','TRANSPORT_MANAGER') NOT NULL;

CREATE TABLE IF NOT EXISTS parents (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL DEFAULT 1,
  user_id INT NOT NULL UNIQUE,
  phone VARCHAR(40) NULL,
  address TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_parents_tenant (tenant_id),
  CONSTRAINT fk_parents_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_parents_user FOREIGN KEY (user_id) REFERENCES users(id)
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

CREATE TABLE IF NOT EXISTS vehicles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL DEFAULT 1,
  bus_no VARCHAR(50) NOT NULL,
  registration_no VARCHAR(100) NOT NULL,
  capacity INT NOT NULL,
  status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  insurance_expiry DATE NULL,
  fitness_expiry DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_vehicles_tenant_bus (tenant_id, bus_no),
  INDEX idx_vehicles_tenant (tenant_id),
  CONSTRAINT fk_vehicles_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS drivers (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL DEFAULT 1,
  full_name VARCHAR(120) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  license_no VARCHAR(100) NOT NULL,
  license_expiry DATE NULL,
  type ENUM('DRIVER','ATTENDANT') NOT NULL DEFAULT 'DRIVER',
  status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_drivers_tenant_license (tenant_id, license_no),
  INDEX idx_drivers_tenant (tenant_id),
  CONSTRAINT fk_drivers_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS routes (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL DEFAULT 1,
  route_name VARCHAR(120) NOT NULL,
  start_point VARCHAR(180) NOT NULL,
  end_point VARCHAR(180) NOT NULL,
  status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_routes_tenant_name (tenant_id, route_name),
  INDEX idx_routes_tenant (tenant_id),
  CONSTRAINT fk_routes_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS route_stops (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL DEFAULT 1,
  route_id BIGINT NOT NULL,
  stop_name VARCHAR(180) NOT NULL,
  pickup_time TIME NULL,
  drop_time TIME NULL,
  latitude DECIMAL(10,7) NULL,
  longitude DECIMAL(10,7) NULL,
  stop_order INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_route_stops_tenant (tenant_id),
  INDEX idx_route_stops_route (route_id),
  CONSTRAINT fk_route_stops_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_route_stops_route FOREIGN KEY (route_id) REFERENCES routes(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS vehicle_assignments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL DEFAULT 1,
  vehicle_id BIGINT NOT NULL,
  route_id BIGINT NOT NULL,
  driver_id BIGINT NOT NULL,
  attendant_id BIGINT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_vehicle_assignments_tenant (tenant_id),
  CONSTRAINT fk_vehicle_assignments_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_vehicle_assignments_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_vehicle_assignments_route FOREIGN KEY (route_id) REFERENCES routes(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_vehicle_assignments_driver FOREIGN KEY (driver_id) REFERENCES drivers(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_vehicle_assignments_attendant FOREIGN KEY (attendant_id) REFERENCES drivers(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS student_transport (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL DEFAULT 1,
  student_id INT NOT NULL UNIQUE,
  route_id BIGINT NOT NULL,
  stop_id BIGINT NOT NULL,
  vehicle_id BIGINT NOT NULL,
  pickup_enabled TINYINT(1) NOT NULL DEFAULT 1,
  drop_enabled TINYINT(1) NOT NULL DEFAULT 1,
  monthly_fee DECIMAL(10,2) NULL,
  status ENUM('ACTIVE','PAUSED','CANCELLED') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_student_transport_tenant (tenant_id),
  CONSTRAINT fk_student_transport_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_student_transport_student FOREIGN KEY (student_id) REFERENCES students(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_student_transport_route FOREIGN KEY (route_id) REFERENCES routes(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_student_transport_stop FOREIGN KEY (stop_id) REFERENCES route_stops(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_student_transport_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS transport_trips (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL DEFAULT 1,
  vehicle_id BIGINT NOT NULL,
  route_id BIGINT NOT NULL,
  trip_date DATE NOT NULL,
  trip_type ENUM('PICKUP','DROP') NOT NULL,
  start_time DATETIME NULL,
  end_time DATETIME NULL,
  status ENUM('SCHEDULED','RUNNING','COMPLETED','CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_transport_trips_tenant (tenant_id),
  CONSTRAINT fk_transport_trips_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_transport_trips_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_transport_trips_route FOREIGN KEY (route_id) REFERENCES routes(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS transport_student_events (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL DEFAULT 1,
  trip_id BIGINT NOT NULL,
  student_id INT NOT NULL,
  boarded TINYINT(1) NOT NULL DEFAULT 0,
  dropped TINYINT(1) NOT NULL DEFAULT 0,
  boarded_at DATETIME NULL,
  dropped_at DATETIME NULL,
  remarks VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_transport_events_trip_student (trip_id, student_id),
  INDEX idx_transport_events_tenant (tenant_id),
  CONSTRAINT fk_transport_events_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_transport_events_trip FOREIGN KEY (trip_id) REFERENCES transport_trips(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_transport_events_student FOREIGN KEY (student_id) REFERENCES students(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS transport_requests (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL DEFAULT 1,
  parent_user_id INT NOT NULL,
  student_id INT NOT NULL,
  request_type ENUM('STOP_CHANGE','PICKUP_CHANGE','DROP_CHANGE','PAUSE_TRANSPORT','RESUME_TRANSPORT') NOT NULL,
  payload_json JSON NOT NULL,
  status ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  admin_note TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_transport_requests_tenant (tenant_id),
  CONSTRAINT fk_transport_requests_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_transport_requests_parent FOREIGN KEY (parent_user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_transport_requests_student FOREIGN KEY (student_id) REFERENCES students(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO roles (name, description, created_at, updated_at)
SELECT 'PARENT', 'Parent portal user', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name='PARENT');

INSERT INTO roles (name, description, created_at, updated_at)
SELECT 'TRANSPORT_MANAGER', 'Transport operations manager', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name='TRANSPORT_MANAGER');

SET FOREIGN_KEY_CHECKS=1;
