from typing import Optional
import redis.asyncio as aioredis
from app.core.config import settings

# Khởi tạo connection pool toàn cục cho Redis
redis_client: Optional[aioredis.Redis] = None


async def init_redis() -> aioredis.Redis:
    """
    Khởi tạo kết nối tới Redis
    """
    global redis_client
    if redis_client is None:
        redis_client = aioredis.from_url(
            settings.REDIS_URL,
            decode_responses=True,
            encoding="utf-8",
        )
    return redis_client


async def close_redis() -> None:
    """
    Đóng kết nối Redis khi ứng dụng shutdown
    """
    global redis_client
    if redis_client is not None:
        await redis_client.aclose()
        redis_client = None


async def get_redis() -> aioredis.Redis:
    """
    Dependency injection cung cấp Redis client cho FastAPI endpoints/services
    """
    global redis_client
    if redis_client is None:
        await init_redis()
    return redis_client
