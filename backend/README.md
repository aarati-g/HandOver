# Handover Backend

This directory contains the FastAPI backend service for the **Handover** project (AI Operational Memory for the Next Person).

## Ownership

**Owner**: Developer 2

### Scope & Boundaries
- Database models, schema design, and pgvector integrations
- REST API endpoints and middleware
- AI service integrations (configurable, provider-agnostic abstractions)
- Backend unit and integration tests

---

## Tech Stack
- **Python 3.10+**
- **FastAPI**: High-performance async web framework
- **Pydantic v2**: Data validation and settings management
- **SQLAlchemy 2.0**: Async ORM
- **PostgreSQL + pgvector**: Vector-enabled operational memory storage
- **Pytest**: Testing suite

---

## Getting Started

### 1. Virtual Environment Setup
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Environment Configuration
Copy `.env.example` to `.env` in the root or backend directory and configure variables:
```bash
cp ../.env.example .env
```

### 4. Run the Development Server
```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at:
- **API Base**: [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

### 5. Run Tests
```bash
pytest
```

---

## Architecture & Directory Structure
```
backend/
├── app/
│   ├── api/          # Endpoint routers and handlers
│   ├── core/         # Settings, security, and global configuration
│   ├── db/           # Database sessions, base models, pgvector config
│   ├── models/       # SQLAlchemy database models
│   ├── schemas/      # Pydantic request/response schemas
│   ├── services/     # Business logic & AI abstractions
│   │   └── ai/       # Replaceable LLM provider services (OpenAI, Anthropic, Ollama, Local)
│   ├── utils/        # Helper functions and utilities
│   └── main.py       # FastAPI application entrypoint
├── tests/            # Automated test suite
├── requirements.txt  # Python package dependencies
└── README.md         # Backend documentation
```
