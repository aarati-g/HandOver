# Handover Backend

This directory contains the FastAPI backend and AI layer for **Handover** (AI Operational Memory for the Next Person).

## Ownership

**Owner**: Developer 2

### Scope & Boundaries
- Database models (SQLAlchemy), async PostgreSQL/SQLite sessions
- REST API endpoints (`/health`, `/api/assets`, `/api/handovers`)
- AI Service Layer (`google-genai` with swappable provider interface and offline fallback)
- Gap Detection service & deterministic Readiness Scoring service
- State Change Detection
- Backend unit and integration tests

---

## Tech Stack
- **Python 3.10+**
- **FastAPI**: Modern async web framework with Swagger OpenAPI documentation
- **Pydantic v2**: Strict validation schemas for operational states
- **SQLAlchemy 2.0 (Async)**: PostgreSQL-ready ORM with zero-config SQLite support for local demos
- **Google GenAI Python SDK**: Official SDK for Gemini extraction (`gemini-2.5-flash`)
- **Pytest**: Automated test suite

---

## Architecture

```
backend/app/
├── main.py                     # FastAPI application & startup lifecycle
├── api/
│   ├── __init__.py
│   └── routes/
│       ├── __init__.py
│       ├── health.py           # GET /health
│       ├── assets.py           # GET/POST /api/assets, history
│       └── handovers.py        # POST /api/handovers/analyze, /answer
├── core/
│   ├── __init__.py
│   └── config.py               # Pydantic Settings & environment config
├── db/
│   ├── __init__.py
│   ├── database.py             # Async database session & seeder
│   └── models.py               # Asset & Handover SQLAlchemy models
├── schemas/
│   ├── __init__.py
│   ├── asset.py                # Asset schemas
│   └── handover.py             # OperationalState, Gaps, Answers
├── services/
│   ├── __init__.py
│   ├── gap_service.py          # Missing knowledge gap detection
│   ├── handover_service.py     # Deterministic readiness scoring & change detection
│   └── ai/
│       ├── __init__.py
│       ├── base.py             # AIProvider abstract base class
│       ├── gemini_provider.py  # GeminiProvider & MockFallbackAIProvider
│       └── prompts.py          # System instructions & knowledge taxonomy
└── utils/
    └── __init__.py
```

---

## Getting Started

### 1. Virtual Environment & Dependencies
```bash
python -m venv venv

# Windows
.\venv\Scripts\activate
# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Environment Variables
Copy `.env.example` to `.env` in project root:
```bash
cp ../.env.example .env
```
Key variables:
- `GEMINI_API_KEY`: Google GenAI API key (if omitted, backend seamlessly runs in offline deterministic demo mode)
- `GEMINI_MODEL`: Defaults to `gemini-2.5-flash`
- `DATABASE_URL`: `sqlite+aiosqlite:///./handover.db` (or PostgreSQL connection URL)
- `FRONTEND_ORIGIN`: `http://localhost:5173`

### 3. Run the Backend
```bash
uvicorn app.main:app --reload --port 8000
```
- **Base URL**: `http://localhost:8000`
- **Health Check**: `http://localhost:8000/health`
- **Swagger Docs**: `http://localhost:8000/docs`

### 4. Run Tests
```bash
pytest
```

---

## API Summary

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service health status check |
| `GET` | `/api/assets` | List all assets (auto-seeded with `COMP-03`, `GEN-12`, `PUMP-07`) |
| `GET` | `/api/assets/{asset_id}` | Retrieve single asset details |
| `POST` | `/api/assets` | Register a new asset |
| `POST` | `/api/handovers/analyze` | AI extraction of messy input into structured operational state & gap detection |
| `POST` | `/api/handovers/{id}/answer` | Answer a detected gap question, recalculate readiness |
| `GET` | `/api/assets/{asset_id}/history` | Retrieve handover history for an asset |
