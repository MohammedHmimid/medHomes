from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import verify_password, get_password_hash
from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserRead, UserUpdate, UserPasswordUpdate
from app.api.deps import get_current_active_user

router = APIRouter(prefix="/users", tags=["Utilisateurs"])


@router.get("/me", response_model=UserRead)
def get_my_profile(current_user: User = Depends(get_current_active_user)):
    return current_user


@router.put("/me", response_model=UserRead)
def update_my_profile(
    payload: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.put("/me/password", status_code=204)
def update_my_password(
    payload: UserPasswordUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Mot de passe actuel incorrect")
    current_user.hashed_password = get_password_hash(payload.new_password)
    db.commit()
    return None
