from typing import Optional, Any
from app.core.redis import get_redis


class RedisService:
    @staticmethod
    async def set_value(key: str, value: Any, expire_seconds: Optional[int] = None) -> bool:
        """
        Lưu một giá trị vào Redis với thời gian hết hạn (expire_seconds) tùy chọn.
        """
        client = await get_redis()
        return await client.set(name=key, value=str(value), ex=expire_seconds)

    @staticmethod
    async def get_value(key: str) -> Optional[str]:
        """
        Lấy giá trị từ Redis theo key.
        """
        client = await get_redis()
        return await client.get(name=key)

    @staticmethod
    async def delete_key(key: str) -> bool:
        """
        Xóa một key khỏi Redis.
        """
        client = await get_redis()
        result = await client.delete(key)
        return result > 0

    @staticmethod
    async def add_token_to_blacklist(token: str, ttl_seconds: int) -> bool:
        """
        Đưa token vào danh sách đen (Blacklist) với thời gian sống (TTL)
        bằng thời gian còn lại trước khi token tự hết hạn.
        """
        if ttl_seconds <= 0:
            return True
        key = f"blacklist:{token}"
        client = await get_redis()
        return await client.set(name=key, value="revoked", ex=ttl_seconds)

    @staticmethod
    async def is_token_blacklisted(token: str) -> bool:
        """
        Kiểm tra xem token có nằm trong Blacklist (đã đăng xuất) hay không.
        """
        key = f"blacklist:{token}"
        client = await get_redis()
        exists = await client.exists(key)
        return exists > 0


redis_service = RedisService()
