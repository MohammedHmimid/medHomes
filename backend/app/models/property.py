import enum
from datetime import datetime

from sqlalchemy import (
    String, Text, Float, Integer, Boolean, DateTime, ForeignKey, Enum as SAEnum
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.database import Base


class PropertyType(str, enum.Enum):
    APARTMENT = "apartment"
    HOUSE = "house"
    VILLA = "villa"
    OFFICE = "office"
    LAND = "land"


class TransactionType(str, enum.Enum):
    SALE = "sale"
    RENT = "rent"


class PropertyStatus(str, enum.Enum):
    AVAILABLE = "available"
    PENDING = "pending"
    SOLD = "sold"
    RENTED = "rented"


class Property(Base):
    __tablename__ = "properties"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)

    property_type: Mapped[PropertyType] = mapped_column(SAEnum(PropertyType), nullable=False, index=True)
    transaction_type: Mapped[TransactionType] = mapped_column(SAEnum(TransactionType), nullable=False, index=True)
    status: Mapped[PropertyStatus] = mapped_column(SAEnum(PropertyStatus), default=PropertyStatus.AVAILABLE, index=True)

    price: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="MAD")

    surface_area: Mapped[float] = mapped_column(Float, nullable=False)
    rooms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    bedrooms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    bathrooms: Mapped[int | None] = mapped_column(Integer, nullable=True)

    city: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    address: Mapped[str] = mapped_column(String(500), nullable=False)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)

    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    views_count: Mapped[int] = mapped_column(Integer, default=0)

    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    owner: Mapped["User"] = relationship("User", back_populates="properties")
    images: Mapped[list["PropertyImage"]] = relationship(
        "PropertyImage", back_populates="property", cascade="all, delete-orphan", order_by="PropertyImage.id"
    )
    favorites: Mapped[list["Favorite"]] = relationship(
        "Favorite", back_populates="property", cascade="all, delete-orphan"
    )
    contact_requests: Mapped[list["ContactRequest"]] = relationship(
        "ContactRequest", back_populates="property", cascade="all, delete-orphan"
    )


class PropertyImage(Base):
    __tablename__ = "property_images"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    property_id: Mapped[int] = mapped_column(ForeignKey("properties.id"), nullable=False)
    url: Mapped[str] = mapped_column(String(500), nullable=False)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    property: Mapped["Property"] = relationship("Property", back_populates="images")
