from fastapi import APIRouter, status, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services import user_service
from sqlalchemy import text
from app.schemas.common import ResponseEnvelope
from app.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    UserBasicOut,
    TokenResponse,
)

router = APIRouter()


@router.post(
    "/register",
    response_model=ResponseEnvelope[UserBasicOut],
    status_code=status.HTTP_201_CREATED,
    summary="Đăng ký tài khoản mới",
    description="Tạo tài khoản người dùng mới với vai trò mặc định GENERAL_USER",
)
async def register_user(
    payload: UserRegisterRequest, db: AsyncSession = Depends(get_db)
):
    """
    API tao tai khoan moi
    """
    user = await user_service.register_user(db, payload)
    return ResponseEnvelope(
        success=True, message="Đăng ký tài khoản thành công", data=user
    )


# user login
@router.post(
    "/login",
    response_model=ResponseEnvelope[TokenResponse],
    summary="Đăng nhập tài khoản",
    description="Xác thực email và mật khẩu, trả về JWT Access Token",
)
async def login_user(
    payload: UserLoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    API Dang nhap he thong va nhan JWT Access Token

    Args:
        payload (UserLoginRequest):
        db (AsyncSession, optional): Defaults to Depends(get_db).

    Returns:
        ResponseEnvenlope
    """
    token_response = await user_service.user_login(db, payload)
    return ResponseEnvelope(
        success=True,
        message="Đăng nhập thành công",
        data=token_response,
    )
