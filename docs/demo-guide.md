# MessPulse Local Demonstration & Evaluation Guide

This guide describes how to run and demonstrate the complete MessPulse application locally.

## Pre-configured Demo Accounts

All demo accounts share the password: `Password123!`

| Role | Email | Password | Intended Workflow |
|---|---|---|---|
| **Student** | `student@ashoka.edu` | `Password123!` | Today's Menu, 5-Second Rating, Skip/Undo-Skip, Personal Impact, Tour |
| **Mess Staff** | `staff@ashoka.edu` | `Password123!` | Daily Entry (Headcount & Leftovers), Menu Editor, Expected Headcount |
| **Warden** | `warden@ashoka.edu` | `Password123!` | Waste Dashboard, Anonymous Ratings Gate, Action Tracker ("You Said, We Did") |
| **Administrator**| `admin@ashoka.edu` | `Password123!` | System overview, Mess settings, Full administrative oversight |

---

## 1. Quick Local Start (Windows)

### Terminal 1: Backend
```powershell
cd messpulse/backend
# Activate virtual environment
.\venv\Scripts\Activate.ps1
# Seed database with demo data
python seed.py
# Start FastAPI backend server
uvicorn app.main:app --reload --port 8000
```
Backend API will be accessible at: `http://localhost:8000`
Interactive Swagger Docs: `http://localhost:8000/docs`

### Terminal 2: Frontend
```powershell
cd messpulse/frontend
npm run dev
```
Frontend web application will run at: `http://localhost:5173`

---

## 2. Docker Start (Optional)
```bash
docker compose up --build
```

---

## 3. Six Verifiable End-to-End Demonstration Flows

1. **Flow 1: Student Rating**
   - Log in as `student@ashoka.edu`.
   - On the "Today" menu card, select a rating from 1 to 5 stars.
   - Choose tags (e.g. *Taste*, *Oil*) and optionally type a short remark.
   - Tap "Submit Rating" (with tactile press effect & confetti). Refresh to verify persistence.

2. **Flow 2: Meal Skip with Cutoff Enforcement**
   - Tap "Skip Meal" on an upcoming meal slot.
   - Notice the status updates to "Skipped" and the button changes to "Undo Skip".
   - Notice that if the cutoff time has passed, the button is safely locked with an explanatory badge.

3. **Flow 3: Kitchen Food-Waste Logging**
   - Log in as `staff@ashoka.edu`.
   - Open the "Daily Entry" screen.
   - Record headcount (e.g. 350 served) and enter leftover kg for each dish (e.g. 3.2 kg rice).
   - Tap "Save Entry". The waste and headcount metrics are instantly recorded in the database.

4. **Flow 4: Aggregated Insights & Privacy Gate**
   - Log in as `warden@ashoka.edu`.
   - Open the Waste Dashboard to view Waste-per-head metrics and Top Wasted Dishes.
   - Open Ratings Dashboard. Notice the rating display gate: if a dish has fewer than 5 ratings, it displays *"Not enough data yet (minimum 5 ratings required for anonymity)"*.

5. **Flow 5: "You Said, We Did" Action Tracker**
   - As Warden, open the Action Tracker and log a new action (e.g. *"Adjusted Dal Tadka spice blend"*).
   - Switch to Student or Public view to see the new action live in the "You Said, We Did" board.

6. **Flow 6: Public Waste Meter & First-Time Quick Tour**
   - Open the app without logging in or click "Public Waste Meter".
   - Observe live aggregated food-waste statistics and 7-day trends.
   - Test the interactive role-based onboarding tour.
