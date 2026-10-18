import enum

class UserRole(str, enum.Enum):
    STUDENT = "student"
    STAFF = "staff"
    WARDEN = "warden"
    ADMIN = "admin"

class MealType(str, enum.Enum):
    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    SNACKS = "snacks"
    DINNER = "dinner"

class ActionStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
