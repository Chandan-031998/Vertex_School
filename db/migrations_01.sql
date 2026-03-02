-- Vertex School Manager consolidated migration (multi-tenant + settings)
-- Run on MySQL 8+
SET FOREIGN_KEY_CHECKS=0;

CREATE TABLE IF NOT EXISTS tenants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id INT NOT NULL DEFAULT 1 AFTER id;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS tenant_id INT NOT NULL DEFAULT 1 AFTER id;
ALTER TABLE admissions ADD COLUMN IF NOT EXISTS tenant_id INT NOT NULL DEFAULT 1 AFTER id;
ALTER TABLE students ADD COLUMN IF NOT EXISTS tenant_id INT NOT NULL DEFAULT 1 AFTER id;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS tenant_id INT NOT NULL DEFAULT 1 AFTER id;
ALTER TABLE fee_structures ADD COLUMN IF NOT EXISTS tenant_id INT NOT NULL DEFAULT 1 AFTER id;
ALTER TABLE fee_invoices ADD COLUMN IF NOT EXISTS tenant_id INT NOT NULL DEFAULT 1 AFTER id;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS tenant_id INT NOT NULL DEFAULT 1 AFTER id;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS tenant_id INT NOT NULL DEFAULT 1 AFTER id;
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS tenant_id INT NOT NULL DEFAULT 1 AFTER id;

CREATE TABLE IF NOT EXISTS tenant_settings (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  category VARCHAR(80) NOT NULL,
  settings_json JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_tenant_settings_tenant_category (tenant_id, category),
  CONSTRAINT fk_tenant_settings_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS feature_flags (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  `key` VARCHAR(120) NOT NULL,
  enabled TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_feature_flags_tenant_key (tenant_id, `key`),
  CONSTRAINT fk_feature_flags_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS integrations (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  type ENUM('smtp','sms','payment','whatsapp') NOT NULL,
  config_json JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_integrations_tenant_type (tenant_id, type),
  CONSTRAINT fk_integrations_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ai_settings (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  enabled TINYINT(1) NOT NULL DEFAULT 0,
  provider VARCHAR(40) NULL,
  model VARCHAR(120) NULL,
  quota_json JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_ai_settings_tenant (tenant_id),
  CONSTRAINT fk_ai_settings_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS role_permissions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  role_name VARCHAR(40) NOT NULL,
  resource VARCHAR(80) NOT NULL,
  can_create TINYINT(1) NOT NULL DEFAULT 0,
  can_read TINYINT(1) NOT NULL DEFAULT 1,
  can_update TINYINT(1) NOT NULL DEFAULT 0,
  can_delete TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_role_permissions (tenant_id, role_name, resource),
  CONSTRAINT fk_role_permissions_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notification_templates (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  `key` VARCHAR(80) NOT NULL,
  subject VARCHAR(255) NULL,
  body TEXT NOT NULL,
  channel ENUM('SMS','EMAIL','WHATSAPP') NOT NULL DEFAULT 'EMAIL',
  language VARCHAR(20) NOT NULL DEFAULT 'en',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_notification_templates (tenant_id, `key`, channel, language),
  CONSTRAINT fk_notification_templates_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS subscriptions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  plan ENUM('BASIC','PRO','ENTERPRISE') NOT NULL DEFAULT 'BASIC',
  status ENUM('ACTIVE','EXPIRED') NOT NULL DEFAULT 'ACTIVE',
  start_date DATE NULL,
  end_date DATE NULL,
  limits_json JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_subscriptions_tenant (tenant_id),
  CONSTRAINT fk_subscriptions_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO tenants (id, name, slug, status)
SELECT 1, 'Default Tenant', 'default', 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE id = 1);

UPDATE users SET tenant_id = 1 WHERE tenant_id IS NULL OR tenant_id = 0;
UPDATE staff SET tenant_id = 1 WHERE tenant_id IS NULL OR tenant_id = 0;
UPDATE admissions SET tenant_id = 1 WHERE tenant_id IS NULL OR tenant_id = 0;
UPDATE students SET tenant_id = 1 WHERE tenant_id IS NULL OR tenant_id = 0;
UPDATE attendance SET tenant_id = 1 WHERE tenant_id IS NULL OR tenant_id = 0;
UPDATE fee_structures SET tenant_id = 1 WHERE tenant_id IS NULL OR tenant_id = 0;
UPDATE fee_invoices SET tenant_id = 1 WHERE tenant_id IS NULL OR tenant_id = 0;
UPDATE payments SET tenant_id = 1 WHERE tenant_id IS NULL OR tenant_id = 0;
UPDATE notifications SET tenant_id = 1 WHERE tenant_id IS NULL OR tenant_id = 0;
UPDATE activity_logs SET tenant_id = 1 WHERE tenant_id IS NULL OR tenant_id = 0;

INSERT INTO tenant_settings (tenant_id, category, settings_json)
SELECT 1, 'branding', JSON_OBJECT('logo_url', NULL, 'favicon_url', NULL, 'primary_color', '#2563eb', 'secondary_color', '#0f172a', 'font_family', 'system-ui', 'product_name', 'Vertex School Manager')
WHERE NOT EXISTS (SELECT 1 FROM tenant_settings WHERE tenant_id = 1 AND category = 'branding');

INSERT INTO tenant_settings (tenant_id, category, settings_json)
SELECT 1, 'school_profile', JSON_OBJECT('school_name', 'Vertex School', 'address', NULL, 'phone', NULL, 'email', NULL, 'website', NULL, 'principal_name', NULL)
WHERE NOT EXISTS (SELECT 1 FROM tenant_settings WHERE tenant_id = 1 AND category = 'school_profile');

INSERT INTO ai_settings (tenant_id, enabled, provider, model, quota_json)
SELECT 1, 0, 'mock', 'mock-v1', JSON_OBJECT()
WHERE NOT EXISTS (SELECT 1 FROM ai_settings WHERE tenant_id = 1);

SET FOREIGN_KEY_CHECKS=1;
