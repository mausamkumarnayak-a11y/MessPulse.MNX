# MessPulse System Architecture Documentation

## 1. High-Level Architecture
MessPulse uses a decoupled client-server architecture:
- **Client (Frontend)**: React 19 + TypeScript + Vite, packaged as an installable Progressive Web App (PWA). Employs modern sensory design (skeuomorphic tactile controls, neumorphic soft containers, glassmorphic floating overlays and modals) in a calm olive-green/warm amber palette.
- **Server (Backend)**: Python FastAPI application structured by domain routers (`auth`, `slots`, `ratings`, `skips`, `waste`, `insights`, `actions`, `help`, `tour`).
- **Database (Persistence)**: Relational database managed with SQLAlchemy 2.0 ORM and Alembic migrations. Works natively with PostgreSQL (production/Docker) and SQLite (zero-friction standalone development/testing).

```mermaid
flowchart TD
    subgraph Users
        S[Student: Mobile / Tablet]
        M[Mess Staff: Counter Tablet]
        W[Warden / Admin: Desktop / Laptop]
        P[Public / Campus Screen]
    end

    subgraph Client["React PWA (Vite + TypeScript)"]
        UI[Skeuomorphic Controls & Neumorphic Cards]
        PWA[Service Worker & Offline Cache]
        APIClient[Centralized API Client with Bearer Token]
    end

    subgraph Server["FastAPI Application (/api/v1)"]
        AuthRouter["/auth (JWT RBAC)"]
        SlotsRouter["/slots & /menus (Daily Service)"]
        RatingsRouter["/ratings (Anonymous, Gated)"]
        SkipsRouter["/skips (Cutoff Enforced)"]
        WasteRouter["/waste & /headcount"]
        InsightsRouter["/insights (Waste/Head & Forecasts)"]
        ActionsRouter["/actions (You Said, We Did)"]
        PublicRouter["/public (Aggregated Waste Meter)"]
        TourRouter["/tour (Progress Tracking)"]
        HelpRouter["/help (Role-Based Knowledge Base)"]
    end

    subgraph Persistence["Storage Layer"]
        DB[(PostgreSQL / SQLite Dual Engine)]
    end

    S --> UI
    M --> UI
    W --> UI
    P --> UI

    UI --> APIClient
    APIClient -->|JSON HTTP Request| Server
    Server -->|SQLAlchemy ORM Queries| DB
```

## 2. Core Entities & Relationships

```mermaid
erDiagram
    MESS ||--o{ USER : contains
    MESS ||--o{ MEAL_SLOT : schedules
    MESS ||--o{ DISH : offers
    MESS ||--o{ ACTION : tracks

    MEAL_SLOT ||--|{ SLOT_DISH : includes
    DISH ||--o{ SLOT_DISH : assigned_to

    MEAL_SLOT ||--o{ RATING : receives
    USER ||--o{ RATING : submits

    MEAL_SLOT ||--o{ SKIP : logs
    USER ||--o{ SKIP : marks

    MEAL_SLOT ||--o| HEADCOUNT_LOG : records
    MEAL_SLOT ||--o{ WASTE_LOG : measures
    DISH ||--o{ WASTE_LOG : leftovers_of

    USER ||--o{ TOUR_PROGRESS : tracks
```

## 3. Privacy by Design Enforcement
1. **Student Anonymity**: When a student submits a rating, `user_id` is recorded solely to enforce the unique constraint (one rating per student per meal slot).
2. **Identity Protection**: No staff or warden endpoint ever serializes or returns `user_id`, student names, or student identifiers alongside ratings.
3. **Rating Gate (Minimum Sample Size)**: Average dish scores and sentiment breakdowns are hidden and return a status of `insufficient_sample` until at least 5 distinct students have submitted ratings for that slot/dish.

## 4. Key Calculation Formulas
- **Waste Per Head (kg/person)**:
  $$\text{Waste Per Head} = \frac{\sum \text{leftover\_kg of all dishes for slot}}{\text{headcount\_served}}$$
- **Expected Headcount**:
  $$\text{Expected Headcount} = (\text{Registered Students} - \text{On-Time Skips}) \times \text{Historical Show-Up Rate}$$
  *(Historical show-up rate is calculated for the same weekday and meal type).*
