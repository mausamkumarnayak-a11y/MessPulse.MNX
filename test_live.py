import urllib.request
import json

def test_endpoints():
    print("Testing Backend Health...")
    with urllib.request.urlopen("http://127.0.0.1:8000/api/v1/health") as res:
        health_data = json.loads(res.read().decode())
        print("Backend Health Response:", health_data)
        assert health_data["status"] == "healthy"

    print("Testing Public Waste Meter...")
    with urllib.request.urlopen("http://127.0.0.1:8000/api/v1/public/waste-meter") as res:
        meter_data = json.loads(res.read().decode())
        print("Mess Name:", meter_data["mess_name"])
        print("Weekly Waste:", meter_data["total_waste_this_week_kg"], "kg")
        print("Waste per Student:", meter_data["waste_per_student_per_meal_kg"], "kg")
        print("Daily Trend Records:", len(meter_data["daily_history"]))
        assert len(meter_data["daily_history"]) == 7

    print("Testing Frontend HTTP Server...")
    with urllib.request.urlopen("http://127.0.0.1:5173/") as res:
        code = res.getcode()
        print("Frontend HTTP Status Code:", code)
        assert code == 200

    print("\nALL LIVE INTEGRATION CHECKS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_endpoints()
