# MessPulse Requirements Traceability Checklist

This checklist maps the requirements from the **MessPulse Project Documentation (Hacktober Fest 2026)** to the application's implementation files, endpoints, components, and tests.

| Status | Code | Requirement | Document Section | Implementation Location | Verification Method |
|---|---|---|---|---|---|
| [x] | ARCH-1 | React + Vite + TypeScript PWA Frontend | Sec 9.1 | `frontend/` | Vite build & PWA manifest verification |
| [x] | ARCH-2 | Python FastAPI REST API Backend | Sec 9.1 | `backend/app/main.py` | FastAPI OpenAPI documentation & pytest |
| [x] | ARCH-3 | PostgreSQL / SQLite Relational ORM | Sec 9.1, 9.2 | `backend/app/db/` | SQLAlchemy 2.0 models & Alembic migrations |
| [x] | ARCH-4 | JWT Session & Role-Based Access Control | Sec 9.1, 9.5 | `backend/app/core/security.py`, `app/api/auth.py` | Role check unit tests (Student, Staff, Warden, Admin) |
| [x] | UX-1 | Skeuomorphic tactile buttons, toggles, sliders | User Prompt | `frontend/src/styles/design-system.css` | Visual & interactive testing |
| [x] | UX-2 | Neumorphic containers, cards, and input screens | User Prompt | `frontend/src/styles/design-system.css` | Visual & interactive testing |
| [x] | UX-3 | Glassmorphic modals, floating bars, and headers | User Prompt | `frontend/src/styles/design-system.css` | Translucent blur inspection |
| [x] | UX-4 | Olive Green & Warm Amber palette | Sec 10.1 | CSS Custom Properties | WCAG AA contrast check |
| [x] | STUD-1 | Today's Menu by meal slot & veg/non-veg tags | Sec 7.1, 9.3 | `GET /api/v1/slots/today`, `StudentToday.tsx` | View today's meal slots & dish items |
| [x] | STUD-2 | 5-Second One-Tap Anonymous Rating | Sec 7.1, 9.3 | `POST /api/v1/slots/{id}/rating`, `RatingModal.tsx` | Rate 1-5, select tags (taste, salt, oil, etc.) |
| [x] | PRIV-1 | Privacy: Student identities NEVER exposed to staff | Sec 8.3, 9.5 | Backend queries never return `user_id` on ratings | API response audit & unit test |
| [x] | PRIV-2 | Rating Gate: Min 5 ratings required before score display | Sec 8.3, 9.4 | `backend/app/services/insights.py` | Less than 5 shows "Not enough data yet" |
| [x] | STUD-3 | Skip-a-Meal with configurable cutoff time | Sec 7.1, 9.3 | `POST /api/v1/slots/{id}/skip`, `StudentSkip.tsx` | Enforces cutoff based on slot time - cutoff_minutes |
| [x] | STUD-4 | Undo Skip before cutoff | Sec 7.1, 9.3 | `DELETE /api/v1/slots/{id}/skip` | Can undo skip if before cutoff; locked afterwards |
| [x] | STAF-1 | Staff Daily Entry: Headcount and Leftover kg per dish | Sec 7.2, 9.3 | `POST /api/v1/slots/{id}/headcount`, `/waste` | Form validation & data persistence |
| [x] | STAF-2 | Expected Headcount transparent estimation | Sec 7.2, 9.4 | `GET /api/v1/insights/expected-headcount` | Registered minus skips * historical show-up rate |
| [x] | STAF-3 | Menu Editor & weekly copy | Sec 7.2, 9.3 | `PUT /api/v1/menus/{date}`, `StaffMenuEditor.tsx` | Create/edit slots and dish associations |
| [x] | WARD-1 | Waste & Rating Analytics Dashboards | Sec 7.3, 9.4 | `GET /api/v1/insights/waste`, `insights/ratings` | Waste per head, per dish, weekly trends |
| [x] | WARD-2 | Action Tracker ("You said, we did") | Sec 7.3, 9.3 | `GET, POST, PATCH /api/v1/actions` | Warden creates/updates; public views resolved actions |
| [x] | PUBL-1 | Public Waste Meter | Sec 7.1, 9.3 | `GET /api/v1/public/waste-meter`, `PublicWasteMeter.tsx` | Real aggregated waste metrics without login |
| [x] | TOUR-1 | In-built Quick Tour for first-time visitors | Sec 8.1, 9.3 | `frontend/src/components/tour/`, `/api/v1/tour/progress` | Interactive role-specific practice tour |
| [x] | HELP-1 | In-App Help Centre & User Guide | Sec 8.2, 9.3 | `frontend/src/pages/help/`, `/api/v1/help/articles` | Searchable guides by role, FAQs, troubleshooting |
| [x] | TEST-1 | Automated Test Suite (Pytest) | Sec 11 | `backend/tests/` | Tests for auth, ratings gate, skips cutoff, waste calc |
| [x] | TEST-2 | End-to-End QA Integration Audit Suite | User Prompt | `test_audit_suite.py`, `docs/audit-report.md` | Full multi-persona live database audit (10/10 PASS) |

