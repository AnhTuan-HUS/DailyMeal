from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class DishTypeOut(BaseModel):
    dish_type_id: int
    dish_type_name: str

    model_config = ConfigDict(from_attributes=True)


class RecipeIngredientOut(BaseModel):
    ingredient_id: int
    ingredient_name: Optional[str] = None
    quantity: float
    unit: str
    preparation_note: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class RecipeStep(BaseModel):
    step_number: int
    instruction_text: str
    image_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class RecipeIngredientCreate(BaseModel):
    ingredient_id: int
    quantity: float
    unit: str
    preparation_note: Optional[str] = None


class RecipeCreate(BaseModel):
    recipe_name: str
    dish_type_id: int
    cooking_method_id: int
    description: Optional[str] = None
    prep_time_minutes: int = 15
    cook_time_minutes: int = 20
    difficulty_level: str = "MEDIUM"
    image_url: Optional[str] = None
    baby_note: Optional[str] = None
    adult_note: Optional[str] = None
    ingredients: List[RecipeIngredientCreate] = []
    steps: Optional[List[RecipeStep]] = []


class RecipeUpdate(BaseModel):
    recipe_name: Optional[str] = None
    dish_type_id: Optional[int] = None
    cooking_method_id: Optional[int] = None
    description: Optional[str] = None
    prep_time_minutes: Optional[int] = None
    cook_time_minutes: Optional[int] = None
    difficulty_level: Optional[str] = None
    image_url: Optional[str] = None
    baby_note: Optional[str] = None
    adult_note: Optional[str] = None
    ingredients: Optional[List[RecipeIngredientCreate]] = None
    steps: Optional[List[RecipeStep]] = None


class RecipeOut(BaseModel):
    recipe_id: int
    recipe_name: str
    dish_type_id: int
    cooking_method_id: Optional[int] = None
    description: Optional[str] = None
    prep_time_minutes: Optional[int] = None
    cook_time_minutes: Optional[int] = None
    difficulty_level: Optional[str] = None
    image_url: Optional[str] = None
    baby_note: Optional[str] = None
    adult_note: Optional[str] = None
    dish_type: Optional[DishTypeOut] = None
    ingredients: List[RecipeIngredientOut] = []
    steps: List[RecipeStep] = []
    estimated_calories: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)
