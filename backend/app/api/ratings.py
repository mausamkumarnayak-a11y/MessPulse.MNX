from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.entities import MealSlot, Rating, User
from app.models.enums import UserRole
from app.schemas import RatingCreate, RatingResponse
from app.core.security import get_current_user, require_student

router = APIRouter(tags=["Student Ratings"])

@router.post("/slots/{slot_id}/rating", response_model=RatingResponse, status_code=status.HTTP_201_CREATED)
def submit_or_update_rating(
    slot_id: str,
    rating_in: RatingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student)
):
    """Submits or updates a 5-second meal rating for a slot. Privacy preserved: user_id is never exposed."""
    slot = db.query(MealSlot).filter(MealSlot.id == slot_id).first()
    if not slot:
        raise HTTPException(status_code=404, detail="Meal slot not found")

    # Find existing rating for this user and slot
    existing_rating = db.query(Rating).filter(
        Rating.slot_id == slot_id,
        Rating.user_id == current_user.id
    ).first()

    clean_tags = [str(t).lower().strip() for t in rating_in.tags] if rating_in.tags else []

    if existing_rating:
        existing_rating.score = rating_in.score
        existing_rating.tags = clean_tags
        existing_rating.dish_id = rating_in.dish_id
        existing_rating.comment = rating_in.comment.strip() if rating_in.comment else None
        db.commit()
        db.refresh(existing_rating)
        return existing_rating

    new_rating = Rating(
        slot_id=slot_id,
        dish_id=rating_in.dish_id,
        user_id=current_user.id,
        score=rating_in.score,
        tags=clean_tags,
        comment=rating_in.comment.strip() if rating_in.comment else None
    )
    db.add(new_rating)
    db.commit()
    db.refresh(new_rating)
    return new_rating

@router.get("/slots/{slot_id}/my-rating", response_model=Optional[RatingResponse])
def get_my_rating_for_slot(
    slot_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student)
):
    """Allows a student to inspect their own previously submitted rating for a slot."""
    rating = db.query(Rating).filter(
        Rating.slot_id == slot_id,
        Rating.user_id == current_user.id
    ).first()
    return rating
