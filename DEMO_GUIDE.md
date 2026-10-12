# Patient Flow Module — Demo Guide

**Project:** Patient Flow Optimization & Hospital Resource Coordination Platform  
**Module:** Member 2 — Patient Flow & Queue Management  
**Audience:** College demonstration / project review

---

## Pre-Demo Setup

### 1. Start MongoDB

```bash
# Local MongoDB
mongod
```

Or ensure your MongoDB Atlas cluster is accessible.

### 2. Start the Backend (Terminal 1)

```bash
cd "patient-flow-backend"
npm run dev
```

Wait for:
```
MongoDB connected successfully
Server running on port 5000
```

### 3. Start the Frontend (Terminal 2)

```bash
cd "patient-flow-frontend"
npm run dev
```

Wait for:
```
VITE v8.3.3  ready in ...ms
➜  Local:   http://localhost:5173/
```

### 4. Open in Browser

Go to: `http://localhost:5173`

### 5. Create a Queue (first-time only)

The demo requires at least one queue to exist. Create one via the API or Postman:

```http
POST http://localhost:5000/api/queues
Content-Type: application/json

{
  "departmentId": "507f1f77bcf86cd799439011",
  "name": "General Outpatient",
  "averageConsultationTime": 15
}
```

Copy the `_id` from the response — this is your **Queue ID** for the demo.

---

## Demo Script

### Scene 1 — The Problem (1 minute)

> "Hospital emergency departments face a daily challenge: patients arrive continuously, but without a structured system, high-priority patients can be missed, staff have no visibility into the queue state, and patients don't know how long they'll wait.
>
> Our Patient Flow module solves this with a structured triage-to-discharge workflow backed by a priority queue system."

---

### Scene 2 — The Dashboard (1 minute)

Navigate to: `http://localhost:5173/patient-flow`

1. Select the **General Outpatient** queue from the dropdown.
2. Click **Load Queue**.
3. Show the live waiting entries table and summary cards.

> "Staff can immediately see how many patients are waiting, their priority levels, and their estimated waiting times — all calculated by the backend in real time."

---

### Scene 3 — Creating a Triage Record (2 minutes)

Navigate to: `/patient-flow/triage`

Fill in the form:

| Field | Value |
|---|---|
| Patient ID | any valid 24-char hex ID (e.g. `507f1f77bcf86cd799439011`) |
| Symptoms | `Chest pain and shortness of breath` |
| Severity | `CRITICAL` |
| Temperature | `38.5` |
| Heart Rate | `110` |
| Blood Pressure | `150/95` |
| Oxygen Saturation | `91` |
| Triage Level | `EMERGENCY` |
| Notes | `Requires immediate assessment` |

Click **Submit Triage**.

> "The system records the clinical assessment. Crucially, the triage level — EMERGENCY — will drive the patient's priority in the queue. The frontend never calculates priority itself; the backend is the single source of truth."

Copy the **Triage Record ID** from the success banner.

---

### Scene 4 — Joining the Queue (1 minute)

Navigate to: `/patient-flow/queue`

Fill in the form:

| Field | Value |
|---|---|
| Patient ID | same ID used for triage |
| Triage ID | the ID copied in Scene 3 |
| Queue | Select **General Outpatient** |

Click **Join Queue**.

> "The backend reads the triage record, calculates the priority — EMERGENCY maps to Priority 1 — generates a queue number, and creates the queue entry. No priority logic exists in the frontend."

Show the result card:
- Queue Number
- **Priority: Emergency** (badge)
- **Status: Waiting**
- Estimated Waiting Time

Copy the **Queue Entry ID**.

---

### Scene 5 — Patient Queue Tracking (1 minute)

Navigate to: `/patient-flow/queue-status`

| Field | Value |
|---|---|
| Queue | Select **General Outpatient** |
| Queue Entry ID | the ID copied in Scene 4 |

Click **Track Queue**.

> "A patient or nurse can check the current position and estimated waiting time at any time. Because this patient has Emergency priority, they appear at position 1 regardless of when they joined."

Add 2–3 more patients with URGENT and NORMAL triage levels, join them to the queue, then reload the status to show position ordering.

---

### Scene 6 — Staff Queue Management (3 minutes)

Navigate to: `/patient-flow/queue-management`

Select the queue and click **Load Queue**.

> "Staff see all waiting patients in priority order. Actions are only shown for valid transitions — the backend enforces the rules."

**Demonstrate the full workflow:**

1. Click **Call Patient** on the emergency patient.
   - Status changes to **Called**.
   - `calledAt` timestamp set by backend.
   - `actualWaitingTime` calculated automatically.

2. Click **Start Consultation**.
   - Status changes to **In Consultation**.
   - `consultationStartedAt` set.

3. Click **Complete**.
   - Status changes to **Completed**.
   - `completedAt` set.

**Demonstrate alternative paths:**

4. Join a new patient → click **Cancel** (WAITING → CANCELLED).
5. Join another → call them → click **No Show** (CALLED → NO_SHOW).

> "The backend validates every transition. Try clicking an invalid action and you'll get a clear error — the system prevents jumping from Waiting directly to Completed."

---

### Scene 7 — Queue History & Analytics (1 minute)

Navigate to: `/patient-flow/queue-history`

Select the queue and click **Load History**.

> "Historical records show only completed, cancelled, and no-show entries — the backend filters in real time. The analytics cards show actual counts and the average actual waiting time, computed only from patients who were actually called, not from patients who are still waiting."

Point out:
- Completed / No Show / Cancelled counts
- Average Waiting Time (uses `actualWaitingTime` from CALLED/COMPLETED patients only)
- History table with Queue Number, Priority badge, Status badge, timestamps

---

### Scene 8 — Performance Dashboard (1 minute)

Navigate to: `/patient-flow/queue-performance`

Select the queue and click **Load Performance**.

> "The performance dashboard gives staff an operational overview. Priority distribution shows the clinical severity mix. The waiting time distribution groups patients by how long they waited, helping managers identify chronic delays."

Point out:
- Total patients, waiting, completed, no-show, cancelled
- Average and longest waiting time
- Priority distribution chart
- Waiting time range breakdown (0–15 min, 16–30 min, 31–60 min, 60+ min)
- Recent completed table

---

### Scene 9 — Optimization Recommendations (2 minutes)

Navigate to: `/patient-flow/optimization`

Select the queue and click **Analyze Queue**.

> "This is rule-based operational guidance — not AI. The system reads the current queue entries and evaluates six transparent rules. I'll show you what triggers."

**Walk through the rules:**

| Rule | Trigger | What it shows |
|---|---|---|
| Rule A | Any WAITING patient with Priority 1 | 🚨 Emergency alert |
| Rule B | 5+ WAITING patients | ⚠️ Congestion alert |
| Rule C | Any WAITING patient with EWT ≥ 30 min | ⚠️ Long wait alert |
| Rule D | Any CALLED patient | ℹ️ Called patients notice |
| Rule E | Zero WAITING patients | ℹ️ Queue clear notice |
| Rule F | No COMPLETED records | ℹ️ No history available |

> "Every recommendation shows the affected queue numbers and suggested action. The system never changes any patient's status automatically — all clinical decisions stay with the staff."

Point out the **Clinical Safety banner** at the top:  
*"Recommendations are generated using transparent, rule-based criteria. They are not produced by AI/ML algorithms and are not clinically validated."*

---

### Scene 10 — Integration Status (1 minute)

> "This module is designed to integrate with the other team members' modules. The queue entry correctly stores `patientId`, `triageId`, and `departmentId` as MongoDB ObjectIds, ready to be resolved against a Patient collection, a Triage collection, and a Department collection.
>
> Currently, Patient IDs and Department IDs are entered manually during the demo because Member 1's patient module and Member 3's doctor/department module have not yet been delivered to this environment. The integration points are built and documented — once those modules exist, the manual inputs will be replaced by live lookups."

---

## Quick Reference: IDs for the Demo

Keep these handy during the demo:

| Item | Value |
|---|---|
| Queue ID | *(copy from POST /api/queues response)* |
| Patient ID (demo) | `507f1f77bcf86cd799439011` *(or any valid ObjectId)* |
| Triage Record ID | *(copy from triage form success banner)* |
| Queue Entry ID | *(copy from Join Queue success card)* |

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| "This site can't be reached" | Run `npm run dev` in the frontend folder and keep the terminal open |
| Queue selector shows empty | No queues exist — create one via POST /api/queues |
| "Unable to load queue" | Backend is not running — start it with `npm run dev` |
| "MongoDB connection error" | MongoDB is not running — start `mongod` |
| Triage submission fails with 400 | Patient ID must be a valid 24-character hex MongoDB ObjectId |
| Duplicate queue join error (409) | Patient is already WAITING/CALLED/IN_CONSULTATION in this queue |
