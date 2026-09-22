from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

from app.models.property import PropertyType, TransactionType, PropertyStatus
from app.schemas.user import UserRead


class PropertyImageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    url: str
    is_primary: bool


class PropertyBase(BaseModel):
    title: str = Field(min_length=5, max_length=255)
    description: str = Field(min_length=10)
    property_type: PropertyType
    transaction_type: TransactionType
    price: float = Field(gt=0)
    currency: str = "MAD"
    surface_area: float = Field(gt=0)
    rooms: int | None = Field(default=None, ge=0)
    bedrooms: int | None = Field(default=None, ge=0)
    bathrooms: int | None = Field(default=None, ge=0)
    city: str = Field(min_length=2, max_length=120)
    address: str = Field(min_length=3, max_length=500)
    latitude: float | None = None
    longitude: float | None = None


class PropertyCreate(PropertyBase):
    pass


class PropertyUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=5, max_length=255)
    description: str | None = Field(default=None, min_length=10)
    property_type: PropertyType | None = None
    transaction_type: TransactionType | None = None
    price: float | None = Field(default=None, gt=0)
    surface_area: float | None = Field(default=None, gt=0)
    rooms: int | None = None
    bedrooms: int | None = None
    bathrooms: int | None = None
    city: str | None = None
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    status: PropertyStatus | None = None
    is_featured: bool | None = None


class PropertyRead(PropertyBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: PropertyStatus
    is_featured: bool
    views_count: int
    owner_id: int
    created_at: datetime
    updated_at: datetime
    images: list[PropertyImageRead] = []


class PropertyReadWithOwner(PropertyRead):
    owner: UserRead


class PropertyListResponse(BaseModel):
    total: int
    page: int
    limit: int
    pages: int
    items: list[PropertyRead]
