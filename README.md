# Handover — AI Operational Memory for the Next Person

**iQOO Hackathon 2026**

Handover is a phone-first AI system designed for field-maintenance handovers. Field technicians frequently encounter messy, unstructured knowledge captured through quick notes, voice transcripts, or site photos. Handover converts this raw input into structured operational state, proactively detects missing critical information, computes handover readiness scores, and empowers the oncoming technician to effortlessly retrieve the asset's up-to-date operational memory.

---

## Architecture Overview

```
                        ┌───────────────────────────────┐
                        │      Field Technician App     │
                        │    (React + Vite + Tailwind)  │
                        └───────────────┬───────────────┘
                                        │ REST / JSON
                                        ▼
                        ┌───────────────────────────────┐
                        │       FastAPI Backend         │
                        │  (Endpoints & Core Services)  │
                        └───────┬───────────────┬───────┘
                                │               │
                                ▼               ▼
                 ┌────────────────────┐   ┌────────────────────────┐
                 │ PostgreSQL+pgvector│   │ AI Service Abstraction │
                 │ (Operational Mem)  │   │(OpenAI/Anthropic/Local)│
                 └────────────────────┘   └────────────────────────┘
```

- **Frontend**: Mobile-first, responsive interface built with React, Vite, TypeScript, and Tailwind CSS.
- **Backend**: Async Python API built with FastAPI, Pydantic v2, and SQLAlchemy 2.0.
- **Database**: PostgreSQL with pgvector for hybrid structured + semantic vector storage.
- **AI Service Layer**: Swappable provider abstraction allowing cloud LLMs (OpenAI, Anthropic) or local/on-device models (Ollama, iQOO on-device inference) via environment configuration.

---

## Repository Structure & Folder Ownership

```
Handover/
│
├── frontend/             # [Developer 1] React + Vite + TypeScript web client
│   ├── src/
│   │   ├── components/   # Reusable UI widgets and elements
│   │   ├── pages/        # Screen-level views
│   │   ├── layouts/      # App frames & navigation
│   │   ├── services/     # API client integrations
│   │   ├── hooks/        # Custom React hooks
│   │   ├── types/        # TypeScript interfaces & types
│   │   ├── data/         # Mock data for rapid prototyping
│   │   └── lib/          # Helper utilities
│   ├── public/           # Static assets
│   ├── package.json
│   └── README.md
│
├── backend/              # [Developer 2] FastAPI + Python backend
│   ├── app/
│   │   ├── api/          # Route handlers & endpoints
│   │   ├── core/         # Configuration & app settings
│   │   ├── models/       # SQLAlchemy ORM models
│   │   ├── schemas/      # Pydantic request/response schemas
│   │   ├── services/     # Business logic & domain services
│   │   │   └── ai/       # Replaceable AI provider implementations
│   │   ├── db/           # Database session & engine setup
│   │   └── utils/        # General backend helpers
│   ├── tests/            # Pytest test suite
│   ├── requirements.txt
│   └── README.md
│
├── docs/                 # [Shared] Project & API documentation
│   ├── product/          # PRDs, feature specs, workflows
│   └── api/              # OpenAPI specifications and schema docs
│
├── .gitignore            # Clean git ignore for Node, Python, secrets & OS
├── .env.example          # Environment variables template
├── README.md             # Monorepo documentation
└── docker-compose.yml    # Local services (PostgreSQL + pgvector)
```

### Ownership Boundaries

| Area | Owner | Responsibilities |
|---|---|---|
| **Frontend** (`/frontend`) | **Developer 1** | UI/UX, mobile layouts, mock data, client routing, frontend API integration |
| **Backend** (`/backend`) | **Developer 2** | Database schemas, REST endpoints, AI service abstractions, tests |
| **Shared** (`/docs`, root configs) | **Shared** | PRDs, API contracts, environment templates, docker-compose |

---

## Local Development Setup

### 1. Prerequisites
- **Node.js**: v18+ (v20+ recommended)
- **Python**: 3.10+
- **Docker & Docker Compose** (for PostgreSQL + pgvector)

### 2. Database Setup (Docker)
Start the PostgreSQL container with pgvector:
```bash
docker-compose up -d postgres
```

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

# Run backend development server
uvicorn app.main:app --reload --port 8000
```
- API Base: `http://localhost:8000`
- Health Check: `http://localhost:8000/health`
- Swagger Docs: `http://localhost:8000/docs`

### 4. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
- Web App: `http://localhost:5173`

---

## Verification & Testing

### Frontend Build
```bash
cd frontend
npm run build
```

### Backend Tests
```bash
cd backend
pytest
```
