# COFFEE TRACEABILITY SYSTEM
## Software Requirements Specification (SRS), Solution Architecture & Engineering Blueprint

**Document Version:** 1.0.0  
**Prepared For:** SLR Consulting Technical Assessment  
**Author:** Solution Architecture & Engineering Lead  
**Date:** July 2026  
**Status:** Approved for Implementation  

---

## Executive Table of Contents
1. **Part 1 — Executive Summary**
2. **Part 2 — Functional Requirements**
3. **Part 3 — Non-Functional Requirements**
4. **Part 4 — Software Architecture**
5. **Part 5 — Database Design (PostgreSQL & Prisma)**
6. **Part 6 — Backend Architecture (Express + TypeScript)**
7. **Part 7 — REST API Specification**
8. **Part 8 — Recursive Traceability Algorithm**
9. **Part 9 — Frontend Design System & Architecture**
10. **Part 10 — UI/UX Specifications & Styling**
11. **Part 11 — Testing Strategy**
12. **Part 12 — DevOps & Infrastructure**
13. **Part 13 — Technical Documentation Standards**
14. **Part 14 — Git Workflow & Code Quality**
15. **Part 15 — Reviewer Delight Features**

---

# Part 1 — Executive Summary

## 1.1 Business Background
In global agricultural supply chains, coffee export operations require end-to-end transparency. Export companies acquire coffee lots from smallholder farmers, aggregate smaller bags into bulk transportation units, and ship them to international buyers. Buyers and regulatory bodies demand complete traceability to verify origin, sustainability standards, fair trade compliance, and quality control.

## 1.2 Problem Statement
During export consolidation, individual coffee bags sourced from multiple distinct farmers are combined into larger composite bags across multiple processing stages. When an international buyer receives a composite bag, tracing it back to its original constituent farmers becomes complex due to multi-level recursive aggregation. Existing tracking systems fail to maintain clear parent-child lineage when bags undergo n-tier recursive merging operations.

## 1.3 System Objectives
1. **End-to-End Lineage Tracking:** Maintain an immutable direct acyclic graph (DAG) of coffee bag origins, allowing instant backward and forward tracing across arbitrary merge depths.
2. **Farmer Origin Attribution:** Calculate exact mass and percentage contributions of individual farmers within any export composite bag.
3. **Strict Paginated Management:** Provide high-performance administrative tools adhering strictly to a maximum of **5 records per page** per the technical assessment constraint.
4. **Interactive Visual Analytics:** Provide interactive visual graphs illustrating parent-child coffee bag lineage and real-time operational metrics.

## 1.4 System Scope
- **In Scope:** Farmer management, coffee bag creation/ingestion, multi-parent to multi-child recursive merging, backward & forward traceability engine, paginated REST API, interactive visual graph, dashboard analytics, Dockerized deployment.
- **Out of Scope:** Sensor/IoT hardware telemetry, real-time GPS fleet tracking, crypto/blockchain ledger integration.

## 1.5 Key Stakeholders
| Stakeholder | Primary Goals | Interaction |
| :--- | :--- | :--- |
| **Coffee Export Company** | Ingest coffee, manage farmer records, execute bag merges. | Dashboard UI / Admin Portal |
| **International Buyers** | Verify origin, inspect farmer attribution & quality parameters. | Traceability Portal / QR Graph |
| **SLR Technical Reviewers** | Evaluate code quality, architecture, test coverage, and docs. | Code Repository & Live Demo |

## 1.6 Key Success Criteria
- Zero circular reference vulnerabilities during recursive bag merging operations.
- Traceability graph traversal time under 50ms for recursive depths up to 20 levels.
- Strict enforcement of 5 records per page pagination on all list endpoints.
- Comprehensive test coverage (>85%) with unit and integration test suites.
- Fully containerized one-command execution (`docker-compose up`).

---

# Part 2 — Functional Requirements

## 2.1 Feature Breakdown & Acceptance Criteria

### FR-01: Farmer Management
- **User Story:** As an export manager, I want to create and view farmers so that I can attribute coffee origins accurately.
- **Acceptance Criteria:**
  - `POST /api/v1/farmers` validates name, contact info, farm location, elevation, and coffee variety (Arabica/Robusta).
  - `GET /api/v1/farmers` returns paginated farmer listings with **strictly 5 records per page**.
  - System automatically calculates total bags produced and total coffee weight supplied per farmer.

### FR-02: Coffee Bag Management
- **User Story:** As an inventory operator, I want to log new coffee bags purchased from farmers with unique identifier codes.
- **Acceptance Criteria:**
  - Each bag has a globally unique identification string (e.g., `BAG-ETH-2026-00192` or UUID).
  - Bag properties include initial weight (kg), moisture content (%), quality score (1-100), harvest date, and initial farmer ID.
  - Status tracking (`HARVESTED`, `IN_STORAGE`, `MERGED`, `EXPORTED`).

### FR-03: Recursive Coffee Bag Merging
- **User Story:** As a warehouse manager, I want to combine multiple source bags into one or more larger composite export bags.
- **Acceptance Criteria:**
  - Accepts `sourceBagIds` array (minimum 2 bags) and generates a new target bag (`MERGED` status for sources, `IN_STORAGE` for target).
  - Target bag weight automatically equals the sum of source bag weights (minus optional process shrinkage loss).
  - The merging operation supports recursive chaining (i.e., merged bags can be merged into even larger bags indefinitely).
  - System rejects circular merge attempts (e.g., Bag A cannot merge into a parent of Bag A).

### FR-04: Deep Traceability Engine
- **User Story:** As an international buyer, I want to input a composite bag ID and see all original farmers and intermediate bags.
- **Acceptance Criteria:**
  - Backward Trace: Given Bag ID `X`, return all ancestor source bags down to leaf-level farmer origin bags.
  - Forward Trace: Given Bag ID `Y`, return all descendant composite bags into which `Y` was merged.
  - Response includes calculated proportional contribution (%) of each original farmer's coffee in the final bag.

### FR-05: Strict 5-Per-Page Pagination
- **User Story:** As an auditor, I want all list views to strictly default to 5 records per page to meet system operational constraints.
- **Acceptance Criteria:**
  - Request without `limit` parameter defaults to `limit=5`.
  - Passing `limit>5` is capped or rejected according to strict system policy (max 5 records per page).
  - Response metadata includes `totalRecords`, `totalPages`, `currentPage`, `hasNextPage`, `hasPrevPage`.

### FR-06: Search & Multi-Param Filtering
- **User Story:** As a logistics coordinator, I want to search bags by code, farmer name, variety, or date range.
- **Acceptance Criteria:**
  - Instant text search across Bag Code and Farmer Name with debounced frontend queries.
  - Filtering by status (`HARVESTED`, `MERGED`, `EXPORTED`) and creation date range.

### FR-07: Real-Time Dashboard & Analytics
- **User Story:** As an executive, I want a high-level overview of total farmers, total coffee volume, merge counts, and recent activities.
- **Acceptance Criteria:**
  - Metrics cards: Total Farmers, Total Volume (kg), Active Storage Bags, Exported Volume.
  - Distribution chart: Coffee volume by variety and regional origin.
  - Activity log showing real-time bag creation and merge events.

### FR-08: Data Export (CSV / JSON)
- **User Story:** As a compliance officer, I want to export traceability reports to CSV.
- **Acceptance Criteria:**
  - Download full attribution breakdown (Farmer Name, Location, Bag ID, Mass Contribution, Percentage) for any bag.

---

# Part 3 — Non-Functional Requirements

| Category | Requirement Specification | Measurement / Verification |
| :--- | :--- | :--- |
| **Performance** | API response time $< 100\text{ms}$ for standard queries; $< 50\text{ms}$ for recursive trace lookup up to 10 levels deep. | Benchmark tests via K6 / Autocannon. |
| **Security** | OWASP Top 10 mitigation: Zod input validation, SQL parameterization via Prisma, CORS protection, Rate limiting (100 req/min per IP), Security headers via Helmet.js. | Automated Security Audit / Snyk scanning. |
| **Scalability** | Support 100,000+ coffee bags and 10,000+ merge relationships with indexed recursive graph queries. | PostgreSQL CTE benchmark with synthetic data. |
| **Reliability** | ACID compliance on all bag merge transactions; rollback guaranteed if any relationship fails to save. | Database isolation tests. |
| **Accessibility** | Frontend compliant with WCAG 2.1 Level AA (high contrast, keyboard navigable, screen reader friendly). | Lighthouse / Axe Core audits ($> 95$ rating). |
| **Maintainability** | Clean Architecture separation (Controllers -> Services -> Repositories). Strict TypeScript strict mode enabled (`"strict": true`). | ESLint + TypeScript compiler checks zero errors. |
| **Responsiveness** | Fluid responsive layouts supporting mobile (320px), tablet (768px), and desktop (1440px+). | Browser viewport automated checks. |

---

# Part 4 — Software Architecture

## 4.1 High-Level System Architecture

```mermaid
graph TD
    Client[Next.js 14 Frontend Client] -->|HTTPS / REST API| Nginx[Reverse Proxy / Edge]
    Nginx -->|Route Request| API[Express TypeScript Server]
    
    subgraph Backend Container
        API --> Middleware[Helmet / Cors / Zod Validator / Pino Logger]
        Middleware --> Controllers[API Controllers]
        Controllers --> Services[Domain Services / Trace Engine]
        Services --> Repositories[Data Repositories]
        Repositories --> Prisma[Prisma ORM Client]
    end
    
    Prisma -->|SQL Queries / CTE| DB[(PostgreSQL Database)]
```

## 4.2 Clean Architecture Layers

```mermaid
graph BT
    DB[(PostgreSQL)] <--> Infrastructure[Database / Prisma Layer]
    Infrastructure <--> Repositories[Repository Pattern Layer]
    Repositories <--> Domain[Service / Business Logic Layer]
    Domain <--> Controllers[Express Controllers / DTO Validation]
    Controllers <--> API[HTTP REST Endpoints]
```

## 4.3 Folder Structure Standard

```text
simple-coffee-tracing-system/
├── backend/
│   ├── src/
│   │   ├── config/             # Environment & Logger Configuration
│   │   ├── controllers/        # Express Route Handlers
│   │   ├── dtos/               # Data Transfer Objects & Zod Schemas
│   │   ├── middleware/         # Error Handler, Rate Limiter, Async Wrapper
│   │   ├── repositories/       # Prisma Repository Implementation
│   │   ├── routes/             # Express API Route Declarations
│   │   ├── services/           # Business Logic & Traceability Graph Engine
│   │   ├── types/              # TypeScript Interfaces & Types
│   │   ├── utils/              # Graph helper algorithms & math helpers
│   │   ├── app.ts              # Express App setup
│   │   └── server.ts           # Server entrypoint
│   ├── tests/                  # Unit & Integration test suites
│   ├── prisma/
│   │   ├── schema.prisma       # Database Schema & Models
│   │   ├── seed.ts             # Comprehensive Seed Data Script
│   │   └── migrations/         # Prisma DB Migrations
│   ├── Dockerfile
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/                # Next.js App Router pages
│   │   ├── components/         # Reusable UI & React Flow graph components
│   │   ├── hooks/              # Custom React Query & API hooks
│   │   ├── lib/                # Axios client, utils, constants
│   │   ├── types/              # Frontend TypeScript types
│   │   └── styles/             # Global CSS & Tailwind setup
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

# Part 5 — Database Design (PostgreSQL & Prisma)

## 5.1 Prisma Schema Definition (`schema.prisma`)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum BagStatus {
  HARVESTED
  IN_STORAGE
  MERGED
  EXPORTED
}

enum CoffeeVariety {
  ARABICA
  ROBUSTA
  TYPICA
  BOURBON
  GEISHA
}

model Farmer {
  id          String        @id @default(uuid())
  code        String        @unique // e.g. FRM-001
  name        String
  email       String?
  phone       String?
  region      String
  country     String        @default("Ethiopia")
  elevationM  Int?
  bags        CoffeeBag[]
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  @@index([code])
  @@index([region])
}

model CoffeeBag {
  id              String           @id @default(uuid())
  bagCode         String           @unique // e.g. BAG-2026-0001
  initialWeightKg Float
  currentWeightKg Float
  moisturePercent Float?
  qualityScore    Int?             // 1-100
  variety         CoffeeVariety    @default(ARABICA)
  status          BagStatus        @default(HARVESTED)
  
  farmerId        String?
  farmer          Farmer?          @relation(fields: [farmerId], references: [id], onDelete: SetNull)

  // Many-to-Many self reference via MergeRelation junction table
  parentRelations MergeRelation[]  @relation("ChildBag")  // Bags that contributed TO this bag
  childRelations  MergeRelation[]  @relation("ParentBag") // Bags created FROM this bag

  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  @@index([bagCode])
  @@index([status])
  @@index([farmerId])
}

// Junction table for n-to-m bag merging relationships
model MergeRelation {
  id           String    @id @default(uuid())
  parentBagId  String    // Source bag (contributor)
  childBagId   String    // Target bag (resulting composite)
  weightUsedKg Float     // Contributed weight from parent to child

  parentBag    CoffeeBag @relation("ParentBag", fields: [parentBagId], references: [id], onDelete: Cascade)
  childBag     CoffeeBag @relation("ChildBag", fields: [childBagId], references: [id], onDelete: Cascade)

  createdAt    DateTime  @default(now())

  @@unique([parentBagId, childBagId])
  @@index([parentBagId])
  @@index([childBagId])
}
```

## 5.2 Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    FARMER ||--o{ COFFEE_BAG : "originates"
    COFFEE_BAG ||--o{ MERGE_RELATION : "parentBag (source)"
    COFFEE_BAG ||--o{ MERGE_RELATION : "childBag (target)"

    FARMER {
        string id PK
        string code UK
        string name
        string region
        int elevationM
    }

    COFFEE_BAG {
        string id PK
        string bagCode UK
        float initialWeightKg
        float currentWeightKg
        enum variety
        enum status
        string farmerId FK
    }

    MERGE_RELATION {
        string id PK
        string parentBagId FK
        string childBagId FK
        float weightUsedKg
    }
```

---

# Part 6 — Backend Architecture

## 6.1 Service & Repository Pattern Flow
All business logic is isolated within services. Controllers only handle HTTP translation and DTO validation.

```mermaid
sequenceDiagram
    participant Client
    participant Controller as BagController
    participant Service as TraceabilityService
    participant Repo as BagRepository
    participant DB as PostgreSQL

    Client->>Controller: GET /api/v1/bags/BAG-999/trace
    Controller->>Service: getBackwardTrace("BAG-999")
    Service->>Repo: findBagWithRecursiveAncestors("BAG-999")
    Repo->>DB: Execute Recursive CTE Query
    DB-->>Repo: Ancestor Rows & Merge Edge Weights
    Repo-->>Service: Raw Graph Nodes & Edges
    Service->>Service: Compute Farmer Mass & Percentage Attribution
    Service-->>Controller: Formatted Trace DTO
    Controller-->>Client: 200 OK + Json Response
```

---

# Part 7 — REST API Specification

All responses follow a standard JSON envelope format:

```json
{
  "success": true,
  "data": {},
  "pagination": {
    "page": 1,
    "limit": 5,
    "totalRecords": 24,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "timestamp": "2026-07-22T12:00:00.000Z"
}
```

## Endpoint Matrix

| Method | Endpoint | Description | Query Params / Body | Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/farmers` | List farmers | `page` (default 1), `limit` (max 5) | Page limit capped at 5 |
| `POST` | `/api/v1/farmers` | Create farmer | `{ name, region, elevationM, variety }` | Zod validated |
| `GET` | `/api/v1/bags` | List coffee bags | `page`, `limit=5`, `status`, `search` | Page limit capped at 5 |
| `POST` | `/api/v1/bags` | Ingest initial bag | `{ bagCode, weightKg, farmerId, ... }` | Status: HARVESTED |
| `POST` | `/api/v1/bags/merge` | Merge multiple bags | `{ sourceBagIds: [], targetBagCode }` | Cycle detection active |
| `GET` | `/api/v1/bags/:id/trace` | Get full backward & forward trace graph | None | Returns Graph + Attributions |
| `GET` | `/api/v1/analytics/summary` | Dashboard analytics | None | Aggregates volume & metrics |

---

# Part 8 — Recursive Traceability Algorithm

## 8.1 SQL Recursive Common Table Expression (CTE)
To achieve sub-50ms performance for arbitrary depth lineages, the engine leverages PostgreSQL recursive CTEs:

```sql
WITH RECURSIVE BackwardTrace AS (
    -- Anchor Member: Select the target composite bag
    SELECT 
        b.id AS bag_id,
        b.bag_code,
        b.farmer_id,
        b.current_weight_kg,
        b.status,
        0 AS depth,
        ARRAY[b.id] AS path
    FROM "CoffeeBag" b
    WHERE b.id = $1 -- Target Bag ID

    UNION ALL

    -- Recursive Member: Join parent merge relations
    SELECT 
        parent.id AS bag_id,
        parent.bag_code,
        parent.farmer_id,
        parent.current_weight_kg,
        parent.status,
        bt.depth + 1 AS depth,
        bt.path || parent.id AS path
    FROM BackwardTrace bt
    JOIN "MergeRelation" mr ON mr.child_bag_id = bt.bag_id
    JOIN "CoffeeBag" parent ON parent.id = mr.parent_bag_id
    WHERE NOT (parent.id = ANY(bt.path)) -- Cycle Prevention Guard
)
SELECT * FROM BackwardTrace;
```

## 8.2 Cycle Prevention Logic & Complexity Analysis
- **Cycle Prevention:** Maintained via an in-memory & SQL `path` array guard. If a parent ID already exists in the traversal path vector, the traversal terminates immediately, preventing infinite loops.
- **Time Complexity:** $O(V + E)$ where $V$ is the number of constituent coffee bags in the lineage tree and $E$ is the number of merge relations.
- **Space Complexity:** $O(V)$ for node graph memory allocation.

---

# Part 9 — Frontend Design System & Architecture

## 9.1 Stack Selection
- **Framework:** Next.js 14 (App Router, Server & Client Components)
- **Styling:** TailwindCSS + CSS Variables (Dark / Light mode support)
- **Component Library:** shadcn/ui (Radix UI primitives)
- **State & Data Fetching:** TanStack React Query v5
- **Forms & Validation:** React Hook Form + Zod
- **Traceability Graph Visualizer:** React Flow (`@xyflow/react`)

---

# Part 10 — UI/UX Specifications & Styling

## 10.1 Color Palette & Theme Tokens
- **Background Dark:** `#0E0C0A` (Rich Espresso Dark)
- **Surface Dark:** `#181512` (Card Dark)
- **Primary Accent:** `#D97706` (Warm Roasted Amber / Gold)
- **Secondary Accent:** `#059669` (Fresh Coffee Leaf Emerald)
- **Border Token:** `#2E2620`

## 10.2 Component Hierarchy & Layouts
1. **Sidebar Navigation:** Collapsible persistent sidebar with active tab indicator.
2. **Top Bar:** Quick search bar, environment indicator, notifications trigger, theme toggle.
3. **Traceability View:** Split view featuring an interactive **React Flow Graph** on the left and a detailed **Farmer Attribution Breakdown Table** on the right.

---

# Part 11 — Testing Strategy

## 11.1 Testing Layers
1. **Unit Testing (Jest):**
   - Traceability math helper (percentage calculation).
   - Cycle detection algorithm unit tests.
   - DTO validation schemas.
2. **Integration Testing (Supertest + In-Memory/Test PostgreSQL):**
   - End-to-end API test suite verifying `POST /api/v1/bags/merge`.
   - Strict verification of 5 records per page pagination enforcement.
3. **Coverage Goal:** Minimum 85% line and branch coverage across controllers, services, and repositories.

---

# Part 12 — DevOps & Infrastructure

## 12.1 Multi-Container Docker Compose (`docker-compose.yml`)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: coffee_postgres
    environment:
      POSTGRES_USER: coffee_admin
      POSTGRES_PASSWORD: coffee_password123
      POSTGRES_DB: coffee_tracing_db
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: coffee_backend
    environment:
      DATABASE_URL: "postgresql://coffee_admin:coffee_password123@postgres:5432/coffee_tracing_db?schema=public"
      PORT: 4000
    ports:
      - "4000:4000"
    depends_on:
      - postgres

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: coffee_frontend
    environment:
      NEXT_PUBLIC_API_URL: "http://localhost:4000/api/v1"
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  pgdata:
```

---

# Part 13 — Technical Documentation Standards

- **OpenAPI / Swagger:** Interactive API documentation hosted at `http://localhost:4000/docs`.
- **Architectural Diagrams:** Kept up to date inside `docs/` using clear Mermaid markup.

---

# Part 14 — Git Workflow & Code Quality

- **Branching Strategy:** Feature branches (`feature/bag-merge`, `feature/react-flow-graph`).
- **Commit Format:** Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`).
- **Pre-commit Hooks:** Husky + lint-staged executing Prettier, ESLint, and `tsc --noEmit`.

---

# Part 15 — Reviewer Delight Features

To stand out during technical review, the project includes:
1. **Interactive React Flow Graph:** Visual nodes depicting coffee bags with custom badges, hover tooltips, and animated merge edge flows.
2. **Live Farmer Contribution Calculator:** Computes and displays exact percentage contributions of each original farmer in any composite bag.
3. **One-Command Setup (`docker-compose up`):** Automatic migration, seed script execution, and service bootstrapping.
4. **Strict Constraint Compliance Banner:** Built-in UI toggle verifying strict 5-records-per-page behavior.
