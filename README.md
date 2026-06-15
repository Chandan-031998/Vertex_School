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

## Production Setup (Vercel)

### Frontend (Vercel)
Set in Vercel project env:
```env
VITE_API_URL=https://vertex-school-oleu.vercel.app/api
```

Frontend URL:
`https://vertex-school-d4z25y2ti-chandangirish95-5672s-projects.vercel.app`

SPA rewrite file is included at:
`/Users/chandangirish/Downloads/vertex-school-manager/frontend/vercel.json`

### Backend (Vercel)
Deploy the `backend` directory as a Vercel project.

Project settings:
```text
Root Directory: backend
Framework Preset: Other
Install Command: npm install
Build Command: echo "No build required"
Output Directory: leave empty
```

Environment variables:
```env
NODE_ENV=production
DB_SYNC=false
JWT_SECRET=your_long_secret
JWT_EXPIRES_IN=7d
DB_HOST=cpanel-sh117.webhostingservices.com
DB_PORT=3306
DB_USER=pixelfla_vertex_user
DB_PASSWORD=your_db_password
DB_NAME=pixelfla_school_erp
CORS_ORIGIN=http://localhost:5173,https://schoolerp.vertexsoftware.in,https://vertex-school-oleu.vercel.app
```

Backend URL:
`https://vertex-school-oleu.vercel.app`

The serverless entrypoint is:
- `backend/api/index.js`

Vercel backend uses one function with catch-all routes in `backend/vercel.json`
to avoid the Hobby plan 12 function limit.

### Production quick tests
```bash
curl -i https://vertex-school-oleu.vercel.app/api/health
curl -i -X OPTIONS https://vertex-school-oleu.vercel.app/api/auth/login \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type,authorization"
curl -i -X POST https://vertex-school-oleu.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vertexschool.local","password":"Admin@12345"}'
```

Expected preflight header:
```text
Access-Control-Allow-Origin: http://localhost:5173
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



git add .
git commit -m "New Phase 10 gitignore"

git push



VITE_API_URL=https://vertex-school-oleu.vercel.app/api
