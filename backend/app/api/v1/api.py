from fastapi import APIRouter

# Hiện tại chỉ có dish_types đã hoàn thiện schema và logic DB.
# Các module khác sẽ được mở khi chúng ta tạo xong schema và logic tương ứng.
from app.api.v1.endpoints import (
    # auth,
    # users,
    # roles,
    # permissions,
    # eating_profiles,
    ingredients,
    dish_types,
    # recipes,
    # recommendations,
    # available_ingredients,
    # shopping_lists,
)

api_router = APIRouter()

# -------------------------------------------------------------
# Phân hệ 2: Danh mục Nguyên liệu & Loại món ăn (Đã hoàn thiện)
# -------------------------------------------------------------
api_router.include_router(
    ingredients.router,
    prefix="/ingredients",
    tags=["2.1 Danh mục nguyên liệu (Ingredients)"]
)

api_router.include_router(
    dish_types.router,
    prefix="/dish-types",
    tags=["2.2 Loại món ăn (Dish Types)"]
)

# Các phân hệ còn lại sẽ lần lượt được đăng ký khi hoàn thiện logic:
# - auth, users, roles, permissions
# - ingredients, recipes, recommendations
# - available_ingredients, shopping_lists
