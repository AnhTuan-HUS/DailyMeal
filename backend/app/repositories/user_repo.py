from sqlalchemy import text, select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.models import User, Role


# kiem tra nguoi dung cos ton tai
async def check_mail_exits(db: AsyncSession, email: str) -> bool:
    """
    Check email is exits

    Args:
        - email : str

    Return
        - bool
    """
    email_normal = email.strip()

    stmt = text("SELECT 1 FROM users WHERE email = :email")
    result = await db.execute(stmt, {"email": email_normal})

    return result.scalar_one_or_none() is not None


# get user by email
async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    """
    Get user by email

    Args:
        - db : AsyncSession
        - email : str

    Return:
        - user: Optional[User]
    """

    stmt = select(User).where(User.email == email.strip().lower())
    result = await db.execute(stmt)

    return result.scalar_one_or_none()


async def get_role_id_by_name(db: AsyncSession, role_name: str) -> Optional[int]:
    """
    Get role id from role_name

    Args:
        - role_name : str

    Return
        - role_id : Optional[int]
    """

    stmt = text("SELECT role_id FROM role WHERE role_name = :role_name")
    result = await db.execute(stmt, {"role_name": role_name})

    return result.scalar_one_or_none()


async def get_role_by_id(db: AsyncSession, role_id: int) -> Optional[Role]:
    """Get information role from role_id"""

    stmt = select(Role).where(Role.role_id == role_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_permission_by_role_id(db: AsyncSession, role_id: int) -> List[str]:
    """Get list permission by role_id"""
    stmt = text(
        """
        SELECT p.permission_name
        FROM permission p
        JOIN role_permission rp ON rp.permission_id = p.permission_id
        WHERE rp.role_id = :role_id
        """
    )
    result = await db.execute(stmt, {"role_id": role_id})
    return list(result.scalars().all())


async def create_user(
    db: AsyncSession, user_name: str, email: str, password_hash: str, role_id: int
) -> User:
    """
    Create new user

    Args:
        - email : str
        - password_hash : str
        - user_name : str

    Return
        - User
    """

    new_user = User(
        email=email,
        password_hash=password_hash,
        user_name=user_name,
        role_id=role_id,
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user
