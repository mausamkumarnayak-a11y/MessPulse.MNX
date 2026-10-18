from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.entities import MealSlot, Mess, Skip, User
from app.schemas import SkipResponse
from app.core.security import require_student
from app.api.slots import is_cutoff_passed, format_cutoff_label

router = APIRouter(tags=["Meal Skips"])

@router.post("/slots/{slot_id}/skip", response_model=SkipResponse, status_code=status.HTTP_201_CREATED)
def mark_skip(
    slot_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student)
):
    """Marks a meal as skipped ahead of the cutoff time to prevent kitchen over-preparation."""
    slot = db.query(MealSlot).filter(MealSlot.id == slot_id).first()
    if not slot:
        raise HTTPException(status_code=404, detail="Meal slot not found")

    mess = db.query(Mess).filter(Mess.id == slot.mess_id).first()
    if is_cutoff_passed(slot, mess):
        cutoff_time = format_cutoff_label(slot, mess)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cutoff passed ({cutoff_time}). Meal preparation has already begun."
        )

    existing_skip = db.query(Skip).filter(
        Skip.slot_id == slot_id,
        Skip.user_id == current_user.id
    ).first()

    if existing_skip:
        return existing_skip

    new_skip = Skip(slot_id=slot_id, user_id=current_user.id)
    db.add(new_skip)
    db.commit()
    db.refresh(new_skip)
    return new_skip

@router.delete("/slots/{slot_id}/skip", status_code=status.HTTP_200_OK)
def undo_skip(
    slot_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student)
):
    """Allows a student to undo their skip before the cutoff time."""
    slot = db.query(MealSlot).filter(MealSlot.id == slot_id).first()
    if not slot:
        raise HTTPException(status_code=404, detail="Meal slot not found")

    mess = db.query(Mess).filter(Mess.id == slot.mess_id).first()
    if is_cutoff_passed(slot, mess):
        cutoff_time = format_cutoff_label(slot, mess)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cutoff passed ({cutoff_time}). Skips are locked to maintain kitchen stability."
        )

    skip = db.query(Skip).filter(
        Skip.slot_id == slot_id,
        Skip.user_id == current_user.id
    ).first()

    if not skip:
        raise HTTPException(status_code=404, detail="No active skip record found for this slot")

    db.delete(skip)
    db.commit()
    return {"message": "Skip removed successfully", "slot_id": slot_id}

@router.get("/students/my-impact", response_model=Dict[str, Any])
def get_student_impact(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student)
):
    """Computes personal stats on timely skips and estimated food waste prevented."""
    total_skips = db.query(Skip).filter(Skip.user_id == current_user.id).count()
    # Approx 0.380 kg per standard Indian hostel student meal saved when informed in advance
    estimated_saved_kg = round(total_skips * 0.38, 2)

    return {
        "student_name": current_user.display_name,
        "meals_skipped_on_time": total_skips,
        "estimated_food_saved_kg": estimated_saved_kg,
        "impact_summary": f"By skipping ahead of time, you prevented an estimated {estimated_saved_kg} kg of kitchen surplus."
    }
