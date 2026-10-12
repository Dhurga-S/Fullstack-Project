# Patient Flow & Queue Management — Backend

**Module:** Member 2 — Patient Flow & Queue Management  
**Project:** Patient Flow Optimization & Hospital Resource Coordination Platform  
**Stack:** Node.js · Express.js · MongoDB · Mongoose · JavaScript (ES6+)

---

## Problem Statement

Hospital emergency and outpatient departments struggle with unstructured patient queues, unpredictable waiting times, and inefficient staff allocation. Patients with critical conditions can wait alongside non-urgent cases without a systematic prioritisation mechanism, leading to poor clinical outcomes and patient dissatisfaction.

## Objective

Build a backend service that manages the full patient-flow lifecycle: from triage assessment and priority assignment to queue management, real-time position tracking, and staff-driven status transitions — providing hospital staff with accurate, data-driven operational information.

## Scope

This module handles:

1. **Triage recording** — symptoms, severity, vital signs, triage classification
2. **Priority calculation** — converts clinical triage level into a numerical queue priority
3. **Queue management** — department queues, patient enrolment, queue-number generation
4. **Dynamic queue ordering** — priority-first, FIFO within the same priority
5. **Estimated waiting time (EWT)** — calculated per-request based on position and consultation rate
6. **Status lifecycle** — controlled state machine with automated timestamp recording
7. **Actual waiting time (AWT)** — computed automatically on `WAITING → CALLED` transition

---

## Technology Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express.js 5.x |
| Database | MongoDB 6+ with Mongoose 9.x |
| Environment | dotenv |
| Dev server | nodemon |

---

## Architecture Overview

```
HTTP Request
     │
     ▼
Express Router (routes/)
     │
     ▼
Controller (controllers/)   ← validates HTTP concerns
     │
     ▼
Service (services/)          ← all business logic
     │
     ▼
Mongoose Model (models/)
     │
     ▼
MongoDB
```

The controller layer handles request parsing and HTTP responses only. All business logic — validation, duplicate checks, priority calculation, EWT computation, status transition rules — lives in the service layer.

---

## Database Models

### TriageRecord

| Field | Type | Required | Notes |
|---|---|---|---|
| `patientId` | ObjectId | ✅ | Reference to patient (external module) |
| `symptoms` | String | ✅ | Clinical description |
| `severity` | String | ✅ | `LOW` / `MODERATE` / `HIGH` / `CRITICAL` |
| `vitalSigns.temperature` | Number | — | °C |
| `vitalSigns.heartRate` | Number | — | bpm |
| `vitalSigns.bloodPressure` | String | — | e.g. `120/80` |
| `vitalSigns.oxygenSaturation` | Number | — | SpO₂ % |
| `triageLevel` | String | ✅ | `EMERGENCY` / `URGENT` / `NORMAL` |
| `notes` | String | — | Additional clinical notes |
| `createdAt`, `updatedAt` | Date | auto | Mongoose timestamps |

### Queue

| Field | Type | Required | Notes |
|---|---|---|---|
| `departmentId` | ObjectId | ✅ | Reference to department (external module) |
| `name` | String | ✅ | Display name for the queue |
| `status` | String | ✅ | `ACTIVE` / `INACTIVE`; default `ACTIVE` |
| `averageConsultationTime` | Number | ✅ | Minutes per patient; default 15 |
| `createdAt`, `updatedAt` | Date | auto | Mongoose timestamps |

### QueueEntry

| Field | Type | Required | Notes |
|---|---|---|---|
| `patientId` | ObjectId | ✅ | Reference to patient |
| `triageId` | ObjectId | ✅ | Ref → TriageRecord |
| `queueId` | ObjectId | ✅ | Ref → Queue |
| `departmentId` | ObjectId | ✅ | Denormalised from Queue |
| `priority` | Number | ✅ | `1` Emergency / `2` Urgent / `3` Normal |
| `queueNumber` | Number | ✅ | Sequential token; auto-generated |
| `status` | String | ✅ | See state machine below |
| `joinedAt` | Date | ✅ | Entry creation time |
| `calledAt` | Date | — | Set on `WAITING → CALLED` |
| `consultationStartedAt` | Date | — | Set on `CALLED → IN_CONSULTATION` |
| `completedAt` | Date | — | Set on `IN_CONSULTATION → COMPLETED` |
| `estimatedWaitingTime` | Number | — | Minutes; computed on-the-fly, stored as 0 |
| `actualWaitingTime` | Number | — | `calledAt − joinedAt` in minutes |
| `createdAt`, `updatedAt` | Date | auto | Mongoose timestamps |

### PriorityRule *(optional DB override)*

| Field | Type | Notes |
|---|---|---|
| `name` | String | Rule label |
| `triageLevel` | String | `EMERGENCY` / `URGENT` / `NORMAL` |
| `priority` | Number | `1` / `2` / `3` |
| `active` | Boolean | Enables/disables override |

---

## Queue State Machine

```
WAITING ──────────► CALLED ──────────► IN_CONSULTATION ──────────► COMPLETED
   │                   │
   ▼                   ▼
CANCELLED           NO_SHOW
```

| Transition | Timestamps set | AWT calculated |
|---|---|---|
| `WAITING → CALLED` | `calledAt` | ✅ `calledAt − joinedAt` |
| `CALLED → IN_CONSULTATION` | `consultationStartedAt` | — |
| `IN_CONSULTATION → COMPLETED` | `completedAt` | — |
| `WAITING → CANCELLED` | — | — |
| `CALLED → NO_SHOW` | — | — |

---

## Waiting Time Formulas

**Estimated Waiting Time (EWT)** — computed per request, never stored permanently:
```
EWT = (position − 1) × averageConsultationTime
```

**Actual Waiting Time (AWT)** — stored permanently on `WAITING → CALLED`:
```
AWT = round((calledAt − joinedAt) / 60000) minutes
```

---

## API Reference

### Health Check
| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Returns `{ message: "Patient Flow Backend is running!" }` |

### Triage
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/triage` | Create triage record |
| `GET` | `/api/triage/:id` | Get triage record by ID |
| `GET` | `/api/triage/patient/:patientId` | Get all triage records for a patient |

### Priority
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/priority/calculate` | Calculate priority from triage level |

### Queues
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/queues` | List all queues (`?status=ACTIVE` to filter) |
| `POST` | `/api/queues` | Create a new queue |
| `GET` | `/api/queues/:queueId` | Get queue by ID |
| `POST` | `/api/queues/join` | Add patient to queue |
| `GET` | `/api/queues/:queueId/entries` | Get queue entries (`?includeAll=true` for all statuses; default WAITING only) |
| `GET` | `/api/queues/:queueId/entries/:queueEntryId/position` | Get patient position and EWT (WAITING only) |
| `PATCH` | `/api/queues/entries/:queueEntryId/status` | Update queue entry status |

### Standard Error Responses

| Code | Meaning |
|---|---|
| `400` | Invalid input / invalid status transition |
| `404` | Resource not found |
| `409` | Duplicate active queue entry |
| `500` | Internal server error |

---

## Prerequisites

- Node.js 18 or later
- MongoDB 6 or later (local install or MongoDB Atlas)
- npm 9 or later

---

## Installation

```bash
cd patient-flow-backend
npm install
```

---

## Environment Variables

Create a `.env` file in `patient-flow-backend/`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/patient_flow_db
```

> **Never commit `.env` to version control.** It is already listed in `.gitignore`.

For MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string.

---

## Running the Server

```bash
# Development (auto-restart on file changes)
npm run dev

# Production
npm start
```

Server starts at: `http://localhost:5000`

---

## Known Limitations

- No authentication middleware (pending Member 1's auth module integration).
- `departmentId` on QueueEntry is copied from the Queue record; there is no live validation against a Department collection.
- No automated test suite; all testing was performed manually.
- CORS is fully open (`cors()` with no origin restriction) — suitable for development only.
- The `estimatedWaitingTime` field stored on `QueueEntry` is always `0` at creation; the live value is computed on-the-fly by the entries endpoint and is not persisted.
