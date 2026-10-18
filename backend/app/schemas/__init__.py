from datetime import datetime, date, time
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from app.models.enums import UserRole, MealType, ActionStatus

# ----------------- AUTH SCHEMAS -----------------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    mess_id: str
    role: UserRole
    display_name: str
    email: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    display_name: str
    role: UserRole = UserRole.STUDENT
    mess_id: Optional[str] = None

# ----------------- DISH & SLOT SCHEMAS -----------------
class DishResponse(BaseModel):
    id: str
    mess_id: str
    name: str
    veg_flag: bool
    category: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class DishCreate(BaseModel):
    name: str
    veg_flag: bool = True
    category: Optional[str] = "Main"

class MealSlotResponse(BaseModel):
    id: str
    mess_id: str
    date: date
    meal_type: MealType
    start_time: str
    end_time: str
    dishes: List[DishResponse] = []
    is_skipped: bool = False
    is_rated: bool = False
    user_rating: Optional[int] = None
    can_skip: bool = True
    cutoff_time_str: str = ""
    headcount_served: Optional[int] = None
    total_waste_kg: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)

class SlotMenuUpdateItem(BaseModel):
    meal_type: MealType
    start_time: str = "08:00"
    end_time: str = "10:00"
    dish_ids: List[str]

class DayMenuUpdateRequest(BaseModel):
    slots: List[SlotMenuUpdateItem]

# ----------------- RATING SCHEMAS -----------------
class RatingCreate(BaseModel):
    dish_id: Optional[str] = None
    score: int = Field(..., ge=1, le=5, description="Score from 1 (poor) to 5 (excellent)")
    tags: List[str] = Field(default_factory=list, description="Reason tags e.g. taste, salt, oil, temperature, quantity, hygiene")
    comment: Optional[str] = Field(None, max_length=500)

class RatingResponse(BaseModel):
    id: str
    slot_id: str
    dish_id: Optional[str] = None
    score: int
    tags: List[str] = []
    comment: Optional[str] = None
    created_at: datetime
    # Note: user_id is deliberately excluded from response to protect student anonymity

    model_config = ConfigDict(from_attributes=True)

# ----------------- SKIP SCHEMAS -----------------
class SkipResponse(BaseModel):
    id: str
    slot_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# ----------------- HEADCOUNT & WASTE SCHEMAS -----------------
class HeadcountCreate(BaseModel):
    served_count: int = Field(..., ge=0, description="Total number of students served")

class HeadcountResponse(BaseModel):
    id: str
    slot_id: str
    served_count: int
    entered_by: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class WasteEntryItem(BaseModel):
    dish_id: str
    leftover_kg: float = Field(..., ge=0.0, description="Measured leftover food in kilograms")
    notes: Optional[str] = Field(None, max_length=300)

class WasteBatchCreate(BaseModel):
    entries: List[WasteEntryItem]

class WasteLogResponse(BaseModel):
    id: str
    slot_id: str
    dish_id: str
    dish_name: Optional[str] = None
    leftover_kg: float
    notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# ----------------- INSIGHTS SCHEMAS -----------------
class DishWasteStat(BaseModel):
    dish_id: str
    dish_name: str
    total_waste_kg: float
    avg_leftover_per_slot_kg: float
    service_count: int

class WasteInsightsResponse(BaseModel):
    total_waste_kg: float
    total_headcount_served: int
    waste_per_head_kg: float
    days_analyzed: int
    top_wasted_dishes: List[DishWasteStat]
    daily_trend: List[Dict[str, Any]]

class DishRatingStat(BaseModel):
    dish_id: str
    dish_name: str
    rating_count: int
    average_score: Optional[float]
    sample_size_met: bool
    status_note: str

class RatingsInsightsResponse(BaseModel):
    total_ratings_count: int
    overall_average_score: Optional[float]
    sample_size_met: bool
    status_message: str
    tag_breakdown: Dict[str, int]
    dish_scores: List[DishRatingStat]

class ExpectedHeadcountResponse(BaseModel):
    slot_id: str
    meal_type: MealType
    registered_students: int
    skips_recorded: int
    historical_showup_rate: float
    expected_headcount: int
    expected_range_low: int
    expected_range_high: int
    confidence_note: str

# ----------------- ACTION TRACKER SCHEMAS -----------------
class ActionCreate(BaseModel):
    title: str = Field(..., max_length=255)
    description: str
    linked_dish_id: Optional[str] = None
    status: ActionStatus = ActionStatus.OPEN
    outcome: Optional[str] = None

class ActionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    linked_dish_id: Optional[str] = None
    status: Optional[ActionStatus] = None
    outcome: Optional[str] = None

class ActionResponse(BaseModel):
    id: str
    mess_id: str
    title: str
    description: str
    linked_dish_id: Optional[str] = None
    dish_name: Optional[str] = None
    status: ActionStatus
    outcome: Optional[str] = None
    created_by: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# ----------------- PUBLIC WASTE METER -----------------
class PublicWasteMeterResponse(BaseModel):
    mess_name: str
    total_waste_this_week_kg: float
    waste_per_student_per_meal_kg: float
    weekly_waste_reduced_pct: float
    participating_students_count: int
    meals_skipped_on_time: int
    recent_actions: List[ActionResponse]
    daily_history: List[Dict[str, Any]]

# ----------------- TOUR & HELP -----------------
class TourProgressUpdate(BaseModel):
    tour_id: str
    step: int
    completed: bool

class TourProgressResponse(BaseModel):
    tour_id: str
    step: int
    completed: bool
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class HelpArticleResponse(BaseModel):
    id: str
    role_target: str
    category: str
    title: str
    summary: str
    content: str
