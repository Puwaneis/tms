# Task Management System

Full-stack app: **React (Vite)** frontend, **Flask** REST API, and **SQLAlchemy** with SQLite by default (MySQL supported via dependencies).

## Prerequisites

- **Node.js** 18+ and npm  
- **Python** 3.10+  

On Windows, building **mysqlclient** may require extra C build tools; SQLite mode does not need MySQL.

All commands below assume your terminal’s **current directory is the project root** (the folder that contains `package.json` and the `api/` directory).

## 1. Python environment and backend dependencies

Create a virtual environment at the **repository root** (the `npm run dev` script expects `venv` here on Windows).

**Windows (PowerShell):**

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r api\requirements.txt
```

**macOS / Linux:**

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r api/requirements.txt
```

## 2. Database configuration

The API loads environment variables from **`api/.env`**. Create that file if it does not exist.

**SQLite (simplest local setup)** — database file is created next to the API working directory (typically `api/database.db` when you run Flask from `api/`):

```env
FLASK_APP=app.py
SQLALCHEMY_DATABASE_URI_DEV=sqlite:///database.db
SQLALCHEMY_TRACK_MODIFICATIONS=False
JWT_SECRET_KEY=change-this-to-a-long-random-string
```

**MySQL (optional)** — adjust user, password, host, and database name. The project ships with `mysqlclient`:

```env
SQLALCHEMY_DATABASE_URI_DEV=mysql+mysqldb://USER:PASSWORD@127.0.0.1:3306/task_management
```

Ensure the MySQL database exists before running migrations.

## 3. Apply database migrations

From the **`api`** directory, with the virtual environment activated:

```bash
cd api
flask db upgrade
cd ..
```

This uses **Flask-Migrate** / Alembic migrations in `api/migrations/`.

## 4. Frontend dependencies

From the **repository root**:

```bash
npm install
```

## 5. Run the app locally

The Vite dev server proxies `/api` to **`http://localhost:5000`** (see `vite.config.js`). The Flask development server must listen on port **5000** (default for `flask run`).

### Option A — Windows (`npm run dev`)

Runs Vite and Flask together (Flask is invoked via `venv\Scripts\flask`):

```powershell
npm run dev
```

Then open the URL Vite prints (usually **http://localhost:5173**).

### Option B — macOS / Linux (two terminals)

The default `npm run dev` script uses a Windows path for Flask. Run frontend and backend separately:

**Terminal 1 — backend:**

```bash
cd api
source ../venv/bin/activate   # or: ..\venv\Scripts\activate on Git Bash
flask run --no-debugger
```

**Terminal 2 — frontend:**

```bash
npm exec vite
```

Or run `npx vite` from the repo root.

### First account (super admin)

The **first user registered** through the app becomes **`super_admin`** if no users exist yet. Later registrations are normal **`user`** roles. Use the first account to access **Users** and **Tasks** in the UI.

## Running checks and tests locally

There is **no dedicated automated test suite** (pytest / Vitest) checked into this repository yet. You can still validate locally:

| What | Command | Notes |
|------|---------|--------|
| Frontend ESLint | `npm run lint` | Static analysis for JS/JSX |
| Frontend production build | `npm run build` | Catches many compile/bundle errors |
| Backend | *Manual* | e.g. `curl`, Postman, or browser against `http://localhost:5000/api/...` with a JWT after login |

**Smoke-test the API after login:** obtain a token from your auth endpoint, then call protected routes with header:

`Authorization: Bearer <token>`.

To add automated tests later, typical choices are **pytest** for Flask and **Vitest** (or **Jest**) for React; wire them in `api/` and the root `package.json` respectively.

## Useful paths

| Area | Path |
|------|------|
| React app entry | `src/main.jsx`, `src/App.jsx` |
| Router | `src/router.jsx` |
| API package | `api/src/` |
| Flask app factory / extensions | `api/src/__init__.py` |
| Migrations | `api/migrations/` |
| Environment file | `api/.env` |

## Troubleshooting

- **API calls fail from the browser:** Confirm Flask is on **port 5000** and Vite is running so the `/api` proxy works.  
- **401 on API:** Log in again; JWT may be expired or missing from `localStorage`.  
- **Database errors after pulling code:** Run `flask db upgrade` again from `api/`.  
- **Module not found on backend:** Ensure `venv` is activated and `pip install -r api/requirements.txt` completed successfully.
