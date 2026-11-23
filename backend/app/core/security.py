import jwt
from datetime import datetime, timedelta, timezone
from app.core.config import settings
from typing import Optional
import uuid


def create_access_token(data: dict) -> str:
    """
    Generate JWT access token

    Args:
        data (dict): du lieu tu user

    Returns:
        str: token
    """
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({"exp": expire})
    to_encode.update({"jti": uuid.uuid4().hex})  # thêm trường dữ liệu

    encode_jwt = jwt.encode(
        to_encode, key=settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )

    return encode_jwt


# giai hoa token
def decode_access_token(token: str) -> Optional[dict]:
    """
    Phương thức giải mã token

    Args:
        token (str): access token

    Returns:
        Optional[dict]: Thông tin về user
    """
    try:
        payload = jwt.decode(
            token, key=settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )

        return payload
    except jwt.PyJWKError:
        return None
