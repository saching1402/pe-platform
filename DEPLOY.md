# PE Platform — Deployment Guide

## Overview
- **Backend**: Django 4.2 + Django REST Framework
- **Database**: PostgreSQL (Railway managed)
- **Frontend**: React + Vite + Recharts (built into Django's static serving)
- **Host**: Railway.app

---

## Phase 4: Deploy to Railway

### Step 1 — Push code to GitHub

1. Open terminal in the `pe-platform` folder
2. Initialize git repo:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: PE Buyout Intelligence Platform"
   ```
3. Create a new GitHub repo (e.g. `pe-platform`) — go to github.com/new
4. Push:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/pe-platform.git
   git branch -M main
   git push -u origin main
   ```

### Step 2 — Create Railway project

1. Go to **railway.app** → New Project → Deploy from GitHub Repo
2. Select your `pe-platform` repository
3. Railway will auto-detect the `nixpacks.toml`

### Step 3 — Add PostgreSQL database

1. In your Railway project → **+ New** → Database → PostgreSQL
2. Railway automatically injects `DATABASE_URL` into your environment

### Step 4 — Set environment variables

In the Railway service → **Variables** tab, add:

| Variable | Value |
|----------|-------|
| `DJANGO_SETTINGS_MODULE` | `pe_platform.settings` |
| `SECRET_KEY` | generate a strong random key |
| `DEBUG` | `False` |
| `ALLOWED_HOSTS` | `*.railway.app,yourdomain.com` |
| `CORS_ALLOWED_ORIGINS` | `https://yourapp.railway.app` |

### Step 5 — Deploy

Railway will automatically:
1. Install Python + Node dependencies
2. Build the React frontend (`npm run build`)
3. Collect Django static files
4. Run migrations (`python manage.py migrate`)
5. Seed database from Excel (`python manage.py seed_data`)
6. Start Gunicorn web server

### Step 6 — Connect your domain

In Railway → Settings → Custom Domain → enter your domain → update DNS with the CNAME Railway provides.

---

## Local Development

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file (copy from .env.example)
cp .env.example .env
# Edit .env with your local Postgres credentials

python manage.py migrate
python manage.py seed_data --file data/fund_data.xlsx
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev    # runs on http://localhost:5173, proxies /api to :8000
```

### API Endpoints
- `GET /api/managers/` — list all managers (filterable)
- `GET /api/managers/{id}/` — manager detail with funds
- `GET /api/managers/top_performers/?metric=avg_irr&n=15`
- `GET /api/managers/overview_stats/` — KPI aggregates
- `GET /api/managers/scatter_data/` — scatter plot data
- `GET /api/managers/vintage_stats/` — vintage year aggregates
- `GET /api/funds/` — list all funds (filterable)
- `GET /api/tasks/` — workflow tasks
- `POST /api/tasks/` — create task
- `POST /api/tasks/{id}/add_comment/` — add comment
- `PATCH /api/tasks/{id}/update_status/` — change status
