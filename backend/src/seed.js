const env = require("./config/env");
const {
  sequelize,
  Role,
  User,
  Staff,
  FeeStructure,
  Student,
  Tenant,
  TenantSetting,
  FeatureFlag,
  AiSetting,
  AcademicYear,
  SchoolClass,
  Section,
  FeeSetting,
  AttendanceSetting,
  SecuritySetting,
  RolePermission,
  NotificationTemplate,
  Integration,
  Subscription
  ,
  Parent,
  ParentStudent,
  ParentProfile
} = require("./models");
const { hashPassword } = require("./utils/password");
const { FEATURE_FLAGS } = require("./config/constants");

async function upsertRole(name, description) {
  const [row] = await Role.findOrCreate({ where: { name }, defaults: { description } });
  return row;
}

async function upsertUser(email, password, full_name, roleName) {
  const tenant_id = 1;
  const role = await Role.findOne({ where: { name: roleName } });
  const existing = await User.findOne({ where: { email, tenant_id } });
  const password_hash = await hashPassword(password);
  if (existing) {
    existing.tenant_id = tenant_id;
    existing.password_hash = password_hash;
    existing.full_name = full_name;
    existing.role_id = role.id;
    await existing.save();
    return existing;
  }
  return User.create({ tenant_id, email, password_hash, full_name, role_id: role.id });
}

async function ensureStaff(user, designation, assigned_classes=[]) {
  const existing = await Staff.findOne({ where: { user_id: user.id, tenant_id: 1 } });
  if (existing) return existing;
  return Staff.create({
    tenant_id: 1,
    user_id: user.id,
    employee_code: "EMP-" + String(Date.now()).slice(-6),
    designation,
    assigned_classes
  });
}

async function run() {
  await sequelize.authenticate();
  await sequelize.sync();

  await Tenant.findOrCreate({
    where: { id: 1 },
    defaults: { id: 1, name: "Default Tenant", slug: "default", status: "ACTIVE" }
  });

  await TenantSetting.findOrCreate({
    where: { tenant_id: 1, category: "branding" },
    defaults: {
      tenant_id: 1,
      category: "branding",
      settings_json: {
        logo_url: null,
        primary_color: "#2563eb",
        secondary_color: "#0f172a",
        school_name: "Vertex School",
        school_tagline: null,
        contact_email: null,
        contact_phone: null
      }
    }
  });

  await TenantSetting.findOrCreate({
    where: { tenant_id: 1, category: "school_profile" },
    defaults: {
      tenant_id: 1,
      category: "school_profile",
      settings_json: {
        school_name: "Vertex School",
        address: null,
        phone: null,
        email: null,
        website: null,
        principal_name: null
      }
    }
  });

  await FeatureFlag.findOrCreate({
    where: { tenant_id: 1, key: FEATURE_FLAGS.AI_ASSISTANT },
    defaults: { tenant_id: 1, key: FEATURE_FLAGS.AI_ASSISTANT, enabled: false }
  });
  await FeatureFlag.findOrCreate({ where: { tenant_id: 1, key: FEATURE_FLAGS.AI_INSIGHTS }, defaults: { tenant_id: 1, key: FEATURE_FLAGS.AI_INSIGHTS, enabled: false } });
  await FeatureFlag.findOrCreate({ where: { tenant_id: 1, key: FEATURE_FLAGS.AI_FEES_PREDICT }, defaults: { tenant_id: 1, key: FEATURE_FLAGS.AI_FEES_PREDICT, enabled: false } });
  await FeatureFlag.findOrCreate({ where: { tenant_id: 1, key: FEATURE_FLAGS.AI_OCR }, defaults: { tenant_id: 1, key: FEATURE_FLAGS.AI_OCR, enabled: false } });
  await FeatureFlag.findOrCreate({ where: { tenant_id: 1, key: FEATURE_FLAGS.AI_REPORTS }, defaults: { tenant_id: 1, key: FEATURE_FLAGS.AI_REPORTS, enabled: false } });
  await FeatureFlag.findOrCreate({ where: { tenant_id: 1, key: FEATURE_FLAGS.AI_TIMETABLE }, defaults: { tenant_id: 1, key: FEATURE_FLAGS.AI_TIMETABLE, enabled: false } });
  await FeatureFlag.findOrCreate({ where: { tenant_id: 1, key: FEATURE_FLAGS.AI_MESSAGING }, defaults: { tenant_id: 1, key: FEATURE_FLAGS.AI_MESSAGING, enabled: false } });
  await FeatureFlag.findOrCreate({
    where: { tenant_id: 1, key: FEATURE_FLAGS.NOTIFICATIONS },
    defaults: { tenant_id: 1, key: FEATURE_FLAGS.NOTIFICATIONS, enabled: true }
  });

  await AiSetting.findOrCreate({
    where: { tenant_id: 1 },
    defaults: { tenant_id: 1, enabled: false, provider: "mock", model: "mock-v1", quota_json: {} }
  });

  await Integration.findOrCreate({ where: { tenant_id: 1, type: "smtp" }, defaults: { tenant_id: 1, type: "smtp", config_json: {} } });
  await Integration.findOrCreate({ where: { tenant_id: 1, type: "sms" }, defaults: { tenant_id: 1, type: "sms", config_json: {} } });
  await Integration.findOrCreate({ where: { tenant_id: 1, type: "payment" }, defaults: { tenant_id: 1, type: "payment", config_json: {} } });
  await Integration.findOrCreate({ where: { tenant_id: 1, type: "whatsapp" }, defaults: { tenant_id: 1, type: "whatsapp", config_json: {} } });

  await Subscription.findOrCreate({
    where: { tenant_id: 1 },
    defaults: {
      tenant_id: 1,
      plan: "BASIC",
      status: "ACTIVE",
      start_date: new Date().toISOString().slice(0, 10),
      end_date: null,
      limits_json: { users: 50, students: 500, ai_tokens: 0 }
    }
  });

  const defaultPermissions = [
    { role_name: "ADMIN", resource: "settings", can_create: true, can_read: true, can_update: true, can_delete: true },
    { role_name: "TEACHER", resource: "students", can_create: false, can_read: true, can_update: false, can_delete: false },
    { role_name: "ACCOUNTANT", resource: "fees", can_create: true, can_read: true, can_update: true, can_delete: false }
  ];
  for (const p of defaultPermissions) {
    await RolePermission.findOrCreate({ where: { tenant_id: 1, role_name: p.role_name, resource: p.resource }, defaults: { tenant_id: 1, ...p } });
  }

  await NotificationTemplate.findOrCreate({
    where: { tenant_id: 1, key: "FEE_REMINDER", channel: "EMAIL", language: "en" },
    defaults: { tenant_id: 1, key: "FEE_REMINDER", subject: "Fee Reminder", body: "Your fee is pending.", channel: "EMAIL", language: "en" }
  });

  await FeeSetting.findOrCreate({
    where: { tenant_id: 1 },
    defaults: {
      tenant_id: 1,
      currency: "INR",
      receipt_prefix: "VSM-REC",
      invoice_prefix: "VSM-INV",
      late_fee_enabled: false,
      late_fee_type: "FIXED",
      late_fee_value: 0,
      grace_days: 0,
      payment_methods_json: ["CASH", "ONLINE", "UPI"]
    }
  });

  await AttendanceSetting.findOrCreate({
    where: { tenant_id: 1 },
    defaults: {
      tenant_id: 1,
      mode: "DAILY",
      cutoff_time: null,
      allow_edit_days: 1,
      auto_absent_after_cutoff: false,
      leave_types_json: ["SICK", "CASUAL", "OFFICIAL"]
    }
  });

  await SecuritySetting.findOrCreate({
    where: { tenant_id: 1 },
    defaults: {
      tenant_id: 1,
      password_min_length: 8,
      password_require_upper: true,
      password_require_number: true,
      password_require_symbol: false,
      session_timeout_minutes: 120,
      enable_2fa: false
    }
  });

  const thisYear = new Date().getUTCFullYear();
  const nextShort = String((thisYear + 1) % 100).padStart(2, "0");
  const academicName = `${thisYear}-${nextShort}`;
  await AcademicYear.findOrCreate({
    where: { tenant_id: 1, name: academicName },
    defaults: {
      tenant_id: 1,
      name: academicName,
      start_date: `${thisYear}-04-01`,
      end_date: `${thisYear + 1}-03-31`,
      is_active: true
    }
  });

  const [class10] = await SchoolClass.findOrCreate({
    where: { tenant_id: 1, class_name: "10" },
    defaults: { tenant_id: 1, class_name: "10" }
  });
  const [class9] = await SchoolClass.findOrCreate({
    where: { tenant_id: 1, class_name: "9" },
    defaults: { tenant_id: 1, class_name: "9" }
  });
  await Section.findOrCreate({ where: { tenant_id: 1, class_id: class10.id, section_name: "A" }, defaults: { tenant_id: 1, class_id: class10.id, section_name: "A" } });
  await Section.findOrCreate({ where: { tenant_id: 1, class_id: class9.id, section_name: "A" }, defaults: { tenant_id: 1, class_id: class9.id, section_name: "A" } });

  await upsertRole("ADMIN", "System administrator");
  await upsertRole("TEACHER", "Teacher");
  await upsertRole("ACCOUNTANT", "Accounts / Fees");
  await upsertRole("PARENT", "Parent portal user");
  await upsertRole("TRANSPORT_MANAGER", "Transport manager");

  const admin = await upsertUser(env.SEED.ADMIN_EMAIL, env.SEED.ADMIN_PASSWORD, "Vertex Admin", "ADMIN");
  const teacher = await upsertUser(env.SEED.TEACHER_EMAIL, env.SEED.TEACHER_PASSWORD, "Vertex Teacher", "TEACHER");
  const accountant = await upsertUser(env.SEED.ACCOUNTANT_EMAIL, env.SEED.ACCOUNTANT_PASSWORD, "Vertex Accountant", "ACCOUNTANT");
  const parent = await upsertUser("parent@vertexschool.local", "Parent@12345", "Vertex Parent", "PARENT");

  await ensureStaff(admin, "Principal", []);
  await ensureStaff(teacher, "Class Teacher", [{ class_name: "10", section: "A" }]);
  await ensureStaff(accountant, "Accountant", []);

  // Basic fee structures
  const feeDefaults = [
    { class_name: "10", fee_name: "Tuition", amount: 1500, frequency: "MONTHLY" },
    { class_name: "10", fee_name: "Lab", amount: 300, frequency: "MONTHLY" },
    { class_name: "9", fee_name: "Tuition", amount: 1400, frequency: "MONTHLY" },
  ];
  for (const f of feeDefaults) {
    await FeeStructure.findOrCreate({ where: { tenant_id: 1, class_name: f.class_name, fee_name: f.fee_name, frequency: f.frequency }, defaults: { ...f, tenant_id: 1 } });
  }

  // Demo students if empty
  const count = await Student.count();
  if (count === 0) {
    await Student.bulkCreate([
      { tenant_id: 1, admission_no: "ADM-1001", full_name: "Aarav Kumar", class_name: "10", section: "A", parent_name: "Rakesh Kumar", parent_phone: "9999999999" },
      { tenant_id: 1, admission_no: "ADM-1002", full_name: "Isha Sharma", class_name: "10", section: "A", parent_name: "Neha Sharma", parent_phone: "8888888888" },
      { tenant_id: 1, admission_no: "ADM-1003", full_name: "Vihaan Patel", class_name: "9", section: "B", parent_name: "Kiran Patel", parent_phone: "7777777777" },
    ]);
  }

  const firstStudent = await Student.findOne({ where: { tenant_id: 1 }, order: [["id", "ASC"]] });
  if (firstStudent) {
    await Parent.findOrCreate({
      where: { tenant_id: 1, user_id: parent.id },
      defaults: { tenant_id: 1, user_id: parent.id, phone: firstStudent.parent_phone || null }
    });
    await ParentProfile.findOrCreate({
      where: { tenant_id: 1, user_id: parent.id },
      defaults: { tenant_id: 1, user_id: parent.id, phone: firstStudent.parent_phone || null, preferred_language: "en", notification_preferences_json: {} }
    });
    await ParentStudent.findOrCreate({
      where: { tenant_id: 1, parent_user_id: parent.id, student_id: firstStudent.id },
      defaults: { tenant_id: 1, parent_user_id: parent.id, student_id: firstStudent.id }
    });
  }

  console.log("✅ Seed complete");
  process.exit(0);
}

run().catch((e) => {
  console.error("Seed error", e);
  process.exit(1);
});
