from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.common import ResponseEnvelope
from app.schemas.ingredient import (
    IngredientCreate,
    IngredientOut,
    IngredientUpdate,
)
from app.services import ingredient_service

router = APIRouter()


@router.post(
    "",
    response_model=ResponseEnvelope[IngredientOut],
    status_code=status.HTTP_201_CREATED,
    summary="Thêm nguyên liệu mới vào danh mục",
    description="Thêm nguyên liệu mới kèm chỉ số dinh dưỡng (ADMIN, CONTENT_EDITOR)",
)
async def create_ingredient(
    payload: IngredientCreate,
    db: AsyncSession = Depends(get_db),
) -> ResponseEnvelope[IngredientOut]:
    """
    Endpoint tạo mới một nguyên liệu trong danh mục kèm danh sách dinh dưỡng.

    Đầu vào:
        payload (IngredientCreate): Thông tin nguyên liệu và danh sách dinh dưỡng.
        db (AsyncSession): Phiên làm việc CSDL bất đồng bộ.
    Đầu ra:
        ResponseEnvelope[IngredientOut]: Thông tin nguyên liệu vừa được tạo.
    """
    ingredient_out = await ingredient_service.create_ingredient(db, payload)
    return ResponseEnvelope(
        success=True,
        message="Thêm nguyên liệu thành công",
        data=ingredient_out,
    )


@router.get(
    "",
    response_model=ResponseEnvelope[List[IngredientOut]],
    summary="Xem danh sách nguyên liệu",
    description="Tìm kiếm, lọc và phân trang danh mục nguyên liệu",
)
async def list_ingredients(
    q: Optional[str] = Query(None, description="Từ khóa tìm kiếm theo tên hoặc mã"),
    food_group: Optional[str] = Query(None, description="Lọc theo nhóm thực phẩm"),
    page: int = Query(1, ge=1, description="Trang hiện tại"),
    limit: int = Query(20, ge=1, le=100, description="Số lượng mỗi trang"),
    db: AsyncSession = Depends(get_db),
) -> ResponseEnvelope[List[IngredientOut]]:
    """
    Endpoint lấy danh sách nguyên liệu có tìm kiếm, lọc theo nhóm thực phẩm và phân trang.

    Đầu vào:
        q (Optional[str]): Từ khóa tìm trên `ingredient_name` hoặc `code`.
        food_group (Optional[str]): Tên nhóm thực phẩm cần lọc.
        page (int): Số thứ tự trang (bắt đầu từ 1).
        limit (int): Số bản ghi tối đa trên một trang.
        db (AsyncSession): Phiên làm việc CSDL bất đồng bộ.
    Đầu ra:
        ResponseEnvelope[List[IngredientOut]]: Danh sách nguyên liệu và thông tin phân trang.
    """
    items, meta = await ingredient_service.list_ingredients(
        db=db,
        q=q,
        food_group=food_group,
        page=page,
        limit=limit,
    )
    return ResponseEnvelope(
        success=True,
        message="Lấy danh sách nguyên liệu thành công",
        data=items,
        meta=meta,
    )


@router.get(
    "/{ingredient_id}",
    response_model=ResponseEnvelope[IngredientOut],
    summary="Xem chi tiết một nguyên liệu",
    description="Lấy thông tin chi tiết và thành phần dinh dưỡng của nguyên liệu",
)
async def get_ingredient(
    ingredient_id: int,
    db: AsyncSession = Depends(get_db),
) -> ResponseEnvelope[IngredientOut]:
    """
    Endpoint lấy thông tin chi tiết của một nguyên liệu theo `ingredient_id`.

    Đầu vào:
        ingredient_id (int): ID nguyên liệu cần tra cứu.
        db (AsyncSession): Phiên làm việc CSDL bất đồng bộ.
    Đầu ra:
        ResponseEnvelope[IngredientOut]: Chi tiết nguyên liệu và thành phần dinh dưỡng.
    """
    ingredient_out = await ingredient_service.get_ingredient(db, ingredient_id)
    return ResponseEnvelope(
        success=True,
        message="Lấy thông tin nguyên liệu thành công",
        data=ingredient_out,
    )


@router.put(
    "/{ingredient_id}",
    response_model=ResponseEnvelope[IngredientOut],
    summary="Cập nhật thông tin nguyên liệu",
    description="Chỉnh sửa thông tin và chỉ số dinh dưỡng của nguyên liệu",
)
async def update_ingredient(
    ingredient_id: int,
    payload: IngredientUpdate,
    db: AsyncSession = Depends(get_db),
) -> ResponseEnvelope[IngredientOut]:
    """
    Endpoint cập nhật thông tin nguyên liệu và đồng bộ danh sách dinh dưỡng (nếu có).

    Đầu vào:
        ingredient_id (int): ID nguyên liệu cần chỉnh sửa.
        payload (IngredientUpdate): Các trường thông tin cần cập nhật.
        db (AsyncSession): Phiên làm việc CSDL bất đồng bộ.
    Đầu ra:
        ResponseEnvelope[IngredientOut]: Thông tin nguyên liệu sau khi cập nhật.
    """
    ingredient_out = await ingredient_service.update_ingredient(
        db, ingredient_id, payload
    )
    return ResponseEnvelope(
        success=True,
        message="Cập nhật nguyên liệu thành công",
        data=ingredient_out,
    )


@router.delete(
    "/{ingredient_id}",
    response_model=ResponseEnvelope[None],
    summary="Xóa nguyên liệu khỏi danh mục",
    description="Xóa nguyên liệu (ADMIN, CONTENT_EDITOR)",
)
async def delete_ingredient(
    ingredient_id: int,
    db: AsyncSession = Depends(get_db),
) -> ResponseEnvelope[None]:
    """
    Endpoint xóa một nguyên liệu khỏi danh mục nếu không bị ràng buộc bởi công thức.

    Đầu vào:
        ingredient_id (int): ID nguyên liệu cần xóa.
        db (AsyncSession): Phiên làm việc CSDL bất đồng bộ.
    Đầu ra:
        ResponseEnvelope[None]: Thông báo xóa thành công.
    """
    await ingredient_service.delete_ingredient(db, ingredient_id)
    return ResponseEnvelope(
        success=True,
        message=f"Đã xóa nguyên liệu ID {ingredient_id}",
        data=None,
    )
