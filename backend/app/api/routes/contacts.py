from typing import Optional

from sqlalchemy import or_
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.contact import ContactRequest, RequestStatus
from app.models.property import Property
from app.models.notification import Notification
from app.models.user import User, UserRole
from app.schemas.contact import ContactRequestCreate, ContactRequestUpdate, ContactRequestRead
from app.api.deps import get_current_active_user, get_current_user_optional

router = APIRouter(prefix="/contacts", tags=["Contacts & Assistance"])


@router.post("", response_model=ContactRequestRead, status_code=201)
def create_contact_request(
    payload: ContactRequestCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    prop = None
    if payload.property_id:
        prop = db.query(Property).filter(Property.id == payload.property_id).first()
        if not prop:
            raise HTTPException(status_code=404, detail="Bien introuvable")

    contact = ContactRequest(
        **payload.model_dump(),
        user_id=current_user.id if current_user else None,
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)

    # Notifier le proprietaire du bien concerne, le cas echeant.
    if prop and prop.owner_id:
        notif = Notification(
            user_id=prop.owner_id,
            title="Nouvelle demande de contact",
            message=f"{payload.name} s'interesse a votre bien « {prop.title} ».",
            notif_type="contact_request",
            link=f"/properties/{prop.id}",
        )
        db.add(notif)
        db.commit()

    return contact


@router.get("", response_model=list[ContactRequestRead])
def list_contact_requests(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    query = db.query(ContactRequest)
    if current_user.role == UserRole.ADMIN:
        pass  # l'admin voit tout
    else:
        # L'utilisateur voit les demandes qu'il a envoyees et celles recues
        # sur les biens dont il est proprietaire.
        owned_property_ids = [p.id for p in current_user.properties]
        conditions = [ContactRequest.user_id == current_user.id]
        if owned_property_ids:
            conditions.append(ContactRequest.property_id.in_(owned_property_ids))
        query = query.filter(or_(*conditions))
    return query.order_by(ContactRequest.created_at.desc()).all()


@router.get("/{contact_id}", response_model=ContactRequestRead)
def get_contact_request(
    contact_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    contact = db.query(ContactRequest).filter(ContactRequest.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Demande introuvable")

    is_owner_of_property = (
        contact.property and contact.property.owner_id == current_user.id
    )
    if (
        current_user.role != UserRole.ADMIN
        and contact.user_id != current_user.id
        and not is_owner_of_property
    ):
        raise HTTPException(status_code=403, detail="Acces non autorise")
    return contact


@router.put("/{contact_id}", response_model=ContactRequestRead)
def update_contact_request(
    contact_id: int,
    payload: ContactRequestUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    contact = db.query(ContactRequest).filter(ContactRequest.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Demande introuvable")

    is_owner_of_property = (
        contact.property and contact.property.owner_id == current_user.id
    )
    if current_user.role != UserRole.ADMIN and not is_owner_of_property:
        raise HTTPException(status_code=403, detail="Acces non autorise")

    contact.status = payload.status
    db.commit()
    db.refresh(contact)
    return contact


@router.delete("/{contact_id}", status_code=204)
def delete_contact_request(
    contact_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    contact = db.query(ContactRequest).filter(ContactRequest.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Demande introuvable")
    if current_user.role != UserRole.ADMIN and contact.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Acces non autorise")
    db.delete(contact)
    db.commit()
    return None
