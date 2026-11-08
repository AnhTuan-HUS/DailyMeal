from pydantic import BaseModel, Field
from typing import Generic, TypeVar, Optional, List, Any

T = TypeVar("T")


class PaginationMeta(BaseModel):
    page: int = Field(default=1, description="Trang hiện tại", ge=1)
    limit: int = Field(default=20, description="Số bản ghi mỗi trang", ge=1, le=100)
    total_items: int = Field(default=0, description="Tổng số bản ghi")
    total_pages: int = Field(default=0, description="Tổng số trang")


class ResponseEnvelope(BaseModel, Generic[T]):
    success: bool = Field(default=True, description="Trạng thái thực thi")
    message: str = Field(default="Thao tác thành công", description="Thông điệp phản hồi")
    data: Optional[T] = Field(default=None, description="Dữ liệu trả về")
    meta: Optional[PaginationMeta] = Field(default=None, description="Thông tin phân trang (nếu có)")


class ErrorDetail(BaseModel):
    field: Optional[str] = Field(default=None, description="Tên trường bị lỗi")
    reason: str = Field(description="Lý do lỗi")


class ErrorEnvelope(BaseModel):
    success: bool = Field(default=False, description="Trạng thái thực thi")
    message: str = Field(description="Thông báo lỗi tổng quát")
    error_code: str = Field(description="Mã lỗi hệ thống (e.g. VALIDATION_ERROR, NOT_FOUND)")
    errors: Optional[List[ErrorDetail]] = Field(default=None, description="Danh sách chi tiết các lỗi")
