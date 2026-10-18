from typing import Optional
from datetime import date
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.entities import User
from app.schemas import (
    WasteInsightsResponse, RatingsInsightsResponse, ExpectedHeadcountResponse
)
from app.core.security import require_staff_or_warden
from app.services.insights import (
    calculate_waste_metrics, calculate_rating_insights, calculate_expected_headcount
)

router = APIRouter(prefix="/insights", tags=["Insights & Analytics"])

@router.get("/waste", response_model=WasteInsightsResponse)
def get_waste_insights(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff_or_warden)
):
    """Calculates waste per head, top wasted dishes, and multi-day trends."""
    return calculate_waste_metrics(
        db=db,
        mess_id=current_user.mess_id,
        start_date=start_date,
        end_date=end_date
    )

@router.get("/ratings", response_model=RatingsInsightsResponse)
def get_ratings_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff_or_warden)
):
    """Returns aggregated dish ratings and tag breakdowns with strict privacy gate enforcement (>= 5 ratings)."""
    return calculate_rating_insights(
        db=db,
        mess_id=current_user.mess_id
    )

@router.get("/expected-headcount", response_model=ExpectedHeadcountResponse)
def get_expected_headcount(
    slot_id: str = Query(..., description="Meal slot ID to forecast"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff_or_warden)
):
    """Provides transparent expected headcount estimation using registered capacity, recorded skips, and show-up rates."""
    return calculate_expected_headcount(
        db=db,
        slot_id=slot_id
    )
