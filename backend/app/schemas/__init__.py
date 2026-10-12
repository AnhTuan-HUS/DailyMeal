from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime


# -----------------------------
# Ingredient Schemas
# -----------------------------
class IngredientBase(BaseModel):
    name: str
    category: str
    stall: str
    default_unit: str = "g"
    estimated_price_per_unit: float = 0.0
    shelf_life_days: int = 7


class IngredientOut(IngredientBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


# -----------------------------
# Recipe Schemas
# -----------------------------
class RecipeBase(BaseModel):
    title: str
    dish_type: str
    emoji: str = "🍲"
    description: Optional[str] = None
    cook_time_minutes: int = 20
    kcal: int = 300
    protein_g: float = 20.0
    carb_g: float = 30.0
    fat_g: float = 10.0
    sodium_note: Optional[str] = None
    branch_baby_tip: Optional[str] = None
    branch_adult_tip: Optional[str] = None


class RecipeOut(RecipeBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


# -----------------------------
# Meal Combo Schemas
# -----------------------------
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


# -----------------------------
# Fridge Item Schemas
# -----------------------------
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


# -----------------------------
# AI Request & Response Schemas
# -----------------------------
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
