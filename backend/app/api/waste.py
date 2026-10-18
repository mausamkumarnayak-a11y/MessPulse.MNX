from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.entities import MealSlot, HeadcountLog, WasteLog, Dish, User
from app.schemas import (
    HeadcountCreate, HeadcountResponse, WasteBatchCreate, WasteLogResponse
)
from app.core.security import require_staff_or_warden

router = APIRouter(tags=["Kitchen Logging"])

@router.post("/slots/{slot_id}/headcount", response_model=HeadcountResponse)
def log_headcount(
    slot_id: str,
    data: HeadcountCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff_or_warden)
):
    """Logs or updates the actual number of students served during a meal service."""
    slot = db.query(MealSlot).filter(MealSlot.id == slot_id).first()
    if not slot:
        raise HTTPException(status_code=404, detail="Meal slot not found")

    log = db.query(HeadcountLog).filter(HeadcountLog.slot_id == slot_id).first()
    if log:
        log.served_count = data.served_count
        log.entered_by = current_user.id
    else:
        log = HeadcountLog(
            slot_id=slot_id,
            served_count=data.served_count,
            entered_by=current_user.id
        )
        db.add(log)

    db.commit()
    db.refresh(log)
    return log

@router.get("/slots/{slot_id}/headcount", response_model=HeadcountResponse)
def get_slot_headcount(
    slot_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff_or_warden)
):
    """Retrieves logged headcount for a specific slot."""
    log = db.query(HeadcountLog).filter(HeadcountLog.slot_id == slot_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Headcount not yet recorded for this slot")
    return log

@router.post("/slots/{slot_id}/waste", response_model=List[WasteLogResponse])
def log_waste_batch(
    slot_id: str,
    batch: WasteBatchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff_or_warden)
):
    """Records leftover food weight in kilograms for each dish served in a meal slot."""
    slot = db.query(MealSlot).filter(MealSlot.id == slot_id).first()
    if not slot:
        raise HTTPException(status_code=404, detail="Meal slot not found")

    saved_logs = []
    for entry in batch.entries:
        # Validate dish exists
        dish = db.query(Dish).filter(Dish.id == entry.dish_id).first()
        if not dish:
            continue

        existing_log = db.query(WasteLog).filter(
            WasteLog.slot_id == slot_id,
            WasteLog.dish_id == entry.dish_id
        ).first()

        if existing_log:
            existing_log.leftover_kg = round(float(entry.leftover_kg), 2)
            existing_log.notes = entry.notes
            existing_log.entered_by = current_user.id
            saved_logs.append(existing_log)
        else:
            new_log = WasteLog(
                slot_id=slot_id,
                dish_id=entry.dish_id,
                leftover_kg=round(float(entry.leftover_kg), 2),
                notes=entry.notes,
                entered_by=current_user.id
            )
            db.add(new_log)
            saved_logs.append(new_log)

    db.commit()
    for l in saved_logs:
        db.refresh(l)

    return [
        WasteLogResponse(
            id=l.id,
            slot_id=l.slot_id,
            dish_id=l.dish_id,
            dish_name=l.dish.name if l.dish else "Unknown Dish",
            leftover_kg=l.leftover_kg,
            notes=l.notes,
            created_at=l.created_at
        )
        for l in saved_logs
    ]

@router.get("/slots/{slot_id}/waste", response_model=List[WasteLogResponse])
def get_slot_waste(
    slot_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff_or_warden)
):
    """Retrieves all leftover waste logs recorded for a slot."""
    logs = db.query(WasteLog).filter(WasteLog.slot_id == slot_id).all()
    return [
        WasteLogResponse(
            id=l.id,
            slot_id=l.slot_id,
            dish_id=l.dish_id,
            dish_name=l.dish.name if l.dish else "Unknown Dish",
            leftover_kg=l.leftover_kg,
            notes=l.notes,
            created_at=l.created_at
        )
        for l in logs
    ]
