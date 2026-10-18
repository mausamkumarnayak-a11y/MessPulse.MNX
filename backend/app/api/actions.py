from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.entities import Action, Dish, User
from app.models.enums import ActionStatus
from app.schemas import ActionCreate, ActionUpdate, ActionResponse
from app.core.security import get_current_user, require_warden

router = APIRouter(prefix="/actions", tags=["You Said, We Did Action Tracker"])

@router.get("", response_model=List[ActionResponse])
def list_actions(
    status_filter: Optional[ActionStatus] = None,
    db: Session = Depends(get_db)
):
    """Retrieves all 'You said, we did' accountability actions. Visible to all users and public."""
    query = db.query(Action)
    if status_filter:
        query = query.filter(Action.status == status_filter)
    actions = query.order_by(Action.updated_at.desc()).all()

    return [
        ActionResponse(
            id=a.id,
            mess_id=a.mess_id,
            title=a.title,
            description=a.description,
            linked_dish_id=a.linked_dish_id,
            dish_name=a.dish.name if a.dish else None,
            status=a.status,
            outcome=a.outcome,
            created_by=a.created_by,
            created_at=a.created_at,
            updated_at=a.updated_at
        )
        for a in actions
    ]

@router.post("", response_model=ActionResponse, status_code=status.HTTP_201_CREATED)
def create_action(
    action_in: ActionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_warden)
):
    """Creates a new accountability action linked to student feedback (Warden / Admin)."""
    action = Action(
        mess_id=current_user.mess_id,
        title=action_in.title.strip(),
        description=action_in.description.strip(),
        linked_dish_id=action_in.linked_dish_id,
        status=action_in.status,
        outcome=action_in.outcome.strip() if action_in.outcome else None,
        created_by=current_user.display_name
    )
    db.add(action)
    db.commit()
    db.refresh(action)

    dish_name = action.dish.name if action.dish else None
    return ActionResponse(
        id=action.id,
        mess_id=action.mess_id,
        title=action.title,
        description=action.description,
        linked_dish_id=action.linked_dish_id,
        dish_name=dish_name,
        status=action.status,
        outcome=action.outcome,
        created_by=action.created_by,
        created_at=action.created_at,
        updated_at=action.updated_at
    )

@router.patch("/{action_id}", response_model=ActionResponse)
def update_action(
    action_id: str,
    action_update: ActionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_warden)
):
    """Updates action status, details, or resolution outcome (Warden / Admin)."""
    action = db.query(Action).filter(Action.id == action_id).first()
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")

    if action_update.title is not None:
        action.title = action_update.title.strip()
    if action_update.description is not None:
        action.description = action_update.description.strip()
    if action_update.linked_dish_id is not None:
        action.linked_dish_id = action_update.linked_dish_id
    if action_update.status is not None:
        action.status = action_update.status
    if action_update.outcome is not None:
        action.outcome = action_update.outcome.strip()

    db.commit()
    db.refresh(action)

    dish_name = action.dish.name if action.dish else None
    return ActionResponse(
        id=action.id,
        mess_id=action.mess_id,
        title=action.title,
        description=action.description,
        linked_dish_id=action.linked_dish_id,
        dish_name=dish_name,
        status=action.status,
        outcome=action.outcome,
        created_by=action.created_by,
        created_at=action.created_at,
        updated_at=action.updated_at
    )
