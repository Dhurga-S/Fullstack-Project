# Patient Flow Module — Viva Questions & Answers

**Project:** Patient Flow Optimization & Hospital Resource Coordination Platform  
**Module:** Member 2 — Patient Flow & Queue Management  
**Prepared for:** College technical viva / project review

Read each answer, understand it, then practise saying it in your own words. You do not need to memorise the exact text.

---

## Section A — Project Overview & Problem Statement

### Q1. What problem does your project solve?

Hospital outpatient and emergency departments face a daily challenge: patients arrive continuously but there is no structured system to track who should be seen first. High-priority patients — those with life-threatening conditions — can end up waiting behind non-urgent patients simply because they arrived after them. Staff also have no real-time visibility into the queue, so they cannot allocate resources effectively.

My module solves this by implementing a **priority-based patient flow system**. Every patient is triaged first, and their triage level automatically determines their place in the queue. The system tracks real waiting times, lets staff manage status transitions, and provides analytics and operational recommendations — all backed by a REST API and a MongoDB database.

---

### Q2. What is the difference between a Hospital Management System and a Patient Flow Optimization platform?

A **Hospital Management System** (HMS) typically handles administrative tasks: patient registration, billing, appointment booking, and record storage. It answers the question "who is this patient and what are their records?"

A **Patient Flow Optimization platform** focuses on movement — it answers the question "where is this patient right now and how long will they wait?" It models the queue as a dynamic, priority-ordered data structure, calculates estimated waiting times in real time, tracks status transitions with timestamps, and gives operational recommendations to reduce congestion.

My project is the second type. It does not manage patient billing or appointments. It specifically optimises the flow of patients through a consultation queue.

---

### Q3. Which part of the project did you build?

I built **Member 2 — Patient Flow & Queue Management**. This includes:

- The complete backend: Node.js + Express REST API, MongoDB models, business logic services
- The complete frontend: React + TypeScript + Vite + Tailwind CSS, 8 pages, all service layer and components
- The triage form, queue joining, queue management, patient tracking, history, performance dashboard, and rule-based optimization

---

## Section B — Technology Stack

### Q4. Why did you choose the MERN stack?

MERN stands for MongoDB, Express, React, Node.js. It uses JavaScript/TypeScript throughout the entire stack, which means:
- One language for both frontend and backend reduces context-switching
- JSON is the native format for both MongoDB documents and API responses
- Node.js is non-blocking and well-suited for a high-concurrency hospital environment
- React gives us a component-based UI that is easy to maintain and extend

---

### Q5. What is Express.js and how does it fit in your project?

Express is a lightweight web framework for Node.js. It handles:
- Routing — mapping URL paths and HTTP methods to controller functions
- Middleware — parsing JSON bodies, handling CORS, catching errors globally
- No-clutter design — it does not force a specific folder structure, so I could organise code into routes, controllers, and services clearly

In my project every API endpoint is an Express route. For example:
```
router.post('/join', joinQueue)
```
This maps `POST /api/queues/join` to the `joinQueue` controller function.

---

### Q6. Why TypeScript on the frontend?

TypeScript adds static type checking to JavaScript. In my project it means:
- Every API response shape is defined as an interface (e.g. `QueueEntry`, `TriageRecord`) — if the backend changes a field name, the TypeScript compiler immediately flags every place the old name was used
- I cannot accidentally pass a `string` where a `number` is expected (e.g. `priority`)
- The `QueueEntryStatus` union type (`"WAITING" | "CALLED" | ...`) prevents typos in status values
- IDEs provide autocomplete for all data fields

---

### Q7. Why MongoDB over a relational database like MySQL?

MongoDB is a document database that stores data as JSON-like documents. For this project:
- A `QueueEntry` document naturally contains nested data (timestamps, priority, status) without needing multiple joins
- The schema is flexible — I can add fields like `consultationStartedAt` without migrating a table
- Mongoose provides schema validation and type casting on top of MongoDB's flexibility

A relational database would work too, but it would require joins between `patients`, `triage_records`, `queues`, and `queue_entries` tables for every queue listing operation. MongoDB keeps related data together.

---

### Q8. What is Mongoose?

Mongoose is an ODM — Object Document Mapper — for MongoDB and Node.js. It:
- Defines schemas with field types, validators, and defaults (e.g. `status` defaults to `'WAITING'`)
- Validates data before saving (e.g. rejects a `severity` value that is not in `['LOW','MODERATE','HIGH','CRITICAL']`)
- Casts types automatically (e.g. converts a string `"5000"` to number `5000` where a `Number` type is declared)
- Provides methods like `findById`, `findOne`, `save`, and custom indexes

---

## Section C — API Design

### Q9. What REST principles did you follow?

REST — Representational State Transfer — uses HTTP methods semantically:

| Method | Use | Example in my project |
|---|---|---|
| GET | Read data | `GET /api/queues/:queueId/entries` |
| POST | Create new resource | `POST /api/triage` |
| PATCH | Partial update | `PATCH /api/queues/entries/:id/status` |

I used nouns in URLs (not verbs), nested resources logically (`/queues/:id/entries`), and returned consistent `{ success, data }` response envelopes so the frontend knows what to expect.

---

### Q10. What is the difference between PUT and PATCH?

- **PUT** replaces the entire resource with a new representation
- **PATCH** applies a partial update — only the specified fields change

I used PATCH for status updates because I only want to change the `status` field (and trigger the corresponding timestamp logic). Replacing the entire `QueueEntry` with PUT would risk accidentally overwriting `joinedAt`, `calledAt`, etc.

---

### Q11. How does your error handling work on the backend?

Every controller wraps its logic in `try/catch` and calls `next(error)` on failure. A global error handler middleware at the bottom of `server.js` catches all errors and responds with a consistent format:

```json
{ "success": false, "message": "Queue not found" }
```

The middleware also:
- Detects Mongoose `CastError` (malformed ObjectId) → 400
- Detects Mongoose `ValidationError` (schema violation) → 400
- Logs unexpected 500 errors server-side for debugging
- Never exposes raw stack traces to the client

---

### Q12. What is an ObjectId and why does it matter for validation?

MongoDB automatically assigns a 24-character hexadecimal string as the `_id` of every document. This is called an `ObjectId`. Examples:
- Valid: `507f1f77bcf86cd799439011`
- Invalid: `abc123`

Before using an ID from the request, I validate it with `mongoose.Types.ObjectId.isValid(id)`. If it is invalid, I return a 400 immediately without hitting the database. This prevents Mongoose `CastError` exceptions and gives the client a clear error message.

---

## Section D — Database Models & Relationships

### Q13. Describe your database models and their relationships.

My module has four Mongoose models:

**TriageRecord** — stores the clinical assessment for one patient visit: `patientId`, `symptoms`, `severity`, `vitalSigns`, `triageLevel`, `notes`.

**Queue** — represents a department's consultation queue: `departmentId`, `name`, `status` (ACTIVE/INACTIVE), `averageConsultationTime`.

**QueueEntry** — the core record linking a patient to a queue for one visit: `patientId`, `triageId` (→ TriageRecord), `queueId` (→ Queue), `departmentId`, `priority`, `queueNumber`, `status`, and all timestamps.

**PriorityRule** — optional database override for the triage-level to priority mapping.

The relationship is: one `TriageRecord` → one `QueueEntry` → one `Queue`. The `patientId` and `departmentId` are foreign key references to modules owned by other team members.

---

### Q14. Why do you store departmentId on QueueEntry when it is already on Queue?

This is intentional denormalisation. When I look up a queue entry later, I want the `departmentId` immediately without an extra database join to the Queue collection. In MongoDB this is a common pattern — trade a small amount of storage for faster reads.

---

## Section E — Queue Business Logic

### Q15. How does the priority calculation work?

When a patient joins a queue, the backend:
1. Reads the `triageId` from the request
2. Fetches the `TriageRecord` from MongoDB
3. Reads the `triageLevel` field (`EMERGENCY`, `URGENT`, or `NORMAL`)
4. Passes it to `priorityService.calculatePriority(triageLevel)`
5. The service first checks the `PriorityRule` collection for a custom override, then falls back to the hardcoded map: `EMERGENCY→1, URGENT→2, NORMAL→3`
6. The numerical `priority` is stored on the `QueueEntry`

The frontend **never calculates priority**. It only displays the number returned by the backend.

---

### Q16. How does queue ordering work?

When `GET /api/queues/:queueId/entries` is called, the backend runs:

```javascript
QueueEntry.find({ queueId, status: 'WAITING' }).sort({ priority: 1, joinedAt: 1 })
```

This sorts by:
1. `priority` ascending — 1 (Emergency) always before 2 (Urgent) before 3 (Normal)
2. `joinedAt` ascending — within the same priority, earlier arrivals come first (FIFO)

This ensures an emergency patient who arrives after a normal patient is moved to the front of the queue.

---

### Q17. How is estimated waiting time (EWT) calculated?

EWT is calculated on every API call — it is never permanently stored. The formula is:

```
EWT = (position − 1) × averageConsultationTime
```

For example, if `averageConsultationTime` is 15 minutes:
- Position 1 → 0 minutes (next to be called)
- Position 2 → 15 minutes
- Position 3 → 30 minutes

The position is determined by the sort order (priority + join time). The `averageConsultationTime` is configured on the Queue record when the queue is created.

---

### Q18. How is actual waiting time (AWT) calculated?

AWT is calculated and stored permanently when a patient transitions from `WAITING` to `CALLED`:

```javascript
const diffMs = calledAt.getTime() − joinedAt.getTime();
actualWaitingTime = Math.round(diffMs / (1000 × 60)); // in minutes
```

This represents the real time a patient waited from joining the queue until being called. It is stored on the `QueueEntry` and used in the history and analytics pages.

---

### Q19. How does the status transition system work?

Status transitions follow a strict state machine defined in `queueStatusService.js`:

```
WAITING → CALLED → IN_CONSULTATION → COMPLETED
WAITING → CANCELLED
CALLED → NO_SHOW
```

When a `PATCH` request arrives, the service:
1. Validates the `queueEntryId` is a valid ObjectId
2. Finds the `QueueEntry` in MongoDB
3. Checks that the requested transition is in `VALID_TRANSITIONS[currentStatus]`
4. If valid: updates `status`, sets the relevant timestamp (`calledAt`, `consultationStartedAt`, or `completedAt`), and calculates AWT if transitioning from WAITING
5. Saves and returns the updated document

If the transition is invalid (e.g. WAITING → COMPLETED), the service throws a 400 error: "Invalid status transition from WAITING to COMPLETED".

---

### Q20. How do you prevent a patient from joining the same queue twice?

Before creating a new `QueueEntry`, the service checks:

```javascript
QueueEntry.findOne({
  patientId,
  queueId,
  status: { $in: ['WAITING', 'CALLED', 'IN_CONSULTATION'] }
})
```

If a document is found, the service throws a 409 Conflict error: "Patient is already active in this queue". This prevents duplicate entries without any frontend logic.

---

## Section F — Frontend Architecture

### Q21. How is the frontend structured?

The frontend follows a layered architecture:

```
Pages → Components → Services → Axios → Backend API
```

- **Pages** own state, fetch data, and handle loading/error/success
- **Components** are pure display — they receive props and render UI, never call APIs directly
- **Services** (`queueService.ts`, `triageService.ts`) wrap every API endpoint in a typed function and unwrap the backend's `{ success, data }` envelope
- **Types** (`queue.ts`, `triage.ts`) define TypeScript interfaces matching exact backend response shapes
- **Utils** (`optimizationRules.ts`) contain pure calculation functions with no side effects

---

### Q22. What is the purpose of the Axios instance in api.ts?

Instead of calling `axios.get(...)` with a full URL everywhere, I create one configured instance:

```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});
```

Every service file imports this instance. If the backend URL changes, I update one line in one file. It also makes it easy to add an auth interceptor later — I add it once to `api.ts` and every service benefits automatically.

---

### Q23. How does the optimization engine work?

The optimization page is powered by `optimizationRules.ts` — a pure TypeScript module with no API calls. When the user clicks "Analyze Queue":

1. `optimizationService.ts` fetches all queue entries (all statuses) from the backend
2. It passes the entries array to `evaluateOptimizationRules()`
3. The function evaluates six transparent rules against the data:
   - Rule A: Emergency patients waiting → HIGH alert
   - Rule B: 5+ patients waiting → congestion warning
   - Rule C: Any patient with EWT ≥ 30 min → long wait warning
   - Rule D: Called patients exist → info
   - Rule E: No waiting patients → queue clear notice
   - Rule F: No completed patients → no history available
4. The page displays high-importance alerts separately from informational notices

**Important:** This is rule-based operational guidance — not AI or machine learning. The rules are deterministic, transparent, and do not change any patient data.

---

### Q24. What is React Router and how do you use it?

React Router is a client-side routing library. Instead of loading a new HTML page from the server for every navigation, it swaps React components based on the URL. My application has a single HTML file — `index.html` — and React Router renders different page components depending on the path.

I use nested routes:
```tsx
<Route path="/patient-flow" element={<PatientFlowLayout />}>
  <Route index element={<PatientFlowDashboard />} />
  <Route path="triage" element={<TriagePage />} />
  ...
</Route>
```

The `PatientFlowLayout` renders the shared header and footer. Each child route renders its page component inside the layout's `<Outlet />`. This avoids duplicating the header across every page.

---

## Section G — Authentication & Security

### Q25. Is authentication implemented in your module?

No. Authentication was planned as Member 1's responsibility (Patient & Access module), but Member 1's module was not delivered to this environment by the time of this demo. My backend APIs are currently open (public).

The architecture is designed for easy integration:
- All API calls go through a single Axios instance in `api.ts`
- Adding auth requires only: (1) store the JWT in `localStorage` after login, and (2) add one Axios request interceptor that reads the token and appends `Authorization: Bearer <token>` to every request
- On the backend, a route-level middleware function `protect(req, res, next)` would verify the JWT before allowing access to protected routes

---

### Q26. What is JWT and how would it work in your project?

JWT stands for JSON Web Token. It is a compact, signed string that proves a user is who they claim to be. The flow would be:

1. User logs in with email + password
2. Backend verifies credentials and signs a JWT containing the user's `_id` and `role`
3. Frontend stores the JWT in `localStorage`
4. Every subsequent API request includes the JWT in the `Authorization` header
5. Backend middleware verifies the JWT signature, decodes the payload, and attaches `req.user` to the request
6. Route handlers use `req.user.role` to decide what data to show (e.g., staff can see all patients; a patient can only see their own records)

---

## Section H — Testing & Quality

### Q27. How did you test your project?

Testing was performed in three ways:

1. **TypeScript compile check** — `npm run build` in the frontend runs `tsc -b`, which catches all type errors at compile time. This passed with zero errors.

2. **Module load test** — A Node.js script loads all 13 backend modules and verifies they require without errors. This passed.

3. **Code inspection** — All API contract shapes (request body fields, response envelope structure) were verified by reading both the backend controller/service and the corresponding frontend service function side by side.

There is no automated test framework installed. Manual browser testing of the full workflow (triage → join → manage → history → performance → optimization) is required.

---

### Q28. What are the known limitations of your project?

1. **No authentication** — all APIs are public; Member 1's auth module was not delivered
2. **Manual ID entry** — Patient IDs and Triage IDs are entered manually as MongoDB ObjectIds (no patient search UI)
3. **No real-time updates** — queue status changes require manual page refresh; no WebSockets
4. **No automated tests** — no Jest or Vitest test suite
5. **CORS fully open** — `app.use(cors())` with no origin restriction is fine for development but not production
6. **Estimated waiting time not persisted** — EWT is recalculated on every request; if the queue is empty the stored value on completed entries is 0

---

### Q29. What would you improve if you had more time?

1. **WebSocket real-time updates** — use Socket.IO so the queue management screen updates automatically when a patient joins or is called
2. **Authentication** — complete Member 1's integration: JWT verification middleware, role-based route protection, patient lookup dropdown
3. **Automated testing** — add Vitest for frontend unit tests on services and optimizationRules; add Supertest for backend API integration tests
4. **CORS restriction** — restrict allowed origins to the known frontend URL
5. **Persistent EWT** — update `estimatedWaitingTime` on the QueueEntry at join time and refresh it when other patients are called
6. **Patient-facing mobile view** — a simplified "your ticket" view showing only position and EWT for the current patient

---

### Q30. Why did you choose to separate business logic from controllers?

The controller's only job is to handle HTTP concerns: read from `req`, call a service, and send a `res`. The service contains all business logic: validation, database queries, calculations, error throwing.

This separation means:
- Logic is testable without starting an HTTP server — you can call a service function directly with mocked data
- Controllers are thin and readable — a reviewer can see all your API endpoints without wading through business rules
- If you switch from Express to another framework later, you only rewrite the controllers; the services are unchanged

This is called the **Service Layer pattern** and is a standard architecture in production Node.js applications.

---

## Section I — Follow-up Design Questions

### Q31. Why is `getOrderedQueue` called on every request instead of caching the queue order?

Queue order changes whenever a patient joins, is called, or cancels. If I cached the result for even 10 seconds, a newly joined emergency patient might not appear at the front of the queue on the staff's screen for 10 seconds — a potentially dangerous delay in a hospital context. Real-time accuracy is more important than the small performance gain from caching.

---

### Q32. What does `sort({ priority: 1, joinedAt: 1 })` mean in MongoDB?

In MongoDB's `sort()`, `1` means ascending (smallest first) and `-1` means descending (largest first).

- `priority: 1` — sorts priority 1 (Emergency) before 2 (Urgent) before 3 (Normal). Lower number = higher urgency = first in queue.
- `joinedAt: 1` — within the same priority level, the patient who joined earlier (smaller/earlier timestamp) comes first. This is FIFO — First In, First Out.

---

### Q33. What is the `includeAll` query parameter you added to the entries endpoint?

By default, `GET /api/queues/:queueId/entries` returns only WAITING entries. This is correct for the queue management and dashboard pages — they only need to see who is currently waiting.

But the history, performance, and optimization pages need to see all statuses (COMPLETED, NO_SHOW, CANCELLED) to calculate analytics. Rather than creating a separate endpoint, I added `?includeAll=true`:

```
GET /api/queues/:queueId/entries?includeAll=true
```

The backend reads `req.query.includeAll === 'true'` and adjusts the MongoDB filter accordingly. This is a backward-compatible change — existing callers without the parameter are unaffected.

---

### Q34. Why does the `QueueAnalyticsCards` component use `validAwtEntries` instead of all entries?

Actual waiting time (`actualWaitingTime`) is only set on the `WAITING → CALLED` transition. WAITING patients still have `actualWaitingTime: 0` (never been called yet). If I included them in the average, every waiting patient would pull the average down toward zero, giving a misleadingly low number.

I filter to entries that are neither WAITING nor IN_CONSULTATION before computing the average. This ensures the average reflects only patients who have actually been through the waiting experience.

---

### Q35. How would you add a new module to this project?

1. Define the MongoDB model in `src/models/`
2. Write a service in `src/services/` with all business logic
3. Write a controller in `src/controllers/` that calls the service and formats HTTP responses
4. Add a router in `src/routes/` and register it in `server.js`
5. On the frontend, add a TypeScript type file in `src/types/`, a service file in `src/services/`, a page in `src/pages/`, and register the route in `App.tsx`

This modularity means adding a new feature does not require touching existing code — only adding new files and one registration line each.
