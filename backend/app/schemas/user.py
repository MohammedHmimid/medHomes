from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict, Field

from app.models.user import UserRole


class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=255)
    phone: str | None = None


class UserCreate(UserBase):
    password: str = Field(min_length=6, max_length=128)


class UserUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=255)
    phone: str | None = None
    avatar_url: str | None = None


class UserPasswordUpdate(BaseModel):
    current_password: str
    new_password: str = Field(min_length=6, max_length=128)


class UserRead(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    role: UserRole
    avatar_url: str | None = None
    is_active: bool
    created_at: datetime
