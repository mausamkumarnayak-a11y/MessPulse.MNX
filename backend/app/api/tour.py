from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.entities import TourProgress, User
from app.schemas import TourProgressUpdate, TourProgressResponse
from app.core.security import get_current_user

router = APIRouter(prefix="/tour", tags=["Interactive Tour"])

@router.get("/progress", response_model=Optional[TourProgressResponse])
def get_user_tour_progress(
    tour_id: str = "default",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves saved onboarding tour state for the authenticated user."""
    # If tour_id is default, use the user's role
    target_tour = current_user.role.value if tour_id == "default" else tour_id
    progress = db.query(TourProgress).filter(
        TourProgress.user_id == current_user.id,
        TourProgress.tour_id == target_tour
    ).first()
    return progress

@router.put("/progress", response_model=TourProgressResponse)
def update_user_tour_progress(
    progress_in: TourProgressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Saves user onboarding tour progress so it does not reappear involuntarily."""
    progress = db.query(TourProgress).filter(
        TourProgress.user_id == current_user.id,
        TourProgress.tour_id == progress_in.tour_id
    ).first()

    if progress:
        progress.step = progress_in.step
        progress.completed = progress_in.completed
    else:
        progress = TourProgress(
            user_id=current_user.id,
            tour_id=progress_in.tour_id,
            step=progress_in.step,
            completed=progress_in.completed
        )
        db.add(progress)

    db.commit()
    db.refresh(progress)
    return progress
