from datetime import datetime
from pydantic import BaseModel, ConfigDict


class NotificationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    message: str
    notif_type: str
    link: str | None
    is_read: bool
    created_at: datetime
