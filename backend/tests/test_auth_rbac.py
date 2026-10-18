import pytest
from fastapi.testclient import TestClient

def test_login_student_success(client: TestClient):
    resp = client.post("/api/v1/auth/login", json={
        "email": "student@ashoka.edu",
        "password": "Password123!"
    })
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert "access_token" in data
    assert data["user"]["role"] == "student"
    assert data["user"]["email"] == "student@ashoka.edu"

def test_login_invalid_password(client: TestClient):
    resp = client.post("/api/v1/auth/login", json={
        "email": "student@ashoka.edu",
        "password": "WrongPassword!"
    })
    assert resp.status_code == 401

def test_rbac_student_cannot_access_staff_insights(client: TestClient):
    # Log in as student
    login_resp = client.post("/api/v1/auth/login", json={
        "email": "student@ashoka.edu",
        "password": "Password123!"
    })
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Attempt to read staff/warden waste insights
    insights_resp = client.get("/api/v1/insights/waste", headers=headers)
    assert insights_resp.status_code == 403, "Student must receive 403 Forbidden on staff insights"

def test_rbac_staff_can_access_waste_insights(client: TestClient):
    login_resp = client.post("/api/v1/auth/login", json={
        "email": "staff@ashoka.edu",
        "password": "Password123!"
    })
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    insights_resp = client.get("/api/v1/insights/waste", headers=headers)
    assert insights_resp.status_code == 200
    data = insights_resp.json()
    assert "total_waste_kg" in data
    assert "waste_per_head_kg" in data
