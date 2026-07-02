# Construction Intelligence Platform — Product Architecture

---

## 1. Architecture Philosophy

- **Domain-Driven Design** — each bounded context owns its data and logic
- **Event-Driven** — contexts communicate through domain events, not direct calls
- **Multi-Tenant SaaS** — Organisation is the tenant root; all data is scoped to it
- **Monorepo, Microservice-Ready** — single repo today, split by context boundary later
- **Offline-First Mobile** — field users work without connectivity; sync on reconnect
- **Quantity-Aware Core** — every progress entry automatically flows through
  quantity calculation → inventory → cost → forecast

---

## 2. Bounded Contexts

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PLATFORM BOUNDARY                            │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  Identity &  │  │   Project    │  │    BOQ & Estimation      │  │
│  │   Access     │  │  Management  │  │                          │  │
│  │   (IAM)      │  │              │  │                          │  │
│  └──────┬───────┘  └──────┬───────┘  └────────────┬─────────────┘  │
│         │                 │                        │                │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌────────────▼─────────────┐  │
│  │   Schedule   │  │    Site      │  │   Materials & Inventory  │  │
│  │  Management  │  │  Operations  │  │                          │  │
│  └──────┬───────┘  └──────┬───────┘  └────────────┬─────────────┘  │
│         │                 │                        │                │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌────────────▼─────────────┐  │
│  │  Forecasting │  │   Document   │  │       AI Services        │  │
│  │  & Analytics │  │  Management  │  │                          │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

| # | Context | Responsibility |
|---|---|---|
| 1 | Identity & Access (IAM) | Organisations, users, roles, permissions, auth tokens |
| 2 | Project Management | Projects, sites, milestones, WBS, project settings |
| 3 | BOQ & Estimation | Bill of Quantities, BOM templates, quantity take-off |
| 4 | Schedule Management | Activity plan, Gantt, baseline, critical path |
| 5 | Site Operations | Daily reports, workforce, equipment logs, photos |
| 6 | Materials & Inventory | Material catalogue, site stock, GRN, purchase orders |
| 7 | Forecasting & Analytics | Delay, cost, labour, equipment, material forecasts |
| 8 | Document Management | Drawings, RFIs, submittals, revisions |
| 9 | AI Services | Vision, voice, drone, chat assistant, ML jobs |

---

## 3. Aggregate Roots & Key Entities

### 3.1 Identity & Access

```
Organisation (tenant root)
  ├── id, name, plan, timezone, logo
  ├── → OrganisationMember[]
  └── → Project[] (via Project context)

User
  ├── id, email, displayName, avatarUrl
  ├── → OrganisationMembership { role, status }
  └── → ProjectMembership { role, permissions[] }

Role
  ├── id, name, scope (global | project | site)
  └── → Permission[]
```

### 3.2 Project Management

```
Project (aggregate root)
  ├── id, orgId, name, code, status, currency, timezone
  ├── startDate, baselineEndDate, forecastEndDate
  ├── → Site[]
  ├── → Milestone[]
  └── → WBSNode[]

Site
  ├── id, projectId, name, location { lat, lng, address }
  └── → SiteInventory (owned by Materials context)

WBSNode
  ├── id, projectId, parentId, code, title, level
  └── (tree structure, recursive)
```

### 3.3 BOQ & Estimation

```
BOQPackage (aggregate root)
  ├── id, projectId, revision, status, approvedBy
  └── → BOQItem[]

BOQItem
  ├── id, packageId, wbsCode, description
  ├── unit, quantity, unitRate, totalAmount
  └── → BOMLine[]  (materials needed per unit of this item)

BOMLine
  ├── id, boqItemId, materialId, qtyPerUnit, unit, wasteFactorPct
  └── (drives auto-consumption when activity progress is logged)

BOMTemplate
  ├── id, orgId, activityType, description
  └── → BOMTemplateLine[]  (reusable across projects)
```

### 3.4 Schedule Management

```
ActivityPlan (aggregate root)
  ├── id, projectId, baselineVersion
  └── → Activity[]

Activity
  ├── id, planId, wbsCode, title, trade
  ├── baselineStart, baselineEnd, plannedStart, plannedEnd
  ├── forecastEnd, plannedQty, unit, completedQty, progressPct
  ├── → ActivityDependency[]
  └── → ResourceAssignment[]

ActivityDependency
  └── id, activityId, dependsOnId, type (FS | FF | SS | SF), lagDays

ResourceAssignment
  └── id, activityId, resourceType (labour | equipment), resourceId, qty
```

### 3.5 Site Operations

```
DailyReport (aggregate root)
  ├── id, siteId, reportDate, submittedBy, status
  ├── weatherCondition, workingHours, notes
  ├── → ProgressEntry[]
  ├── → WorkforceEntry[]
  ├── → EquipmentEntry[]
  └── → ProgressPhoto[]

ProgressEntry
  ├── id, reportId, activityId, completedQty, unit, remarks
  └── (triggers QuantityCalculationRequested domain event on submit)

WorkforceEntry
  ├── id, reportId, trade, headcount, manHours, supervisorName

EquipmentEntry
  ├── id, reportId, equipmentId, operatingHours, idleHours
  └── fuelConsumed, breakdownNote

ProgressPhoto
  ├── id, reportId, activityId, url, caption, takenAt
  └── → AIAnalysisResult (owned by AI Services context)
```

### 3.6 Materials & Inventory

```
MaterialCatalogue (aggregate root)
  ├── id, orgId
  └── → Material[]

Material
  ├── id, catalogueId, code, name, category, unit
  └── specifications {}

SiteInventory (aggregate root)
  ├── id, siteId
  └── → StockLedgerEntry[]

StockLedgerEntry
  ├── id, inventoryId, materialId, movementType (GRN | ISSUE | RETURN | ADJUST)
  ├── qty, balanceAfter, referenceId, referenceType, createdAt
  └── (append-only ledger; current stock = sum of entries)

PurchaseOrder (aggregate root)
  ├── id, siteId, orgId, vendorId, status
  ├── → POLineItem[]
  └── → GRN[]  (Goods Received Notes)

GRN
  ├── id, poId, receivedAt, receivedBy
  └── → GRNLineItem[]  (triggers InventoryReceived event)
```

### 3.7 Forecasting & Analytics

```
ProjectForecast (aggregate root)
  ├── id, projectId, calculatedAt, triggeredBy (event type)
  ├── scheduleForecast { ecd, spi, delayDays, riskScore }
  ├── costForecast { eac, cpi, variance, cashflowProjection[] }
  └── → ModuleForecast[]  (delay | inventory | labour | equipment | material)
```

### 3.8 Document Management

```
DrawingRegister (aggregate root)
  ├── id, projectId
  └── → Drawing[]

Drawing
  ├── id, registerId, title, drawingNo, discipline, revision
  ├── status, fileUrl, uploadedBy, uploadedAt
  └── → ExtractionResult (owned by AI Services context)
```

### 3.9 AI Services

```
AIJob (aggregate root)
  ├── id, orgId, jobType (EXTRACTION | DETECTION | TRANSCRIPTION | CHAT | FORECAST)
  ├── status (QUEUED | PROCESSING | DONE | FAILED)
  ├── inputRef { type, id }
  ├── outputRef { type, id }
  └── metadata { model, confidence, processingMs }

ChatSession
  ├── id, userId, projectId, createdAt
  └── → ChatMessage[]

ChatMessage
  ├── id, sessionId, role (user | assistant), content
  ├── citations[] { contextType, contextId, excerpt }
  └── → AssistantAction[]
```

---

## 4. Domain Event Flow

This is the quantity-aware intelligence backbone — every field entry
propagates automatically through the system.

```
SITE OPERATIONS
  ProgressEntry submitted
        │
        ▼ QuantityCalculationRequested
FORECASTING
  Calculate BOM consumption for activityId × completedQty
        │
        ├──▼ MaterialConsumptionCalculated (per material)
        │     │
        │     ▼ InventoryDeductionRequested
        │  MATERIALS & INVENTORY
        │     Auto-deduct from SiteInventory ledger
        │     │
        │     ▼ InventoryUpdated
        │     Check reorder points → StockAlertRaised (if below threshold)
        │
        └──▼ ActivityProgressUpdated
              │
              ▼ ForecastRecalculationRequested
           FORECASTING
              Recalculate SPI, EAC, ECD, material demand
              │
              ▼ ForecastUpdated
           NOTIFICATIONS
              Push alerts to Project Manager / Executive if thresholds breached
```

### Full Event Catalogue

| Event | Published By | Consumed By |
|---|---|---|
| `ProgressEntrySubmitted` | Site Operations | Forecasting, AI Services |
| `QuantityCalculationRequested` | Forecasting | Forecasting (internal) |
| `MaterialConsumptionCalculated` | Forecasting | Materials & Inventory |
| `InventoryDeductionRequested` | Forecasting | Materials & Inventory |
| `InventoryUpdated` | Materials & Inventory | Forecasting, Notifications |
| `StockAlertRaised` | Materials & Inventory | Notifications, Procurement |
| `ActivityProgressUpdated` | Site Operations | Schedule Management, Forecasting |
| `ForecastRecalculationRequested` | Multiple | Forecasting |
| `ForecastUpdated` | Forecasting | Notifications, Dashboard |
| `GRNCreated` | Materials & Inventory | Forecasting, Notifications |
| `POApproved` | Materials & Inventory | Notifications |
| `DrawingRevisionUploaded` | Document Management | AI Services |
| `ExtractionCompleted` | AI Services | BOQ & Estimation, Notifications |
| `DailyReportApproved` | Site Operations | Forecasting, Reporting |
| `SafetyAlertRaised` | AI Services | Notifications, Site Operations |
| `DelayRiskThresholdBreached` | Forecasting | Notifications |
| `ChatActionRequested` | AI Services | (all contexts, action-specific) |

---

## 5. Multi-Tenant Data Model

```
Organisation  (tenant root — all data belongs to one org)
    │
    ├── Project[]
    │       │
    │       ├── Site[]
    │       │       │
    │       │       ├── DailyReport[]
    │       │       ├── SiteInventory
    │       │       └── EquipmentFleet[]
    │       │
    │       ├── ActivityPlan
    │       ├── BOQPackage
    │       ├── DrawingRegister
    │       └── ProjectForecast
    │
    ├── MaterialCatalogue
    ├── BOMTemplateLibrary
    ├── VendorDirectory
    └── UserDirectory
```

### Tenancy Enforcement

- Every database table carries `org_id` as a non-nullable indexed column
- Row-Level Security (RLS) policies enforce `org_id = current_setting('app.org_id')`
- API middleware sets the RLS context from the JWT claim on every request
- Cross-tenant data access is architecturally impossible at the database layer

### Subscription Plans

| Feature | Starter | Professional | Enterprise |
|---|---|---|---|
| Projects | 3 | 20 | Unlimited |
| Users | 10 | 100 | Unlimited |
| AI modules | — | Phase 2 | Phase 2 + 3 |
| Data retention | 1 yr | 5 yr | Unlimited |
| SSO / SAML | — | — | ✓ |
| Custom roles | — | ✓ | ✓ |

---

## 6. System Architecture Diagram

```
                        ┌─────────────────────┐
  Browser / Mobile  ───▶│   API Gateway       │
                        │  (Auth + Rate Limit) │
                        └──────────┬──────────┘
                                   │  JWT verified
              ┌────────────────────┼─────────────────────┐
              │                    │                     │
              ▼                    ▼                     ▼
      ┌──────────────┐   ┌──────────────────┐   ┌──────────────┐
      │  REST API    │   │  WebSocket API   │   │  File Store  │
      │  (per context│   │  (live updates)  │   │  (S3-compat) │
      │   router)    │   └────────┬─────────┘   └──────────────┘
      └──────┬───────┘            │
             │                    │
      ┌──────▼────────────────────▼──────────────────────────────┐
      │                   Application Layer                       │
      │  IAM │ Project │ BOQ │ Schedule │ SiteOps │ Materials    │
      │  Forecasting │ Documents │ AI Services │ Notifications   │
      └──────────────────────────┬───────────────────────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
              ▼                  ▼                  ▼
      ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
      │  PostgreSQL  │  │  Event Bus   │  │  AI/ML Service   │
      │  (per-tenant │  │  (Kafka /    │  │  (Vision, NLP,   │
      │   RLS)       │  │  Redis Pub)  │  │   Forecasting)   │
      └──────────────┘  └──────────────┘  └──────────────────┘
```

---

## 7. API Gateway & Auth Layer

### Authentication Flow

```
1. User submits email + password (or SSO token)
2. IAM service validates credentials
3. Issues:
   - Access Token  (JWT, 15-minute TTL, contains org_id + role + permissions)
   - Refresh Token (opaque, 30-day TTL, stored in HttpOnly cookie)
4. API Gateway validates JWT on every request (signature + expiry)
5. Gateway injects { org_id, user_id, role, permissions } into request context
6. RLS context set from org_id before any DB query
```

### JWT Payload

```json
{
  "sub": "user_01JXK...",
  "org": "org_01JXK...",
  "role": "project_manager",
  "permissions": ["progress:read", "progress:write", "forecast:read"],
  "projects": ["proj_01...", "proj_02..."],
  "iat": 1751234567,
  "exp": 1751235467
}
```

### API Conventions

| Concern | Convention |
|---|---|
| Base URL | `/api/v1/` |
| Auth header | `Authorization: Bearer <access_token>` |
| Tenant scoping | Implicit from JWT; no `org_id` in URL |
| Pagination | `?page=1&limit=25`; response: `{ data[], meta { total, page, limit } }` |
| Filtering | `?filter[status]=active&filter[trade]=masonry` |
| Sorting | `?sort=-createdAt` (prefix `-` = descending) |
| Error format | `{ error: { code, message, details[] } }` |
| Idempotency | `Idempotency-Key` header on POST mutations |
| Versioning | URL path versioning (`/v1/`, `/v2/`) |
| WebSocket | `wss://api.domain/ws?token=<access_token>` |

### Rate Limiting

| Tier | Limit |
|---|---|
| Auth endpoints | 10 req / min per IP |
| Read endpoints | 300 req / min per user |
| Write endpoints | 60 req / min per user |
| AI job endpoints | 20 req / min per org |
| File upload | 100 MB / request, 1 GB / day per org |

---

## 8. Monorepo Folder Structure

```
construction-intelligence-platform/
├── apps/
│   ├── web/                     # Next.js (React) — browser app
│   ├── mobile/                  # React Native — iOS + Android
│   └── api/                     # Node.js API (Express / Fastify)
│       ├── gateway/             # Auth, rate limiting, routing
│       └── services/
│           ├── iam/
│           ├── projects/
│           ├── boq/
│           ├── schedule/
│           ├── site-ops/
│           ├── materials/
│           ├── forecasting/
│           ├── documents/
│           ├── ai/
│           └── notifications/
│
├── packages/
│   ├── ui/                      # Shared component library (React)
│   ├── domain/                  # Shared domain types, events, value objects
│   ├── api-client/              # Generated API client (OpenAPI)
│   ├── sync-engine/             # Offline sync core (shared mobile + web)
│   ├── quantity-engine/         # BOQ × progress → consumption calculator
│   ├── forecast-engine/         # EVM, delay prediction, cost EAC
│   └── config/                  # ESLint, TypeScript, Tailwind base configs
│
├── infra/
│   ├── docker/
│   ├── k8s/
│   ├── terraform/
│   └── migrations/              # Database migration files (per service)
│
├── docs/
│   ├── openspec/                # This folder
│   └── adr/                     # Architecture Decision Records
│
├── scripts/
├── package.json                 # Turborepo / pnpm workspace root
└── turbo.json
```

### Service Boundary Rule

Each service under `apps/api/services/` owns:
- Its own database schema (separate schema in the same Postgres instance for now)
- Its own migration files
- Its own domain events (published to event bus)
- No direct imports from another service's internal modules
- Communication via shared `packages/domain` types only

---

## 9. Offline Sync Strategy (Mobile)

Site engineers frequently work in areas with no connectivity. The mobile app
must function fully offline and sync when a connection is available.

### Sync Architecture

```
Mobile App
  ├── Local SQLite DB (full working copy)
  ├── Sync Queue (append-only operation log)
  └── Sync Engine (packages/sync-engine)

On action (e.g. submit ProgressEntry):
  1. Write to local SQLite immediately → UI responds instantly
  2. Append operation to SyncQueue { type, payload, localId, timestamp }
  3. Show "Pending sync" indicator

On connectivity restored:
  4. Sync Engine flushes queue → POST /sync/batch
  5. Server applies operations in timestamp order
  6. Server returns merged state + conflict resolutions
  7. Local DB updated with server canonical IDs
  8. "Synced" indicator shown
```

### Conflict Resolution Rules

| Scenario | Resolution |
|---|---|
| Two users edit different fields of the same record | Merge — apply both changes |
| Two users edit the same field of the same record | Last-write-wins (server timestamp) |
| Record deleted on server, edited offline | Soft-restore with conflict flag for manual review |
| Duplicate ProgressEntry for same activity+date | Sum quantities; flag for supervisor review |
| New record created offline (temp local ID) | Server assigns canonical ID; client remaps references |

### Data Seeded for Offline Use

On login or project switch, the mobile app downloads:
- Active project's activity list + schedule
- BOQ items linked to those activities
- Material catalogue for the site
- Current inventory snapshot
- Own pending daily reports

---

## 10. Microservice Extraction Path

The monorepo starts as a modular monolith. Each `services/` folder is
pre-isolated so it can be extracted into an independent microservice without
rewriting business logic.

### Extraction Triggers (when to split)

| Service | Split When |
|---|---|
| `ai/` | AI job volume requires independent GPU scaling |
| `forecasting/` | Forecast recalculation load exceeds API latency budget |
| `notifications/` | Push/email volume requires dedicated delivery infrastructure |
| `site-ops/` | Mobile write throughput requires independent horizontal scaling |

### Extraction Steps (per service)

1. Move service folder to new repo
2. Replace in-process function calls with REST / gRPC calls
3. Replace shared DB schema access with API contracts
4. Move event bus subscriptions to the new service's own consumer group
5. Deploy independently behind the existing API Gateway

---

## 11. Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| Web frontend | Next.js 14 (App Router) + TypeScript | SSR for initial load, client navigation |
| Mobile | React Native + Expo | Code share with web; offline-first |
| Component library | Tailwind CSS + Radix UI primitives | Accessible, unstyled base |
| API | Node.js + Fastify + TypeScript | High throughput, type safety |
| ORM | Drizzle ORM | Type-safe SQL, migration support |
| Database | PostgreSQL 16 (with RLS) | Relational, tenant isolation via RLS |
| Local mobile DB | SQLite via Expo SQLite | Offline-first sync |
| Event bus | Redis Pub/Sub (→ Kafka when scale demands) | Simple to start, swap later |
| File storage | S3-compatible (AWS S3 / MinIO) | Photos, drawings, exports |
| Auth | JWT (access) + opaque refresh tokens | Stateless API scaling |
| AI / ML | Python FastAPI microservice | Separate runtime for GPU models |
| Vision models | YOLO v8 (detection) + GPT-4o vision (analysis) | Best accuracy per use case |
| Speech-to-text | Whisper (on-device) + cloud fallback | Privacy-first, noise-robust |
| LLM (chat) | Claude claude-sonnet-4-6 via Anthropic API | Context window for project RAG |
| Search | PostgreSQL full-text search (→ Elasticsearch at scale) | Start simple |
| Caching | Redis | Session, rate limit, hot forecast data |
| Job queue | BullMQ (Redis-backed) | AI jobs, forecast recalculation |
| Monitoring | OpenTelemetry + Grafana + Prometheus | Trace, metric, log pipeline |
| CI/CD | GitHub Actions + Docker + Kubernetes | Standard cloud-native deploy |

---

## 12. Architecture Decision Records (ADRs)

| # | Decision | Rationale |
|---|---|---|
| ADR-001 | Monorepo with Turborepo | Shared types and UI library without publish overhead |
| ADR-002 | PostgreSQL RLS for multi-tenancy | Tenant isolation enforced at DB layer, not just app layer |
| ADR-003 | Append-only stock ledger | Audit trail; current stock = sum; no UPDATE on inventory |
| ADR-004 | Offline queue on mobile (not CRDT) | CRDT complexity not justified; timestamp-based merge sufficient for daily reports |
| ADR-005 | Domain events via Redis Pub/Sub initially | Kafka is operationally heavy early; Redis is sufficient for <100 events/sec |
| ADR-006 | Separate Python service for AI/ML | GPU runtime isolation; language best-fit for ML libraries |
| ADR-007 | quantity-engine as shared package | Core business logic must be identical on server and mobile (offline calculation) |
| ADR-008 | Claude API for chat assistant | Large context window needed to hold full project data for RAG queries |
