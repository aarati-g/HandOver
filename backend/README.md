# Handover Backend — Core Intelligence & API Specification

FastAPI backend and AI Operational Memory Engine for **Handover** (iQOO Hackathon 2026).

---

## 1. Frontend Integration Guide

### Base URL
- **Local Development**: `http://localhost:8000`
- **API Root**: `http://localhost:8000/api`
- **Interactive OpenAPI Documentation**: `http://localhost:8000/docs`

### CORS
CORS is configured for standard local development ports:
- `http://localhost:5173` (Vite dev server)
- `http://127.0.0.1:5173`
- `http://localhost:3000`
- `http://localhost:4173`
- Any custom origin via environment variable `CORS_ORIGINS="*"`.

---

## 2. API Endpoints & Contract

### A. Asset Management

#### `GET /api/assets`
Retrieve all monitored industrial equipment assets.

**Response `200 OK`**:
```json
[
  {
    "id": 1,
    "asset_code": "COMP-03",
    "name": "Compressor #03",
    "type": "Industrial Compressor",
    "location": "Plant Floor A - Sector 2",
    "status": "needs_attention",
    "created_at": "2026-08-30T14:30:00Z",
    "updated_at": "2026-08-30T14:30:00Z"
  },
  {
    "id": 2,
    "asset_code": "GEN-12",
    "name": "Generator #12",
    "type": "Backup Generator",
    "location": "Substation B - Exterior",
    "status": "operational",
    "created_at": "2026-08-27T10:00:00Z",
    "updated_at": "2026-09-01T12:00:00Z"
  },
  {
    "id": 3,
    "asset_code": "PUMP-07",
    "name": "Pump #07",
    "type": "Water Pump",
    "location": "Water Treatment C",
    "status": "operational",
    "created_at": "2026-08-25T08:00:00Z",
    "updated_at": "2026-08-31T09:00:00Z"
  }
]
```

#### `GET /api/assets/{asset_id}`
Retrieve a single asset by code (`COMP-03`) or integer ID.

**Response `200 OK`**:
```json
{
  "id": 1,
  "asset_code": "COMP-03",
  "name": "Compressor #03",
  "type": "Industrial Compressor",
  "location": "Plant Floor A - Sector 2",
  "status": "needs_attention",
  "created_at": "2026-08-30T14:30:00Z",
  "updated_at": "2026-08-30T14:30:00Z"
}
```

#### `GET /api/assets/{asset_id}/history`
Retrieve chronological operational timeline events for an asset.

**Response `200 OK`**:
```json
[
  {
    "type": "HANDOVER_CREATED",
    "timestamp": "2026-08-30T14:30:00Z",
    "summary": "Abnormal vibration reported",
    "details": { "asset_id": "COMP-03" },
    "handover_id": 1
  },
  {
    "type": "GAP_DETECTED",
    "timestamp": "2026-08-30T14:30:00Z",
    "summary": "Operating-load test not confirmed",
    "details": {
      "question": "Was the compressor tested under normal operating load after the belt replacement?"
    },
    "handover_id": 1
  },
  {
    "type": "GAP_ANSWERED",
    "timestamp": "2026-08-30T16:00:00Z",
    "summary": "Tested under normal load; vibration remained elevated",
    "details": { "answer": "Tested under normal load; vibration remained elevated" },
    "handover_id": 1
  }
]
```

---

### B. Core Handover Intelligence

#### `POST /api/handovers/analyze`
Extracts structured operational state from messy shift text, identifies critical information gaps, and calculates deterministic readiness.

**Request Payload**:
```json
{
  "asset_id": "COMP-03",
  "text": "Machine 03 has abnormal vibration. We replaced the belt, but the motor hasn't been inspected. It is currently operating below 70% load."
}
```

**Response `200 OK`**:
```json
{
  "handover_id": 2,
  "asset_id": "COMP-03",
  "operational_state": {
    "issue": "Abnormal vibration",
    "current_status": "needs_attention",
    "completed_actions": ["Belt replaced"],
    "pending_actions": ["Motor inspection"],
    "workaround": "Operate below 70% load",
    "root_cause": "Unknown",
    "operational_context": "Reported operating below 70% load during shift",
    "risks": [],
    "unknowns": ["Root cause has not been confirmed"],
    "next_action": "Inspect motor and verify vibration under normal operating load",
    "confidence": 0.86
  },
  "readiness": {
    "score": 72,
    "status": "needs_attention",
    "breakdown": {
      "current_status": 20,
      "issue": 15,
      "completed_actions": 15,
      "pending_actions": 15,
      "operational_context": 5,
      "workaround": 10,
      "next_action": 5,
      "unknowns": 1
    }
  },
  "readiness_score": 72,
  "gap": {
    "detected": true,
    "question": "Was the compressor tested under normal operating load after the belt replacement?",
    "reason": "Belt replacement was completed but load testing verification was not reported.",
    "severity": "medium"
  }
}
```

---

#### `POST /api/handovers/{handover_id}/answer`
Incorporates the technician's targeted answer into operational memory, re-evaluates gaps, recalculates readiness, and writes audit logs.

**Request Payload**:
```json
{
  "answer": "Yes, it was tested under normal load and vibration remained elevated."
}
```

**Response `200 OK`**:
```json
{
  "handover_id": 2,
  "asset_id": "COMP-03",
  "operational_state": {
    "issue": "Abnormal vibration",
    "current_status": "needs_attention",
    "completed_actions": [
      "Belt replaced",
      "Verification test: Yes, it was tested under normal load and vibration remained elevated."
    ],
    "pending_actions": ["Motor inspection"],
    "workaround": "Operate below 70% load",
    "root_cause": "Unknown",
    "operational_context": "Reported operating below 70% load during shift | Verified under normal load: vibration remained elevated",
    "risks": [],
    "unknowns": ["Root cause has not been confirmed"],
    "next_action": "Perform motor bearing & alignment inspection",
    "confidence": 0.94
  },
  "readiness": {
    "score": 94,
    "status": "ready",
    "breakdown": {
      "current_status": 20,
      "issue": 15,
      "completed_actions": 15,
      "pending_actions": 15,
      "operational_context": 10,
      "workaround": 10,
      "next_action": 5,
      "unknowns": 4
    }
  },
  "readiness_score": 94,
  "gap": {
    "detected": false,
    "question": null,
    "reason": null,
    "severity": null
  }
}
```

---

#### `GET /api/handovers/{handover_id}`
Retrieve a single complete handover record with audit events and full operational memory state.

**Response `200 OK`**:
```json
{
  "id": 2,
  "asset_id": "COMP-03",
  "raw_input": "Machine 03 has abnormal vibration...",
  "operational_state": { ... },
  "readiness": { "score": 94, "status": "ready", "breakdown": { ... } },
  "readiness_score": 94,
  "gap": { "detected": false, "question": null, "reason": null, "severity": null },
  "events": [
    { "id": 1, "handover_id": 2, "event_type": "HANDOVER_CREATED", "created_at": "..." },
    { "id": 2, "handover_id": 2, "event_type": "GAP_DETECTED", "created_at": "..." },
    { "id": 3, "handover_id": 2, "event_type": "GAP_ANSWERED", "created_at": "..." },
    { "id": 4, "handover_id": 2, "event_type": "READINESS_CHANGED", "created_at": "..." }
  ],
  "created_at": "2026-08-30T14:30:00Z"
}
```

---

#### `POST /api/handovers/compare`
Compares two operational states and returns semantic shifts (ignoring wording variations).

**Request Payload**:
```json
{
  "previous_state": {
    "issue": "Normal operation",
    "current_status": "operational",
    "completed_actions": ["Routine check"],
    "pending_actions": []
  },
  "current_state": {
    "issue": "Abnormal vibration",
    "current_status": "needs_attention",
    "completed_actions": ["Belt replaced"],
    "pending_actions": ["Motor inspection"]
  }
}
```

**Response `200 OK`**:
```json
{
  "has_changes": true,
  "changes": [
    {
      "field": "current_status",
      "previous": "operational",
      "current": "needs_attention",
      "severity": "high"
    },
    {
      "field": "issue",
      "previous": "Normal operation",
      "current": "Abnormal vibration",
      "severity": "high"
    },
    {
      "field": "pending_actions",
      "previous": "None",
      "current": "Motor inspection",
      "severity": "medium"
    }
  ]
}
```

---

## 3. Error Handling

Standardized HTTP error envelopes:
```json
{
  "detail": "Asset 'INVALID-01' not found"
}
```

- `400 Bad Request`: Invalid payload or duplicate asset code.
- `404 Not Found`: Asset or Handover ID does not exist.
- `500 Internal Server Error`: Internal service error (falls back to deterministic AI provider automatically without exposing internal keys or traces).

---

## 4. Running Backend Locally

```bash
# In backend/
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```
- API Root: `http://localhost:8000/api`
- OpenAPI Docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`
