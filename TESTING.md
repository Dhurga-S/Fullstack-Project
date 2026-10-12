# Patient Flow Module — Testing Documentation

**Module:** Member 2 — Patient Flow & Queue Management  
**Testing completed in:** Part 25

---

## Test Environment Requirements

| Requirement | Value |
|---|---|
| Node.js | 18 or later |
| MongoDB | 6 or later (local or Atlas) |
| Backend URL | `http://localhost:5000` |
| Frontend URL | `http://localhost:5173` |
| Test framework | None installed — all testing manual |

---

## Build & Startup Tests

| Test | Command | Result |
|---|---|---|
| Frontend TypeScript compile | `npm run build` (frontend) | ✅ PASSED — 0 errors |
| Frontend Vite production build | `npm run build` (frontend) | ✅ PASSED — 399 KB JS bundle |
| Backend module load | `node -e "require('./src/server.js')"` | ✅ PASSED — all modules load, MongoDB connects |
| No hardcoded secrets in source | Manual inspection | ✅ PASSED — all credentials in `.env` |
| `.env` excluded from git | `.gitignore` inspection | ✅ PASSED — both projects |

---

## API Contract Tests (Manual — requires running services)

### Triage APIs

| Test | Endpoint | Expected | Verified |
|---|---|---|---|
| Create triage — valid payload | `POST /api/triage` | `201 { success, data }` | ✅ Contract confirmed by code inspection |
| Create triage — invalid patientId | `POST /api/triage` | `400 { success: false, message }` | ✅ Validated in controller |
| Create triage — missing severity | `POST /api/triage` | `400` | ✅ Validated in controller |
| Get triage by ID | `GET /api/triage/:id` | `200 { success, data }` | ✅ Contract confirmed |
| Get triage — invalid ObjectId | `GET /api/triage/:id` | `400` | ✅ Validated in service |
| Get patient triage records | `GET /api/triage/patient/:patientId` | `200 { success, count, data[] }` | ✅ Contract confirmed |

### Queue APIs

| Test | Endpoint | Expected | Verified |
|---|---|---|---|
| Get all queues | `GET /api/queues` | `200 { success, count, data[] }` | ✅ Contract confirmed |
| Get active queues only | `GET /api/queues?status=ACTIVE` | Filtered list | ✅ Controller inspected |
| Create queue | `POST /api/queues` | `201 { success, data }` | ✅ Contract confirmed |
| Get queue by ID | `GET /api/queues/:queueId` | `200 { success, data }` | ✅ Contract confirmed |
| Get queue — not found | `GET /api/queues/:queueId` | `404` | ✅ Service throws 404 |
| Join queue — valid | `POST /api/queues/join` | `201 { success, data }` | ✅ Contract confirmed |
| Join queue — duplicate | `POST /api/queues/join` | `409 { success: false, message }` | ✅ Service checks existing WAITING/CALLED/IN_CONSULTATION |
| Join queue — inactive queue | `POST /api/queues/join` | `400` | ✅ Service validates queue.status |
| Join queue — triage not found | `POST /api/queues/join` | `404` | ✅ Service validates triageId |
| Get WAITING entries only | `GET /api/queues/:queueId/entries` | WAITING entries with position + EWT | ✅ Default behaviour confirmed |
| Get all entries | `GET /api/queues/:queueId/entries?includeAll=true` | All statuses | ✅ Added in Part 22 |
| Get entry position — WAITING | `GET .../entries/:entryId/position` | `200 { position, priority, estimatedWaitingTime }` | ✅ Contract confirmed |
| Get entry position — not WAITING | `GET .../entries/:entryId/position` | `400 { message: "not currently waiting" }` | ✅ Service throws 400 |

### Status Transition Tests

| Transition | Expected | Verified |
|---|---|---|
| `WAITING → CALLED` | Sets `calledAt`, computes `actualWaitingTime` | ✅ `queueStatusService.js` inspected |
| `CALLED → IN_CONSULTATION` | Sets `consultationStartedAt` | ✅ Confirmed |
| `IN_CONSULTATION → COMPLETED` | Sets `completedAt` | ✅ Confirmed |
| `WAITING → CANCELLED` | Status updated, no new timestamps | ✅ Confirmed |
| `CALLED → NO_SHOW` | Status updated, no new timestamps | ✅ Confirmed |
| `WAITING → COMPLETED` (invalid) | `400 "Invalid status transition"` | ✅ `VALID_TRANSITIONS` map enforces |
| `COMPLETED → anything` (invalid) | `400` | ✅ `VALID_TRANSITIONS` has empty array |

### Priority Tests

| Triage Level | Expected Priority | Verified |
|---|---|---|
| `EMERGENCY` | `1` | ✅ `DEFAULT_PRIORITY_MAP` confirmed |
| `URGENT` | `2` | ✅ Confirmed |
| `NORMAL` | `3` | ✅ Confirmed |

---

## Frontend Feature Tests (Manual — requires browser)

| Feature | Test | Status |
|---|---|---|
| Patient Flow Dashboard | Select queue → Load → entries appear | ⛔ NOT TESTED — requires running services |
| Triage Form | Submit valid form → success banner with ID | ⛔ NOT TESTED |
| Triage Form validation | Submit with empty patientId → inline error | ⛔ NOT TESTED |
| Triage Form — invalid ObjectId | Submit bad patientId → "must be 24-char ObjectId" | ⛔ NOT TESTED |
| Join Queue | Select queue, enter IDs → success card | ⛔ NOT TESTED |
| Join Queue — duplicate | Second join attempt → 409 error displayed | ⛔ NOT TESTED |
| Queue Status — WAITING patient | Enter IDs → position + EWT shown | ⛔ NOT TESTED |
| Queue Status — CALLED patient | Enter IDs → "Called" status card shown | ⛔ NOT TESTED (fixed in Part 25) |
| Queue Status — COMPLETED patient | Enter IDs → "Completed" status card shown | ⛔ NOT TESTED (fixed in Part 25) |
| Queue Management — Call Patient | Click → status becomes CALLED | ⛔ NOT TESTED |
| Queue Management — Complete | Full workflow to COMPLETED | ⛔ NOT TESTED |
| Queue Management — Cancel | WAITING → CANCELLED | ⛔ NOT TESTED |
| Queue Management — No Show | CALLED → NO_SHOW | ⛔ NOT TESTED |
| Queue History | Load → completed/no-show/cancelled entries appear | ⛔ NOT TESTED |
| Queue History analytics | Average waiting time excludes WAITING zeros | ⛔ NOT TESTED (fixed in Part 25) |
| Queue Performance | All statuses returned; stats exclude WAITING zeros | ⛔ NOT TESTED (fixed in Part 25) |
| Optimization — Rule A | Emergency WAITING patient triggers alert | ⛔ NOT TESTED |
| Optimization — Rule B | 5+ WAITING patients triggers congestion | ⛔ NOT TESTED |
| Optimization — Rule D | CALLED patient triggers Rule D | ⛔ NOT TESTED (fixed in Part 25) |
| Optimization — Rule F | No COMPLETED entries triggers Rule F correctly | ⛔ NOT TESTED (fixed in Part 25) |

**Reason tests are NOT TESTED:** Running these tests requires MongoDB running locally, both services started, and real data created through the application workflow. The test environment could not be automated — manual execution is required.

---

## Bugs Found and Fixed in Part 25

| # | Severity | Bug | Fix Applied |
|---|---|---|---|
| 1 | Critical | Optimization Rules D and F always wrong — `optimizationService` fetched WAITING-only entries | Changed to `getQueueEntries(queueId, true)` |
| 2 | Moderate | AWT stats in QueuePerformancePage included WAITING patients' `0` values | Added `e.status !== "WAITING"` to filter |
| 3 | Moderate | Same zero-skew in WaitingTimePerformance distribution chart | Same fix applied |
| 4 | Moderate | Non-WAITING patients saw error banner instead of status card on Queue Status page | `trackQueueEntry` now uses `includeAll=true` |
| 5 | Minor | "Completed At" column showed "—" for NO_SHOW/CANCELLED (column renamed "Finalized At") | Renamed header; NO_SHOW shows `calledAt` |
| 6 | Minor | Queue Status page `QueueSelector` defaulted to ACTIVE only | Added `activeOnly={false}` |
| 7 | Minor | `getAllQueues` controller had inline `require('../models/Queue')` | Moved to top of file |
| 8 | Minor | Frontend README had stale routes and structure | Rewrote README |
| 9 | Minor | Frontend `.gitignore` didn't list `.env` | Added `.env` entries |

---

## Known Remaining Issues

| Severity | Issue | Impact |
|---|---|---|
| Low | `updateQueueEntryStatus` returns `entry:` key; all others return `data:` | API inconsistency; frontend handles correctly |
| Low | `priorityService.ts` (frontend) not imported anywhere | Dead code; no functional impact |
| Low | Non-WAITING entries accumulate in QueueManagementPage local state during a session | "Refresh Queue" or page reload clears it |
| Blocked | Authentication | All APIs are currently public |
| Blocked | Patient ID lookup | Requires Member 1's module |
| Blocked | Department selector | Requires Member 3's module |

---

## How to Run Manual Tests

1. Start MongoDB
2. Start backend: `npm run dev` in `patient-flow-backend`
3. Start frontend: `npm run dev` in `patient-flow-frontend`
4. Open `http://localhost:5173/patient-flow/triage`
5. Follow the Demo Guide in `DEMO_GUIDE.md`

To test the backend APIs directly without a browser, use Postman or curl:

```bash
# Health check
curl http://localhost:5000/

# Create triage
curl -X POST http://localhost:5000/api/triage \
  -H "Content-Type: application/json" \
  -d '{"patientId":"507f1f77bcf86cd799439011","symptoms":"Chest pain","severity":"CRITICAL","triageLevel":"EMERGENCY"}'

# Get all queues
curl http://localhost:5000/api/queues
```
