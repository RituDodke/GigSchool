# 🎓 GigSchool

**GigSchool** is a full-stack web application that connects students within a college/school community to post, discover, and apply for freelance gigs (small jobs). Think of it as a **mini-freelance marketplace built for students** — where you can offer tutoring, design work, coding help, writing services, and more.

---

## 📋 Table of Contents

1. [What Does This Project Do?](#-what-does-this-project-do)
2. [Features](#-features)
3. [Tech Stack](#-tech-stack)
4. [Project Structure](#-project-structure)
5. [Prerequisites](#-prerequisites)
6. [Setting Up Supabase](#-setting-up-supabase)
7. [Installation & Setup](#-installation--setup)
8. [Running the Project](#-running-the-project)
9. [Environment Variables Explained](#-environment-variables-explained)
10. [Database Schema Overview](#-database-schema-overview)
11. [API Endpoints](#-api-endpoints)
12. [Troubleshooting](#-troubleshooting)

---

## 🚀 What Does This Project Do?

GigSchool allows students to:

- **Post gigs/jobs** — e.g. "Need help with logo design" or "Looking for a math tutor"
- **Browse and search** for available gigs posted by other students
- **Apply to gigs** — with a pitch explaining why you're the right fit
- **Accept or reject applicants** — the gig creator can manage who gets the job
- **Chat in real-time** — direct messaging between students (like DMs)
- **Leave reviews** — rate and review students after a completed gig
- **Build a portfolio** — upload and showcase your past work
- **Bookmark gigs** — save interesting jobs to view later
- **Get notifications** — stay updated on applications and messages

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 Authentication | Sign up / Login with email using Supabase Auth |
| 📝 Job Board | Create, edit, delete, and browse freelance gigs |
| 📩 Applications | Apply to gigs with a pitch message |
| ✅ Accept/Reject | Gig creators can accept or reject applicants |
| 💬 Real-time Chat | Direct messaging between two users |
| ⭐ Reviews & Ratings | Rate users (1–5 stars) after completing a gig |
| 🖼️ Portfolio | Upload images/files to showcase your work |
| 🔖 Bookmarks | Save gigs you're interested in |
| 🔔 Notifications | Track application status and updates |
| 👤 Profiles | Public profile with bio, skills, reviews, and portfolio |
| 🌙 Dark Mode | Full dark mode support across the UI |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| [React 19](https://react.dev/) | UI library for building the interface |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe JavaScript |
| [Vite](https://vitejs.dev/) | Fast development server & build tool |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first CSS framework for styling |
| [React Router v7](https://reactrouter.com/) | Client-side page navigation |
| [Zustand](https://zustand-demo.pmnd.rs/) | Lightweight state management |
| [TanStack React Query](https://tanstack.com/query) | Server state management & data fetching |
| [Framer Motion](https://www.framer.com/motion/) | Smooth animations and transitions |
| [Lucide React](https://lucide.dev/) | Beautiful icon library |
| [Axios](https://axios-http.com/) | HTTP client for API requests |

### Backend
| Technology | Purpose |
|---|---|
| [Python 3.10+](https://www.python.org/) | Programming language |
| [FastAPI](https://fastapi.tiangolo.com/) | Modern, fast web framework for APIs |
| [Uvicorn](https://www.uvicorn.org/) | ASGI server to run FastAPI |
| [Pydantic](https://docs.pydantic.dev/) | Data validation and settings management |
| [Supabase Python SDK](https://supabase.com/docs/reference/python/introduction) | Database & auth interaction |

### Database & Services
| Technology | Purpose |
|---|---|
| [Supabase](https://supabase.com/) | PostgreSQL database, Authentication, Real-time subscriptions, File storage |

---

## 📁 Project Structure

```
GigSchool/
├── backend/                    # Python FastAPI backend
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py         # Dependency injection (auth, DB)
│   │   │   └── v1/
│   │   │       ├── api.py      # Router aggregator
│   │   │       └── endpoints/  # Individual API route files
│   │   ├── core/
│   │   │   ├── config.py       # App configuration (env vars)
│   │   │   └── exceptions.py   # Custom error handlers
│   │   ├── db/                 # Supabase client setup
│   │   ├── repositories/      # Database query logic
│   │   ├── schemas/            # Pydantic models (request/response shapes)
│   │   ├── services/           # Business logic layer
│   │   └── main.py             # FastAPI app entry point
│   ├── schema.sql              # Main database schema
│   ├── schema_updates.sql      # Schema migrations (reviews, bio, skills)
│   ├── requirements.txt        # Python dependencies
│   ├── Dockerfile              # Docker config for backend
│   ├── .env                    # ⚠️ Your secret env vars (not in git)
│   └── .env.example            # Template for .env file
│
├── frontend/                   # React + TypeScript frontend
│   ├── src/
│   │   ├── api/                # API service functions (Axios calls)
│   │   ├── components/         # Reusable UI components
│   │   │   ├── jobs/           # Job cards, modals, detail views
│   │   │   ├── portfolio/      # Portfolio grid, uploader
│   │   │   └── reviews/        # Review list, star rating, create modal
│   │   ├── lib/                # Utility libraries (Supabase client)
│   │   ├── pages/              # Full page components
│   │   │   ├── AuthPage.tsx    # Login / Sign Up page
│   │   │   ├── ChatPage.tsx    # Real-time messaging
│   │   │   ├── ProfilePage.tsx # Your own profile
│   │   │   ├── PublicProfilePage.tsx  # Other user's profile
│   │   │   ├── NotificationsPage.tsx  # Notifications center
│   │   │   └── SettingsPage.tsx       # User settings
│   │   ├── stores/             # Zustand state stores
│   │   ├── App.tsx             # Root component with routes
│   │   ├── App.css             # App-level styles
│   │   ├── index.css           # Global styles & Tailwind config
│   │   └── main.tsx            # React DOM entry point
│   ├── index.html              # HTML template
│   ├── package.json            # Node.js dependencies
│   ├── tailwind.config.js      # Tailwind CSS configuration
│   ├── vite.config.ts          # Vite build configuration
│   ├── tsconfig.json           # TypeScript configuration
│   ├── .env                    # ⚠️ Your secret env vars (not in git)
│   └── .env.example            # Template for .env file
│
├── docker-compose.yml          # Docker Compose for backend
├── render.yaml                 # Render.com deployment config
└── .gitignore                  # Files excluded from Git
```

---

## ✅ Prerequisites

Before starting, make sure you have these installed on your computer:

| Tool | Version | How to Install |
|---|---|---|
| **Node.js** | v18 or higher | [Download Node.js](https://nodejs.org/) — choose the LTS version |
| **npm** | Comes with Node.js | Installed automatically with Node.js |
| **Python** | 3.10 or higher | [Download Python](https://www.python.org/downloads/) — ⚠️ check "Add to PATH" during install! |
| **pip** | Comes with Python | Installed automatically with Python |
| **Git** | Any recent version | [Download Git](https://git-scm.com/downloads) |

### How to check if they're installed:

Open your terminal (Command Prompt / PowerShell on Windows, Terminal on Mac/Linux) and run:

```bash
node --version      # Should show v18.x.x or higher
npm --version       # Should show 9.x.x or higher
python --version    # Should show 3.10.x or higher
pip --version       # Should show a version number
git --version       # Should show a version number
```

If any command says **"not recognized"** or **"command not found"**, you need to install that tool first.

---

## 🗄️ Setting Up Supabase

This project uses **Supabase** as its backend database and authentication provider. You need to create a free Supabase project first.

### Step 1: Create a Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** and sign up (you can use your GitHub account)
3. Click **"New Project"**
4. Fill in:
   - **Name**: `GigSchool` (or anything you like)
   - **Database Password**: Choose a strong password (save it somewhere!)
   - **Region**: Pick the one closest to you
5. Click **"Create new project"** and wait ~2 minutes for it to set up

### Step 2: Get Your API Keys

1. In your Supabase dashboard, go to **Settings** → **API** (in the left sidebar)
2. You'll see:
   - **Project URL** — looks like `https://xxxxx.supabase.co`
   - **anon (public) key** — a long string starting with `eyJ...`
   - **service_role key** — another long string (⚠️ keep this SECRET!)
3. Copy these values — you'll need them for the `.env` files

### Step 3: Set Up the Database Tables

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Open the file `backend/schema.sql` from this project, copy its entire contents, and paste it into the SQL editor
4. Click **"Run"** — this creates all the main tables (users, jobs, applications, conversations, messages, bookmarks)
5. Create another new query, copy the contents of `backend/schema_updates.sql`, paste, and click **"Run"** — this adds the reviews table and extra user fields

### Step 4: Set Up Supabase Storage (for Portfolio Uploads)

1. In your Supabase dashboard, go to **Storage** (left sidebar)
2. Click **"New Bucket"**
3. Name it `portfolio` and set it to **Public**
4. Click **"Create bucket"**

### Step 5: Enable Realtime (for Chat)

1. Go to **Database** → **Replication** in the Supabase dashboard
2. Make sure the `messages` and `conversations` tables have realtime enabled
3. Toggle them ON if they're not already

---

## 📥 Installation & Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/RituDodke/GigSchool.git
cd GigSchool
```

### Step 2: Set Up the Backend

```bash
# Navigate to the backend folder
cd backend

# Create a virtual environment (isolates Python packages)
python -m venv venv

# Activate the virtual environment
# On Windows (Command Prompt):
venv\Scripts\activate
# On Windows (PowerShell):
venv\Scripts\Activate.ps1
# On Mac/Linux:
source venv/bin/activate

# You should see (venv) at the start of your terminal prompt now

# Install Python dependencies
pip install -r requirements.txt
```

### Step 3: Configure Backend Environment Variables

```bash
# Copy the example env file
cp .env.example .env
# On Windows (if cp doesn't work):
copy .env.example .env
```

Now open `backend/.env` in a text editor and fill in your Supabase values:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-service-role-key-here
PROJECT_NAME=GigSchool
```

> ⚠️ **Important**: Use the **service_role** key for the backend, NOT the anon key. The service role key gives the backend full database access.

### Step 4: Set Up the Frontend

```bash
# Go back to the project root, then into frontend
cd ../frontend

# Install JavaScript dependencies (this may take a few minutes)
npm install
```

### Step 5: Configure Frontend Environment Variables

```bash
# Copy the example env file
cp .env.example .env
# On Windows (if cp doesn't work):
copy .env.example .env
```

Open `frontend/.env` in a text editor and fill in:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
VITE_API_URL=http://localhost:8000/api/v1
```

> ⚠️ **Important**: Use the **anon (public)** key for the frontend, NOT the service role key. This key is safe to expose to browsers.

---

## ▶️ Running the Project

You need **two terminal windows** — one for the backend and one for the frontend.

### Terminal 1: Start the Backend

```bash
cd backend

# Make sure the virtual environment is activated!
# On Windows: venv\Scripts\activate
# On Mac/Linux: source venv/bin/activate

# Start the backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

You should see:

```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Started reloader process
```

✅ Backend is now running at **http://localhost:8000**

You can verify by opening http://localhost:8000 in your browser — you should see `{"status": "ok", "version": "1.0.0"}`

### Terminal 2: Start the Frontend

```bash
cd frontend

# Start the development server
npm run dev
```

You should see:

```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

✅ Frontend is now running at **http://localhost:5173**

Open http://localhost:5173 in your browser to see the app!

---

## 🔐 Environment Variables Explained

### Backend (`backend/.env`)

| Variable | What It Is | Where to Find It |
|---|---|---|
| `SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API → Project URL |
| `SUPABASE_KEY` | Service Role secret key | Supabase Dashboard → Settings → API → service_role key |
| `PROJECT_NAME` | App name (used in API docs) | Just set to `GigSchool` |

### Frontend (`frontend/.env`)

| Variable | What It Is | Where to Find It |
|---|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Same as backend — Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Public anonymous key | Supabase Dashboard → Settings → API → anon key |
| `VITE_API_URL` | Backend API URL | Default: `http://localhost:8000/api/v1` |

---

## 🗃️ Database Schema Overview

The app uses these main tables in Supabase (PostgreSQL):

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│    users     │     │     jobs     │     │  applications    │
├──────────────┤     ├──────────────┤     ├──────────────────┤
│ id (UUID)    │◄────│ creator_id   │     │ id (UUID)        │
│ email        │     │ title        │     │ job_id ──────────┼──► jobs.id
│ username     │     │ description  │     │ applicant_id ────┼──► users.id
│ avatar_url   │     │ tags[]       │     │ pitch            │
│ bio          │     │ category     │     │ status           │
│ skills[]     │     │ status       │     │ (PENDING/ACCEPTED│
│ metadata     │     │ (OPEN/CLOSED/│     │  /REJECTED)      │
│ created_at   │     │  COMPLETED)  │     │ created_at       │
└──────────────┘     │ created_at   │     └──────────────────┘
       │             └──────────────┘
       │
       ▼
┌──────────────────┐  ┌──────────────┐  ┌──────────────┐
│  conversations   │  │   messages   │  │  bookmarks   │
├──────────────────┤  ├──────────────┤  ├──────────────┤
│ id (UUID)        │  │ id (UUID)    │  │ id (UUID)    │
│ user1_id ────────┤  │ convo_id ────┼─►│ user_id      │
│ user2_id ────────┤  │ sender_id    │  │ job_id       │
│ last_message_at  │  │ content      │  │ created_at   │
│ created_at       │  │ created_at   │  └──────────────┘
└──────────────────┘  └──────────────┘
                                         ┌──────────────┐
                                         │   reviews    │
                                         ├──────────────┤
                                         │ id (UUID)    │
                                         │ job_id       │
                                         │ reviewer_id  │
                                         │ reviewee_id  │
                                         │ rating (1-5) │
                                         │ comment      │
                                         │ created_at   │
                                         └──────────────┘
```

---

## 🔌 API Endpoints

The backend runs at `http://localhost:8000`. All routes are prefixed with `/api/v1`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check |
| **Users** | | |
| `POST` | `/api/v1/users/sync` | Sync user from Supabase Auth |
| `GET` | `/api/v1/users/me` | Get current user profile |
| `PUT` | `/api/v1/users/me` | Update your profile |
| `GET` | `/api/v1/users/{user_id}` | Get a user's public profile |
| **Jobs** | | |
| `GET` | `/api/v1/jobs` | List all open jobs |
| `POST` | `/api/v1/jobs` | Create a new job |
| `GET` | `/api/v1/jobs/{job_id}` | Get job details |
| `PUT` | `/api/v1/jobs/{job_id}` | Update a job |
| `DELETE` | `/api/v1/jobs/{job_id}` | Delete a job |
| **Applications** | | |
| `POST` | `/api/v1/applications` | Apply to a job |
| `GET` | `/api/v1/applications/job/{job_id}` | Get applications for a job |
| `PUT` | `/api/v1/applications/{id}/status` | Accept/reject application |
| **Chat** | | |
| `GET` | `/api/v1/conversations` | List your conversations |
| `POST` | `/api/v1/conversations` | Start a new conversation |
| `GET` | `/api/v1/conversations/{id}/messages` | Get messages in a conversation |
| `POST` | `/api/v1/messages` | Send a message |
| **Bookmarks** | | |
| `GET` | `/api/v1/bookmarks` | List your bookmarks |
| `POST` | `/api/v1/bookmarks` | Bookmark a job |
| `DELETE` | `/api/v1/bookmarks/{job_id}` | Remove a bookmark |
| **Reviews** | | |
| `POST` | `/api/v1/reviews` | Leave a review |
| `GET` | `/api/v1/reviews/user/{user_id}` | Get reviews for a user |

> 💡 **Tip**: Visit `http://localhost:8000/api/v1/openapi.json` or `http://localhost:8000/docs` to see the auto-generated interactive API documentation (Swagger UI).

---

## 🐛 Troubleshooting

### "Module not found" or "No module named ..."
- Make sure you activated the virtual environment: `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux)
- Make sure you ran `pip install -r requirements.txt`

### Backend starts but API calls return 401 Unauthorized
- Check that `SUPABASE_KEY` in `backend/.env` is the **service_role** key, not the anon key
- Make sure the user is logged in on the frontend before making API calls

### Frontend shows a blank page or network errors
- Check that the backend is running on port 8000
- Check that `VITE_API_URL` in `frontend/.env` is set to `http://localhost:8000/api/v1`
- Check the browser console (F12 → Console tab) for error messages

### "CORS error" in the browser console
- The backend allows all origins by default (`allow_origins=["*"]`). If you changed this, make sure `http://localhost:5173` is in the allowed list

### Supabase tables don't exist
- Make sure you ran both `schema.sql` and `schema_updates.sql` in the Supabase SQL Editor
- Check the **Table Editor** in Supabase to verify tables were created

### Can't upload to portfolio
- Make sure you created a **public** storage bucket named `portfolio` in Supabase Storage

### Chat messages don't appear in real-time
- Make sure you enabled **Realtime** for the `messages` table in Supabase Dashboard → Database → Replication

### "npm install" fails
- Try deleting `node_modules` and `package-lock.json`, then run `npm install` again:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```
- On Windows: `rmdir /s node_modules` then `del package-lock.json`

### Python version issues
- This project requires **Python 3.10+**. Check with `python --version`
- On some systems, use `python3` instead of `python`

---

## 👥 Team

- **Ritu Dodke** — Developer
- **Sahil Lamture** — Developer

---

## 📄 License

This project was built as a school/college project.

---

<p align="center">Made with ❤️ by the GigSchool Team</p>
