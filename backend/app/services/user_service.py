from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import hashlib

from app.schemas.auth import UserRegisterRequest, UserBasicOut
from app.schemas.role_permission import RoleOut
from app.repositories import user_repo


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
