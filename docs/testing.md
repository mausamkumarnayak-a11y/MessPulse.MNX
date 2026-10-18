# MessPulse Testing Strategy & Quality Assurance Guide

## Test Matrix
The quality assurance plan verifies all core business rules, privacy guarantees, and permissions outlined in Section 11 of the product specification.

| Test Category | Target Area | Tooling | Success Metric |
|---|---|---|---|
| **Unit Tests** | Formulas: Waste per head, Expected Headcount | Pytest | Zero discrepancy against hand-calculated samples |
| **RBAC Authorization** | Access control across 4 roles (Student, Staff, Warden, Admin) | Pytest + FastAPI TestClient | 403 Forbidden for unauthorized attempts |
| **Privacy Audit** | Student identity isolation | Automated Response Inspection | `user_id`, student name, and IP absent from staff/warden rating responses |
| **Rating Gate** | Minimum sample size (5 ratings) | Pytest API Test | Average withheld until 5th rating submitted |
| **Cutoff Enforcement** | Skip & Undo-skip time restrictions | Pytest API Test | 400 Bad Request returned if skip attempted after cutoff |
| **Frontend Health** | Type soundness & build bundle | Vite + TypeScript (`tsc`) | Clean compilation with zero build errors |

---

## Running the Automated Test Suite

### Backend Tests
```bash
# From messpulse/backend:
venv\Scripts\pytest.exe -v
```

### Frontend Type & Build Verification
```bash
# From messpulse/frontend:
npm run build
```
