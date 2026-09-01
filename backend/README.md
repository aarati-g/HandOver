# Handover Backend — Core Intelligence Engine

FastAPI backend and AI Operational Memory Engine for **Handover** (iQOO Hackathon 2026).

## Ownership

**Owner**: Developer 2

### Scope & Boundaries
- Domain logic: Operational state extraction, gap analysis, deterministic readiness scoring, state diffing
- Database models (SQLAlchemy), async PostgreSQL/SQLite sessions, event audit logging
- AI Service Layer (`google-genai` with swappable provider interface and offline fallback)
- REST API endpoints (`/health`, `/api/assets`, `/api/handovers`)
- Backend unit and integration tests

---

## Core Intelligence Flow

```
                      MESSY HUMAN INPUT
                             ↓
                      AI UNDERSTANDING
                             ↓
                STRUCTURED OPERATIONAL STATE
                             ↓
                   HANDOVER GAP DETECTION
                             ↓
                     TARGETED QUESTION
                             ↓
                        USER ANSWER
                             ↓
                 UPDATED OPERATIONAL STATE
                             ↓
                      READINESS SCORE
                             ↓
                      HANDOVER READY
```

---

## Tech Stack
- **Python 3.10+**
- **FastAPI**: Async web framework with interactive Swagger OpenAPI documentation
- **Pydantic v2**: Strict validation schemas for operational state contracts
- **SQLAlchemy 2.0 (Async)**: PostgreSQL-ready ORM with local SQLite support for demo runs
- **Google GenAI Python SDK**: Official SDK for Gemini extraction (`gemini-2.5-flash`)
- **Pytest**: Automated test suite (13 integration and unit tests)

---

## Key Modules & Architecture

```
backend/app/
├── main.py                     # FastAPI application & startup lifecycle
├── api/
│   ├── __init__.py
│   └── routes/
│       ├── __init__.py
│       ├── health.py           # GET /health
│       ├── assets.py           # GET/POST /api/assets, /history
│       └── handovers.py        # POST /api/handovers/analyze, /answer, /compare
├── core/
│   ├── __init__.py
│   └── config.py               # Pydantic Settings & environment config
├── db/
│   ├── __init__.py
│   ├── database.py             # Async database engine & demo seeder
│   └── models.py               # Asset, Handover, HandoverEvent SQLAlchemy models
├── schemas/
│   ├── __init__.py
│   ├── asset.py                # Asset schemas
│   └── handover.py             # OperationalState (11 fields), Gaps, Readiness
├── services/
│   ├── __init__.py
│   ├── gap_service.py          # Gap detection & question prioritization
│   ├── handover_service.py     # Deterministic scoring, breakdown, & change detection
│   └── ai/
│       ├── __init__.py
│       ├── base.py             # AIProvider abstract base class
│       ├── gemini_provider.py  # GeminiProvider & MockFallbackAIProvider
│       └── prompts.py          # Operational analyst instructions & safety taxonomy
└── utils/
    └── __init__.py
```

---

## Readiness Scoring & Classifications

The readiness scoring system is deterministic and transparent:

| Category | Max Weight | Criteria |
|---|---|---|
| **Current Status** | 20 | Operational state explicitly defined (`operational`, `needs_attention`, `degraded`, `offline`) |
| **Issue** | 15 | Primary symptom or defect documented |
| **Completed Actions** | 15 | Verified actions already taken |
| **Pending Actions** | 15 | Unresolved steps documented |
| **Operational Context** | 10 | Operating conditions, load %, or ambient factors recorded |
| **Workaround** | 10 | Operating restrictions/limits defined (or not required if operational) |
| **Next Action** | 5 | Specific immediate step defined for oncoming technician |
| **Unknowns Identified** | 10 | Explicitly acknowledging unconfirmed assumptions is rewarded |
| **Total** | **100** | Active unaddressed gaps reduce score; answering gaps increases readiness |

### Readiness Lifecycle States
- `0–49`: **incomplete**
- `50–74`: **needs_attention**
- `75–89`: **almost_ready**
- `90–100`: **ready**

---

## API Summary

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service health status check |
| `GET` | `/api/assets` | List all assets (auto-seeded: `COMP-03`, `GEN-12`, `PUMP-07`) |
| `GET` | `/api/assets/{asset_id}` | Retrieve single asset details |
| `POST` | `/api/assets` | Register a new equipment asset |
| `POST` | `/api/handovers/analyze` | AI extraction, gap detection, and readiness score evaluation |
| `POST` | `/api/handovers/{id}/answer` | Submit answer to gap question, update memory, recalculate readiness |
| `POST` | `/api/handovers/compare` | Semantic state comparison ignoring wording-only differences |
| `GET` | `/api/assets/{asset_id}/history` | Retrieve handover records and audit events for an asset |

---

## Local Development & Testing

### 1. Run Server
```bash
uvicorn app.main:app --reload --port 8000
```
- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health: [http://localhost:8000/health](http://localhost:8000/health)

### 2. Run Tests
```bash
pytest
```
