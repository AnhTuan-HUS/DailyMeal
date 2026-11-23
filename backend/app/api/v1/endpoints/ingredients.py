import math
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import delete, func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models import Ingredient, IngredientNutrient, Nutrient
from app.schemas.common import PaginationMeta, ResponseEnvelope
from app.schemas.ingredient import (
    IngredientCreate,
    IngredientOut,
    IngredientUpdate,
    NutrientIn,
    NutrientOut,
)

router = APIRouter()


def _map_ingredient_to_out(ingredient: Ingredient) -> IngredientOut:
    """
    Chuyển đổi thực thể ORM Ingredient (kèm quan hệ IngredientNutrient -> Nutrient)
    sang đối tượng Pydantic IngredientOut.

    Đầu vào:
        ingredient (Ingredient): Đối tượng ORM Ingredient đã được nạp sẵn `nutrients.nutrient`.
    Đầu ra:
        IngredientOut: Schema chuẩn hóa trả về cho client.
    """
    nutrient_list: List[NutrientOut] = []
    for item in ingredient.nutrients:
        if item.nutrient is not None:
            nutrient_list.append(
                NutrientOut(
                    nutrient_id=item.nutrient_id,
                    nutrient_name=item.nutrient.nutrient_name,
                    unit=item.nutrient.unit,
                    nutrient_amount=float(item.nutrient_amount),
                )
            )

    return IngredientOut(
        ingredient_id=ingredient.ingredient_id,
        code=ingredient.code,
        ingredient_name=ingredient.ingredient_name,
        food_group=ingredient.food_group,
        market_stall=ingredient.market_stall,
        waste_rate_percent=float(ingredient.waste_rate_percent),
        description=ingredient.description,
        image_url=ingredient.image_url,
        nutrients=nutrient_list,
    )


async def _validate_nutrients(
    db: AsyncSession, nutrients: List[NutrientIn]
) -> None:
    """
    Kiểm tra danh sách chất dinh dưỡng truyền vào có bị trùng lặp ID
    hoặc chứa nutrient_id không tồn tại trong cơ sở dữ liệu hay không.

    Đầu vào:
        db (AsyncSession): Phiên kết nối CSDL bất đồng bộ.
        nutrients (List[NutrientIn]): Danh sách chất dinh dưỡng cần gán.
    Đầu ra:
        None (Ném HTTPException 400 nếu phát hiện dữ liệu không hợp lệ).
    """
    if not nutrients:
        return

    nutrient_ids = [n.nutrient_id for n in nutrients]
    if len(nutrient_ids) != len(set(nutrient_ids)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Danh sách dinh dưỡng có chứa nutrient_id bị trùng lặp",
        )

    stmt = select(Nutrient.nutrient_id).where(Nutrient.nutrient_id.in_(nutrient_ids))
    result = await db.execute(stmt)
    existing_ids = set(result.scalars().all())

    missing_ids = sorted(set(nutrient_ids) - existing_ids)
    if missing_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Các nutrient_id không tồn tại trong hệ thống: {missing_ids}",
        )


async def _load_ingredient_with_nutrients(
    db: AsyncSession, ingredient_id: int
) -> Optional[Ingredient]:
    """
    Truy vấn một nguyên liệu theo ID kèm nạp trước (eager load) bảng trung gian
    IngredientNutrient và bảng Nutrient.

    Đầu vào:
        db (AsyncSession): Phiên kết nối CSDL bất đồng bộ.
        ingredient_id (int): Khóa chính của nguyên liệu cần tải.
    Đầu ra:
        Optional[Ingredient]: Đối tượng Ingredient hoặc None nếu không tìm thấy.
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
    Tạo mới một nguyên liệu trong bảng `ingredient` và các bản ghi dinh dưỡng
    tương ứng trong bảng `ingredient_nutrient`.

    Đầu vào:
        payload (IngredientCreate): Thông tin nguyên liệu và danh sách dinh dưỡng.
        db (AsyncSession): Phiên làm việc CSDL bất đồng bộ.
    Đầu ra:
        ResponseEnvelope[IngredientOut]: Thông tin nguyên liệu vừa được tạo.
    """
    normalized_code = payload.code.strip().upper()

    # 1. Kiểm tra trùng mã code
    code_check_stmt = select(Ingredient.ingredient_id).where(
        Ingredient.code == normalized_code
    )
    existing = await db.execute(code_check_stmt)
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Mã nguyên liệu '{normalized_code}' đã tồn tại trong hệ thống",
        )

    # 2. Kiểm tra tính hợp lệ của danh sách nutrient_id
    await _validate_nutrients(db, payload.nutrients)

    # 3. Khởi tạo thực thể Ingredient và IngredientNutrient
    new_ingredient = Ingredient(
        code=normalized_code,
        ingredient_name=payload.ingredient_name.strip(),
        food_group=payload.food_group.strip(),
        market_stall=payload.market_stall.strip(),
        waste_rate_percent=payload.waste_rate_percent,
        description=payload.description,
        image_url=payload.image_url,
    )
    db.add(new_ingredient)
    await db.flush()

    for n_item in payload.nutrients:
        db.add(
            IngredientNutrient(
                ingredient_id=new_ingredient.ingredient_id,
                nutrient_id=n_item.nutrient_id,
                nutrient_amount=n_item.nutrient_amount,
            )
        )

    await db.commit()

    # 4. Tải lại nguyên liệu kèm quan hệ dinh dưỡng để trả về
    loaded_ingredient = await _load_ingredient_with_nutrients(
        db, new_ingredient.ingredient_id
    )
    return ResponseEnvelope(
        success=True,
        message="Thêm nguyên liệu thành công",
        data=_map_ingredient_to_out(loaded_ingredient),
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
    Truy vấn danh sách nguyên liệu có hỗ trợ tìm kiếm từ khóa, lọc nhóm thực phẩm
    và phân trang.

    Đầu vào:
        q (Optional[str]): Từ khóa tìm trên `ingredient_name` hoặc `code`.
        food_group (Optional[str]): Tên nhóm thực phẩm cần lọc.
        page (int): Số thứ tự trang (bắt đầu từ 1).
        limit (int): Số bản ghi tối đa trên một trang.
        db (AsyncSession): Phiên làm việc CSDL bất đồng bộ.
    Đầu ra:
        ResponseEnvelope[List[IngredientOut]]: Danh sách nguyên liệu và thông tin phân trang.
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

    # 1. Đếm tổng số bản ghi khớp điều kiện
    count_stmt = select(func.count(Ingredient.ingredient_id))
    if filters:
        count_stmt = count_stmt.where(*filters)
    total_items = (await db.execute(count_stmt)).scalar_one()
    total_pages = math.ceil(total_items / limit) if total_items > 0 else 0

    # 2. Truy vấn dữ liệu phân trang kèm thông tin dinh dưỡng
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
    ingredients = result.scalars().all()

    return ResponseEnvelope(
        success=True,
        message="Lấy danh sách nguyên liệu thành công",
        data=[_map_ingredient_to_out(ing) for ing in ingredients],
        meta=PaginationMeta(
            page=page,
            limit=limit,
            total_items=total_items,
            total_pages=total_pages,
        ),
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
    Lấy thông tin chi tiết của một nguyên liệu theo `ingredient_id`.

    Đầu vào:
        ingredient_id (int): ID nguyên liệu cần tra cứu.
        db (AsyncSession): Phiên làm việc CSDL bất đồng bộ.
    Đầu ra:
        ResponseEnvelope[IngredientOut]: Chi tiết nguyên liệu và thành phần dinh dưỡng.
    """
    ingredient = await _load_ingredient_with_nutrients(db, ingredient_id)
    if ingredient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy nguyên liệu với ID {ingredient_id}",
        )

    return ResponseEnvelope(
        success=True,
        message="Lấy thông tin nguyên liệu thành công",
        data=_map_ingredient_to_out(ingredient),
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
    Cập nhật thông tin nguyên liệu và làm mới danh sách dinh dưỡng (nếu được cung cấp).

    Đầu vào:
        ingredient_id (int): ID nguyên liệu cần chỉnh sửa.
        payload (IngredientUpdate): Các trường thông tin cần cập nhật.
        db (AsyncSession): Phiên làm việc CSDL bất đồng bộ.
    Đầu ra:
        ResponseEnvelope[IngredientOut]: Thông tin nguyên liệu sau khi cập nhật.
    """
    ingredient = await _load_ingredient_with_nutrients(db, ingredient_id)
    if ingredient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy nguyên liệu với ID {ingredient_id}",
        )

    # 1. Nếu đổi mã code, kiểm tra không được trùng với nguyên liệu khác
    if payload.code is not None:
        normalized_code = payload.code.strip().upper()
        if normalized_code != ingredient.code:
            dup_stmt = select(Ingredient.ingredient_id).where(
                Ingredient.code == normalized_code,
                Ingredient.ingredient_id != ingredient_id,
            )
            if (await db.execute(dup_stmt)).scalar_one_or_none() is not None:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Mã nguyên liệu '{normalized_code}' đã được sử dụng",
                )
            ingredient.code = normalized_code

    # 2. Cập nhật các trường thuộc tính nếu có truyền lên
    if payload.ingredient_name is not None:
        ingredient.ingredient_name = payload.ingredient_name.strip()
    if payload.food_group is not None:
        ingredient.food_group = payload.food_group.strip()
    if payload.market_stall is not None:
        ingredient.market_stall = payload.market_stall.strip()
    if payload.waste_rate_percent is not None:
        ingredient.waste_rate_percent = payload.waste_rate_percent
    if payload.description is not None:
        ingredient.description = payload.description
    if payload.image_url is not None:
        ingredient.image_url = payload.image_url

    # 3. Đồng bộ lại bảng trung gian ingredient_nutrient nếu payload.nutrients được truyền lên
    if payload.nutrients is not None:
        await _validate_nutrients(db, payload.nutrients)
        await db.execute(
            delete(IngredientNutrient).where(
                IngredientNutrient.ingredient_id == ingredient_id
            )
        )
        for n_item in payload.nutrients:
            db.add(
                IngredientNutrient(
                    ingredient_id=ingredient_id,
                    nutrient_id=n_item.nutrient_id,
                    nutrient_amount=n_item.nutrient_amount,
                )
            )

    await db.commit()
    db.expire(ingredient)

    updated_ingredient = await _load_ingredient_with_nutrients(db, ingredient_id)
    return ResponseEnvelope(
        success=True,
        message="Cập nhật nguyên liệu thành công",
        data=_map_ingredient_to_out(updated_ingredient),
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
    Xóa một nguyên liệu khỏi danh mục nếu nguyên liệu đó chưa bị ràng buộc
    bởi bất kỳ công thức món ăn nào (`recipe_ingredient`).

    Đầu vào:
        ingredient_id (int): ID nguyên liệu cần xóa.
        db (AsyncSession): Phiên làm việc CSDL bất đồng bộ.
    Đầu ra:
        ResponseEnvelope[None]: Thông báo xóa thành công.
    """
    stmt = select(Ingredient).where(Ingredient.ingredient_id == ingredient_id)
    ingredient = (await db.execute(stmt)).scalar_one_or_none()
    if ingredient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy nguyên liệu với ID {ingredient_id}",
        )

    try:
        await db.delete(ingredient)
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Không thể xóa nguyên liệu này vì đang được sử dụng trong công thức món ăn",
        )

    return ResponseEnvelope(
        success=True,
        message=f"Đã xóa nguyên liệu ID {ingredient_id}",
        data=None,
    )
