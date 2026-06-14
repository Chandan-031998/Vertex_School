-- Vertex School Manager demo data for MySQL 8+
-- Safe to run more than once. Existing demo records are updated where possible.
-- Review @tenant_id before execution.

START TRANSACTION;

SET @tenant_id := 1;
SET @billing_month := DATE_FORMAT(CURDATE(), '%Y-%m');
SET @admin_id := (
  SELECT id FROM users
  WHERE tenant_id = @tenant_id AND email = 'admin@vertexschool.local'
  LIMIT 1
);
SET @teacher_id := (
  SELECT id FROM users
  WHERE tenant_id = @tenant_id AND email = 'teacher@vertexschool.local'
  LIMIT 1
);
SET @accountant_id := (
  SELECT id FROM users
  WHERE tenant_id = @tenant_id AND email = 'accountant@vertexschool.local'
  LIMIT 1
);

-- School identity and profile.
UPDATE tenants
SET name = 'Vertex Public School',
    slug = 'vertex-public-school',
    status = 'ACTIVE',
    updated_at = CURRENT_TIMESTAMP
WHERE id = @tenant_id;

INSERT INTO tenant_settings (tenant_id, category, settings_json, created_at, updated_at)
VALUES (
  @tenant_id,
  'school_profile',
  JSON_OBJECT(
    'school_name', 'Vertex Public School',
    'address', '12 Knowledge Park, Bengaluru, Karnataka 560001',
    'phone', '+91 80 4000 1234',
    'email', 'office@vertexschool.local',
    'website', 'https://vertexschool.local',
    'principal_name', 'Dr. Meera Nair',
    'affiliation', 'CBSE',
    'school_code', 'VPS-2026'
  ),
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON DUPLICATE KEY UPDATE
  settings_json = VALUES(settings_json),
  updated_at = CURRENT_TIMESTAMP;

-- Classes and sections.
INSERT INTO classes (tenant_id, class_name, created_at, updated_at)
VALUES
  (@tenant_id, '6', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (@tenant_id, '7', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (@tenant_id, '8', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (@tenant_id, '9', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (@tenant_id, '10', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

INSERT INTO sections (tenant_id, class_id, section_name, created_at, updated_at)
SELECT @tenant_id, c.id, section_names.section_name, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM classes c
CROSS JOIN (
  SELECT 'A' AS section_name
  UNION ALL SELECT 'B'
) section_names
WHERE c.tenant_id = @tenant_id
  AND c.class_name IN ('6', '7', '8', '9', '10')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- Subjects. The table has no unique subject constraint, so NOT EXISTS keeps this rerunnable.
INSERT INTO subjects (tenant_id, class_id, subject_name, created_at, updated_at)
SELECT @tenant_id, c.id, subject_names.subject_name, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM classes c
CROSS JOIN (
  SELECT 'English' AS subject_name
  UNION ALL SELECT 'Mathematics'
  UNION ALL SELECT 'Science'
  UNION ALL SELECT 'Social Science'
  UNION ALL SELECT 'Computer Science'
) subject_names
WHERE c.tenant_id = @tenant_id
  AND c.class_name IN ('6', '7', '8', '9', '10')
  AND NOT EXISTS (
    SELECT 1
    FROM subjects existing_subject
    WHERE existing_subject.tenant_id = @tenant_id
      AND existing_subject.class_id = c.id
      AND existing_subject.subject_name = subject_names.subject_name
  );

-- Additional realistic students. Existing ADM-1001 to ADM-1003 remain intact.
INSERT INTO students (
  tenant_id, admission_no, full_name, dob, gender, class_name, section, roll_no,
  parent_name, parent_phone, contact_email, address, is_active, created_at, updated_at
)
VALUES
  (@tenant_id, 'ADM-1004', 'Ananya Rao', '2013-08-14', 'Female', '7', 'A', 1, 'Suresh Rao', '9000001004', 'suresh.rao@example.com', 'Indiranagar, Bengaluru', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (@tenant_id, 'ADM-1005', 'Arjun Reddy', '2012-11-03', 'Male', '8', 'A', 2, 'Lakshmi Reddy', '9000001005', 'lakshmi.reddy@example.com', 'Whitefield, Bengaluru', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (@tenant_id, 'ADM-1006', 'Diya Menon', '2011-05-22', 'Female', '9', 'A', 3, 'Rajeev Menon', '9000001006', 'rajeev.menon@example.com', 'HSR Layout, Bengaluru', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (@tenant_id, 'ADM-1007', 'Kabir Singh', '2010-09-18', 'Male', '10', 'B', 4, 'Amrita Singh', '9000001007', 'amrita.singh@example.com', 'Jayanagar, Bengaluru', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (@tenant_id, 'ADM-1008', 'Meera Joshi', '2013-01-30', 'Female', '7', 'B', 5, 'Nitin Joshi', '9000001008', 'nitin.joshi@example.com', 'Malleshwaram, Bengaluru', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (@tenant_id, 'ADM-1009', 'Neil Thomas', '2014-04-12', 'Male', '6', 'A', 6, 'Susan Thomas', '9000001009', 'susan.thomas@example.com', 'Koramangala, Bengaluru', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (@tenant_id, 'ADM-1010', 'Riya Kapoor', '2012-07-08', 'Female', '8', 'B', 7, 'Vikram Kapoor', '9000001010', 'vikram.kapoor@example.com', 'Yelahanka, Bengaluru', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (@tenant_id, 'ADM-1011', 'Shaurya Das', '2011-12-16', 'Male', '9', 'B', 8, 'Madhuri Das', '9000001011', 'madhuri.das@example.com', 'JP Nagar, Bengaluru', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (@tenant_id, 'ADM-1012', 'Zara Khan', '2014-02-25', 'Female', '6', 'B', 9, 'Sameer Khan', '9000001012', 'sameer.khan@example.com', 'Hebbal, Bengaluru', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE
  full_name = VALUES(full_name),
  dob = VALUES(dob),
  gender = VALUES(gender),
  class_name = VALUES(class_name),
  section = VALUES(section),
  roll_no = VALUES(roll_no),
  parent_name = VALUES(parent_name),
  parent_phone = VALUES(parent_phone),
  contact_email = VALUES(contact_email),
  address = VALUES(address),
  is_active = 1,
  updated_at = CURRENT_TIMESTAMP;

-- Monthly fee structures for every class used by the demo students.
INSERT INTO fee_structures (
  tenant_id, class_name, fee_name, amount, frequency, is_active, created_at, updated_at
)
VALUES
  (@tenant_id, '6', 'Tuition', 1200.00, 'MONTHLY', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (@tenant_id, '6', 'Activities', 200.00, 'MONTHLY', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (@tenant_id, '7', 'Tuition', 1250.00, 'MONTHLY', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (@tenant_id, '7', 'Activities', 250.00, 'MONTHLY', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (@tenant_id, '8', 'Tuition', 1350.00, 'MONTHLY', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (@tenant_id, '8', 'Lab', 250.00, 'MONTHLY', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (@tenant_id, '9', 'Lab', 300.00, 'MONTHLY', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (@tenant_id, '10', 'Activities', 200.00, 'MONTHLY', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE
  amount = VALUES(amount),
  is_active = 1,
  updated_at = CURRENT_TIMESTAMP;

-- Thirty days of attendance for all active students.
INSERT INTO attendance (
  tenant_id, student_id, class_name, section, date, status, marked_by, created_at, updated_at
)
SELECT
  @tenant_id,
  s.id,
  s.class_name,
  s.section,
  DATE_SUB(CURDATE(), INTERVAL day_numbers.day_offset DAY),
  IF(MOD(s.id + day_numbers.day_offset, 11) = 0, 'A', 'P'),
  @teacher_id,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM students s
CROSS JOIN (
  SELECT 0 AS day_offset
  UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
  UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8
  UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12
  UNION ALL SELECT 13 UNION ALL SELECT 14 UNION ALL SELECT 15 UNION ALL SELECT 16
  UNION ALL SELECT 17 UNION ALL SELECT 18 UNION ALL SELECT 19 UNION ALL SELECT 20
  UNION ALL SELECT 21 UNION ALL SELECT 22 UNION ALL SELECT 23 UNION ALL SELECT 24
  UNION ALL SELECT 25 UNION ALL SELECT 26 UNION ALL SELECT 27 UNION ALL SELECT 28
  UNION ALL SELECT 29
) day_numbers
WHERE s.tenant_id = @tenant_id
  AND s.is_active = 1
ON DUPLICATE KEY UPDATE
  class_name = VALUES(class_name),
  section = VALUES(section),
  status = VALUES(status),
  marked_by = VALUES(marked_by),
  updated_at = CURRENT_TIMESTAMP;

-- Current-month invoices calculated from each class's active monthly fee structure.
INSERT INTO fee_invoices (
  tenant_id, invoice_no, student_id, class_name, section, billing_month,
  total_amount, status, created_by, created_at, updated_at
)
SELECT
  @tenant_id,
  CONCAT('VSM-INV-', DATE_FORMAT(CURDATE(), '%Y%m'), '-', s.admission_no),
  s.id,
  s.class_name,
  s.section,
  @billing_month,
  COALESCE((
    SELECT SUM(fs.amount)
    FROM fee_structures fs
    WHERE fs.tenant_id = @tenant_id
      AND fs.class_name = s.class_name
      AND fs.frequency = 'MONTHLY'
      AND fs.is_active = 1
  ), 1500.00),
  'UNPAID',
  @admin_id,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM students s
WHERE s.tenant_id = @tenant_id
  AND s.is_active = 1
ON DUPLICATE KEY UPDATE
  total_amount = VALUES(total_amount),
  class_name = VALUES(class_name),
  section = VALUES(section),
  created_by = VALUES(created_by),
  updated_at = CURRENT_TIMESTAMP;

-- Mixed payment state: approximately one-third paid, one-third partial, one-third pending.
INSERT INTO payments (
  tenant_id, invoice_id, receipt_no, amount_paid, payment_mode,
  transaction_ref, paid_at, recorded_by, created_at, updated_at
)
SELECT
  @tenant_id,
  fi.id,
  CONCAT('VSM-REC-', DATE_FORMAT(CURDATE(), '%Y%m'), '-', s.admission_no),
  CASE
    WHEN MOD(s.id, 3) = 0 THEN fi.total_amount
    ELSE ROUND(fi.total_amount * 0.60, 2)
  END,
  IF(MOD(s.id, 2) = 0, 'ONLINE', 'CASH'),
  IF(MOD(s.id, 2) = 0, CONCAT('TXN-', DATE_FORMAT(CURDATE(), '%Y%m%d'), '-', s.id), NULL),
  CURRENT_TIMESTAMP,
  @accountant_id,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM fee_invoices fi
JOIN students s ON s.id = fi.student_id
WHERE fi.tenant_id = @tenant_id
  AND fi.billing_month = @billing_month
  AND MOD(s.id, 3) <> 2
ON DUPLICATE KEY UPDATE
  amount_paid = VALUES(amount_paid),
  payment_mode = VALUES(payment_mode),
  transaction_ref = VALUES(transaction_ref),
  paid_at = VALUES(paid_at),
  recorded_by = VALUES(recorded_by),
  updated_at = CURRENT_TIMESTAMP;

-- Synchronize invoice status with payment totals.
UPDATE fee_invoices fi
LEFT JOIN (
  SELECT invoice_id, SUM(amount_paid) AS paid_amount
  FROM payments
  WHERE tenant_id = @tenant_id
  GROUP BY invoice_id
) paid ON paid.invoice_id = fi.id
SET fi.status = CASE
      WHEN COALESCE(paid.paid_amount, 0) >= fi.total_amount THEN 'PAID'
      WHEN COALESCE(paid.paid_amount, 0) > 0 THEN 'PARTIAL'
      ELSE 'UNPAID'
    END,
    fi.updated_at = CURRENT_TIMESTAMP
WHERE fi.tenant_id = @tenant_id
  AND fi.billing_month = @billing_month;

COMMIT;

-- Verification summary.
SELECT 'students' AS entity, COUNT(*) AS row_count
FROM students WHERE tenant_id = @tenant_id AND is_active = 1
UNION ALL
SELECT 'subjects', COUNT(*) FROM subjects WHERE tenant_id = @tenant_id
UNION ALL
SELECT 'attendance_last_30_days', COUNT(*) FROM attendance
WHERE tenant_id = @tenant_id AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
UNION ALL
SELECT 'current_month_invoices', COUNT(*) FROM fee_invoices
WHERE tenant_id = @tenant_id AND billing_month = @billing_month
UNION ALL
SELECT 'current_month_payments', COUNT(*) FROM payments p
JOIN fee_invoices fi ON fi.id = p.invoice_id
WHERE p.tenant_id = @tenant_id AND fi.billing_month = @billing_month;
