try:
    import email_validator  # noqa: F401
    from pydantic import EmailStr
except ImportError:
    EmailStr = str
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime
from app.schemas.role_permission import RoleOut


# profile cuar user
class UserProfileUpdate(BaseModel):
    user_name: Optional[str] = Field(
        None, min_length=2, max_length=100, description="Tên hiển thị mới"
    )
    avatar_url: Optional[str] = Field(None, description="URL ảnh đại diện mới")


class UserRoleUpdate(BaseModel):
    role_id: int = Field(..., description="ID vai trò mới cần gán cho người dùng")


# du lieu cuar nguoi dung
class UserOut(BaseModel):
    user_id: int
    email: EmailStr
    user_name: str
    avatar_url: Optional[str] = None
    created_at: datetime
    role_id: int
    role: Optional[RoleOut] = None

    model_config = ConfigDict(from_attributes=True)
