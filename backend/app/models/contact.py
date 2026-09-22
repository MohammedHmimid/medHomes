import enum
from datetime import datetime

from sqlalchemy import String, Text, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.database import Base


class RequestType(str, enum.Enum):
    PROPERTY_INQUIRY = "property_inquiry"
    VISIT_REQUEST = "visit_request"
    ESTIMATION = "estimation"
    GENERAL_ASSISTANCE = "general_assistance"


class RequestStatus(str, enum.Enum):
    NEW = "new"
    IN_PROGRESS = "in_progress"
    CLOSED = "closed"


class ContactRequest(Base):
    """Demande de contact / assistance immobiliere.
    Peut concerner un bien precis (property_id) ou etre une demande generale
    (estimation, conseil...). Peut etre envoyee par un utilisateur connecte
    (user_id) ou en visiteur anonyme (name/email/phone renseignes manuellement)."""

    __tablename__ = "contact_requests"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    property_id: Mapped[int | None] = mapped_column(ForeignKey("properties.id"), nullable=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)

    request_type: Mapped[RequestType] = mapped_column(SAEnum(RequestType), default=RequestType.PROPERTY_INQUIRY)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[RequestStatus] = mapped_column(SAEnum(RequestStatus), default=RequestStatus.NEW, index=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    property: Mapped["Property"] = relationship("Property", back_populates="contact_requests")
    sender: Mapped["User"] = relationship("User", foreign_keys=[user_id])
