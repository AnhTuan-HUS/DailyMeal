from typing import List, Optional, Tuple
from sqlalchemy import delete, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import Ingredient, IngredientNutrient, Nutrient


async def get_by_id(db: AsyncSession, ingredient_id: int) -> Optional[Ingredient]:
    """
    Truy vấn một nguyên liệu cơ bản theo khóa chính `ingredient_id`.

    Đầu vào:
        db (AsyncSession): Phiên kết nối CSDL bất đồng bộ.
        ingredient_id (int): Khóa chính của nguyên liệu.
    Đầu ra:
        Optional[Ingredient]: Đối tượng Ingredient hoặc None nếu không tồn tại.
    """
    stmt = select(Ingredient).where(Ingredient.ingredient_id == ingredient_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_by_id_with_nutrients(
    db: AsyncSession, ingredient_id: int
) -> Optional[Ingredient]:
    """
    Truy vấn một nguyên liệu theo ID kèm nạp trước (eager load) bảng trung gian
    `ingredient_nutrient` và bảng `nutrient`.

    Đầu vào:
        db (AsyncSession): Phiên kết nối CSDL bất đồng bộ.
        ingredient_id (int): Khóa chính của nguyên liệu cần tải.
    Đầu ra:
        Optional[Ingredient]: Đối tượng Ingredient kèm dinh dưỡng hoặc None nếu không tìm thấy.
    """
    stmt = (
        select(Ingredient)
        .options(
            selectinload(Ingredient.nutrients).selectinload(IngredientNutrient.nutrient)
        )
        .where(Ingredient.ingredient_id == ingredient_id)
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def exists_by_code(
    db: AsyncSession,
    code: str,
    exclude_ingredient_id: Optional[int] = None,
) -> bool:
    """
    Kiểm tra mã nguyên liệu `code` đã tồn tại trong CSDL hay chưa.

    Đầu vào:
        db (AsyncSession): Phiên kết nối CSDL bất đồng bộ.
        code (str): Mã nguyên liệu đã được chuẩn hóa.
        exclude_ingredient_id (Optional[int]): ID nguyên liệu cần loại trừ khi cập nhật.
    Đầu ra:
        bool: True nếu mã đã tồn tại, ngược lại False.
    """
    stmt = select(Ingredient.ingredient_id).where(Ingredient.code == code)
    if exclude_ingredient_id is not None:
        stmt = stmt.where(Ingredient.ingredient_id != exclude_ingredient_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none() is not None


async def get_existing_nutrient_ids(
    db: AsyncSession, nutrient_ids: List[int]
) -> set[int]:
    """
    Lấy tập hợp các `nutrient_id` đang tồn tại trong bảng `nutrient`
    từ danh sách ID đầu vào.

    Đầu vào:
        db (AsyncSession): Phiên kết nối CSDL bất đồng bộ.
        nutrient_ids (List[int]): Danh sách mã chất dinh dưỡng cần kiểm tra.
    Đầu ra:
        set[int]: Tập hợp các `nutrient_id` hợp lệ có trong CSDL.
    """
    if not nutrient_ids:
        return set()

    stmt = select(Nutrient.nutrient_id).where(Nutrient.nutrient_id.in_(nutrient_ids))
    result = await db.execute(stmt)
    return set(result.scalars().all())


async def list_paginated(
    db: AsyncSession,
    q: Optional[str] = None,
    food_group: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
) -> Tuple[List[Ingredient], int]:
    """
    Truy vấn danh sách nguyên liệu có hỗ trợ tìm kiếm theo tên/mã, lọc theo nhóm
    thực phẩm và phân trang kèm thông tin dinh dưỡng.

    Đầu vào:
        db (AsyncSession): Phiên kết nối CSDL bất đồng bộ.
        q (Optional[str]): Từ khóa tìm kiếm trên `ingredient_name` hoặc `code`.
        food_group (Optional[str]): Tên nhóm thực phẩm cần lọc chính xác.
        page (int): Trang hiện tại (từ 1).
        limit (int): Số bản ghi tối đa trên mỗi trang.
    Đầu ra:
        Tuple[List[Ingredient], int]: Bộ gồm danh sách nguyên liệu và tổng số bản ghi khớp điều kiện.
    """
    filters = []
    if q and q.strip():
        keyword = f"%{q.strip()}%"
        filters.append(
            or_(
                Ingredient.ingredient_name.ilike(keyword),
                Ingredient.code.ilike(keyword),
            )
        )
    if food_group and food_group.strip():
        filters.append(Ingredient.food_group == food_group.strip())

    count_stmt = select(func.count(Ingredient.ingredient_id))
    if filters:
        count_stmt = count_stmt.where(*filters)
    total_items: int = (await db.execute(count_stmt)).scalar_one()

    stmt = (
        select(Ingredient)
        .options(
            selectinload(Ingredient.nutrients).selectinload(IngredientNutrient.nutrient)
        )
        .order_by(Ingredient.ingredient_id.asc())
        .offset((page - 1) * limit)
        .limit(limit)
    )
    if filters:
        stmt = stmt.where(*filters)

    result = await db.execute(stmt)
    ingredients = list(result.scalars().all())
    return ingredients, total_items


async def create_ingredient(
    db: AsyncSession,
    ingredient: Ingredient,
    nutrients: List[IngredientNutrient],
) -> Ingredient:
    """
    Thêm mới thực thể `Ingredient` và các bản ghi `IngredientNutrient` vào phiên
    CSDL hiện tại (chưa commit để tầng Service quản lý transaction).

    Đầu vào:
        db (AsyncSession): Phiên kết nối CSDL bất đồng bộ.
        ingredient (Ingredient): Đối tượng ORM nguyên liệu mới.
        nutrients (List[IngredientNutrient]): Danh sách bản ghi dinh dưỡng liên kết.
    Đầu ra:
        Ingredient: Đối tượng nguyên liệu đã được cấp `ingredient_id` sau `flush()`.
    """
    db.add(ingredient)
    await db.flush()

    for item in nutrients:
        item.ingredient_id = ingredient.ingredient_id
        db.add(item)

    return ingredient


async def replace_nutrients(
    db: AsyncSession,
    ingredient_id: int,
    nutrients: List[IngredientNutrient],
) -> None:
    """
    Xóa toàn bộ liên kết dinh dưỡng cũ của nguyên liệu và thêm danh sách mới
    trong cùng transaction hiện tại.

    Đầu vào:
        db (AsyncSession): Phiên kết nối CSDL bất đồng bộ.
        ingredient_id (int): ID nguyên liệu cần đồng bộ dinh dưỡng.
        nutrients (List[IngredientNutrient]): Danh sách bản ghi dinh dưỡng mới.
    Đầu ra:
        None
    """
    await db.execute(
        delete(IngredientNutrient).where(
            IngredientNutrient.ingredient_id == ingredient_id
        )
    )
    for item in nutrients:
        item.ingredient_id = ingredient_id
        db.add(item)


async def delete_ingredient(db: AsyncSession, ingredient: Ingredient) -> None:
    """
    Đánh dấu xóa một thực thể `Ingredient` trong phiên CSDL hiện tại
    (chưa commit để tầng Service xử lý rollback nếu vi phạm ràng buộc khóa ngoại).

    Đầu vào:
        db (AsyncSession): Phiên kết nối CSDL bất đồng bộ.
        ingredient (Ingredient): Đối tượng ORM nguyên liệu cần xóa.
    Đầu ra:
        None
    """
    await db.delete(ingredient)
