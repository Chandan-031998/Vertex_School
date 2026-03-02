# Vertex School Manager

Modern School Management / Education Administration Platform.

**Stack**
- Frontend: React (Vite) + Tailwind CSS
- Backend: Node.js + Express.js (REST API)
- Database: MySQL
- Auth: JWT + bcrypt (role-based access: ADMIN, TEACHER, ACCOUNTANT)
- File Uploads: Multer
- ORM: Sequelize

## Quick Start (Local)

### 1) Database
Create DB and import schema:
```bash
mysql -u root -p
CREATE DATABASE vertex_school_manager;
exit
mysql -u root -p vertex_school_manager < db/schema.sql
```

### 2) Backend
```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```

### 3) Frontend
```bash
cd ../frontend
cp .env.example .env
npm install
npm run dev
```

Open: http://localhost:5173

## Production Setup (Vercel + Render)

### Frontend (Vercel)
Set in Vercel project env:
```env
VITE_API_URL=https://vertex-school.onrender.com/api
```

Frontend URL:
`https://vertex-school-d4z25y2ti-chandangirish95-5672s-projects.vercel.app`

SPA rewrite file is included at:
`/Users/chandangirish/Downloads/vertex-school-manager/frontend/vercel.json`

### Backend (Render)
Set in Render service env:
```env
CORS_ORIGIN=http://localhost:5173,https://vertex-school-d4z25y2ti-chandangirish95-5672s-projects.vercel.app,https://schoolerp.vertexsoftware.in,https://*.vercel.app,https://*.vertexsoftware.in
DB_SYNC=false
```

Backend URL:
`https://vertex-school.onrender.com`

### Production quick tests
```bash
curl -s https://vertex-school.onrender.com/api/health
curl -X POST https://vertex-school.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vertexschool.local","password":"Admin@12345"}'
```

## Demo Logins (seed)
- Admin: `admin@vertexschool.local` / `Admin@12345`
- Teacher: `teacher@vertexschool.local` / `Teacher@12345`
- Accountant: `accountant@vertexschool.local` / `Accountant@12345`


parent@vertexschool.local
Parent@12345

## Docker (optional)
```bash
docker compose up --build
```

Services:
- MySQL: 3306
- Backend: 4000
- Frontend: 5173

# Vertex_School
