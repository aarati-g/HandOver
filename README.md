# Handover — AI Operational Memory for the Next Person

[![Live Demo](https://img.shields.io/badge/Live_Demo-Render-00b4d8?style=for-the-badge&logo=render&logoColor=white)](https://handover-b6aj.onrender.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Google Gemini](https://img.shields.io/badge/Gemini_2.5_Flash-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

> **iQOO Hackathon 2026** — Mobile-first operational AI system preserving critical shift memory and closing knowledge gaps between field technicians.

---

## 🔗 Live Application

- **Production URL**: **[https://handover-b6aj.onrender.com/](https://handover-b6aj.onrender.com/)**
- **Interactive OpenAPI Documentation**: **[https://handover-b6aj.onrender.com/docs](https://handover-b6aj.onrender.com/docs)**
- **System Health Check**: **[https://handover-b6aj.onrender.com/health](https://handover-b6aj.onrender.com/health)**

---

## 💡 The Problem & Core Innovation

### The Shift Handover Gap
In industrial manufacturing, power utilities, and field service operations, equipment handovers between shifts are notoriously fragile:
- **Unstructured Notes**: Critical observations are hastily typed, spoken into radios, or scribbled on paper logs.
- **Lost Tribal Context**: Previous technicians leave without documenting key validations (e.g. *Did anyone test it under operating load?*).
- **Compounding Downtime**: The next technician wastes hours repeating diagnostics or risks machine failure by running equipment under unverified operating conditions.

### What Makes Handover Different
**Handover is NOT a generic text summarizer or chatbot.**

> *"AI reconstructs what happened, proactively identifies what the next worker still needs to know, and turns incomplete handovers into actionable operational memory."*

```
[ Messy Shift Notes / Voice / Photo ]
                 │
                 ▼
┌────────────────────────────────────────────────────────┐
│             HANDOVER AI ENGINE (GEMINI 2.5)            │
│  1. Extracts Structured Operational State              │
│  2. Evaluates Deterministic Readiness Score (72/100)   │
│  3. Detects Critical Knowledge Gaps                    │
└────────────────────────────────────────────────────────┘
                 │
                 ▼
     [ "AI Found a Knowledge Gap" ]
  "Was the machine tested under normal
   operating load after belt replacement?"
                 │
                 ▼  (Technician Answers: "Yes, vibration remained elevated.")
┌────────────────────────────────────────────────────────┐
│           UPDATED OPERATIONAL MEMORY (94/100)          │
│  ✓ Verified Actions Updated                            │
│  ✓ Readiness Increased to Ready                        │
│  ✓ Oncoming Technician Briefing Generated in 10s       │
└────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🎙 **Phone-First Multi-Modal Capture** | Direct in-browser microphone voice notes and camera photo capture with graceful fallback handling for text input. |
| 🧠 **Operational State Reconstruction** | Converts unstructured observations into structured state: *Symptoms, Completed Actions, Unresolved Issues, Workarounds, Root Cause, Next Action*. |
| 🔍 **Proactive Knowledge Gap Detection** | Detects missing validation steps before the departing worker leaves shift (e.g., post-repair load testing). |
| 📊 **Deterministic Readiness Scoring** | Evaluates handover completeness mathematically (`72/100 Needs Attention` &rarr; `94/100 Ready` upon gap resolution). |
| 📋 **Actionable Oncoming Briefing** | Mobile-optimized *"What You Need To Know"* screen enabling oncoming technicians to grasp the full operational picture in **10–15 seconds**. |
| ⏱ **Audit Trail & Semantic Change Detection** | Immutable chronological audit stream tracking equipment health drift and shift transitions. |

---

## 🏗 System Architecture

```
                                  ┌─────────────────────────────────────────┐
                                  │      Field Technician Client (PWA)      │
                                  │       (React 19 + Vite + Tailwind)      │
                                  └────────────────────┬────────────────────┘
                                                       │
                                                       │ Same-Origin REST / SPA
                                                       ▼
                                  ┌─────────────────────────────────────────┐
                                  │         FastAPI Unified Engine          │
                                  │      (Static SPA Server + REST API)     │
                                  └────────────┬──────────────────┬─────────┘
                                               │                  │
                         ┌─────────────────────┴──────┐     ┌─────┴──────────────────┐
                         │   Async SQLAlchemy 2.0     │     │   AI Provider Engine   │
                         │ (SQLite / Postgres+pgvector│     │ (Google Gemini 2.5 /   │
                         │   Operational Database)    │     │ Deterministic Fallback)│
                         └────────────────────────────┘     └────────────────────────┘
```

---

## 🛠 Tech Stack

### Frontend Client
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS (Phone-first responsive layout, 390×844 viewport optimized)
- **Routing**: React Router 7
- **Icons & Animation**: Lucide React, Framer Motion
- **Media Capture**: Web MediaDevices Audio & Video APIs (`getUserMedia` / `MediaRecorder`)

### Backend & AI Engine
- **Framework**: FastAPI (Async Python 3.11+)
- **Validation**: Pydantic v2
- **ORM & Database**: SQLAlchemy 2.0 Async (SQLite for zero-config demo / PostgreSQL with pgvector for production)
- **AI Model**: Google Gemini 2.5 Flash via official `@google/genai` SDK with deterministic offline fallback provider
- **Test Suite**: Pytest (17 automated unit and integration tests)

---

## 📁 Repository Structure

```
HandOver/
├── frontend/                     # React 19 + Vite + TypeScript Web Client
│   ├── src/
│   │   ├── components/           # Reusable UI widgets (StatusBadge, Cards, Buttons, Inputs)
│   │   ├── pages/                # Screen-level views (Home, Create, Review, NextWorker, Assets, History)
│   │   ├── layouts/              # Mobile shell with responsive navigation frame
│   │   ├── services/             # API client with automatic same-origin/dev routing
│   │   ├── types/                # TypeScript domain models and schemas
│   │   └── data/                 # Offline mock dataset
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                      # FastAPI Python Engine
│   ├── app/
│   │   ├── api/                  # REST endpoints (/api/assets, /api/handovers, /health)
│   │   ├── core/                 # App configuration and environment settings
│   │   ├── db/                   # Database session, models, and async engine
│   │   └── services/ai/          # Replaceable AI extraction and gap detection services
│   ├── tests/                    # Pytest test suite (17 passed test cases)
│   ├── requirements.txt
│   └── handover.db               # Pre-seeded operational database
│
├── docs/                         # PRDs, architecture specifications, and API docs
├── .env.example                  # Environment configuration template
├── docker-compose.yml            # PostgreSQL + pgvector local container config
└── README.md                     # Project documentation
```

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js**: v18+ (v20+ recommended)
- **Python**: 3.10+ (3.11+ recommended)

### 1. Clone the Repository
```bash
git clone https://github.com/aarati-g/HandOver.git
cd HandOver
```

### 2. Configure Environment Variables
```bash
# Copy template
cp .env.example .env
```
Add your `GEMINI_API_KEY` in `.env` (obtain free key from [Google AI Studio](https://aistudio.google.com/)).

### 3. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend
uvicorn app.main:app --reload --port 8000
```
- API Root: `http://localhost:8000/api`
- Swagger Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

### 4. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
- Client App: `http://localhost:5173`

---

## 🧪 Testing & Verification

### Run Backend Test Suite
```bash
cd backend
pytest
```
*Output: 17 passed tests covering API endpoints, health checks, operational state extraction, readiness scoring, gap detection, and SPA routing.*

### Run Frontend Production Build
```bash
cd frontend
npm run build
```
*Output: 0 TypeScript errors, 0 bundler errors.*

---

## 🌐 Single-Service Production Deployment (Render)

The project is architected for **single-service deployment**, where FastAPI serves both the REST API endpoints (`/api/*`) and the static production React application (`/*`) with client-side SPA routing fallback.

### Render Configuration
| Setting | Value |
|---|---|
| **Environment** | `Python` |
| **Build Command** | `npm --prefix frontend install && npm --prefix frontend run build && pip install -r backend/requirements.txt` |
| **Start Command** | `uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port $PORT` |

### Environment Variables on Render
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
AI_FALLBACK_ENABLED=true
DATABASE_URL=sqlite+aiosqlite:///./handover.db
FRONTEND_ORIGIN=*
PORT=8000
HOST=0.0.0.0
PYTHON_VERSION=3.11.9
```

---

## 🔌 API Reference Quick Guide

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service health status check |
| `GET` | `/api/assets` | Retrieve all monitored equipment assets |
| `GET` | `/api/assets/{asset_id}` | Retrieve operational state for specific asset |
| `GET` | `/api/assets/{asset_id}/history` | Chronological audit timeline events |
| `POST` | `/api/handovers/analyze` | AI extraction of operational state & knowledge gap detection |
| `POST` | `/api/handovers/{id}/answer` | Submit gap answer, recalculate readiness & update memory |
| `GET` | `/api/handovers/{id}` | Full handover record with linked audit events |
| `POST` | `/api/handovers/compare` | Semantic state change comparison between shifts |

---

## 📱 Demonstration Walkthrough Flow

1. **Dashboard (`/`)**: Identifies **Compressor #03 (COMP-03)** requiring shift attention (*Abnormal vibration, motor inspection pending*).
2. **Create Handover (`/handover/new?asset=COMP-03`)**: Enter raw shift observations; optional microphone voice note and camera photo evidence.
3. **Analyze**: AI reconstructs verified completed actions, pending work, workarounds, and unconfirmed unknowns.
4. **Knowledge Gap & Readiness**: Initial score evaluates to `72/100 (Needs Attention)` due to missing load-test verification.
5. **Answer Gap**: Answering the targeted AI question updates the operational state, increasing readiness to `94/100 (Ready)`.
6. **Oncoming Briefing (`/handover/HO-101/next-worker`)**: Next worker receives a crisp 10-second briefing (*Condition, Done, Unresolved, Workaround, Next Action*) and acknowledges operational responsibility.
