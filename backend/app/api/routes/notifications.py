from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.notification import Notification
from app.models.user import User
from app.schemas.notification import NotificationRead
from app.api.deps import get_current_active_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=list[NotificationRead])
def list_my_notifications(
    current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)
):
    return (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .all()
    )


@router.put("/{notification_id}/read", response_model=NotificationRead)
def mark_as_read(
    notification_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    notif = (
        db.query(Notification)
        .filter(Notification.id == notification_id, Notification.user_id == current_user.id)
        .first()
    )
    if not notif:
        raise HTTPException(status_code=404, detail="Notification introuvable")
    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return notif


@router.put("/read-all", status_code=204)
def mark_all_as_read(
    current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)
):
    db.query(Notification).filter(
        Notification.user_id == current_user.id, Notification.is_read == False  # noqa: E712
    ).update({"is_read": True})
    db.commit()
    return None


@router.delete("/{notification_id}", status_code=204)
def delete_notification(
    notification_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    notif = (
        db.query(Notification)
        .filter(Notification.id == notification_id, Notification.user_id == current_user.id)
        .first()
    )
    if not notif:
        raise HTTPException(status_code=404, detail="Notification introuvable")
    db.delete(notif)
    db.commit()
    return None
