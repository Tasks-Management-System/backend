# Task Management System — Backend

A RESTful API server for the Task Management System, built with Node.js, Express 5, MongoDB, Socket.IO, and Redis.

---

## Live URLs

| Service | URL |
|---------|-----|
| API Base | `https://backend-1-1zao.onrender.com/api/v1` |
| Swagger UI | `https://backend-1-1zao.onrender.com/api-docs` |
| Health Check | `https://backend-1-1zao.onrender.com/api/v1/health` |
| Frontend | `https://frontend-zeta-eight-57.vercel.app` |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js v20 (ESM) |
| Framework | Express 5 |
| Database | MongoDB (Mongoose) |
| Real-time | Socket.IO |
| Cache / Pub-Sub | Redis via Upstash (ioredis) |
| Auth | JWT + Google OAuth |
| File Uploads | Cloudinary + Multer |
| Email | Nodemailer (Gmail SMTP) |
| API Docs | Swagger UI (zod-to-openapi) |
| Scheduler | node-cron |
| PDF Generation | PDFKit |

---

## API Endpoints

| Module | Base Route |
|--------|-----------|
| Auth | `/api/v1/auth` |
| Organization | `/api/v1/organization` |
| Projects | `/api/v1/project` |
| Tasks | `/api/v1/task` |
| Attendance | `/api/v1/attendance` |
| Leave | `/api/v1/leave` |
| Hiring | `/api/v1/hiring` |
| Salary | `/api/v1/salary` |
| Notes | `/api/v1/notes` |
| Events | `/api/v1/events` |
| Announcements | `/api/v1/announcements` |
| Assets | `/api/v1/assets` |
| Timesheets | `/api/v1/timesheets` |
| Chat | `/api/v1/chat` |
| Health | `/api/v1/health` |

Full interactive documentation available at `/api-docs`.

---

## Local Development

### Prerequisites

- Node.js v20+
- MongoDB (local or Atlas)
- npm

### Setup

```bash
# Clone the repo
git clone git@github.com:Tasks-Management-System/backend.git
cd backend

# Install dependencies
npm install

# Copy env file and fill in values
cp .env.example .env

# Start dev server with hot reload
npm run dev
```

Server runs at `http://localhost:5051`
Swagger UI at `http://localhost:5051/api-docs`

### Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Start with nodemon (hot reload) |
| `start` | `npm start` | Start for production |
| `lint` | `npm run lint` | Run ESLint |
| `test` | `npm test` | Run tests |

---

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=5051
FRONTEND_URL=http://localhost:5173

# MongoDB
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/TMS

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
ADMIN_EMAIL=your@gmail.com

# Redis (optional — Upstash recommended)
REDIS_URL=rediss://default:<pass>@your-host.upstash.io:6379
```

> `REDIS_URL` is optional. If not set, Socket.IO runs with an in-memory adapter (single server only).

---

## Hosting & Deployment

### Backend — Render

The API is hosted on **[Render](https://render.com)** (Web Service).

- **Plan:** Free tier
- **Region:** Oregon (US West)
- **Build command:** `npm install`
- **Start command:** `node index.js`
- **Auto-deploy:** Triggered via GitHub Actions deploy hook on every push to `main`

> Note: Free tier services spin down after 15 minutes of inactivity. The first request after sleep takes ~30 seconds to wake up. Upgrade to a paid plan to keep it always-on.

### Frontend — Vercel

The frontend is hosted on **[Vercel](https://vercel.com)** and connects to this API.

### Database — MongoDB Atlas

Hosted on **MongoDB Atlas** (Free M0 tier).

### Redis — Upstash

Hosted on **[Upstash](https://upstash.com)** (Free tier, serverless Redis). Used for Socket.IO pub/sub adapter to support online user tracking across connections.

### File Storage — Cloudinary

Images and file uploads are stored on **Cloudinary** (Free tier).

---

## CI/CD Pipeline

The pipeline is configured with **GitHub Actions** at `.github/workflows/ci-cd.yml`.

### Trigger

| Event | Branch | Jobs Run |
|-------|--------|----------|
| `push` | `main` | CI + Docker + Deploy |
| `pull_request` | `main` | CI only |

### Pipeline Jobs

```
push to main
      │
      ▼
┌─────────────────────────────┐
│  Job 1: CI                  │
│  ─────────────────────────  │
│  ✔ Validate required secrets│
│  ✔ npm ci                   │
│  ✔ npm run lint              │
│  ✔ npm test                 │
└─────────────┬───────────────┘
              │ (only on push to main)
              ▼
┌─────────────────────────────┐
│  Job 2: Docker              │
│  ─────────────────────────  │
│  ✔ Build Docker image       │
│  ✔ Push to Docker Hub       │
│    tags: :latest + :<sha>   │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  Job 3: Deploy              │
│  ─────────────────────────  │
│  ✔ POST to Render deploy    │
│    hook → triggers redeploy │
└─────────────────────────────┘
```

### Required GitHub Secrets

Go to **Settings → Secrets and variables → Actions** in the GitHub repo and add:

| Secret | Description |
|--------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `EMAIL_USER` | Gmail address for sending emails |
| `EMAIL_PASS` | Gmail App Password (16-char) |
| `DOCKERHUB_USERNAME` | Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token |
| `RENDER_DEPLOY_HOOK_URL` | Render deploy hook URL |

### Docker Image

The image is published to Docker Hub on every push to `main`:

```
docker pull jayluhar/tasks-backend:latest
```

Tags:
- `:latest` — always points to the most recent build
- `:<git-sha>` — pinned to a specific commit

---

## Project Structure

```
backend/
├── controllers/        # Route handler logic
├── model/              # Mongoose schemas
├── routes/             # Express route definitions
├── middleware/         # Auth, error handling, upload middleware
├── utils/              # DB, Redis, Socket.IO, mail helpers
├── jobs/               # Cron jobs (reminders, etc.)
├── swagger/            # OpenAPI schema definitions
├── validation/         # Zod validation schemas
├── .github/
│   └── workflows/
│       └── ci-cd.yml   # GitHub Actions pipeline
├── Dockerfile          # Production Docker image
├── .dockerignore
├── eslint.config.js
├── index.js            # App entry point
└── package.json
```
