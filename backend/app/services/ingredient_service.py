import math
from typing import List, Optional, Tuple
from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Ingredient, IngredientNutrient
from app.repositories import ingredient_repo
from app.schemas.common import PaginationMeta
from app.schemas.ingredient import (
    IngredientCreate,
    IngredientOut,
    IngredientUpdate,
    NutrientIn,
    NutrientOut,
)


def map_ingredient_to_out(ingredient: Ingredient) -> IngredientOut:
    """
    Chuyển đổi thực thể ORM `Ingredient` (kèm quan hệ `nutrients.nutrient`)
    sang đối tượng Pydantic `IngredientOut`.

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


async def validate_nutrients(
    db: AsyncSession, nutrients: List[NutrientIn]
) -> None:
    """
    Kiểm tra danh sách chất dinh dưỡng truyền vào có bị trùng lặp `nutrient_id`
    hoặc chứa ID không tồn tại trong cơ sở dữ liệu hay không.

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

    existing_ids = await ingredient_repo.get_existing_nutrient_ids(db, nutrient_ids)
    missing_ids = sorted(set(nutrient_ids) - existing_ids)
    if missing_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Các nutrient_id không tồn tại trong hệ thống: {missing_ids}",
        )


async def create_ingredient(
    db: AsyncSession, payload: IngredientCreate
) -> IngredientOut:
    """
    Tạo mới một nguyên liệu trong danh mục kèm danh sách thành phần dinh dưỡng.

    Luồng xử lý:
        1. Chuẩn hóa mã `code` và kiểm tra trùng lặp.
        2. Kiểm tra tính hợp lệ của danh sách `nutrients`.
        3. Khởi tạo bản ghi qua repository và commit transaction (bắt IntegrityError khi race condition).
        4. Nạp lại nguyên liệu kèm quan hệ dinh dưỡng và chuyển sang `IngredientOut`.

    Đầu vào:
        db (AsyncSession): Phiên làm việc CSDL bất đồng bộ.
        payload (IngredientCreate): Thông tin nguyên liệu mới.
    Đầu ra:
        IngredientOut: Thông tin nguyên liệu vừa được tạo.
    """
    normalized_code = payload.code.strip().upper()

    if await ingredient_repo.exists_by_code(db, normalized_code):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Mã nguyên liệu '{normalized_code}' đã tồn tại trong hệ thống",
        )

    await validate_nutrients(db, payload.nutrients)

    new_ingredient = Ingredient(
        code=normalized_code,
        ingredient_name=payload.ingredient_name.strip(),
        food_group=payload.food_group.strip(),
        market_stall=payload.market_stall.strip(),
        waste_rate_percent=payload.waste_rate_percent,
        description=payload.description,
        image_url=payload.image_url,
    )
    nutrient_models = [
        IngredientNutrient(
            nutrient_id=n_item.nutrient_id,
            nutrient_amount=n_item.nutrient_amount,
        )
        for n_item in payload.nutrients
    ]

    try:
        await ingredient_repo.create_ingredient(db, new_ingredient, nutrient_models)
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Mã nguyên liệu '{normalized_code}' đã tồn tại hoặc dữ liệu vi phạm ràng buộc",
        )

    loaded_ingredient = await ingredient_repo.get_by_id_with_nutrients(
        db, new_ingredient.ingredient_id
    )
    return map_ingredient_to_out(loaded_ingredient)


async def list_ingredients(
    db: AsyncSession,
    q: Optional[str] = None,
    food_group: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
) -> Tuple[List[IngredientOut], PaginationMeta]:
    """
    Lấy danh sách nguyên liệu có tìm kiếm, lọc theo nhóm thực phẩm và phân trang.

    Đầu vào:
        db (AsyncSession): Phiên làm việc CSDL bất đồng bộ.
        q (Optional[str]): Từ khóa tìm kiếm theo tên hoặc mã nguyên liệu.
        food_group (Optional[str]): Nhóm thực phẩm cần lọc.
        page (int): Số trang hiện tại (bắt đầu từ 1).
        limit (int): Số bản ghi trên mỗi trang.
    Đầu ra:
        Tuple[List[IngredientOut], PaginationMeta]: Danh sách DTO nguyên liệu và thông tin phân trang.
    """
    ingredients, total_items = await ingredient_repo.list_paginated(
        db=db,
        q=q,
        food_group=food_group,
        page=page,
        limit=limit,
    )
    total_pages = math.ceil(total_items / limit) if total_items > 0 else 0

    items_out = [map_ingredient_to_out(ing) for ing in ingredients]
    meta = PaginationMeta(
        page=page,
        limit=limit,
        total_items=total_items,
        total_pages=total_pages,
    )
    return items_out, meta


async def get_ingredient(db: AsyncSession, ingredient_id: int) -> IngredientOut:
    """
    Lấy thông tin chi tiết của một nguyên liệu kèm danh sách dinh dưỡng theo ID.

    Đầu vào:
        db (AsyncSession): Phiên làm việc CSDL bất đồng bộ.
        ingredient_id (int): ID nguyên liệu cần tra cứu.
    Đầu ra:
        IngredientOut: Thông tin chi tiết nguyên liệu (ném 404 nếu không tồn tại).
    """
    ingredient = await ingredient_repo.get_by_id_with_nutrients(db, ingredient_id)
    if ingredient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy nguyên liệu với ID {ingredient_id}",
        )
    return map_ingredient_to_out(ingredient)


async def update_ingredient(
    db: AsyncSession,
    ingredient_id: int,
    payload: IngredientUpdate,
) -> IngredientOut:
    """
    Cập nhật thông tin nguyên liệu và đồng bộ lại danh sách dinh dưỡng (nếu có truyền lên).

    Luồng xử lý:
        1. Tìm nguyên liệu theo ID (ném 404 nếu không thấy).
        2. Kiểm tra trùng mã `code` nếu người dùng đổi mã.
        3. Cập nhật các trường thuộc tính có trong payload.
        4. Nếu có trường `nutrients`, kiểm tra hợp lệ và thay thế bảng trung gian.
        5. Commit transaction (bắt IntegrityError nếu race condition) và nạp lại kết quả.

    Đầu vào:
        db (AsyncSession): Phiên làm việc CSDL bất đồng bộ.
        ingredient_id (int): ID nguyên liệu cần cập nhật.
        payload (IngredientUpdate): Dữ liệu cần thay đổi.
    Đầu ra:
        IngredientOut: Thông tin nguyên liệu sau khi cập nhật.
    """
    ingredient = await ingredient_repo.get_by_id_with_nutrients(db, ingredient_id)
    if ingredient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy nguyên liệu với ID {ingredient_id}",
        )

    if payload.code is not None:
        normalized_code = payload.code.strip().upper()
        if normalized_code != ingredient.code:
            if await ingredient_repo.exists_by_code(
                db, normalized_code, exclude_ingredient_id=ingredient_id
            ):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Mã nguyên liệu '{normalized_code}' đã được sử dụng",
                )
            ingredient.code = normalized_code

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

    if payload.nutrients is not None:
        await validate_nutrients(db, payload.nutrients)
        nutrient_models = [
            IngredientNutrient(
                ingredient_id=ingredient_id,
                nutrient_id=n_item.nutrient_id,
                nutrient_amount=n_item.nutrient_amount,
            )
            for n_item in payload.nutrients
        ]
        await ingredient_repo.replace_nutrients(db, ingredient_id, nutrient_models)

    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Không thể cập nhật nguyên liệu do trùng mã code hoặc vi phạm ràng buộc dữ liệu",
        )

    db.expire(ingredient)
    updated_ingredient = await ingredient_repo.get_by_id_with_nutrients(
        db, ingredient_id
    )
    return map_ingredient_to_out(updated_ingredient)


async def delete_ingredient(db: AsyncSession, ingredient_id: int) -> None:
    """
    Xóa một nguyên liệu khỏi danh mục nếu chưa bị ràng buộc bởi bảng `recipe_ingredient`.

    Đầu vào:
        db (AsyncSession): Phiên làm việc CSDL bất đồng bộ.
        ingredient_id (int): ID nguyên liệu cần xóa.
    Đầu ra:
        None (Ném 404 nếu không tìm thấy, 409 nếu đang được sử dụng trong công thức).
    """
    ingredient = await ingredient_repo.get_by_id(db, ingredient_id)
    if ingredient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy nguyên liệu với ID {ingredient_id}",
        )

    try:
        await ingredient_repo.delete_ingredient(db, ingredient)
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Không thể xóa nguyên liệu này vì đang được sử dụng trong công thức món ăn",
        )
