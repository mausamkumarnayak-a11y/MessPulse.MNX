import uuid
from datetime import datetime, timezone, date, time
from typing import List, Optional
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, Date, Time, DateTime,
    ForeignKey, Text, JSON, UniqueConstraint, Enum as SQLEnum
)
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.db.base import Base
from app.models.enums import UserRole, MealType, ActionStatus

def generate_uuid() -> str:
    return str(uuid.uuid4())

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class Mess(Base):
    __tablename__ = "mess"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    timezone: Mapped[str] = mapped_column(String(64), default="Asia/Kolkata")
    cutoff_minutes: Mapped[int] = mapped_column(Integer, default=60)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    users = relationship("User", back_populates="mess", cascade="all, delete-orphan")
    meal_slots = relationship("MealSlot", back_populates="mess", cascade="all, delete-orphan")
    dishes = relationship("Dish", back_populates="mess", cascade="all, delete-orphan")
    actions = relationship("Action", back_populates="mess", cascade="all, delete-orphan")

class User(Base):
    __tablename__ = "user"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=generate_uuid)
    mess_id: Mapped[str] = mapped_column(String(64), ForeignKey("mess.id", ondelete="CASCADE"), nullable=False)
    role: Mapped[UserRole] = mapped_column(SQLEnum(UserRole), nullable=False, default=UserRole.STUDENT)
    display_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    mess = relationship("Mess", back_populates="users")
    ratings = relationship("Rating", back_populates="user", cascade="all, delete-orphan")
    skips = relationship("Skip", back_populates="user", cascade="all, delete-orphan")
    tour_progress = relationship("TourProgress", back_populates="user", cascade="all, delete-orphan")

class Dish(Base):
    __tablename__ = "dish"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=generate_uuid)
    mess_id: Mapped[str] = mapped_column(String(64), ForeignKey("mess.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    veg_flag: Mapped[bool] = mapped_column(Boolean, default=True)
    category: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)  # Main, Side, Dessert, Beverage
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    mess = relationship("Mess", back_populates="dishes")
    slot_associations = relationship("SlotDish", back_populates="dish", cascade="all, delete-orphan")
    waste_logs = relationship("WasteLog", back_populates="dish")
    actions = relationship("Action", back_populates="dish")

class MealSlot(Base):
    __tablename__ = "meal_slot"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=generate_uuid)
    mess_id: Mapped[str] = mapped_column(String(64), ForeignKey("mess.id", ondelete="CASCADE"), nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    meal_type: Mapped[MealType] = mapped_column(SQLEnum(MealType), nullable=False)
    start_time: Mapped[str] = mapped_column(String(10), default="08:00")  # HH:MM
    end_time: Mapped[str] = mapped_column(String(10), default="10:00")    # HH:MM
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    __table_args__ = (
        UniqueConstraint("mess_id", "date", "meal_type", name="uq_mess_date_meal_type"),
    )

    mess = relationship("Mess", back_populates="meal_slots")
    slot_dishes = relationship("SlotDish", back_populates="slot", cascade="all, delete-orphan")
    ratings = relationship("Rating", back_populates="slot", cascade="all, delete-orphan")
    skips = relationship("Skip", back_populates="slot", cascade="all, delete-orphan")
    headcount_log = relationship("HeadcountLog", back_populates="slot", uselist=False, cascade="all, delete-orphan")
    waste_logs = relationship("WasteLog", back_populates="slot", cascade="all, delete-orphan")

class SlotDish(Base):
    __tablename__ = "slot_dish"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=generate_uuid)
    slot_id: Mapped[str] = mapped_column(String(64), ForeignKey("meal_slot.id", ondelete="CASCADE"), nullable=False)
    dish_id: Mapped[str] = mapped_column(String(64), ForeignKey("dish.id", ondelete="CASCADE"), nullable=False)

    __table_args__ = (
        UniqueConstraint("slot_id", "dish_id", name="uq_slot_dish"),
    )

    slot = relationship("MealSlot", back_populates="slot_dishes")
    dish = relationship("Dish", back_populates="slot_associations")

class Rating(Base):
    __tablename__ = "rating"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=generate_uuid)
    slot_id: Mapped[str] = mapped_column(String(64), ForeignKey("meal_slot.id", ondelete="CASCADE"), nullable=False, index=True)
    dish_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("dish.id", ondelete="SET NULL"), nullable=True)
    user_id: Mapped[str] = mapped_column(String(64), ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    score: Mapped[int] = mapped_column(Integer, nullable=False)  # 1 to 5
    tags: Mapped[Optional[list]] = mapped_column(JSON, default=list)  # ["taste", "salt", "oil", ...]
    comment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    __table_args__ = (
        # One rating per user per slot (or per slot & dish)
        UniqueConstraint("slot_id", "user_id", "dish_id", name="uq_user_slot_dish_rating"),
    )

    slot = relationship("MealSlot", back_populates="ratings")
    dish = relationship("Dish")
    user = relationship("User", back_populates="ratings")

class Skip(Base):
    __tablename__ = "skip"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=generate_uuid)
    slot_id: Mapped[str] = mapped_column(String(64), ForeignKey("meal_slot.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[str] = mapped_column(String(64), ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    __table_args__ = (
        UniqueConstraint("slot_id", "user_id", name="uq_user_slot_skip"),
    )

    slot = relationship("MealSlot", back_populates="skips")
    user = relationship("User", back_populates="skips")

class HeadcountLog(Base):
    __tablename__ = "headcount_log"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=generate_uuid)
    slot_id: Mapped[str] = mapped_column(String(64), ForeignKey("meal_slot.id", ondelete="CASCADE"), nullable=False, unique=True)
    served_count: Mapped[int] = mapped_column(Integer, nullable=False)
    entered_by: Mapped[str] = mapped_column(String(64), ForeignKey("user.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    slot = relationship("MealSlot", back_populates="headcount_log")

class WasteLog(Base):
    __tablename__ = "waste_log"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=generate_uuid)
    slot_id: Mapped[str] = mapped_column(String(64), ForeignKey("meal_slot.id", ondelete="CASCADE"), nullable=False, index=True)
    dish_id: Mapped[str] = mapped_column(String(64), ForeignKey("dish.id", ondelete="CASCADE"), nullable=False)
    leftover_kg: Mapped[float] = mapped_column(Float, nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    entered_by: Mapped[str] = mapped_column(String(64), ForeignKey("user.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    __table_args__ = (
        UniqueConstraint("slot_id", "dish_id", name="uq_slot_dish_waste"),
    )

    slot = relationship("MealSlot", back_populates="waste_logs")
    dish = relationship("Dish", back_populates="waste_logs")

class Action(Base):
    __tablename__ = "action"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=generate_uuid)
    mess_id: Mapped[str] = mapped_column(String(64), ForeignKey("mess.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    linked_dish_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("dish.id", ondelete="SET NULL"), nullable=True)
    status: Mapped[ActionStatus] = mapped_column(SQLEnum(ActionStatus), default=ActionStatus.OPEN)
    outcome: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_by: Mapped[str] = mapped_column(String(64), ForeignKey("user.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    mess = relationship("Mess", back_populates="actions")
    dish = relationship("Dish", back_populates="actions")

class TourProgress(Base):
    __tablename__ = "tour_progress"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(64), ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    tour_id: Mapped[str] = mapped_column(String(64), nullable=False)  # student, staff, warden
    step: Mapped[int] = mapped_column(Integer, default=1)
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    __table_args__ = (
        UniqueConstraint("user_id", "tour_id", name="uq_user_tour"),
    )

    user = relationship("User", back_populates="tour_progress")
