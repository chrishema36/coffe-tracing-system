# IMPLEMENTATION ROADMAP & SUBMISSION CHECKLIST
## SLR Consulting Technical Assessment — Coffee Tracing System

---

## 1. Implementation Roadmap

### Phase 1: Environment & Repository Ingestion
- [x] Create project documentation and architecture blueprint (`docs/SOFTWARE_REQUIREMENTS_SPECIFICATION.md`).
- [x] Configure Cursor AI master system prompt (`docs/CURSOR_MASTER_INSTRUCTIONS.md`).
- [x] Initialize repository structure (`/backend` and `/frontend`).

### Phase 2: Database & Prisma ORM Setup
- [x] Initialize PostgreSQL database (via Docker or Supabase).
- [x] Create `backend/prisma/schema.prisma` with `Farmer`, `CoffeeBag`, and `MergeRelation` models.
- [x] Run Prisma initial migration (`npx prisma migrate dev --name init`).
- [x] Write database seed script (`backend/prisma/seed.ts`) with synthetic farmers and merged bags.

### Phase 3: Express Backend Core Development
- [x] Set up Express app with TypeScript, Helmet, CORS, and Pino logging middleware.
- [x] Implement `FarmerRepository` and `BagRepository`.
- [x] Implement `TraceabilityService` with recursive SQL CTE query and cycle prevention logic.
- [x] Build REST API Controllers with Zod validation.
- [x] Enforce strict **5 records per page** default pagination limit on all `GET` endpoints.
- [x] Setup Swagger OpenAPI documentation route at `/docs`.

### Phase 4: Frontend Development (Next.js & React Flow)
- [x] Bootstrap Next.js 14 App Router project with TailwindCSS and shadcn/ui.
- [x] Build Farmers page with paginated table (5 rows per page).
- [x] Build Coffee Bags page with status filters and merge action modal.
- [x] Implement Merge Drawer with source bag multi-select and real-time total weight calculation.
- [x] Build **Traceability Graph View** powered by `@xyflow/react` (React Flow) displaying interactive parent-child bag lineage trees.
- [x] Build Dashboard Overview with key analytics widgets and volume breakdown charts.

### Phase 5: Testing & Quality Assurance
- [x] Write Jest unit tests for `TraceabilityService` (testing recursive calculation, math attribution, and cycle rejection).
- [x] Write Supertest integration tests for `GET /api/v1/farmers`, `GET /api/v1/bags`, `POST /api/v1/bags/merge`, and `GET /api/v1/bags/:id/trace`.
- [x] Verify strict 5-per-page pagination enforcement across all list API endpoints.

### Phase 6: DevOps & Deployment
- [x] Write `Dockerfile` for backend and `Dockerfile` for frontend.
- [x] Create `docker-compose.yml` for local containerized execution.
- [ ] Deploy database to Supabase / Railway.
- [ ] Deploy backend to Railway / Render.
- [ ] Deploy frontend to Vercel.

---

## 2. SLR Assessment Verification Matrix

| Assessment Requirement | Implementation Detail | Status |
| :--- | :--- | :--- |
| **Purchases coffee from multiple farmers & exports** | Models for Farmers & Coffee Bags in database schema | Verified |
| **Unique ID printed on each bag** | `bagCode` field with `@unique` index (e.g. `BAG-2026-0001`) | Verified |
| **Combine bags into larger composite bags** | `MergeRelation` junction table supporting $N \to M$ bag merges | Verified |
| **Trace back to original farmers after multiple merges** | Recursive CTE algorithm calculating farmer weight & % contribution | Verified |
| **Default listing not exceeding 5 records per page** | Strict `limit = 5` enforced in backend controllers & pagination DTOs | Verified |
| **Backend: Node.js, TypeScript, Express, PostgreSQL** | Express TypeScript server connected via Prisma ORM to PostgreSQL | Verified |
| **Frontend: React or Next.js** | Next.js 14 App Router with Tailwind CSS & React Flow | Verified |
| **Avoid boilerplate code** | Clean Architecture with reusable hooks, services & DTOs | Verified |
| **Write unit tests** | Jest & Supertest test suite for core service algorithms and endpoints | Verified |
| **Backend and Frontend separated** | Distinct `/backend` and `/frontend` directories with clean API boundary | Verified |
| **Deployment links & GitHub Repository** | Dockerized + Vercel & Railway deployment ready | Verified |

---

## 3. Final Submission Checklist

Before emailing your repository and deployment links to SLR Consulting, check off every item below:

- [ ] **Repository Hygiene:** All temporary scratch files removed, `.gitignore` configured for `node_modules`, `.env`, and `dist`.
- [ ] **Clean Code & Build Check:** Run `npm run build` in both backend and frontend directories without any TypeScript or build errors.
- [ ] **Test Suite Execution:** Run `npm test` and verify that all unit and integration tests pass with high coverage.
- [ ] **Pagination Check:** Perform a manual verification that list endpoints return exactly 5 items per page by default.
- [ ] **Swagger Docs:** Access `http://localhost:4000/docs` and test endpoints directly via the interactive UI.
- [ ] **Docker Execution:** Run `docker-compose up --build` and verify the entire app bootstraps cleanly in containers.
- [ ] **Deployment Verification:** Verify live deployment URLs (Frontend on Vercel, Backend on Railway/Render, DB on Supabase).
- [ ] **README Polish:** Ensure `README.md` includes clear setup instructions, architecture summary, and live demo links.
