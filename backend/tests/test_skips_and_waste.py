import pytest
from datetime import date, timedelta
from fastapi.testclient import TestClient
from app.models.entities import MealSlot, Mess
from app.models.enums import MealType

def test_skip_workflow_and_undo(client: TestClient, db_session):
    # Log in as student
    login_resp = client.post("/api/v1/auth/login", json={
        "email": "student@ashoka.edu",
        "password": "Password123!"
    })
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create a future slot tomorrow to ensure cutoff hasn't passed
    tomorrow = date.today() + timedelta(days=1)
    slot = db_session.query(MealSlot).filter(
        MealSlot.date == tomorrow,
        MealSlot.meal_type == MealType.DINNER
    ).first()

    if not slot:
        mess = db_session.query(Mess).first()
        slot = MealSlot(
            mess_id=mess.id,
            date=tomorrow,
            meal_type=MealType.DINNER,
            start_time="20:00",
            end_time="22:00"
        )
        db_session.add(slot)
        db_session.commit()
        db_session.refresh(slot)

    # 1. Mark skip
    skip_resp = client.post(f"/api/v1/slots/{slot.id}/skip", headers=headers)
    assert skip_resp.status_code == 201

    # 2. Undo skip
    undo_resp = client.delete(f"/api/v1/slots/{slot.id}/skip", headers=headers)
    assert undo_resp.status_code == 200

def test_staff_waste_and_headcount_logging(client: TestClient, db_session):
    # Log in as staff
    login_resp = client.post("/api/v1/auth/login", json={
        "email": "staff@ashoka.edu",
        "password": "Password123!"
    })
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Select today's lunch slot
    today = date.today()
    slot = db_session.query(MealSlot).filter(MealSlot.date == today).first()
    assert slot is not None

    # Log headcount
    hc_resp = client.post(f"/api/v1/slots/{slot.id}/headcount", json={
        "served_count": 360
    }, headers=headers)
    assert hc_resp.status_code == 200
    assert hc_resp.json()["served_count"] == 360

    # Log waste per dish
    waste_resp = client.post(f"/api/v1/slots/{slot.id}/waste", json={
        "entries": [
            {"dish_id": "d_dal_tadka", "leftover_kg": 3.5, "notes": "Cold day surplus"},
            {"dish_id": "d_rice_basmati", "leftover_kg": 5.2, "notes": "Leftover in trays"}
        ]
    }, headers=headers)
    assert waste_resp.status_code == 200
    entries = waste_resp.json()
    assert len(entries) >= 2
    assert entries[0]["leftover_kg"] in (3.5, 5.2)

def test_public_waste_meter_endpoint(client: TestClient):
    # Public endpoint requires NO token
    resp = client.get("/api/v1/public/waste-meter")
    assert resp.status_code == 200
    data = resp.json()
    assert "total_waste_this_week_kg" in data
    assert "daily_history" in data
    assert len(data["daily_history"]) == 7
