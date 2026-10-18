import pytest
from fastapi.testclient import TestClient

def test_student_rating_submission_and_privacy(client: TestClient):
    # Log in as student
    login_resp = client.post("/api/v1/auth/login", json={
        "email": "student@ashoka.edu",
        "password": "Password123!"
    })
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch today's slots
    slots_resp = client.get("/api/v1/slots/today", headers=headers)
    assert slots_resp.status_code == 200
    slots = slots_resp.json()
    assert len(slots) > 0
    slot_id = slots[0]["id"]

    # Submit a rating
    rate_resp = client.post(f"/api/v1/slots/{slot_id}/rating", json={
        "score": 5,
        "tags": ["taste", "temperature"],
        "comment": "Crispy and hot!"
    }, headers=headers)

    assert rate_resp.status_code == 201
    rating_data = rate_resp.json()
    assert rating_data["score"] == 5
    assert "user_id" not in rating_data, "Student user_id must NEVER be returned in rating response"
    assert "user" not in rating_data

def test_rating_privacy_gate_enforcement(client: TestClient):
    # Log in as warden
    login_resp = client.post("/api/v1/auth/login", json={
        "email": "warden@ashoka.edu",
        "password": "Password123!"
    })
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Retrieve ratings insights
    insights_resp = client.get("/api/v1/insights/ratings", headers=headers)
    assert insights_resp.status_code == 200
    data = insights_resp.json()

    dish_scores = data["dish_scores"]
    assert len(dish_scores) > 0

    # Locate Dal Tadka (seeded with >= 5 ratings)
    dal = next((d for d in dish_scores if d["dish_id"] == "d_dal_tadka"), None)
    assert dal is not None
    assert dal["sample_size_met"] is True, "Dal Tadka should have met >= 5 ratings gate"
    assert dal["average_score"] is not None

    # Locate Paneer Butter Masala (seeded with only 2 ratings)
    paneer = next((d for d in dish_scores if d["dish_id"] == "d_paneer_butter"), None)
    assert paneer is not None
    assert paneer["sample_size_met"] is False, "Paneer should NOT meet sample size gate (< 5)"
    assert paneer["average_score"] is None, "Average score must be masked/withheld until 5 ratings"
