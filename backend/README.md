# Backend - Vertex School Manager

## Run
```bash
cp .env.example .env
npm install
npm run seed
npm run dev
```

API base: `http://localhost:4000/api`

## Deployment (Render + Vercel)

### Render backend env
Use these environment variables in Render:
```env
PORT=10000
CORS_ORIGIN=http://localhost:5173,https://vertex-school-d4z25y2ti-chandangirish95-5672s-projects.vercel.app,https://schoolerp.vertexsoftware.in,https://*.vercel.app,https://*.vertexsoftware.in
JWT_SECRET=<strong-random-secret>
JWT_EXPIRES_IN=7d
DB_HOST=<render-mysql-host-or-external-host>
DB_PORT=3306
DB_USER=<db-user>
DB_PASSWORD=<db-password>
DB_NAME=<db-name>
DB_SYNC=false
UPLOAD_DIR=uploads
```

Backend URL:
`https://vertex-school.onrender.com`

Health checks:
```bash
curl -s https://vertex-school.onrender.com/api/health
curl -s https://vertex-school.onrender.com/health
```

## Migration Strategy
Project supports `sequelize.sync()` in dev (`DB_SYNC=true`) and SQL migration scripts.

Run migration scripts in this order:
1. `/Users/chandangirish/Downloads/vertex-school-manager/db/migrations/20260218_add_assigned_classes_if_missing.sql`
2. `/Users/chandangirish/Downloads/vertex-school-manager/db/migrations/20260221_whitelabel_settings_foundation.sql`
3. `/Users/chandangirish/Downloads/vertex-school-manager/db/migrations/20260221_core_system_settings.sql`
4. `/Users/chandangirish/Downloads/vertex-school-manager/db/migrations_01.sql`
5. `/Users/chandangirish/Downloads/vertex-school-manager/db/migrations/20260301_teacher_module.sql`
6. `/Users/chandangirish/Downloads/vertex-school-manager/db/migrations/20260302_transport_parent_module.sql`
7. `/Users/chandangirish/Downloads/vertex-school-manager/db/migrations_parent.sql`

`/Users/chandangirish/Downloads/vertex-school-manager/db/migrations_01.sql` contains tenant migration + additional settings tables + data backfill.

## Tenant Resolution
Tenant is resolved by:
1. `X-Tenant-Id`
2. subdomain slug
3. default tenant `id=1`

## Auth
`/api/settings/*` requires ADMIN role and JWT.

```bash
curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vertexschool.local","password":"Admin@12345"}'
```

## Settings APIs (ADMIN)
Use these headers:
```bash
-H "Authorization: Bearer <ADMIN_TOKEN>" -H "X-Tenant-Id: 1"
```

### Branding
```bash
curl -s http://localhost:4000/api/settings/branding -H "Authorization: Bearer <ADMIN_TOKEN>"
curl -s -X PUT http://localhost:4000/api/settings/branding -H "Authorization: Bearer <ADMIN_TOKEN>" -H "Content-Type: application/json" -d '{"product_name":"My School ERP","logo_url":"https://cdn/logo.png","favicon_url":"https://cdn/favicon.ico","primary_color":"#1d4ed8","secondary_color":"#0f172a","font_family":"Inter"}'
```

### School Profile
```bash
curl -s http://localhost:4000/api/settings/school -H "Authorization: Bearer <ADMIN_TOKEN>"
curl -s -X PUT http://localhost:4000/api/settings/school -H "Authorization: Bearer <ADMIN_TOKEN>" -H "Content-Type: application/json" -d '{"school_name":"Vertex International","address":"Delhi","phone":"9999999999","email":"info@school.com","website":"https://school.com","principal_name":"A. Kumar"}'
```

### Academic Years
```bash
curl -s http://localhost:4000/api/settings/academic-years -H "Authorization: Bearer <ADMIN_TOKEN>"
curl -s -X POST http://localhost:4000/api/settings/academic-years -H "Authorization: Bearer <ADMIN_TOKEN>" -H "Content-Type: application/json" -d '{"name":"2025-26","start_date":"2025-04-01","end_date":"2026-03-31","is_active":true}'
curl -s -X PUT http://localhost:4000/api/settings/academic-years/1 -H "Authorization: Bearer <ADMIN_TOKEN>" -H "Content-Type: application/json" -d '{"name":"2025-26 Updated"}'
curl -s -X DELETE http://localhost:4000/api/settings/academic-years/1 -H "Authorization: Bearer <ADMIN_TOKEN>"
curl -s -X POST http://localhost:4000/api/settings/academic-years/1/activate -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### Classes / Sections
```bash
curl -s http://localhost:4000/api/settings/classes -H "Authorization: Bearer <ADMIN_TOKEN>"
curl -s -X POST http://localhost:4000/api/settings/classes -H "Authorization: Bearer <ADMIN_TOKEN>" -H "Content-Type: application/json" -d '{"class_name":"10","sections":["A","B"]}'
curl -s -X PUT http://localhost:4000/api/settings/classes/1 -H "Authorization: Bearer <ADMIN_TOKEN>" -H "Content-Type: application/json" -d '{"class_name":"10","sections":["A","C"]}'
curl -s -X DELETE http://localhost:4000/api/settings/classes/1 -H "Authorization: Bearer <ADMIN_TOKEN>"
curl -s -X POST http://localhost:4000/api/settings/classes/1/sections -H "Authorization: Bearer <ADMIN_TOKEN>" -H "Content-Type: application/json" -d '{"section_name":"D"}'
curl -s -X DELETE http://localhost:4000/api/settings/sections/2 -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### Subjects
```bash
curl -s "http://localhost:4000/api/settings/subjects?class_id=1" -H "Authorization: Bearer <ADMIN_TOKEN>"
curl -s -X POST http://localhost:4000/api/settings/subjects -H "Authorization: Bearer <ADMIN_TOKEN>" -H "Content-Type: application/json" -d '{"class_id":1,"subject_name":"Mathematics"}'
curl -s -X PUT http://localhost:4000/api/settings/subjects/1 -H "Authorization: Bearer <ADMIN_TOKEN>" -H "Content-Type: application/json" -d '{"subject_name":"Physics"}'
curl -s -X DELETE http://localhost:4000/api/settings/subjects/1 -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### Holidays
```bash
curl -s "http://localhost:4000/api/settings/holidays?month=2026-02" -H "Authorization: Bearer <ADMIN_TOKEN>"
curl -s -X POST http://localhost:4000/api/settings/holidays -H "Authorization: Bearer <ADMIN_TOKEN>" -H "Content-Type: application/json" -d '{"title":"Republic Day","date":"2026-01-26","type":"HOLIDAY"}'
curl -s -X PUT http://localhost:4000/api/settings/holidays/1 -H "Authorization: Bearer <ADMIN_TOKEN>" -H "Content-Type: application/json" -d '{"title":"Annual Day","type":"EVENT"}'
curl -s -X DELETE http://localhost:4000/api/settings/holidays/1 -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### Fees / Attendance / Security
```bash
curl -s http://localhost:4000/api/settings/fees -H "Authorization: Bearer <ADMIN_TOKEN>"
curl -s -X PUT http://localhost:4000/api/settings/fees -H "Authorization: Bearer <ADMIN_TOKEN>" -H "Content-Type: application/json" -d '{"currency":"INR","receipt_prefix":"VSM-REC","invoice_prefix":"VSM-INV","late_fee_enabled":true,"late_fee_type":"FIXED","late_fee_value":100,"grace_days":5,"payment_methods_json":["CASH","ONLINE","UPI","CARD"]}'

curl -s http://localhost:4000/api/settings/attendance -H "Authorization: Bearer <ADMIN_TOKEN>"
curl -s -X PUT http://localhost:4000/api/settings/attendance -H "Authorization: Bearer <ADMIN_TOKEN>" -H "Content-Type: application/json" -d '{"mode":"DAILY","cutoff_time":"10:30:00","allow_edit_days":1,"auto_absent_after_cutoff":false,"leave_types_json":["SICK","CASUAL","OFFICIAL"]}'

curl -s http://localhost:4000/api/settings/security -H "Authorization: Bearer <ADMIN_TOKEN>"
curl -s -X PUT http://localhost:4000/api/settings/security -H "Authorization: Bearer <ADMIN_TOKEN>" -H "Content-Type: application/json" -d '{"password_min_length":8,"password_require_upper":true,"password_require_number":true,"password_require_symbol":false,"session_timeout_minutes":120,"enable_2fa":false}'
```

### Roles & Permissions
```bash
curl -s http://localhost:4000/api/settings/roles -H "Authorization: Bearer <ADMIN_TOKEN>"
curl -s -X PUT http://localhost:4000/api/settings/roles/TEACHER/permissions -H "Authorization: Bearer <ADMIN_TOKEN>" -H "Content-Type: application/json" -d '{"permissions":[{"resource":"students","can_create":false,"can_read":true,"can_update":false,"can_delete":false}]}'
```

### Notification Templates
```bash
curl -s http://localhost:4000/api/settings/notification-templates -H "Authorization: Bearer <ADMIN_TOKEN>"
curl -s -X POST http://localhost:4000/api/settings/notification-templates -H "Authorization: Bearer <ADMIN_TOKEN>" -H "Content-Type: application/json" -d '{"key":"FEE_REMINDER","subject":"Fee Due","body":"Please pay due fees","channel":"EMAIL","language":"en"}'
curl -s -X PUT http://localhost:4000/api/settings/notification-templates/1 -H "Authorization: Bearer <ADMIN_TOKEN>" -H "Content-Type: application/json" -d '{"subject":"Fee Due Reminder"}'
curl -s -X DELETE http://localhost:4000/api/settings/notification-templates/1 -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### Integrations
```bash
curl -s http://localhost:4000/api/settings/integrations -H "Authorization: Bearer <ADMIN_TOKEN>"
curl -s -X POST http://localhost:4000/api/settings/integrations -H "Authorization: Bearer <ADMIN_TOKEN>" -H "Content-Type: application/json" -d '{"type":"SMTP","config_json":{"host":"smtp.example.com","port":587}}'
curl -s -X PUT http://localhost:4000/api/settings/integrations/1 -H "Authorization: Bearer <ADMIN_TOKEN>" -H "Content-Type: application/json" -d '{"config_json":{"host":"smtp2.example.com","port":587}}'
curl -s -X DELETE http://localhost:4000/api/settings/integrations/1 -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### AI + Features
```bash
curl -s http://localhost:4000/api/settings/ai -H "Authorization: Bearer <ADMIN_TOKEN>"
curl -s -X PUT http://localhost:4000/api/settings/ai -H "Authorization: Bearer <ADMIN_TOKEN>" -H "Content-Type: application/json" -d '{"enabled":true,"provider":"openai","model":"gpt-4o-mini","quota_json":{"monthly_tokens":200000}}'

curl -s http://localhost:4000/api/settings/features -H "Authorization: Bearer <ADMIN_TOKEN>"
curl -s -X PUT http://localhost:4000/api/settings/features -H "Authorization: Bearer <ADMIN_TOKEN>" -H "Content-Type: application/json" -d '{"features":{"NOTIFICATIONS":true,"AI_ASSISTANT":true,"AI_REPORTS":true}}'
```

### Audit Logs + Subscription
```bash
curl -s "http://localhost:4000/api/settings/audit-logs?limit=200" -H "Authorization: Bearer <ADMIN_TOKEN>"

curl -s http://localhost:4000/api/settings/subscription -H "Authorization: Bearer <ADMIN_TOKEN>"
curl -s -X PUT http://localhost:4000/api/settings/subscription -H "Authorization: Bearer <ADMIN_TOKEN>" -H "Content-Type: application/json" -d '{"plan":"PRO","status":"ACTIVE","start_date":"2026-01-01","end_date":"2026-12-31","limits_json":{"users":100,"students":2000}}'
```

## Transport Module APIs
`/api/transport/*` requires `ADMIN` or `TRANSPORT_MANAGER`.

### Login Admin
```bash
curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vertexschool.local","password":"Admin@12345"}'
```

### Create Vehicle
```bash
curl -s -X POST http://localhost:4000/api/transport/vehicles \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"bus_no":"BUS-01","registration_no":"MH12AB1234","capacity":40,"status":"ACTIVE"}'
```

### Allocate Student Transport
```bash
curl -s -X POST http://localhost:4000/api/transport/allocations \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"student_id":1,"route_id":1,"stop_id":1,"vehicle_id":1,"pickup_enabled":true,"drop_enabled":true,"monthly_fee":1200}'
```

### Start Trip
```bash
curl -s -X POST http://localhost:4000/api/transport/trips/start \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"vehicle_id":1,"route_id":1,"trip_date":"2026-03-02","trip_type":"PICKUP"}'
```

## Parent Portal APIs
`/api/parent/*` requires `PARENT` role.

### Login Parent
```bash
curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"parent@vertexschool.local","password":"Parent@12345"}'
```

### Parent Create Request
```bash
curl -s -X POST http://localhost:4000/api/parent/requests \
  -H "Authorization: Bearer <PARENT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"student_id":1,"request_type":"STOP_CHANGE","payload_json":{"stop_id":2}}'
```

### Admin Approve Parent Request
```bash
curl -s -X PUT http://localhost:4000/api/transport/requests/1/approve \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"admin_note":"Approved and updated stop"}'
```

## Parent Management (ADMIN)

### Create Parent
```bash
curl -s -X POST http://localhost:4000/api/admin/parents \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Parent One","email":"parent1@vertexschool.local","password":"Parent@12345","phone":"9999999999","address":"Bengaluru","student_ids":[1]}'
```

### Login Parent
```bash
curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"parent1@vertexschool.local","password":"Parent@12345"}'
```

### Parent Dashboard
```bash
curl -s http://localhost:4000/api/parent/dashboard \
  -H "Authorization: Bearer <PARENT_TOKEN>"
```
