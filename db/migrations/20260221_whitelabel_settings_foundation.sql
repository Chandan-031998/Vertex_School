-- White-label backend foundation (safe, MySQL 8+)
SET FOREIGN_KEY_CHECKS=0;

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

INSERT INTO tenants (id, name, slug, status)
SELECT 1, 'Default Tenant', 'default', 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE id = 1);

INSERT INTO feature_flags (tenant_id, `key`, enabled)
SELECT 1, 'AI_ASSISTANT', 0
WHERE NOT EXISTS (
  SELECT 1 FROM feature_flags WHERE tenant_id = 1 AND `key` = 'AI_ASSISTANT'
);

INSERT INTO feature_flags (tenant_id, `key`, enabled)
SELECT 1, 'NOTIFICATIONS', 1
WHERE NOT EXISTS (
  SELECT 1 FROM feature_flags WHERE tenant_id = 1 AND `key` = 'NOTIFICATIONS'
);

INSERT INTO ai_settings (tenant_id, enabled, provider, model, quota_json)
SELECT 1, 0, NULL, NULL, JSON_OBJECT()
WHERE NOT EXISTS (SELECT 1 FROM ai_settings WHERE tenant_id = 1);

INSERT INTO tenant_settings (tenant_id, category, settings_json)
SELECT 1, 'branding', JSON_OBJECT(
  'logo_url', NULL,
  'primary_color', '#2563eb',
  'secondary_color', '#0f172a',
  'school_name', 'Vertex School',
  'school_tagline', NULL,
  'contact_email', NULL,
  'contact_phone', NULL
)
WHERE NOT EXISTS (
  SELECT 1 FROM tenant_settings WHERE tenant_id = 1 AND category = 'branding'
);

SET FOREIGN_KEY_CHECKS=1;
