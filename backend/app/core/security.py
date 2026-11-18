import jwt
from datetime import datetime, timedelta, timezone
from app.core.config import settings


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

    encode_jwt = jwt.encode(
        to_encode, key=settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )

    return encode_jwt
