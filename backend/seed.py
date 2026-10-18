import sys
import os
from datetime import date, timedelta, datetime, timezone

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.session import engine, SessionLocal
from app.db.base import Base
from app.core.security import hash_password
from app.models.entities import (
    Mess, User, Dish, MealSlot, SlotDish, Rating, Skip, HeadcountLog, WasteLog, Action, TourProgress
)
from app.models.enums import UserRole, MealType, ActionStatus

def seed_database(db: SessionLocal = None):
    print("Initializing database tables...")
    should_close = False
    if db is None:
        db = SessionLocal()
        should_close = True

    try:
        # Check if already seeded
        existing_mess = db.query(Mess).filter(Mess.name == "Ashoka Hall of Residence Mess").first()
        if existing_mess:
            print("Database already contains Ashoka Hall Mess. Refreshing demo slots for today...")
            mess = existing_mess
        else:
            print("Creating default Mess entity...")
            mess = Mess(
                id="mess_ashoka_01",
                name="Ashoka Hall of Residence Mess",
                timezone="Asia/Kolkata",
                cutoff_minutes=60
            )
            db.add(mess)
            db.flush()

        # Seed Users
        demo_password = hash_password("Password123!")
        
        users_data = [
            {"id": "usr_std_01", "name": "Aarav Sharma", "email": "student@ashoka.edu", "role": UserRole.STUDENT},
            {"id": "usr_std_02", "name": "Priya Patel", "email": "priya@ashoka.edu", "role": UserRole.STUDENT},
            {"id": "usr_std_03", "name": "Rohit Verma", "email": "rohit@ashoka.edu", "role": UserRole.STUDENT},
            {"id": "usr_std_04", "name": "Ananya Sen", "email": "ananya@ashoka.edu", "role": UserRole.STUDENT},
            {"id": "usr_std_05", "name": "Vikram Rao", "email": "vikram@ashoka.edu", "role": UserRole.STUDENT},
            {"id": "usr_std_06", "name": "Sneha Das", "email": "sneha@ashoka.edu", "role": UserRole.STUDENT},
            {"id": "usr_stf_01", "name": "Ramesh Kumar (Kitchen Lead)", "email": "staff@ashoka.edu", "role": UserRole.STAFF},
            {"id": "usr_wdn_01", "name": "Dr. S. Mukherjee (Warden)", "email": "warden@ashoka.edu", "role": UserRole.WARDEN},
            {"id": "usr_adm_01", "name": "Campus Administrator", "email": "admin@ashoka.edu", "role": UserRole.ADMIN},
        ]

        for u in users_data:
            existing = db.query(User).filter(User.email == u["email"]).first()
            if not existing:
                user_obj = User(
                    id=u["id"],
                    mess_id=mess.id,
                    role=u["role"],
                    display_name=u["name"],
                    email=u["email"],
                    hashed_password=demo_password
                )
                db.add(user_obj)
        db.flush()

        # Seed Dish Catalogue
        dishes_data = [
            {"id": "d_dal_tadka", "name": "Dal Tadka", "veg": True, "cat": "Main"},
            {"id": "d_paneer_butter", "name": "Paneer Butter Masala", "veg": True, "cat": "Main"},
            {"id": "d_rice_basmati", "name": "Steamed Basmati Rice", "veg": True, "cat": "Side"},
            {"id": "d_tandoori_roti", "name": "Tandoori Roti", "veg": True, "cat": "Bread"},
            {"id": "d_gulab_jamun", "name": "Gulab Jamun", "veg": True, "cat": "Dessert"},
            {"id": "d_chicken_curry", "name": "Kadhai Chicken", "veg": False, "cat": "Main Non-Veg"},
            {"id": "d_poha", "name": "Indori Poha with Sev", "veg": True, "cat": "Breakfast"},
            {"id": "d_chai", "name": "Special Ginger Masala Chai", "veg": True, "cat": "Beverage"},
            {"id": "d_aloo_gobhi", "name": "Aloo Gobhi Adraki", "veg": True, "cat": "Side"},
            {"id": "d_mix_salad", "name": "Fresh Cucumber Tomato Salad", "veg": True, "cat": "Salad"},
        ]

        dish_map = {}
        for d in dishes_data:
            existing_d = db.query(Dish).filter(Dish.id == d["id"]).first()
            if not existing_d:
                d_obj = Dish(
                    id=d["id"],
                    mess_id=mess.id,
                    name=d["name"],
                    veg_flag=d["veg"],
                    category=d["cat"]
                )
                db.add(d_obj)
                dish_map[d["id"]] = d_obj
            else:
                dish_map[d["id"]] = existing_d
        db.flush()

        # Seed 7 days of Meal Slots (from 6 days ago up to today)
        today = date.today()
        slot_types = [
            (MealType.BREAKFAST, "07:30", "09:30", ["d_poha", "d_chai"]),
            (MealType.LUNCH, "12:30", "14:30", ["d_dal_tadka", "d_rice_basmati", "d_aloo_gobhi", "d_tandoori_roti"]),
            (MealType.SNACKS, "17:00", "18:00", ["d_chai"]),
            (MealType.DINNER, "19:30", "21:30", ["d_paneer_butter", "d_chicken_curry", "d_rice_basmati", "d_tandoori_roti", "d_gulab_jamun"])
        ]

        created_slots = []
        for day_offset in range(7):
            cur_date = today - timedelta(days=6 - day_offset)
            for mtype, stime, etime, dish_ids in slot_types:
                slot = db.query(MealSlot).filter(
                    MealSlot.mess_id == mess.id,
                    MealSlot.date == cur_date,
                    MealSlot.meal_type == mtype
                ).first()

                if not slot:
                    slot = MealSlot(
                        mess_id=mess.id,
                        date=cur_date,
                        meal_type=mtype,
                        start_time=stime,
                        end_time=etime
                    )
                    db.add(slot)
                    db.flush()

                    for did in dish_ids:
                        assoc = SlotDish(slot_id=slot.id, dish_id=did)
                        db.add(assoc)

                created_slots.append(slot)
        db.flush()

        # Seed Headcount & Waste for past days
        staff_user = db.query(User).filter(User.role == UserRole.STAFF).first()
        staff_id = staff_user.id if staff_user else "usr_stf_01"

        past_slots = [s for s in created_slots if s.date < today]
        for s in past_slots:
            if not s.headcount_log:
                # Typical headcount around 320 to 390
                hc = HeadcountLog(
                    slot_id=s.id,
                    served_count=350 + (s.date.day % 7) * 8,
                    entered_by=staff_id
                )
                db.add(hc)

            # Leftovers per dish
            for assoc in s.slot_dishes:
                wlog = db.query(WasteLog).filter(
                    WasteLog.slot_id == s.id,
                    WasteLog.dish_id == assoc.dish_id
                ).first()
                if not wlog:
                    # Rice and Dal produce 2.5 - 5.5 kg waste
                    base_kg = 4.2 if "rice" in assoc.dish_id else 2.1
                    wlog = WasteLog(
                        slot_id=s.id,
                        dish_id=assoc.dish_id,
                        leftover_kg=round(base_kg + (s.date.day % 4) * 0.4, 2),
                        notes="Normal dining service surplus",
                        entered_by=staff_id
                    )
                    db.add(wlog)

        # Seed Ratings specifically to test the Privacy Gate:
        # Dish Dal Tadka gets 6 ratings from different students (meets gate >= 5)
        # Dish Paneer Butter Masala gets only 2 ratings (does NOT meet gate, remains masked!)
        student_users = db.query(User).filter(User.role == UserRole.STUDENT).all()
        target_slot = [s for s in created_slots if s.date < today and s.meal_type == MealType.LUNCH][-1]
        
        # 6 ratings on Dal Tadka
        for idx, stu in enumerate(student_users[:6]):
            existing_r = db.query(Rating).filter(
                Rating.slot_id == target_slot.id,
                Rating.user_id == stu.id
            ).first()
            if not existing_r:
                score_val = 4 if idx % 2 == 0 else 5
                tags_list = ["taste", "temperature"] if score_val >= 4 else ["salt"]
                r = Rating(
                    slot_id=target_slot.id,
                    dish_id="d_dal_tadka",
                    user_id=stu.id,
                    score=score_val,
                    tags=tags_list,
                    comment="Well prepared and not too oily."
                )
                db.add(r)

        # 2 ratings on Paneer Butter Masala on Dinner slot
        dinner_slot = [s for s in created_slots if s.date < today and s.meal_type == MealType.DINNER][-1]
        for stu in student_users[:2]:
            existing_r = db.query(Rating).filter(
                Rating.slot_id == dinner_slot.id,
                Rating.user_id == stu.id
            ).first()
            if not existing_r:
                r = Rating(
                    slot_id=dinner_slot.id,
                    dish_id="d_paneer_butter",
                    user_id=stu.id,
                    score=5,
                    tags=["taste", "quantity"],
                    comment="Delicious paneer."
                )
                db.add(r)

        # Seed "You said, we did" Actions
        actions_data = [
            {
                "title": "Adjusted salt and spice in Dal Tadka",
                "desc": "Following 28 student remarks highlighting high salt on Tuesday lunch, chef adjusted spices and reduced salt by 20%.",
                "dish_id": "d_dal_tadka",
                "status": ActionStatus.RESOLVED,
                "outcome": "Salt complaints dropped to zero; dish satisfaction improved to 4.6/5."
            },
            {
                "title": "Staggered Roti baking during rush hour",
                "desc": "Students reported rotis getting cold when placed on buffet tables too early.",
                "dish_id": "d_tandoori_roti",
                "status": ActionStatus.IN_PROGRESS,
                "outcome": "Hot-box delivery schedule started. Fresh batch sent every 15 minutes."
            },
            {
                "title": "Evaluating Paneer quality supplier",
                "desc": "Reviewing dairy supplier after feedback regarding paneer texture.",
                "dish_id": "d_paneer_butter",
                "status": ActionStatus.OPEN,
                "outcome": "Samples from 2 local cooperative dairies being tested this week."
            }
        ]

        warden_user = db.query(User).filter(User.role == UserRole.WARDEN).first()
        warden_name = warden_user.display_name if warden_user else "Dr. S. Mukherjee"

        for a in actions_data:
            existing_act = db.query(Action).filter(Action.title == a["title"]).first()
            if not existing_act:
                act = Action(
                    mess_id=mess.id,
                    title=a["title"],
                    description=a["desc"],
                    linked_dish_id=a["dish_id"],
                    status=a["status"],
                    outcome=a["outcome"],
                    created_by=warden_name
                )
                db.add(act)

        db.commit()
        print("Database seed completed successfully with verified demonstration data!")

    except Exception as e:
        db.rollback()
        print(f"Error during database seed: {e}")
        raise
    finally:
        if should_close:
            db.close()

if __name__ == "__main__":
    seed_database()
