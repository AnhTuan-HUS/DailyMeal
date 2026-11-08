from app.schemas.common import (
    PaginationMeta,
    ResponseEnvelope,
    ErrorDetail,
    ErrorEnvelope,
)
from app.schemas.role_permission import (
    RoleBase,
    RoleCreate,
    RoleUpdate,
    RoleOut,
    PermissionBase,
    PermissionCreate,
    PermissionUpdate,
    PermissionOut,
    RolePermissionsAssignRequest,
    RoleWithPermissionsOut,
)
from app.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    UserBasicOut,
    TokenResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    ChangePasswordRequest,
)
from app.schemas.user import (
    UserProfileUpdate,
    UserRoleUpdate,
    UserOut,
)
from app.schemas.eating_profile import (
    RestrictionItemCreate,
    RestrictionItemOut,
    EatingProfileBase,
    EatingProfileCreate,
    EatingProfileUpdate,
    EatingProfileOut,
)
from app.schemas.ingredient import (
    NutrientBase,
    NutrientOut,
    IngredientNutrientInput,
    IngredientBase,
    IngredientCreate,
    IngredientUpdate,
    IngredientOut,
)
from app.schemas.recipe import (
    DishTypeBase,
    DishTypeOut,
    RecipeIngredientItem,
    RecipeIngredientOut,
    RecipeStep,
    RecipeBase,
    RecipeCreate,
    RecipeUpdate,
    RecipeOut,
)
from app.schemas.recommendation import (
    DishRecommendationFilter,
    DishRecommendationOut,
    DishSelectRequest,
    DishSelectResponse,
    MealSetRecommendationFilter,
    MealSetItemDetail,
    MealSetComboOut,
    MealSetDetailRequest,
    MealSetSelectRequest,
)
from app.schemas.available_ingredient import (
    AvailableIngredientBase,
    AvailableIngredientCreate,
    AvailableIngredientUpdate,
    AvailableIngredientOut,
)
from app.schemas.shopping_list import (
    ShoppingListItemCreate,
    ShoppingListItemUpdate,
    PurchaseStatusUpdate,
    ShoppingListItemOut,
    ShoppingListCreate,
    ShoppingListOut,
    ShoppingListDetailOut,
)

# -----------------------------
# Legacy / AI Schemas for compatibility
# -----------------------------
from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime


class MealComboDishDetail(BaseModel):
    name: str
    emoji: str
    desc: Optional[str] = None


class MealNutrition(BaseModel):
    kcal: int
    protein: str
    carb: str
    fat: str
    sodiumNote: Optional[str] = None


class MealBranchTip(BaseModel):
    baby: Optional[str] = None
    adult: Optional[str] = None


class GroceryItemOut(BaseModel):
    id: int | str
    name: str
    stall: str
    quantity: str
    price: float
    isHave: bool = False
    isBought: bool = False
    model_config = ConfigDict(from_attributes=True)


class CookingTimelineStep(BaseModel):
    step: str
    time: str
    duration: str
    detail: str


class MealComboOut(BaseModel):
    id: int
    title: str
    tag: Optional[str] = None
    tagColor: str
    photoEmoji: str
    themeGradient: str
    cookTime: int
    price: float
    matchRate: int
    mainDish: MealComboDishDetail
    soupDish: MealComboDishDetail
    sideDish: MealComboDishDetail
    nutrition: MealNutrition
    branchTip: MealBranchTip
    groceryItems: List[GroceryItemOut] = []
    timeline: List[CookingTimelineStep] = []
    model_config = ConfigDict(from_attributes=True)


class FridgeItemCreate(BaseModel):
    name: str
    quantity: float = 1.0
    unit: str = "phần"
    expiry_date: datetime


class FridgeItemOut(BaseModel):
    id: int
    name: str
    quantity: float
    unit: str
    expiry_date: datetime
    status: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class AIRecommendationRequest(BaseModel):
    cook_time: int = 30
    budget: float = 120000
    person_count: int = 4
    health_status: Optional[str] = "Bình thường"
    weather: Optional[str] = "Nắng ấm"
    fridge_ingredients: List[str] = []


class AIAssistantRequest(BaseModel):
    question: str
    current_step: Optional[str] = None


class AIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None
