from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models import DishType
from app.schemas.common import ResponseEnvelope
from app.schemas.recipe import DishTypeOut

router = APIRouter()


@router.get(
    "",
    response_model=ResponseEnvelope[List[DishTypeOut]],
    summary="Lấy danh mục loại món ăn",
    description="Lấy danh sách các loại món ăn (Món mặn, Món canh, Món xào, Món chay,...)"
)
async def list_dish_types(db: AsyncSession = Depends(get_db)):
    # 1. Tạo câu truy vấn: Lấy tất cả loại món ăn, sắp xếp theo ID tăng dần
    stmt = select(DishType).order_by(DishType.dish_type_id.asc())

    # 2. Gửi câu truy vấn tới Database PostgreSQL
    result = await db.execute(stmt)

    # 3. Lấy ra danh sách các đối tượng DishType
    dish_types = result.scalars().all()

    # 4. Đóng gói vào chiếc phong bì ResponseEnvelope và trả về
    return ResponseEnvelope(
        success=True,
        message="Lấy danh mục loại món ăn thành công",
        data=dish_types
    )
