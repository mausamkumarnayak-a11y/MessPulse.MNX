from typing import List, Optional
from datetime import datetime, date, timedelta, timezone
from zoneinfo import ZoneInfo
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.entities import MealSlot, Dish, SlotDish, Mess, Skip, Rating, User
from app.models.enums import MealType, UserRole
from app.schemas import (
    MealSlotResponse, DishResponse, DishCreate, DayMenuUpdateRequest
)
from app.core.security import get_current_user, require_staff_or_warden

router = APIRouter(tags=["Meal Slots & Menus"])

def is_cutoff_passed(slot: MealSlot, mess: Mess) -> bool:
    """Checks whether the cutoff time for skipping/editing has passed based on mess timezone."""
    try:
        tz = ZoneInfo(mess.timezone)
    except Exception:
        tz = timezone.utc

    now_local = datetime.now(tz)
    
    # Parse slot start time HH:MM
    try:
        shour, smin = map(int, slot.start_time.split(":"))
    except Exception:
        shour, smin = 8, 0

    slot_start_dt = datetime(
        year=slot.date.year,
        month=slot.date.month,
        day=slot.date.day,
        hour=shour,
        minute=smin,
        tzinfo=tz
    )

    cutoff_dt = slot_start_dt - timedelta(minutes=mess.cutoff_minutes)
    return now_local >= cutoff_dt

def format_cutoff_label(slot: MealSlot, mess: Mess) -> str:
    """Creates a user-friendly string of when the cutoff occurs."""
    try:
        shour, smin = map(int, slot.start_time.split(":"))
        base_mins = shour * 60 + smin
        cutoff_mins = base_mins - mess.cutoff_minutes
        if cutoff_mins < 0:
            cutoff_mins += 24 * 60
        chour = (cutoff_mins // 60) % 24
        cmin = cutoff_mins % 60
        ampm = "AM" if chour < 12 else "PM"
        display_hour = chour % 12
        if display_hour == 0:
            display_hour = 12
        return f"{display_hour}:{cmin:02d} {ampm}"
    except Exception:
        return f"{mess.cutoff_minutes} mins before meal"

@router.get("/slots/today", response_model=List[MealSlotResponse])
def get_today_slots(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves today's meal slots with dishes, skip status, and rating state for the caller."""
    mess = db.query(Mess).filter(Mess.id == current_user.mess_id).first()
    if not mess:
        raise HTTPException(status_code=404, detail="Mess not found")

    today = date.today()
    slots = db.query(MealSlot).filter(
        MealSlot.mess_id == mess.id,
        MealSlot.date == today
    ).order_by(MealSlot.start_time).all()

    # Pre-fetch user skips and ratings for today's slots
    user_skips = {
        s.slot_id for s in db.query(Skip).filter(
            Skip.user_id == current_user.id,
            Skip.slot_id.in_([s.id for s in slots])
        ).all()
    }

    user_ratings = {
        r.slot_id: r.score for r in db.query(Rating).filter(
            Rating.user_id == current_user.id,
            Rating.slot_id.in_([s.id for s in slots])
        ).all()
    }

    results = []
    for s in slots:
        passed = is_cutoff_passed(s, mess)
        cutoff_label = format_cutoff_label(s, mess)
        
        dishes = [
            DishResponse.model_validate(assoc.dish)
            for assoc in s.slot_dishes
        ]

        total_waste = sum(w.leftover_kg for w in s.waste_logs) if s.waste_logs else None
        headcount = s.headcount_log.served_count if s.headcount_log else None

        results.append(MealSlotResponse(
            id=s.id,
            mess_id=s.mess_id,
            date=s.date,
            meal_type=s.meal_type,
            start_time=s.start_time,
            end_time=s.end_time,
            dishes=dishes,
            is_skipped=(s.id in user_skips),
            is_rated=(s.id in user_ratings),
            user_rating=user_ratings.get(s.id),
            can_skip=(not passed),
            cutoff_time_str=cutoff_label,
            headcount_served=headcount,
            total_waste_kg=round(total_waste, 2) if total_waste is not None else None
        ))

    return results

@router.get("/slots/by-date/{date_str}", response_model=List[MealSlotResponse])
def get_slots_by_date(
    date_str: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves meal slots for a specific date (YYYY-MM-DD)."""
    try:
        target_date = date.fromisoformat(date_str)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    mess = db.query(Mess).filter(Mess.id == current_user.mess_id).first()
    if not mess:
        raise HTTPException(status_code=404, detail="Mess not found")

    slots = db.query(MealSlot).filter(
        MealSlot.mess_id == mess.id,
        MealSlot.date == target_date
    ).order_by(MealSlot.start_time).all()

    user_skips = {
        s.slot_id for s in db.query(Skip).filter(
            Skip.user_id == current_user.id,
            Skip.slot_id.in_([s.id for s in slots])
        ).all()
    }
    user_ratings = {
        r.slot_id: r.score for r in db.query(Rating).filter(
            Rating.user_id == current_user.id,
            Rating.slot_id.in_([s.id for s in slots])
        ).all()
    }

    results = []
    for s in slots:
        passed = is_cutoff_passed(s, mess)
        cutoff_label = format_cutoff_label(s, mess)
        dishes = [DishResponse.model_validate(assoc.dish) for assoc in s.slot_dishes]
        total_waste = sum(w.leftover_kg for w in s.waste_logs) if s.waste_logs else None
        headcount = s.headcount_log.served_count if s.headcount_log else None

        results.append(MealSlotResponse(
            id=s.id,
            mess_id=s.mess_id,
            date=s.date,
            meal_type=s.meal_type,
            start_time=s.start_time,
            end_time=s.end_time,
            dishes=dishes,
            is_skipped=(s.id in user_skips),
            is_rated=(s.id in user_ratings),
            user_rating=user_ratings.get(s.id),
            can_skip=(not passed),
            cutoff_time_str=cutoff_label,
            headcount_served=headcount,
            total_waste_kg=round(total_waste, 2) if total_waste is not None else None
        ))
    return results

@router.get("/dishes", response_model=List[DishResponse])
def list_dishes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Returns the dish catalogue for the user's mess."""
    return db.query(Dish).filter(Dish.mess_id == current_user.mess_id).order_by(Dish.name).all()

@router.post("/dishes", response_model=DishResponse, status_code=status.HTTP_201_CREATED)
def create_dish(
    dish_in: DishCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff_or_warden)
):
    """Creates a new dish entry in the catalogue (Staff, Warden, Admin)."""
    dish = Dish(
        mess_id=current_user.mess_id,
        name=dish_in.name.strip(),
        veg_flag=dish_in.veg_flag,
        category=dish_in.category
    )
    db.add(dish)
    db.commit()
    db.refresh(dish)
    return dish

@router.put("/menus/{date_str}", status_code=status.HTTP_200_OK)
def update_menu_for_date(
    date_str: str,
    menu_data: DayMenuUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff_or_warden)
):
    """Creates or updates all meal slots and assigned dishes for a given calendar date."""
    try:
        target_date = date.fromisoformat(date_str)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    mess_id = current_user.mess_id

    for slot_item in menu_data.slots:
        # Check if slot already exists
        slot = db.query(MealSlot).filter(
            MealSlot.mess_id == mess_id,
            MealSlot.date == target_date,
            MealSlot.meal_type == slot_item.meal_type
        ).first()

        if not slot:
            slot = MealSlot(
                mess_id=mess_id,
                date=target_date,
                meal_type=slot_item.meal_type,
                start_time=slot_item.start_time,
                end_time=slot_item.end_time
            )
            db.add(slot)
            db.flush()
        else:
            slot.start_time = slot_item.start_time
            slot.end_time = slot_item.end_time

        # Update dish associations: remove existing and re-insert
        db.query(SlotDish).filter(SlotDish.slot_id == slot.id).delete()
        for dish_id in slot_item.dish_ids:
            # Verify dish exists in mess
            dish = db.query(Dish).filter(Dish.id == dish_id, Dish.mess_id == mess_id).first()
            if dish:
                assoc = SlotDish(slot_id=slot.id, dish_id=dish.id)
                db.add(assoc)

    db.commit()
    return {"message": f"Menu successfully updated for {date_str}"}
