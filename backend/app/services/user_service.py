from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import create_access_token, decode_access_token
from app.core.config import settings
import hashlib
import time

from app.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    UserBasicOut,
    TokenResponse,
)
from app.schemas.role_permission import RoleOut
from app.repositories import user_repo

from app.services.redis_service import redis_service


# bam mat khau
def hash_password(password: str) -> str:
    """
    Function hash password

    Args:
        - password : str

    Return:
        - password_hash : str
    """
    return hashlib.sha256(password.encode()).hexdigest()


async def register_user(db: AsyncSession, user_in: UserRegisterRequest) -> UserBasicOut:
    """
    Register new user

    Args:
        - db : AsyncSession
        - user_in : UserRegisterRequest

    Return:
        - UserBasicOut
    """
    # 1. Kiem tra email da duoc su dung chua
    is_exits = await user_repo.check_mail_exits(db, user_in.email)

    if is_exits:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email da duoc su dung"
        )

    # 2. Lay role_id cho user (mac dinh la GENERAL_USER)
    role_id = await user_repo.get_role_id_by_name(db, "GENERAL_USER")
    if not role_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Chua thiet lap role cho GENERAL_USER",
        )

    # 3. Bam mat khau
    password_hash = hash_password(user_in.password)

    # 4. Tao nguoi dung moi trong database
    new_user = await user_repo.create_user(
        db, user_in.user_name, user_in.email, password_hash, role_id
    )

    # 5. Lay role va danh sach permissions de dong goi UserBasicOut
    role_obj = await user_repo.get_role_by_id(db, role_id)
    permission_names = await user_repo.get_permission_by_role_id(db, role_id)

    return UserBasicOut(
        user_id=new_user.user_id,
        email=new_user.email,
        user_name=new_user.user_name,
        avatar_url=new_user.avatar_url,
        created_at=new_user.created_at,
        role=RoleOut.model_validate(role_obj) if role_obj else None,
        permissions=permission_names,
    )


# login user
async def user_login(db: AsyncSession, user_in: UserLoginRequest) -> TokenResponse:
    """
    User login
    Args:
        db (AsyncSession): connection
        user_in (UserLoginRequest): du lieu nguoi dung

    Raises:
        HTTPException: Trang thai HTTP

    Returns:
        TokenResponse: token
    """
    user = await user_repo.get_user_by_email(db, user_in.email)
    password_in_hash = hash_password(user_in.password)
    # check password after hash
    if not user or user.password_hash != password_in_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email or password incorrect!",
        )

    role = await user_repo.get_role_by_id(db, user.role_id)
    permissions = await user_repo.get_permission_by_role_id(db, user.role_id)

    # tao jwt payload
    jwt_payload = {
        "sub": str(user.user_id),
        "email": user.email,
        "role": role.role_name if role else "GENERAL_USER",
    }

    token_str = create_access_token(jwt_payload)

    user_basic = UserBasicOut(
        user_id=user.user_id,
        email=user.email,
        user_name=user.user_name,
        avatar_url=user.avatar_url,
        created_at=user.created_at,
        role=RoleOut.model_validate(role) if role else None,
        permissions=permissions,
    )

    return TokenResponse(
        access_token=token_str,
        token_type="Bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # Đổi ra giây
        user=user_basic,
    )


async def user_logout(token: str):
    """
    Phương thức đăng xuất và add token vào blacklist

    Args:
        token (str): token access
    """
    # dencode token
    payload = decode_access_token(token=token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token không hợp lệ hoặc đã hết hạn",
        )

    if await redis_service.is_token_blacklisted(payload["jti"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token này đã được đăng xuất trước đó",
        )

    # save token vao blacklist
    ttl = int(payload["exp"] - time.time())
    await redis_service.add_token_to_blacklist(jti=payload["jti"], ttl_seconds=ttl)
