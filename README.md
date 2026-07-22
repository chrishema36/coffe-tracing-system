# CoffeeTrace • SLR Enterprise Coffee Traceability System
## Production-Grade Multi-Tier Lineage Engine & Farmer Attribution Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14_App_Router-black.svg)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-v20-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.x-indigo.svg)](https://www.prisma.io/)
[![React Flow](https://img.shields.io/badge/React_Flow-Traceability_Graph-pink.svg)](https://reactflow.dev/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-blue.svg)](https://www.docker.com/)
[![Swagger](https://img.shields.io/badge/Swagger-OpenAPI_3.0-brightgreen.svg)](http://localhost:4000/docs)

**CoffeeTrace** is an enterprise-grade SaaS application designed and engineered for the **SLR Enterprise Technical Assessment**. It addresses complex coffee supply chain challenges: multi-tier harvest bag aggregation, recursive lineage tracking, zero-cycle loop guarantees, fair farmer percentage attribution, and verifiable digital origin certification.

---

## 🌟 Key Platform Features & Highlights

- 🔄 **Traceability Replay Engine (⭐ Core Highlight):** Step-by-step 5–10 second animated playback demonstrating how smallholder farmer harvest bags recursively merge across tiers into final export lots.
- 📜 **Coffee Origin Export Certificate Generator:** One-click downloadable & printable certificates featuring Export Lot ID, participating farmers, origin regions, timestamps, QR codes, and immutable SHA-256 digital signature hashes.
- ⚡ **Command Palette (`Ctrl + K` / `Cmd + K`):** Global quick-search and action overlay for instant navigation across farmers, coffee bags, merges, and system settings.
- 👤 **Farmer Profile Side Drawer:** Interactive slide-over panel displaying farmer contact info, lifetime bag count, total yield, average weight, harvest timeline, and export contribution history.
- 🛡️ **System Activity Audit Log:** Full audit trail logging harvest creation, merge operations, lineage queries, and export certificate generations.
- 📊 **Executive Dashboard & System Health:** Real-time activity timeline, recent farmer registrations, variety weight distribution, and live health monitors (API, Database, Storage, Deployment).
- 🛡️ **Strict Pagination Guard & Validation:** Max 5 records per page strictly enforced across all REST API endpoints (`/farmers`, `/bags`) via Zod input DTOs and SQL limit parameters.

---

## 🏛️ System Architecture Diagram

```mermaid
graph TD
    User([User / Evaluator]) -->|HTTP / React UI| NextClient[Next.js 14 Frontend UI]
    NextClient -->|Ctrl+K Search & Rest API| ExpressApp[Express.js TypeScript Backend API]
    
    subgraph Backend Core
        ExpressApp -->|Middleware| ZodVal[Zod DTO Validator & Rate Limiter]
        ZodVal --> Controller[Controllers Layer]
        Controller --> Services[Services Layer - Bag & Farmer Logic]
        Services --> CTE[Recursive CTE Lineage Engine & Cycle Detector]
    end
    
    Services -->|Prisma ORM| PostgresDB[(PostgreSQL 16 Database)]
    ExpressApp -->|OpenAPI| SwaggerDocs[Swagger UI Documentation /docs]
```

---

## 📊 Entity Relationship (ER) Diagram

```mermaid
erDiagram
    FARMER ||--o{ COFFEE_BAG : "harvests / registers"
    COFFEE_BAG ||--o{ MERGE_RELATION : "contributes to (Child)"
    COFFEE_BAG ||--o{ MERGE_RELATION : "created from (Parent)"

    FARMER {
        string id PK
        string code UK
        string name
        string email
        string phone
        string region
        string country
        int elevationM
        datetime createdAt
    }

    COFFEE_BAG {
        string id PK
        string bagCode UK
        float initialWeightKg
        float currentWeightKg
        enum variety
        enum status
        string farmerId FK
        datetime createdAt
    }

    MERGE_RELATION {
        string id PK
        string parentBagId FK
        string childBagId FK
        float weightUsedKg
        datetime createdAt
    }
```

---

## 🔄 Multi-Tier Data Flow Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Farmer as Farmer (Jean Bosco)
    participant API as Express REST API
    participant CTE as PostgreSQL CTE Engine
    actor Buyer as International Buyer

    Farmer->>API: POST /api/v1/bags (Log Bag-A1: 50kg)
    API-->>Farmer: 201 Created (HARVESTED)
    Farmer->>API: POST /api/v1/bags/merge (Merge Bag-A1 + Bag-B1 -> Lot-M1)
    API-->>Farmer: 201 Created (MERGED)
    Buyer->>API: GET /api/v1/bags/EXPORT-SUPER-LOT-01/trace
    API->>CTE: Execute Recursive CTE Query & Cycle Check
    CTE-->>API: Graph Nodes, Edges & Farmer Attributions
    API-->>Buyer: 200 OK { success: true, data: { attributions: [Abebe 60%, Tigist 40%] } }
```

---

## 📂 Project Directory Structure

```
.
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma         # PostgreSQL schema (Farmer, CoffeeBag, MergeRelation)
│   │   └── seed.ts               # Pre-populated seed dataset (3-tier export lots)
│   ├── src/
│   │   ├── controllers/          # Request handlers & JSON envelope formatters
│   │   ├── dtos/                 # Zod validation schemas
│   │   ├── middleware/           # Central error handler, rate limiters
│   │   ├── repositories/         # Prisma database access layer
│   │   ├── routes/               # Express API v1 route mounts & Swagger spec
│   │   ├── services/             # Recursive CTE lineage, cycle detection, merge logic
│   │   ├── types/                # TypeScript type definitions
│   │   ├── app.ts                # Express application factory
│   │   └── server.ts             # Server entry point
│   ├── tests/
│   │   ├── unit/                 # Unit tests (Traceability, Merge Logic, BagService)
│   │   └── integration/          # Integration tests (REST endpoints)
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── bags/             # Coffee bags inventory & status filters page
│   │   │   ├── farmers/          # Farmers directory & stats page
│   │   │   ├── settings/         # System health & platform settings page
│   │   │   ├── trace/[id]/       # Interactive lineage graph & replay page
│   │   │   ├── globals.css       # Tailwind CSS tokens & glassmorphism
│   │   │   ├── page.tsx          # Executive Dashboard
│   │   │   └── providers.tsx     # React Query & Toast context providers
│   │   ├── components/
│   │   │   ├── AuditLogModal.tsx # System activity audit log viewer
│   │   │   ├── BagsTable.tsx     # Density switcher, status badges, filters
│   │   │   ├── CertificateModal.tsx # Export origin certificate generator
│   │   │   ├── CommandPalette.tsx # Ctrl+K global search & actions
│   │   │   ├── FarmerProfileDrawer.tsx # Slide-over farmer profile panel
│   │   │   ├── FarmersTable.tsx  # Kebab action dropdown & stats bar
│   │   │   ├── LogBagModal.tsx   # Coffee bag harvest ingestion modal
│   │   │   ├── MergeModal.tsx    # Multi-bag merge execution modal
│   │   │   ├── Navbar.tsx        # Top header & quick search bar
│   │   │   ├── RegisterFarmerModal.tsx # Farmer onboarding modal
│   │   │   ├── Sidebar.tsx       # Enterprise navigation & pagination guard indicator
│   │   │   └── TraceabilityGraph.tsx # React Flow DAG & Lineage Replay Engine
│   │   ├── context/              # Toast & Sidebar state context
│   │   ├── lib/                  # Axios API client
│   │   └── types/                # Frontend TypeScript types
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml            # Docker stack (DB, Backend, Frontend)
└── README.md
```

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | Next.js 14 (App Router), React 18, TypeScript |
| **Styling & UI** | Tailwind CSS, Lucide Icons, Glassmorphism design system |
| **Visual Graph** | React Flow (`@xyflow/react`) |
| **Backend Framework** | Node.js, Express.js, TypeScript |
| **Database & ORM** | PostgreSQL 16, Prisma ORM |
| **State & Data Fetching** | TanStack React Query v5 |
| **Validation & Docs** | Zod DTOs, Swagger UI (`/docs`) |
| **Testing** | Jest, Supertest |
| **DevOps** | Docker, Docker Compose |

---

## 🚀 Quick Setup Guide (Docker Compose)

### 1. Run with Docker Compose (Recommended)

Run the full stack with one command:

```bash
docker compose up --build
```

### 2. Access Platform Endpoints

- 🖥️ **Frontend Application:** `http://localhost:3000`
- ⚙️ **Backend REST API:** `http://localhost:4000/api/v1`
- 📚 **Swagger API Documentation:** `http://localhost:4000/docs`

---

## 🧪 Running Automated Tests

Run the backend unit and integration test suite:

```bash
cd backend
npm test
```

---

## 💡 Future Improvements

1. **IoT RFID Bag Tracking Integration:** Webhook listeners for real-time sensor weight and moisture updates during transport.
2. **Blockchain Hash Anchoring:** Optional public ledger anchoring for export certificates (e.g. Hedera / Polygon).
3. **Multi-Currency Farmer Payout Calculator:** Automatic calculation of fair farmer revenue share based on weight attribution percentage.

---

## 📄 License & Attribution
Prepared specifically for the **SLR Enterprise Technical Assessment**.
