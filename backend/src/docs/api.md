# API (high level)

Base: `/api`

## Auth
- POST `/auth/login`
- GET `/auth/me`

## Dashboards
- GET `/dashboard/admin` (ADMIN)
- GET `/dashboard/staff` (ADMIN/TEACHER/ACCOUNTANT)

## Admissions
- POST `/admissions` (public) multipart `documents[]`
- GET `/admissions` (ADMIN)
- PATCH `/admissions/:id/status` (ADMIN)
- POST `/admissions/:id/convert` (ADMIN)

## Students
- GET `/students?q=&class_name=&section=`
- POST `/students` (ADMIN) multipart `documents[]`
- GET `/students/:id`
- PUT `/students/:id` (ADMIN)
- DELETE `/students/:id` (ADMIN) -> deactivates

## Attendance
- POST `/attendance/mark` (TEACHER/ADMIN)
- GET `/attendance/monthly?class_name=10&section=A&month=2026-02`
- GET `/attendance/monthly/export?...` -> CSV

## Fees
- GET `/fees/structures`
- POST `/fees/structures`
- POST `/fees/invoices`
- GET `/fees/invoices?month=YYYY-MM`
- POST `/fees/invoices/:invoiceId/pay`
- GET `/fees/reports/export?month=YYYY-MM` -> CSV

## Staff
- GET `/staff` (ADMIN)
- POST `/staff` (ADMIN)

## Reports
- GET `/reports/class-strength?class_name=10` (ADMIN)
- GET `/reports/students/export?...` (ADMIN) -> CSV
- GET `/reports/attendance?...` (ADMIN/TEACHER)
- GET `/reports/fees?...` (ADMIN/ACCOUNTANT)

## Notifications
- GET `/notifications` (ADMIN/ACCOUNTANT)
- POST `/notifications` (ADMIN/ACCOUNTANT)
- POST `/notifications/dispatch` (ADMIN)
