from typing import Generic, TypeVar, Optional, Any
from pydantic import BaseModel

T = TypeVar("T")


class ResponseEnvelope(BaseModel, Generic[T]):
    success: bool = True
    message: str = "Thành công"
    data: Optional[T] = None
    meta: Optional[Any] = None


class PaginationMeta(BaseModel):
    page: int
    limit: int
    total_items: int
    total_pages: int
