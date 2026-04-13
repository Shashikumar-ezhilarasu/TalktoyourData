# DataLens: Talk to Your Data

> **Natural-language analytics for teams who can't wait on dashboards.**
> Upload any CSV or JSON dataset, ask questions in plain English, and get structured insights, charts, and session memory — powered by Google Gemini.

![DataLens Banner](https://github.com/user-attachments/assets/ad640c0d-f3e7-4862-b591-6a8fe760c60c)

---

## Table of Contents

1. [What Is DataLens?](#what-is-datalens)
2. [Why DataLens Exists](#why-datalens-exists)
3. [Core Principles](#core-principles)
4. [Feature Overview](#feature-overview)
5. [Use Cases](#use-cases)
6. [Architecture Overview](#architecture-overview)
7. [Data Pipeline Deep Dive](#data-pipeline-deep-dive)
8. [Query Intelligence Pipeline](#query-intelligence-pipeline)
9. [Tech Stack](#tech-stack)
10. [Project Structure](#project-structure)
11. [Prerequisites](#prerequisites)
12. [Environment Setup](#environment-setup)
13. [Running Locally](#running-locally)
14. [First Run Walkthrough](#first-run-walkthrough)
15. [API Reference](#api-reference)
16. [Authentication & Security](#authentication--security)
17. [Real-Time Query Flow](#real-time-query-flow)
18. [Queue & Worker System](#queue--worker-system)
19. [Dataset Ownership Model](#dataset-ownership-model)
20. [Error Handling & Fallback Modes](#error-handling--fallback-modes)
21. [Configuration Reference](#configuration-reference)
22. [Build & Production Deployment](#build--production-deployment)
23. [Troubleshooting Guide](#troubleshooting-guide)
24. [Roadmap](#roadmap)
25. [Contributing](#contributing)
26. [License](#license)

---

## What Is DataLens?

DataLens is a **full-stack AI analytics platform** that allows any user — regardless of technical background — to have a natural conversation with their data.

Instead of writing SQL queries, building pivot tables, or waiting for an analyst, a user uploads a dataset and types a question:

```
"Why did revenue drop in February?"
"Compare mobile vs web conversion this quarter."
"What are the top 5 products by return rate?"
```

DataLens translates these into structured analytical tasks, runs them against the uploaded data using a multi-step AI pipeline, and returns:

- A **narrative insight** written in plain language
- A **chart** (bar, line, pie, or scatter) rendered inline
- A **confidence score** so users know how reliable the answer is
- **Source references** showing exactly which columns and rows were used
- **Follow-up suggestions** to keep the analysis moving

Sessions are persistent. You can close the tab, come back tomorrow, and pick up exactly where you left off.

---

## Why DataLens Exists

Modern businesses are drowning in data but starving for answers. The tools available today force a painful choice:

| Tool | Problem |
|---|---|
| BI dashboards (Looker, Tableau) | Rigid. Require pre-built views. Slow to iterate. |
| SQL / Python | Requires technical skill most business users don't have. |
| Spreadsheets | Breaks at scale. Manual. Error-prone. |
| Generic LLM chat (ChatGPT) | No dataset context. Hallucination risk. No memory. |

DataLens fills the gap: it gives non-technical users the power of a trained analyst, available instantly, with auditability built in.

---

## Core Principles

DataLens is built around three pillars taken directly from the problem space:

### 1. Clarity
Answers are written for non-experts. Jargon is stripped. Summaries come first; detail layers are available on demand. Charts are chosen automatically based on the question type.

### 2. Trust
Every insight includes:
- The columns and rows referenced
- The confidence score for the response
- Consistent metric definitions (revenue always means the same thing within a session)
- PII scrubbing before any data reaches the model

### 3. Speed
Questions receive a `202 Accepted` immediately. Progress updates stream live over SSE. A typical query completes in 3–8 seconds. There is no "please wait" dead time.

---

## Feature Overview

| Feature | Details |
|---|---|
| **Dataset upload** | CSV and JSON, up to 50 MB |
| **Sample datasets** | Pre-loaded examples for immediate testing |
| **Natural language queries** | Full sentence questions, fragments, comparisons |
| **Real-time progress** | Server-Sent Events stream pipeline stage updates |
| **Insight cards** | Narrative + chart + confidence + source columns |
| **Chart types** | Bar, line, pie, scatter — auto-selected or overridable |
| **Session memory** | Follow-up questions reference earlier answers |
| **Multi-session support** | Multiple chat threads per dataset |
| **JWT authentication** | Register/login, protected routes, 7-day tokens |
| **Dataset ownership** | Datasets belong to the user who uploaded them |
| **Legacy claim** | Older unowned datasets auto-claimed on login |
| **PII scrubbing** | Email, phone, SSN patterns removed before ingestion |
| **Queue-based ingestion** | BullMQ + Redis with in-memory fallback |
| **Embedding pipeline** | Vector chunks stored for semantic retrieval |
| **Query cache** | Identical queries return cached results (TTL configurable) |
| **Rate limiting** | Global and per-query limits configurable via env |
| **Helmet hardening** | Security headers on all responses |

---

## Use Cases

### 1. Self-Serve Product Analytics

**Who:** Product managers, growth teams, startup founders

**Scenario:** You export a week of product telemetry from Mixpanel or Amplitude as a CSV. Instead of pulling in a data analyst, you upload it and ask:

```
"Compare mobile vs web conversion rate this week."
"Show the drop-off funnel for the onboarding flow."
"Which features had the most engagement on day 3?"
"Show anomalies in daily active users over the last 14 days."
```

**What DataLens returns:**
- A bar chart comparing conversion by platform
- A narrative: "Web conversion is 4.2% vs mobile 2.1%. The gap widened on Tuesday after the iOS push notification outage."
- Source: columns `platform`, `session_started`, `converted`

---

### 2. Sales and Revenue Insights

**Who:** Sales ops, revenue leaders, finance teams

**Scenario:** You export your CRM pipeline as a CSV at the end of the quarter. No BI tool configured yet. You need answers in the next 20 minutes for a board call.

```
"Break down revenue by region for Q1."
"Compare Q1 vs Q2 pipeline growth."
"Which rep closed the most deals in March?"
"What is the average deal size by industry vertical?"
"Why did revenue drop in February?"
```

**What DataLens returns:**
- Revenue decomposition by region as a pie chart
- A narrative: "North region accounts for 43% of Q1 revenue. South dropped 22% driven by reduced ad spend in weeks 5–7."
- Follow-up: "Do you want to filter by deal size above $50k?"

---

### 3. Operations Monitoring

**Who:** Engineering leads, DevOps, support operations

**Scenario:** You export service logs or support ticket data as JSON. You want to understand failure patterns without writing regex queries.

```
"Find unusual spikes in average processing time."
"Summarize the top 5 failure contributors this week."
"Compare SLA breach rate between APAC and US regions."
"Show the trend in ticket resolution time over 30 days."
```

**What DataLens returns:**
- A line chart of processing time with anomaly markers
- A narrative: "Processing time spiked 3x on Thursday at 14:00 UTC. 78% of spikes originated from the `batch_export` job type."

---

### 4. Executive Reporting

**Who:** C-suite, department heads, investors

**Scenario:** It is Monday morning. You want a plain-English weekly summary before the all-hands meeting.

```
"Give me a weekly summary of customer metrics."
"What changed the most this month vs last month?"
"Show the key signals I should be aware of this week."
```

**What DataLens returns:**
- A bullet-point narrative summary focused on material changes
- Chart of the most significant trend
- Example: "Signups grew 5% WoW. Churn held flat. Average handle time improved by 12 seconds. No anomalies detected in revenue."

---

### 5. HR and People Analytics

**Who:** HR business partners, people ops teams

**Scenario:** You export headcount and attrition data as a CSV.

```
"What is the attrition rate by department?"
"Compare headcount growth this year vs last year."
"Which teams have the highest average tenure?"
"Show the distribution of performance ratings."
```

---

### 6. Supply Chain and Inventory

**Who:** Operations, procurement, logistics teams

**Scenario:** You export inventory data from your ERP.

```
"Which SKUs are at risk of stockout in the next 30 days?"
"Compare lead time by supplier."
"What is the fill rate trend over the last 6 months?"
"Show the top 10 products by carrying cost."
```

---

### 7. Marketing Campaign Analysis

**Who:** Digital marketers, performance teams, agencies

**Scenario:** You pull a campaign performance CSV from Google Ads or Meta.

```
"Which campaigns had the best ROAS last month?"
"Compare CTR and CPC across all ad groups."
"Show the spend vs conversion trend over 8 weeks."
"Which audience segment had the lowest cost per acquisition?"
```

---

## Architecture Overview

```mermaid
flowchart LR
  UI[Next.js Frontend] --> API[Express API]
  API --> AUTH[JWT Auth Middleware]
  API --> MONGO[(MongoDB Atlas)]
  API --> SSE[Server-Sent Events]
  API --> REDIS[(Redis)]
  REDIS --> BULL[BullMQ Queues]
  BULL --> INGEST[Ingestion Worker]
  BULL --> EMBED[Embedding Worker]
  INGEST --> MONGO
  EMBED --> MONGO
  API --> GEMINI[Google Gemini Models]
  GEMINI --> FLASH[gemini-2.5-flash\nQuery + Insights]
  GEMINI --> EMBED2[text-embedding-004\nSemantic Chunks]
```

### Component Responsibilities

| Component | Responsibility |
|---|---|
| **Next.js Frontend** | Auth UI, dataset management, chat interface, chart rendering, SSE client |
| **Express API** | Route handling, auth middleware, job dispatch, query orchestration |
| **MongoDB** | Users, datasets, query history, chat sessions, embedding chunks |
| **Redis + BullMQ** | Job queues for ingestion and embedding; rate limiting for embedding API |
| **Ingestion Worker** | Parse → scrub PII → infer types → profile stats → chunk rows |
| **Embedding Worker** | Generate embeddings per chunk via Gemini → store in Mongo |
| **Gemini Flash** | Natural language query understanding, insight generation, chart recommendation |
| **Gemini Embedding** | Vector representation of dataset schema and row chunks |
| **SSE Stream** | Real-time pipeline event delivery to the browser without WebSocket complexity |

---

## Data Pipeline Deep Dive

### Stage 1: Upload and Job Dispatch

```
POST /api/datasets/upload
  → Validate file type and size
  → Create Dataset document with processingStatus: "pending"
  → Push job to "ingestion" queue (or run inline if Redis unavailable)
  → Return dataset ID immediately
```

### Stage 2: Ingestion Worker

The ingestion worker runs with a concurrency of 3 and processes each job through the following stages:

```
1. PARSE
   - Papa Parse for CSV (handles encoding, delimiters, quoted fields)
   - JSON.parse with streaming for large files
   - Detect header row
   - Emit: row count, column names

2. PII SCRUB
   - Regex scan across all string columns
   - Patterns: email, phone (E.164 + local), SSN, IP address
   - Replace matches with [REDACTED_{TYPE}]
   - Log scrub summary (count of replacements per column)

3. TYPE INFERENCE
   - Per-column analysis: numeric, date, boolean, categorical, freetext
   - Date format detection (ISO, US, EU variants)
   - Numeric precision inference (integer vs float)
   - Cardinality measurement for categoricals

4. STATISTICAL PROFILING
   - Numeric: min, max, mean, median, stddev, null%, outlier count
   - Categorical: top-10 values by frequency, unique count, null%
   - Date: min date, max date, gap detection
   - Store profile in Dataset.columnProfiles

5. CHUNK AND PERSIST
   - Split rows into chunks of ~500 rows
   - Each chunk stored as a DatasetChunk document
   - Chunks reference parent Dataset by ID

6. TRIGGER EMBEDDING
   - Push job to "embedding" queue per chunk
   - Or run inline if Redis unavailable

7. MARK READY
   - Dataset.processingStatus = "ready"
   - Emit "dataset:ready" event for SSE clients
```

### Stage 3: Embedding Worker

```
Concurrency: 2
Rate limiter: configured per Gemini API limits

For each chunk:
  1. Serialize chunk rows to a text representation
  2. Include column names and types as context prefix
  3. Call text-embedding-004 via Gemini SDK
  4. Store embedding vector in DatasetChunk.embedding
  5. Mark chunk as embedded
```

---

## Query Intelligence Pipeline

When a user submits a question, the following pipeline executes:

```
POST /api/query
  → Validate session and dataset ownership
  → Check query cache (TTL configurable)
  → Return 202 + queryId
  → Open SSE channel at /api/stream/:queryId

Pipeline stages (with SSE events):

1. INTENT CLASSIFICATION
   Event: pipeline_update { stage: "intent", status: "running" }
   - Classify query: comparison | decomposition | trend | summary | anomaly | lookup
   - Extract entities: time ranges, dimensions, metrics, filters
   - Resolve ambiguities using session history

2. SCHEMA MAPPING
   Event: pipeline_update { stage: "schema", status: "running" }
   - Map extracted entities to actual column names
   - Handle synonyms ("revenue" → "total_amount", "signups" → "new_users")
   - Validate column existence and type compatibility

3. CHUNK RETRIEVAL
   Event: pipeline_update { stage: "retrieval", status: "running" }
   - Embed the question using text-embedding-004
   - Cosine similarity search across stored chunk embeddings
   - Retrieve top-k most relevant chunks

4. INSIGHT GENERATION
   Event: pipeline_update { stage: "generation", status: "running" }
   - Build prompt with: question + column profiles + retrieved chunks + session history
   - Call gemini-2.5-flash
   - Request structured JSON: { narrative, chartType, chartData, confidence, sourceColumns }

5. CHART SELECTION
   - comparison → bar chart
   - trend over time → line chart
   - decomposition / share → pie chart
   - correlation → scatter chart
   - summary → bar or table

6. RESPONSE ASSEMBLY
   Event: insight_ready { queryId, insight, chart, confidence, sourceColumns }
   - Store QueryResult in MongoDB
   - Append message to ChatSession
   - Cache result

7. STREAM CLOSE
   Event: stream_end
   - Client closes SSE connection
```

---

## Tech Stack

### Frontend

| Library | Version | Purpose |
|---|---|---|
| Next.js | 14 | App framework, routing, SSR |
| React | 18 | Component model |
| Tailwind CSS | 3 | Utility-first styling |
| Framer Motion | latest | Animations and transitions |
| Recharts | latest | Chart rendering |
| Zustand | latest | Client state management |

### Backend

| Library | Version | Purpose |
|---|---|---|
| Express | 5 | HTTP server and routing |
| TypeScript | 5 | Type safety |
| Mongoose | 8 | MongoDB ODM |
| BullMQ | latest | Queue management |
| ioredis | latest | Redis client |
| Google Generative AI SDK | latest | Gemini models |
| jsonwebtoken | latest | JWT issuance and verification |
| bcryptjs | latest | Password hashing |
| Winston | latest | Structured logging |
| Helmet | latest | HTTP security headers |
| Papa Parse | latest | CSV parsing |
| express-rate-limit | latest | Rate limiting middleware |

---

## Project Structure

```
datalens/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts               # MongoDB connection
│   │   │   ├── redis.ts            # Redis + BullMQ setup, fallback detection
│   │   │   └── gemini.ts           # Gemini SDK client, model config
│   │   │
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts  # register, login, me
│   │   │   ├── dataset.controller.ts # upload, list, status, claim-legacy
│   │   │   ├── query.controller.ts # submit query, cache lookup
│   │   │   └── chat.controller.ts  # sessions CRUD, message history
│   │   │
│   │   ├── models/
│   │   │   ├── user.model.ts       # User schema (hashed password, JWT)
│   │   │   ├── dataset.model.ts    # Dataset metadata + column profiles
│   │   │   ├── datasetChunk.model.ts # Row chunks + embeddings
│   │   │   ├── query.model.ts      # Query results + cache
│   │   │   └── chatSession.model.ts # Session + message thread
│   │   │
│   │   ├── pipeline/
│   │   │   ├── ingestion/
│   │   │   │   ├── parser.ts       # CSV/JSON parsing
│   │   │   │   ├── piiScrubber.ts  # PII detection and redaction
│   │   │   │   ├── typeInferrer.ts # Column type inference
│   │   │   │   └── profiler.ts     # Statistical profiling
│   │   │   │
│   │   │   └── query/
│   │   │       ├── intentClassifier.ts  # Query intent classification
│   │   │       ├── schemaMapper.ts      # Entity to column mapping
│   │   │       ├── chunkRetriever.ts    # Embedding similarity search
│   │   │       ├── insightGenerator.ts  # Gemini prompt + response parsing
│   │   │       └── chartSelector.ts     # Chart type selection logic
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── dataset.routes.ts
│   │   │   ├── query.routes.ts
│   │   │   ├── chat.routes.ts
│   │   │   └── stream.routes.ts    # SSE endpoint
│   │   │
│   │   ├── workers/
│   │   │   ├── ingestion.worker.ts # BullMQ worker: ingestion queue
│   │   │   └── embedding.worker.ts # BullMQ worker: embedding queue
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts  # JWT verification
│   │   │   └── rateLimit.ts        # Rate limit configurations
│   │   │
│   │   └── app.ts                  # Express app setup
│   │
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                        # (not committed)
│
├── frontend/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── dashboard/
│   │   │   ├── page.tsx            # Dataset list
│   │   │   └── [datasetId]/
│   │   │       └── page.tsx        # Dataset chat + chart view
│   │   └── layout.tsx
│   │
│   ├── components/
│   │   ├── ChatPanel/              # Message thread, input, session switcher
│   │   ├── InsightCard/            # Narrative + chart + confidence display
│   │   ├── DatasetUpload/          # Drag-drop upload + status poll
│   │   ├── PipelineProgress/       # SSE-driven stage indicators
│   │   └── ChartRenderer/          # Recharts wrapper for all chart types
│   │
│   ├── lib/
│   │   ├── api.ts                  # Typed API client
│   │   ├── sseClient.ts            # SSE connection manager
│   │   └── store.ts                # Zustand store
│   │
│   ├── package.json
│   └── .env.local                  # (not committed)
│
└── README.md
```

---

## Prerequisites

| Requirement | Minimum Version | Notes |
|---|---|---|
| Node.js | 20.x | Required for both frontend and backend |
| npm | 9.x | Comes with Node 20 |
| MongoDB | Atlas free tier | Or any MongoDB-compatible URI |
| Google Gemini API key | — | Free tier sufficient for development |
| Redis | 7.x | Recommended; app runs without it in fallback mode |

### Getting a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click **Create API Key**
3. Copy the key into your `backend/.env` as `GEMINI_API_KEY`

The free tier provides:
- 15 requests/minute on Gemini 2.5 Flash
- 1500 requests/day
- Sufficient for development and demo

### Getting a MongoDB URI

1. Create a free cluster at [MongoDB Atlas](https://cloud.mongodb.com)
2. Under **Database Access**, create a user with read/write permissions
3. Under **Network Access**, allow access from your IP (or `0.0.0.0/0` for dev)
4. Click **Connect → Drivers** and copy the connection string
5. Replace `<password>` with your actual password

---

## Environment Setup

### Backend: `backend/.env`

```env
# ── Required ──────────────────────────────────────────────
GEMINI_API_KEY=your_gemini_api_key_here
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/datalens
JWT_SECRET=a_long_random_secret_at_least_32_chars

# ── Server ────────────────────────────────────────────────
PORT=4000
NODE_ENV=development

# ── Auth ──────────────────────────────────────────────────
JWT_EXPIRES_IN=7d

# ── Redis / Queue ─────────────────────────────────────────
REDIS_URL=redis://localhost:6379
# Leave blank to run in in-memory fallback mode

# ── Gemini Models ─────────────────────────────────────────
GEMINI_EMBEDDING_MODEL=text-embedding-004
GEMINI_FLASH_MODEL=gemini-2.5-flash
GEMINI_PRO_MODEL=gemini-2.5-flash
# Note: "embedding-001" is auto-remapped to "text-embedding-004"

# ── File Limits ───────────────────────────────────────────
MAX_FILE_SIZE_MB=50

# ── Query Behavior ────────────────────────────────────────
QUERY_CACHE_TTL_SECONDS=3600
ASYNC_THRESHOLD_ROWS=5000
MAX_TOKENS_PER_QUERY=1500

# ── Rate Limits ───────────────────────────────────────────
RATE_LIMIT_GLOBAL=100        # requests per 15 min window per IP
RATE_LIMIT_QUERY=30          # query submissions per 15 min window per user

# ── Optional: DNS override for Atlas connectivity ─────────
MONGODB_DNS_SERVERS=8.8.8.8,1.1.1.1
```

### Frontend: `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

---

## Running Locally

### Step 1: Clone the repository

```bash
git clone https://github.com/your-org/datalens.git
cd datalens
```

### Step 2: Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Step 3: Configure environment files

```bash
# Copy the examples and fill in your values
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

### Step 4: Start Redis (recommended)

**Option A — Local install:**
```bash
redis-server
```

**Option B — Docker (no install required):**
```bash
docker run --name datalens-redis -p 6379:6379 -d redis:7
```

**Option C — Skip Redis (fallback mode):**  
Leave `REDIS_URL` blank. DataLens will process ingestion inline. Suitable for demos and development.

### Step 5: Start the backend

```bash
cd backend
npm run dev
```

Healthy startup output:
```
[INFO] MongoDB connected: cluster0.mongodb.net
[INFO] Redis connected: redis://localhost:6379
[INFO] Ingestion worker started (concurrency: 3)
[INFO] Embedding worker started (concurrency: 2)
[INFO] Server running on port 4000
[INFO] Health: http://localhost:4000/api/health
```

If Redis is not available:
```
[WARN] Redis unavailable. Running in in-memory fallback mode.
[INFO] Ingestion will run synchronously per upload.
```

### Step 6: Start the frontend

```bash
cd frontend
npm run dev
```

| URL | Description |
|---|---|
| http://localhost:3000 | DataLens frontend |
| http://localhost:4000/api/health | Backend health check |

### Step 7: Running Tests

To run the unit and integration tests for both the backend and frontend:

```bash
# Run backend tests
cd backend
npm install -D vitest @types/vitest
npm test

# Run frontend tests
cd ../frontend
npm install -D vitest @types/vitest
npm test
```

---

## First Run Walkthrough

### 1. Create an account
Navigate to http://localhost:3000 and click **Register**. Enter email and password. You will be issued a JWT and redirected to the dashboard.

### 2. Upload a dataset
Click **Upload Dataset** and drag in a CSV or JSON file (max 50 MB). Alternatively, click **Load Sample Dataset** to use a pre-built example (sales data, product telemetry, or HR records).

### 3. Wait for processing
A status badge shows the pipeline stage: `Parsing → Profiling → Embedding → Ready`. This typically takes 5–30 seconds depending on file size and Redis availability.

### 4. Open the dataset
Click the dataset card to enter the chat view. The left panel shows dataset metadata and column profiles. The right panel is the chat interface.

### 5. Ask a question
Type any natural language question into the input and press Enter. Examples:

```
Show me the top 5 categories by total revenue.
Compare this week vs last week for conversion rate.
Are there any anomalies in daily order volume?
Give me a summary of key metrics.
```

### 6. Watch real-time progress
A progress bar shows the pipeline stages in real time: Intent → Schema → Retrieval → Generation.

### 7. Review the insight card
The response contains:
- A narrative paragraph in plain English
- A chart rendered automatically based on question type
- A confidence percentage
- The source columns used to generate the answer

### 8. Ask follow-up questions
DataLens maintains session memory. Follow-up questions can reference earlier answers:
```
Which region had the highest drop?
Break that down by product category.
Show this as a line chart instead.
```

### 9. Manage sessions
Use the session sidebar to create, rename, or delete chat threads. Each dataset can have multiple named sessions — useful for separating analysis by project, date, or stakeholder.

---

## API Reference

### Base URL
```
http://localhost:4000/api
```

All protected endpoints require:
```
Authorization: Bearer <jwt_token>
```

---

### Auth

#### `POST /auth/register`
Create a new user account.

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "token": "eyJhbGci...",
  "user": { "id": "...", "email": "user@example.com" }
}
```

---

#### `POST /auth/login`
Authenticate and receive a JWT.

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

---

#### `GET /auth/me`
Return the authenticated user profile.

**Response:**
```json
{
  "id": "64abc123",
  "email": "user@example.com",
  "createdAt": "2024-01-15T10:00:00Z"
}
```

---

### Datasets

#### `POST /datasets/upload`
Upload a CSV or JSON file. Multipart form data.

**Form fields:**
- `file` — the dataset file (CSV or JSON)
- `name` — optional display name

**Response:**
```json
{
  "datasetId": "64def456",
  "processingStatus": "pending",
  "message": "Ingestion job queued."
}
```

---

#### `GET /datasets`
List all datasets owned by the authenticated user.

**Response:**
```json
[
  {
    "id": "64def456",
    "name": "sales_q1.csv",
    "rowCount": 12400,
    "columnCount": 18,
    "processingStatus": "ready",
    "createdAt": "2024-01-15T10:00:00Z"
  }
]
```

---

#### `GET /datasets/sample`
Return available sample datasets.

---

#### `GET /datasets/:id`
Return full dataset metadata including column profiles.

**Response includes:**
```json
{
  "id": "64def456",
  "name": "sales_q1.csv",
  "rowCount": 12400,
  "columnProfiles": [
    {
      "name": "revenue",
      "type": "numeric",
      "min": 0,
      "max": 98540,
      "mean": 4231,
      "nullPercent": 0.2
    }
  ]
}
```

---

#### `GET /datasets/:id/status`
Poll current processing status and stage.

**Response:**
```json
{
  "processingStatus": "embedding",
  "stage": "Generating chunk embeddings (chunk 3 of 12)",
  "progress": 25
}
```

---

#### `POST /datasets/claim-legacy`
Claim all datasets that have no owner and assign them to the authenticated user. Called automatically by the frontend after login.

---

### Query

#### `POST /query`
Submit a natural language question against a dataset.

**Request body:**
```json
{
  "datasetId": "64def456",
  "sessionId": "64ghi789",
  "question": "Compare revenue by region for Q1 vs Q2."
}
```

**Response:**
```json
{
  "queryId": "64jkl012",
  "status": "accepted",
  "streamUrl": "/api/stream/64jkl012"
}
```

---

#### `GET /stream/:queryId`
Server-Sent Events stream for query progress and result.

**Event types:**

| Event | Payload |
|---|---|
| `pipeline_update` | `{ stage, status, message }` |
| `insight_ready` | `{ narrative, chartType, chartData, confidence, sourceColumns }` |
| `error` | `{ message, code }` |
| `stream_end` | `{}` |

**Example SSE stream:**
```
data: {"event":"pipeline_update","stage":"intent","status":"running"}

data: {"event":"pipeline_update","stage":"generation","status":"running"}

data: {"event":"insight_ready","narrative":"Revenue in Q2 grew 8% vs Q1, led by North region (+14%)...","chartType":"bar","confidence":0.87,"sourceColumns":["region","quarter","revenue"]}

data: {"event":"stream_end"}
```

---

### Chat Sessions

#### `POST /chat/sessions/ensure`
Ensure a default session exists for a dataset. Creates one if none exists.

**Request body:**
```json
{ "datasetId": "64def456" }
```

---

#### `GET /chat/sessions`
List all sessions for the authenticated user (optionally filtered by `datasetId` query param).

---

#### `GET /chat/sessions/:sessionId/messages`
Return all messages in a session, ordered chronologically.

**Response:**
```json
[
  {
    "role": "user",
    "content": "Compare revenue by region.",
    "timestamp": "2024-01-15T10:05:00Z"
  },
  {
    "role": "assistant",
    "content": "North leads with 43% of Q1 revenue...",
    "chart": { "type": "pie", "data": [...] },
    "confidence": 0.91,
    "timestamp": "2024-01-15T10:05:04Z"
  }
]
```

---

#### `PATCH /chat/sessions/:sessionId`
Rename a session.

**Request body:**
```json
{ "name": "Q1 Revenue Deep Dive" }
```

---

#### `DELETE /chat/sessions/:sessionId`
Delete a session and all its messages.

---

## Authentication & Security

### JWT Flow

```
Register/Login → bcryptjs password hash → JWT issued (7d expiry)
Request → Authorization: Bearer <token>
Middleware → Verify signature → Attach user to req.user
Protected controller → Use req.user.id for ownership checks
```

### Password Storage
Passwords are hashed with bcryptjs (cost factor 12) before storage. Plaintext passwords are never stored or logged.

### Dataset Ownership
Every dataset is linked to the `userId` of the uploader. Queries, sessions, and stream endpoints verify that `dataset.userId === req.user.id`. A user cannot access, query, or delete another user's dataset.

### Security Headers (Helmet)
All responses include:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security` (production)
- `Content-Security-Policy` (configurable)

### PII Protection
Before any data reaches a Gemini model, the ingestion pipeline runs a PII scrubber across all string columns. Detected patterns:

| Type | Pattern |
|---|---|
| Email | RFC 5322-compatible regex |
| Phone | E.164, US local, international formats |
| SSN | `\d{3}-\d{2}-\d{4}` and variants |
| IP Address | IPv4 and IPv6 |

Scrubbed values are replaced with `[REDACTED_EMAIL]`, `[REDACTED_PHONE]`, etc. The scrub summary (column name + count) is logged but redacted values are never logged.

---

## Real-Time Query Flow

```mermaid
sequenceDiagram
  participant U as User
  participant F as Frontend
  participant B as Backend API
  participant O as Query Orchestrator
  participant G as Gemini
  participant S as SSE Stream

  U->>F: Type question → Submit
  F->>B: POST /api/query
  B-->>F: 202 Accepted + queryId
  F->>S: Open EventSource /api/stream/:queryId
  B->>O: Execute pipeline async

  O->>S: pipeline_update: intent running
  O->>G: Classify intent + extract entities
  G-->>O: Intent: comparison | Entities: {region, revenue, Q1, Q2}

  O->>S: pipeline_update: schema running
  O->>O: Map entities to column names

  O->>S: pipeline_update: retrieval running
  O->>G: Embed question
  O->>O: Cosine similarity → top chunks

  O->>S: pipeline_update: generation running
  O->>G: Prompt with schema + chunks + history
  G-->>O: Structured JSON insight

  O->>S: insight_ready { narrative, chart, confidence }
  O->>S: stream_end
  S-->>F: All events delivered
  F-->>U: Render insight card + chart
```

### SSE Connection Lifecycle
- The frontend opens an `EventSource` immediately after receiving the `queryId`
- The connection stays open until `stream_end` is received or a 60-second timeout fires
- On timeout, the frontend retries the status poll via `GET /datasets/:id/status`
- The backend cleans up the SSE connection and emitter after `stream_end`

---

## Queue & Worker System

### Queues

| Queue | Concurrency | Purpose |
|---|---|---|
| `ingestion` | 3 | Parse, scrub, profile, chunk new datasets |
| `embedding` | 2 | Generate and store vector embeddings per chunk |

### Job Retry Policy
- Max attempts: 3
- Backoff: exponential (1s → 2s → 4s)
- Failed jobs are moved to the dead letter queue with full error context
- Dead letter queue is inspectable via Redis CLI or BullMQ Dashboard

### Rate Limiting for Embedding
The embedding worker uses a BullMQ rate limiter to stay within Gemini API quotas:
- Max: 10 embedding requests per second
- Configurable via `EMBEDDING_RATE_LIMIT_MAX` env variable

### Fallback Mode (No Redis)

When Redis is unavailable:
1. Ingestion runs synchronously in the same process as the API server
2. Embedding runs inline after ingestion
3. No queue UI or job retry is available
4. Suitable for demos, development, and small deployments

To verify mode:
```bash
curl http://localhost:4000/api/health
# Response includes: { "queue": "in-memory" } or { "queue": "bullmq" }
```

---

## Dataset Ownership Model

DataLens enforces strict dataset ownership:

| Operation | Who Can Perform |
|---|---|
| Upload | Any authenticated user |
| List | Only the owner |
| View / Query | Only the owner |
| Delete | Only the owner |
| Stream results | Only the owner |

### Legacy Data Migration

If you had a DataLens deployment before ownership was introduced, your existing datasets have no `userId`. The frontend handles this transparently:

1. After login, the frontend calls `POST /api/datasets/claim-legacy`
2. The backend finds all datasets where `userId` is null
3. Those datasets are assigned to the currently authenticated user
4. They appear in the user's dataset list immediately

This migration is idempotent — calling it multiple times has no effect after the first run.

---

## Error Handling & Fallback Modes

### Query Errors

| Scenario | Behavior |
|---|---|
| Gemini API timeout | Retry once; return partial insight with low confidence |
| No relevant chunks found | Return a "not enough data" narrative with suggestions |
| Ambiguous question | Return clarification prompt via SSE |
| Dataset not ready | Return 409 with current processing status |
| Cache hit | Return 200 with cached insight (no pipeline execution) |

### SSE Error Events

```json
{ "event": "error", "message": "Gemini rate limit exceeded.", "code": "RATE_LIMIT" }
{ "event": "error", "message": "Dataset not yet ready.", "code": "DATASET_NOT_READY" }
{ "event": "error", "message": "Query pipeline failed.", "code": "PIPELINE_ERROR" }
```

### Frontend Safeguards
- SSE connection auto-closes after 60 seconds (timeout)
- Status is re-polled via REST if SSE fails to connect
- Zustand store marks the query as `error` state so UI shows a retry button
- Toast notifications surface backend error messages

---

## Configuration Reference

| Variable | Default | Description |
|---|---|---|
| `PORT` | `4000` | Express server port |
| `NODE_ENV` | `development` | `development` or `production` |
| `MONGODB_URI` | — | MongoDB connection string |
| `JWT_SECRET` | — | JWT signing secret (min 32 chars recommended) |
| `JWT_EXPIRES_IN` | `7d` | JWT expiry duration |
| `REDIS_URL` | — | Redis connection URL (blank = fallback mode) |
| `GEMINI_API_KEY` | — | Google Gemini API key |
| `GEMINI_EMBEDDING_MODEL` | `text-embedding-004` | Embedding model name |
| `GEMINI_FLASH_MODEL` | `gemini-2.5-flash` | Primary query model |
| `GEMINI_PRO_MODEL` | `gemini-2.5-flash` | Alias for pro model (same default) |
| `MAX_FILE_SIZE_MB` | `50` | Upload size limit in MB |
| `QUERY_CACHE_TTL_SECONDS` | `3600` | Cache lifetime for identical queries |
| `ASYNC_THRESHOLD_ROWS` | `5000` | Row count above which async processing is forced |
| `MAX_TOKENS_PER_QUERY` | `1500` | Max tokens in Gemini query prompt |
| `RATE_LIMIT_GLOBAL` | `100` | Requests per IP per 15-minute window |
| `RATE_LIMIT_QUERY` | `30` | Query submissions per user per 15-minute window |
| `MONGODB_DNS_SERVERS` | — | Optional: override DNS for Atlas connectivity |

---

## Build & Production Deployment

### Backend

```bash
cd backend
npm run build    # Compiles TypeScript to dist/
npm start        # Runs dist/app.js
```

### Frontend

```bash
cd frontend
npm run build    # Next.js production build
npm start        # Starts production server on port 3000
```

### Recommended Production Setup

```
┌─────────────────────────────────────────────┐
│  CDN / Load Balancer                        │
│  (Cloudflare, AWS CloudFront, etc.)         │
└──────────────┬──────────────────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
    ▼                     ▼
Frontend               Backend
(Vercel / Railway)     (Railway / Render / EC2)
Next.js                Express + Workers
                            │
               ┌────────────┼────────────┐
               │            │            │
               ▼            ▼            ▼
        MongoDB Atlas    Redis       Gemini API
        (managed)      (Upstash /   (Google AI)
                        Railway)
```

### Environment Management in Production
- Use a secrets manager (Railway Env, Vercel Environment Variables, AWS Secrets Manager)
- Never commit `.env` files
- Rotate `JWT_SECRET` on a schedule and invalidate active tokens accordingly
- Set `NODE_ENV=production` to enable security headers and disable verbose logging

### Monitoring Recommendations
- **Uptime:** Better Uptime or UptimeRobot on `/api/health`
- **Logs:** Ship Winston logs to Datadog, Logtail, or CloudWatch
- **Queue:** BullMQ Dashboard (connect to your Redis instance)
- **Errors:** Sentry SDK on both frontend and backend

---

## Troubleshooting Guide

### "My dataset is not showing after upload"
1. Confirm you are logged into the correct account
2. Check that `NEXT_PUBLIC_API_URL` in frontend `.env.local` points to the running backend
3. Verify the backend is connected to the same MongoDB URI used during upload
4. Open browser DevTools → Network → check if the legacy claim request to `POST /api/datasets/claim-legacy` succeeded (should return 200)
5. Check backend logs for ingestion worker errors

### "Pipeline stuck on processing / never reaches Ready"
1. Check backend logs for worker errors
2. If using BullMQ, verify Redis is running: `redis-cli ping` should return `PONG`
3. Check if the Gemini embedding model is responding: `curl https://generativelanguage.googleapis.com/v1/models`
4. Frontend has a 60-second SSE timeout with automatic retry; wait for the retry before concluding it is stuck
5. Retry the upload with a smaller file to isolate the issue

### "Query returns very low confidence or 'not enough data'"
- Ensure the dataset processing status is `ready` before querying
- Ask more specific questions that reference column names visible in the dataset profile panel
- Rephrase to avoid ambiguous time references ("last month" is relative; try "January 2024" instead)

### "Redis unavailable" warning on startup
- Expected in development if Redis is not running
- App will work in fallback mode; ingestion is synchronous
- To enable queue mode, start Redis (`redis-server` or Docker) and restart the backend

### "Gemini API errors / model not found"
- Verify `GEMINI_API_KEY` is set and valid in `backend/.env`
- Keep `GEMINI_EMBEDDING_MODEL=text-embedding-004` (not `embedding-001`)
- Check your Gemini API quota at [AI Studio](https://aistudio.google.com)
- Free tier limit: 1500 requests/day and 15 requests/minute

### "MongoDB connection failing"
- Verify the URI in `backend/.env` is correct and the password has no special characters that need URL-encoding
- In MongoDB Atlas: confirm your current IP is in the Network Access allowlist
- If behind a VPN or corporate network, try `MONGODB_DNS_SERVERS=8.8.8.8,1.1.1.1`

### "CORS errors in browser"
- Confirm the frontend is calling `http://localhost:4000/api` (not 3000)
- In production, set the backend `CORS_ORIGIN` env variable to your frontend domain
- Check that `NEXT_PUBLIC_API_URL` does not have a trailing slash

---

## Roadmap

### Near Term
- [ ] Multi-dataset join queries ("combine the sales CSV with the customer CSV")
- [ ] Export insight cards as PDF or PNG
- [ ] Scheduled summaries (daily digest via email)
- [ ] Pinned insights on dataset dashboard

### Medium Term
- [ ] Google Sheets and Airtable connectors (no upload needed)
- [ ] Metric dictionary: define "revenue" once, use it consistently everywhere
- [ ] Role-based access: share a dataset with teammates (read-only)
- [ ] Webhook callbacks for async query completion

### Long Term
- [ ] SQL passthrough mode for technically advanced users
- [ ] Embedded DataLens widget (iFrame + API key) for third-party dashboards
- [ ] Streaming chart updates (live data refresh)
- [ ] On-premise deployment package with Docker Compose

---

## Contributing

Pull requests are welcome. For significant changes, please open an issue first to discuss the approach.

### Development workflow

```bash
# Fork and clone
git clone https://github.com/your-fork/datalens.git

# Create a feature branch
git checkout -b feature/my-new-thing

# Make changes, then run linting and type checks
cd backend && npm run lint && npm run typecheck
cd frontend && npm run lint

# Commit with a descriptive message
git commit -m "feat: add multi-dataset join support"

# Push and open a PR
git push origin feature/my-new-thing
```

### Coding standards
- TypeScript strict mode enabled; no `any` without explicit comment
- Winston for all server-side logging (no `console.log` in production paths)
- All new API routes must have input validation
- SSE events must include an `event` field for client-side routing

---

## License

MIT — see [LICENSE](./LICENSE) for full text.

---

*Built for the "Talk to Your Data" hackathon track. DataLens is designed to be demo-ready, production-minded, and extensible. Contributions, feedback, and forks are welcome.*
