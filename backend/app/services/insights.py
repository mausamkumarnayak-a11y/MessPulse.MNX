from typing import List, Dict, Any, Optional
from datetime import datetime, date, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func, select

from app.models.entities import (
    Mess, MealSlot, Dish, SlotDish, Rating, Skip, HeadcountLog, WasteLog, User
)
from app.models.enums import MealType, UserRole
from app.core.config import settings

def calculate_waste_metrics(
    db: Session,
    mess_id: str,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
) -> Dict[str, Any]:
    """Calculates overall leftover kg, total headcount served, and waste per head."""
    if not start_date:
        start_date = date.today() - timedelta(days=30)
    if not end_date:
        end_date = date.today()

    slots_query = db.query(MealSlot).filter(
        MealSlot.mess_id == mess_id,
        MealSlot.date >= start_date,
        MealSlot.date <= end_date
    )
    slots = slots_query.all()
    slot_ids = [s.id for s in slots]

    if not slot_ids:
        return {
            "total_waste_kg": 0.0,
            "total_headcount_served": 0,
            "waste_per_head_kg": 0.0,
            "days_analyzed": (end_date - start_date).days + 1,
            "top_wasted_dishes": [],
            "daily_trend": []
        }

    # Total waste recorded
    total_waste_result = db.query(func.coalesce(func.sum(WasteLog.leftover_kg), 0.0))\
        .filter(WasteLog.slot_id.in_(slot_ids)).scalar() or 0.0

    # Total headcount served
    total_headcount = db.query(func.coalesce(func.sum(HeadcountLog.served_count), 0))\
        .filter(HeadcountLog.slot_id.in_(slot_ids)).scalar() or 0

    waste_per_head = round(total_waste_result / total_headcount, 3) if total_headcount > 0 else 0.0

    # Waste grouped by dish
    dish_waste_rows = db.query(
        Dish.id,
        Dish.name,
        func.sum(WasteLog.leftover_kg).label("total_kg"),
        func.count(WasteLog.id).label("entry_count"),
        func.avg(WasteLog.leftover_kg).label("avg_kg")
    ).join(WasteLog, WasteLog.dish_id == Dish.id)\
     .filter(WasteLog.slot_id.in_(slot_ids))\
     .group_by(Dish.id, Dish.name)\
     .order_by(func.sum(WasteLog.leftover_kg).desc())\
     .all()

    top_wasted = [
        {
            "dish_id": r.id,
            "dish_name": r.name,
            "total_waste_kg": round(float(r.total_kg), 2),
            "avg_leftover_per_slot_kg": round(float(r.avg_kg), 2),
            "service_count": r.entry_count
        }
        for r in dish_waste_rows
    ]

    # Daily trend calculation
    daily_trend_map: Dict[str, Dict[str, Any]] = {}
    for i in range(7):
        d = end_date - timedelta(days=6 - i)
        daily_trend_map[d.isoformat()] = {
            "date": d.isoformat(),
            "weekday": d.strftime("%a"),
            "waste_kg": 0.0,
            "headcount": 0
        }

    daily_waste = db.query(
        MealSlot.date,
        func.sum(WasteLog.leftover_kg).label("day_waste")
    ).join(WasteLog, WasteLog.slot_id == MealSlot.id)\
     .filter(MealSlot.mess_id == mess_id, MealSlot.date >= (end_date - timedelta(days=6)), MealSlot.date <= end_date)\
     .group_by(MealSlot.date).all()

    for dw in daily_waste:
        k = dw.date.isoformat()
        if k in daily_trend_map:
            daily_trend_map[k]["waste_kg"] = round(float(dw.day_waste or 0.0), 2)

    daily_hc = db.query(
        MealSlot.date,
        func.sum(HeadcountLog.served_count).label("day_headcount")
    ).join(HeadcountLog, HeadcountLog.slot_id == MealSlot.id)\
     .filter(MealSlot.mess_id == mess_id, MealSlot.date >= (end_date - timedelta(days=6)), MealSlot.date <= end_date)\
     .group_by(MealSlot.date).all()

    for dh in daily_hc:
        k = dh.date.isoformat()
        if k in daily_trend_map:
            daily_trend_map[k]["headcount"] = int(dh.day_headcount or 0)

    return {
        "total_waste_kg": round(float(total_waste_result), 2),
        "total_headcount_served": int(total_headcount),
        "waste_per_head_kg": waste_per_head,
        "days_analyzed": (end_date - start_date).days + 1,
        "top_wasted_dishes": top_wasted,
        "daily_trend": list(daily_trend_map.values())
    }


def calculate_rating_insights(
    db: Session,
    mess_id: str,
    min_sample_size: int = settings.MINIMUM_RATING_SAMPLE_SIZE
) -> Dict[str, Any]:
    """Calculates ratings insights with strict backend enforcement of the privacy gate."""
    slots = db.query(MealSlot.id).filter(MealSlot.mess_id == mess_id).all()
    slot_ids = [s.id for s in slots]

    if not slot_ids:
        return {
            "total_ratings_count": 0,
            "overall_average_score": None,
            "sample_size_met": False,
            "status_message": "No ratings recorded yet.",
            "tag_breakdown": {},
            "dish_scores": []
        }

    ratings = db.query(Rating).filter(Rating.slot_id.in_(slot_ids)).all()
    total_ratings = len(ratings)

    # Tag frequency count
    tag_counts: Dict[str, int] = {
        "taste": 0, "salt": 0, "oil": 0, "temperature": 0, "quantity": 0, "hygiene": 0
    }
    for r in ratings:
        if r.tags and isinstance(r.tags, list):
            for t in r.tags:
                t_lower = str(t).lower().strip()
                tag_counts[t_lower] = tag_counts.get(t_lower, 0) + 1

    overall_avg = round(sum(r.score for r in ratings) / total_ratings, 2) if total_ratings > 0 else None
    overall_sample_met = total_ratings >= min_sample_size

    # Dish-level ratings with Privacy Gate
    dishes = db.query(Dish).filter(Dish.mess_id == mess_id).all()
    dish_scores_list = []

    for dish in dishes:
        dish_ratings = [r for r in ratings if r.dish_id == dish.id]
        count = len(dish_ratings)
        met = count >= min_sample_size

        avg_score = round(sum(r.score for r in dish_ratings) / count, 2) if met and count > 0 else None
        status_note = (
            f"Active score from {count} ratings" if met 
            else f"Hidden for anonymity ({count}/{min_sample_size} ratings submitted)"
        )

        dish_scores_list.append({
            "dish_id": dish.id,
            "dish_name": dish.name,
            "rating_count": count,
            "average_score": avg_score,
            "sample_size_met": met,
            "status_note": status_note
        })

    # Sort dish scores: first ones with ratings met
    dish_scores_list.sort(key=lambda x: (x["sample_size_met"], x["rating_count"]), reverse=True)

    status_msg = (
        f"Aggregated from {total_ratings} student responses." if overall_sample_met
        else f"Gathering responses: {total_ratings}/{min_sample_size} received so far."
    )

    return {
        "total_ratings_count": total_ratings,
        "overall_average_score": overall_avg if overall_sample_met else None,
        "sample_size_met": overall_sample_met,
        "status_message": status_msg,
        "tag_breakdown": tag_counts,
        "dish_scores": dish_scores_list
    }


def calculate_expected_headcount(
    db: Session,
    slot_id: str
) -> Dict[str, Any]:
    """Computes expected headcount based on registered students, skips, and historical show-up rate."""
    slot = db.query(MealSlot).filter(MealSlot.id == slot_id).first()
    if not slot:
        return {
            "slot_id": slot_id,
            "meal_type": MealType.LUNCH,
            "registered_students": 450,
            "skips_recorded": 0,
            "historical_showup_rate": 0.88,
            "expected_headcount": 396,
            "expected_range_low": 380,
            "expected_range_high": 412,
            "confidence_note": "Default baseline estimate"
        }

    # Count registered students in this mess
    registered_students = db.query(func.count(User.id)).filter(
        User.mess_id == slot.mess_id,
        User.role == UserRole.STUDENT
    ).scalar() or 0

    if registered_students == 0:
        registered_students = 450  # Fallback standard mess capacity

    # Skips for this slot
    skips_recorded = db.query(func.count(Skip.id)).filter(Skip.slot_id == slot.id).scalar() or 0

    # Historical show-up rate for same meal type and same weekday over past 30 days
    weekday_val = slot.date.weekday()
    past_slots = db.query(MealSlot).filter(
        MealSlot.mess_id == slot.mess_id,
        MealSlot.meal_type == slot.meal_type,
        MealSlot.date < slot.date,
        MealSlot.date >= (slot.date - timedelta(days=30))
    ).all()

    past_rates = []
    for ps in past_slots:
        if ps.date.weekday() == weekday_val and ps.headcount_log:
            attended = ps.headcount_log.served_count
            ps_skips = len(ps.skips)
            eligible = max(1, registered_students - ps_skips)
            rate = min(1.0, max(0.5, attended / eligible))
            past_rates.append(rate)

    if len(past_rates) >= 2:
        historical_showup_rate = round(sum(past_rates) / len(past_rates), 2)
        confidence_note = f"Based on {len(past_rates)} past matching {slot.date.strftime('%A')} {slot.meal_type.value} services"
    else:
        historical_showup_rate = 0.88  # Industry typical hostel show-up rate
        confidence_note = "Using initial baseline (88% show-up) until 2 weeks of matching history accumulates"

    net_eligible = max(0, registered_students - skips_recorded)
    expected_headcount = int(round(net_eligible * historical_showup_rate))
    margin = max(5, int(round(expected_headcount * 0.05)))

    return {
        "slot_id": slot.id,
        "meal_type": slot.meal_type,
        "registered_students": registered_students,
        "skips_recorded": skips_recorded,
        "historical_showup_rate": historical_showup_rate,
        "expected_headcount": expected_headcount,
        "expected_range_low": max(0, expected_headcount - margin),
        "expected_range_high": expected_headcount + margin,
        "confidence_note": confidence_note
    }
