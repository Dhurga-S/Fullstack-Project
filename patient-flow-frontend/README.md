# Patient Flow Frontend

React + TypeScript + Vite frontend for the **Patient Flow & Queue Management** module of the Hospital Resource Coordination Platform.

---

## Technology Stack

| Technology | Version | Purpose |
|---|---|---|
| React | 19.x | UI library |
| TypeScript | 5.x | Type safety |
| Vite | 8.x | Build tool & dev server |
| Tailwind CSS | 4.x | Utility-first styling |
| React Router | 7.x | Client-side routing |
| Axios | 1.x | HTTP client |

---

## Features Implemented

| Feature | Route | Status |
|---|---|---|
| Patient Flow Dashboard | `/patient-flow` | ✅ Working |
| Patient Triage Form | `/patient-flow/triage` | ✅ Working |
| Join Queue | `/patient-flow/queue` | ✅ Working |
| Queue Status (patient tracking) | `/patient-flow/queue-status` | ✅ Working |
| Queue Management (staff) | `/patient-flow/queue-management` | ✅ Working |
| Queue History & Analytics | `/patient-flow/queue-history` | ✅ Working |
| Queue Performance Dashboard | `/patient-flow/queue-performance` | ✅ Working |
| Patient Flow Optimization | `/patient-flow/optimization` | ✅ Working |

---

## Prerequisites

- Node.js 18 or later
- npm 9 or later
- Backend running at `http://localhost:5000`

---

## Installation

```bash
cd patient-flow-frontend
npm install
```

---

## Environment Variables

The `.env` file in `patient-flow-frontend/` must contain:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

> **Never commit `.env` to version control.** It is already listed in `.gitignore`.

---

## Running the Frontend

```bash
npm run dev
```

Frontend runs at: **http://localhost:5173**

The backend must be running before the frontend is used.

---

## Project Structure

```
src/
├── components/
│   ├── dashboard/
│   │   ├── SummaryCard.tsx
│   │   ├── PriorityBadge.tsx
│   │   ├── StatusBadge.tsx
│   │   └── QueueTable.tsx
│   ├── queue/
│   │   ├── QueueSelector.tsx          # Reusable queue dropdown (fetches GET /api/queues)
│   │   ├── JoinQueueForm.tsx
│   │   ├── QueueJoinResult.tsx
│   │   ├── QueueStatusCard.tsx
│   │   ├── QueueManagementTable.tsx
│   │   ├── QueueActionButtons.tsx
│   │   ├── QueueHistoryTable.tsx
│   │   ├── QueueAnalyticsCards.tsx
│   │   ├── WaitingTimePerformance.tsx
│   │   ├── PriorityDistribution.tsx
│   │   ├── StatusDistribution.tsx
│   │   └── RecentCompletedTable.tsx
│   ├── triage/
│   │   ├── TriageForm.tsx
│   │   └── VitalSignsForm.tsx
│   └── optimization/
│       ├── RecommendationCard.tsx
│       └── OptimizationSummary.tsx
├── layouts/
│   └── PatientFlowLayout.tsx           # Shared header + nav + footer
├── pages/
│   ├── HomePage.tsx
│   ├── PatientFlowDashboard.tsx
│   ├── TriagePage.tsx
│   ├── QueuePage.tsx
│   ├── QueueStatusPage.tsx
│   ├── QueueManagementPage.tsx
│   ├── QueueHistoryPage.tsx
│   ├── QueuePerformancePage.tsx
│   └── PatientFlowOptimizationPage.tsx
├── services/
│   ├── api.ts                          # Axios instance
│   ├── triageService.ts
│   ├── queueService.ts
│   ├── priorityService.ts
│   └── optimizationService.ts
├── types/
│   ├── triage.ts
│   ├── queue.ts
│   ├── priority.ts
│   └── optimization.ts
├── utils/
│   └── optimizationRules.ts            # Rule-based recommendations engine
├── App.tsx                             # Route definitions
├── main.tsx
└── index.css                           # Tailwind CSS entry
```

---

## API Contract

All API calls go through `src/services/api.ts` (Axios instance with `baseURL` from `VITE_API_BASE_URL`). Services unwrap the backend's `{ success, data }` envelope before returning data to components. Components never call Axios directly.

| Service file | Functions |
|---|---|
| `triageService.ts` | `createTriage`, `getTriageById`, `getPatientTriage` |
| `queueService.ts` | `getQueues`, `getQueue`, `createQueue`, `joinQueue`, `getQueueEntries`, `getQueueEntryPosition`, `updateQueueEntryStatus`, `trackQueueEntry` |
| `priorityService.ts` | `calculatePriority` |
| `optimizationService.ts` | `analyzeQueueFlow` |

---

## Known Limitations

- **Authentication** — Patient ID, Triage ID, and Queue Entry ID are entered manually. Full authentication integration requires Member 1's auth module (not yet delivered).
- **Patient lookup** — No patient search UI; patient IDs must be known in advance.
- **Department selection** — Department IDs are entered manually; no live department selector (requires Member 3's module).
- **No automated tests** — The project has no test framework installed.
- **No WebSockets** — Queue status updates require manual refresh; no real-time push.
