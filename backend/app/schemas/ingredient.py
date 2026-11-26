from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class NutrientIn(BaseModel):
    """Dữ liệu đầu vào khi gán một chất dinh dưỡng cho nguyên liệu."""

    nutrient_id: int = Field(..., gt=0, description="ID của chất dinh dưỡng trong bảng nutrient")
    nutrient_amount: float = Field(
        ..., ge=0.0, description="Hàm lượng chất dinh dưỡng trên 100g nguyên liệu"
    )


class NutrientOut(BaseModel):
    """Dữ liệu đầu ra hiển thị thông tin chất dinh dưỡng của một nguyên liệu."""

    nutrient_id: int = Field(..., description="ID của chất dinh dưỡng")
    nutrient_name: str = Field(..., description="Tên chất dinh dưỡng (VD: Protein, Lipid)")
    unit: str = Field(..., description="Đơn vị đo (VD: g, mg, kcal)")
    nutrient_amount: float = Field(..., description="Hàm lượng trên 100g nguyên liệu")

    model_config = ConfigDict(from_attributes=True)


class IngredientCreate(BaseModel):
    """Dữ liệu đầu vào khi tạo mới một nguyên liệu vào danh mục chuẩn."""

    code: str = Field(
        ..., min_length=1, max_length=20, description="Mã nguyên liệu duy nhất (VD: THIT_BA_CHI)"
    )
    ingredient_name: str = Field(
        ..., min_length=1, max_length=150, description="Tên hiển thị của nguyên liệu"
    )
    food_group: str = Field(
        ..., min_length=1, max_length=100, description="Nhóm thực phẩm (VD: Thịt, Rau củ)"
    )
    market_stall: str = Field(
        default="Quầy gia vị & đồ khô",
        min_length=1,
        max_length=100,
        description="Quầy hàng tại chợ/siêu thị để gom nhóm đi chợ",
    )
    waste_rate_percent: float = Field(
        default=0.0,
        ge=0.0,
        le=100.0,
        description="Tỷ lệ thải bỏ không ăn được (%) từ 0 đến 100",
    )
    description: Optional[str] = Field(default=None, description="Mô tả thêm về nguyên liệu")
    image_url: Optional[str] = Field(default=None, description="Đường dẫn ảnh minh họa")
    nutrients: List[NutrientIn] = Field(
        default_factory=list, description="Danh sách thành phần dinh dưỡng trên 100g"
    )


class IngredientUpdate(BaseModel):
    """Dữ liệu đầu vào khi cập nhật thông tin nguyên liệu."""

    code: Optional[str] = Field(
        default=None, min_length=1, max_length=20, description="Mã nguyên liệu duy nhất"
    )
    ingredient_name: Optional[str] = Field(
        default=None, min_length=1, max_length=150, description="Tên nguyên liệu"
    )
    food_group: Optional[str] = Field(
        default=None, min_length=1, max_length=100, description="Nhóm thực phẩm"
    )
    market_stall: Optional[str] = Field(
        default=None, min_length=1, max_length=100, description="Quầy hàng tại chợ/siêu thị"
    )
    waste_rate_percent: Optional[float] = Field(
        default=None, ge=0.0, le=100.0, description="Tỷ lệ thải bỏ (%)"
    )
    description: Optional[str] = Field(default=None, description="Mô tả nguyên liệu")
    image_url: Optional[str] = Field(default=None, description="Đường dẫn ảnh minh họa")
    nutrients: Optional[List[NutrientIn]] = Field(
        default=None,
        description="Danh sách dinh dưỡng mới (nếu truyền lên sẽ thay thế danh sách cũ)",
    )


class IngredientOut(BaseModel):
    """Dữ liệu đầu ra của một nguyên liệu kèm danh sách dinh dưỡng."""

    ingredient_id: int
    code: str
    ingredient_name: str
    food_group: str
    market_stall: str
    waste_rate_percent: float
    description: Optional[str] = None
    image_url: Optional[str] = None
    nutrients: List[NutrientOut] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)
