try:
    import email_validator  # noqa: F401
    from pydantic import EmailStr
except ImportError:
    EmailStr = str  # Fallback nếu môi trường chưa cài email-validator
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.schemas.role_permission import RoleOut


# create user
class UserRegisterRequest(BaseModel):
    user_name: str = Field(
        ..., min_length=2, max_length=100, description="Họ và tên hoặc tên hiển thị"
    )
    email: EmailStr = Field(..., description="Email đăng nhập")
    password: str = Field(
        ..., min_length=6, max_length=100, description="Mật khẩu đăng nhập"
    )


class UserLoginRequest(BaseModel):
    email: EmailStr = Field(..., description="Email đăng ký")
    password: str = Field(..., description="Mật khẩu đăng nhập")


# thong tin co ban cua user
class UserBasicOut(BaseModel):
    user_id: int
    email: EmailStr
    user_name: str
    avatar_url: Optional[str] = None
    created_at: datetime
    role: Optional[RoleOut] = None
    permissions: List[str] = Field(
        default=[], description="Danh sách mã quyền hạn của người dùng"
    )


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "Bearer"
    expires_in: int = 86400  # thoi gian hieu luc cua token
    user: UserBasicOut


class ForgotPasswordRequest(BaseModel):
    email: EmailStr = Field(..., description="Email nhận mã xác thực đặt lại mật khẩu")


class ResetPasswordRequest(BaseModel):
    email: EmailStr = Field(..., description="Email cần đặt lại mật khẩu")
    reset_code: str = Field(
        ..., description="Mã OTP hoặc token xác thực đặt lại mật khẩu"
    )
    new_password: str = Field(
        ..., min_length=6, max_length=100, description="Mật khẩu mới"
    )


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(..., description="Mật khẩu hiện tại")
    new_password: str = Field(
        ..., min_length=6, max_length=100, description="Mật khẩu mới"
    )
