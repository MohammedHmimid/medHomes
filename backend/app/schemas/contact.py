from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict, Field

from app.models.contact import RequestType, RequestStatus


class ContactRequestCreate(BaseModel):
    property_id: int | None = None
    name: str = Field(min_length=2, max_length=255)
    email: EmailStr
    phone: str | None = None
    request_type: RequestType = RequestType.PROPERTY_INQUIRY
    message: str = Field(min_length=5)


class ContactRequestUpdate(BaseModel):
    status: RequestStatus


class ContactRequestRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    property_id: int | None
    user_id: int | None
    name: str
    email: EmailStr
    phone: str | None
    request_type: RequestType
    message: str
    status: RequestStatus
    created_at: datetime
    updated_at: datetime
