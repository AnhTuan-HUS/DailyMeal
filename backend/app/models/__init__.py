from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float, Numeric, CheckConstraint, Index, UniqueConstraint
)
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.core.database import Base


# =========================================================
# 1. CÁC THỰC THỂ CHÍNH (STRONG ENTITIES)
# =========================================================

class Role(Base):
    __tablename__ = "role"

    role_id = Column(Integer, primary_key=True, index=True)
    role_name = Column(String(50), unique=True, nullable=False)
    description = Column(Text, nullable=True)

    users = relationship("User", back_populates="role")
    role_permissions = relationship("RolePermission", back_populates="role", cascade="all, delete-orphan")


class Permission(Base):
    __tablename__ = "permission"

    permission_id = Column(Integer, primary_key=True, index=True)
    permission_name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)

    role_permissions = relationship("RolePermission", back_populates="permission", cascade="all, delete-orphan")


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    user_name = Column(String(100), nullable=False)
    avatar_url = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    role_id = Column(Integer, ForeignKey("role.role_id"), nullable=False)

    role = relationship("Role", back_populates="users")
    eating_profiles = relationship("EatingProfile", back_populates="user", cascade="all, delete-orphan")
    available_ingredients = relationship("AvailableIngredient", back_populates="user", cascade="all, delete-orphan")
    shopping_lists = relationship("ShoppingList", back_populates="user", cascade="all, delete-orphan")
    meal_histories = relationship("MealHistory", back_populates="user", cascade="all, delete-orphan")
    favorites = relationship("FavoriteRecipe", back_populates="user", cascade="all, delete-orphan")


class EatingProfile(Base):
    __tablename__ = "eating_profile"

    profile_id = Column(Integer, primary_key=True, index=True)
    profile_name = Column(String(100), nullable=False)
    is_child = Column(Boolean, default=False, nullable=False)
    is_elderly = Column(Boolean, default=False, nullable=False)
    spice_level = Column(Integer, default=2, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)

    user = relationship("User", back_populates="eating_profiles")
    restrictions = relationship("ProfileIngredientRestriction", back_populates="profile", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint("spice_level >= 0 AND spice_level <= 5", name="chk_eating_profile_spice"),
    )


class DishType(Base):
    __tablename__ = "dish_type"

    dish_type_id = Column(Integer, primary_key=True, index=True)
    dish_type_name = Column(String(100), unique=True, nullable=False)

    recipes = relationship("Recipe", back_populates="dish_type")


class CookingMethod(Base):
    __tablename__ = "cooking_method"

    cooking_method_id = Column(Integer, primary_key=True, index=True)
    method_code = Column(String(50), unique=True, nullable=False)
    method_name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)

    recipes = relationship("Recipe", back_populates="cooking_method")


class Ingredient(Base):
    __tablename__ = "ingredient"

    ingredient_id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), unique=True, index=True, nullable=False)
    ingredient_name = Column(String(150), nullable=False)
    food_group = Column(String(100), index=True, nullable=False)
    market_stall = Column(String(100), default="Quầy gia vị & đồ khô", nullable=False)
    waste_rate_percent = Column(Numeric(5, 2), default=0.0, nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(Text, nullable=True)

    recipes = relationship("RecipeIngredient", back_populates="ingredient")
    nutrients = relationship("IngredientNutrient", back_populates="ingredient", cascade="all, delete-orphan")
    available_in = relationship("AvailableIngredient", back_populates="ingredient", cascade="all, delete-orphan")
    in_shopping_lists = relationship("ShoppingListItem", back_populates="ingredient", cascade="all, delete-orphan")
    restrictions = relationship("ProfileIngredientRestriction", back_populates="ingredient", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint("waste_rate_percent >= 0.0 AND waste_rate_percent <= 100.0", name="chk_ingredient_waste_rate"),
    )


class Recipe(Base):
    __tablename__ = "recipe"

    recipe_id = Column(Integer, primary_key=True, index=True)
    recipe_name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    instructions = Column(Text, nullable=False)
    cooking_time = Column(Integer, default=20, nullable=False)
    servings = Column(Integer, default=1, nullable=False)
    image_url = Column(Text, nullable=True)
    source_url = Column(Text, nullable=True)
    dish_type_id = Column(Integer, ForeignKey("dish_type.dish_type_id"), nullable=False)
    cooking_method_id = Column(Integer, ForeignKey("cooking_method.cooking_method_id"), nullable=False)

    dish_type = relationship("DishType", back_populates="recipes")
    cooking_method = relationship("CookingMethod", back_populates="recipes")
    recipe_ingredients = relationship("RecipeIngredient", back_populates="recipe", cascade="all, delete-orphan")
    steps = relationship("RecipeStep", back_populates="recipe", cascade="all, delete-orphan", order_by="RecipeStep.step_number")
    in_meal_histories = relationship("MealHistoryRecipe", back_populates="recipe", cascade="all, delete-orphan")
    favorited_by = relationship("FavoriteRecipe", back_populates="recipe", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint("cooking_time >= 0", name="chk_recipe_cooking_time"),
        CheckConstraint("servings > 0", name="chk_recipe_servings"),
        Index("idx_recipe_dish_cooking", "dish_type_id", "cooking_method_id"),
    )


class Nutrient(Base):
    __tablename__ = "nutrient"

    nutrient_id = Column(Integer, primary_key=True, index=True)
    nutrient_name = Column(String(100), unique=True, nullable=False)
    unit = Column(String(20), default="g", nullable=False)
    description = Column(Text, nullable=True)

    ingredient_nutrients = relationship("IngredientNutrient", back_populates="nutrient", cascade="all, delete-orphan")


class ShoppingList(Base):
    __tablename__ = "shopping_list"

    shopping_list_id = Column(Integer, primary_key=True, index=True)
    list_name = Column(String(150), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)

    user = relationship("User", back_populates="shopping_lists")
    items = relationship("ShoppingListItem", back_populates="shopping_list", cascade="all, delete-orphan")


class MealHistory(Base):
    __tablename__ = "meal_history"

    history_id = Column(Integer, primary_key=True, index=True)
    meal_name = Column(String(200), nullable=False)
    cooked_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)

    user = relationship("User", back_populates="meal_histories")
    recipes = relationship("MealHistoryRecipe", back_populates="history", cascade="all, delete-orphan")


# =========================================================
# 2. THỰC THỂ YẾU (WEAK ENTITY)
# =========================================================

class RecipeStep(Base):
    __tablename__ = "recipe_step"

    step_id = Column(Integer, primary_key=True, index=True)
    recipe_id = Column(Integer, ForeignKey("recipe.recipe_id", ondelete="CASCADE"), nullable=False)
    step_number = Column(Integer, nullable=False)
    instruction_text = Column(Text, nullable=False)
    image_url = Column(Text, nullable=True)

    recipe = relationship("Recipe", back_populates="steps")

    __table_args__ = (
        CheckConstraint("step_number > 0", name="chk_step_number"),
        UniqueConstraint("recipe_id", "step_number", name="uq_recipe_step"),
    )


# =========================================================
# 3. BẢNG KẾT HỢP NHIỀU - NHIỀU (ASSOCIATIVE ENTITIES)
# =========================================================

class RolePermission(Base):
    __tablename__ = "role_permission"

    role_id = Column(Integer, ForeignKey("role.role_id", ondelete="CASCADE"), primary_key=True)
    permission_id = Column(Integer, ForeignKey("permission.permission_id", ondelete="CASCADE"), primary_key=True)

    role = relationship("Role", back_populates="role_permissions")
    permission = relationship("Permission", back_populates="role_permissions")


class ProfileIngredientRestriction(Base):
    __tablename__ = "profile_ingredient_restriction"

    profile_id = Column(Integer, ForeignKey("eating_profile.profile_id", ondelete="CASCADE"), primary_key=True)
    ingredient_id = Column(Integer, ForeignKey("ingredient.ingredient_id", ondelete="CASCADE"), primary_key=True)
    restriction_type = Column(String(20), nullable=False)

    profile = relationship("EatingProfile", back_populates="restrictions")
    ingredient = relationship("Ingredient", back_populates="restrictions")

    __table_args__ = (
        CheckConstraint("restriction_type IN ('ALLERGY', 'CANNOT_EAT', 'DISLIKE')", name="chk_restriction_type"),
    )


class IngredientNutrient(Base):
    __tablename__ = "ingredient_nutrient"

    ingredient_id = Column(Integer, ForeignKey("ingredient.ingredient_id", ondelete="CASCADE"), primary_key=True)
    nutrient_id = Column(Integer, ForeignKey("nutrient.nutrient_id", ondelete="CASCADE"), primary_key=True)
    nutrient_amount = Column(Numeric(12, 4), nullable=False)

    ingredient = relationship("Ingredient", back_populates="nutrients")
    nutrient = relationship("Nutrient", back_populates="ingredient_nutrients")

    __table_args__ = (
        CheckConstraint("nutrient_amount >= 0", name="chk_nutrient_amount"),
    )


class RecipeIngredient(Base):
    __tablename__ = "recipe_ingredient"

    recipe_id = Column(Integer, ForeignKey("recipe.recipe_id", ondelete="CASCADE"), primary_key=True)
    ingredient_id = Column(Integer, ForeignKey("ingredient.ingredient_id", ondelete="RESTRICT"), primary_key=True)
    quantity = Column(Numeric(10, 2), nullable=False)
    unit = Column(String(30), nullable=False)

    recipe = relationship("Recipe", back_populates="recipe_ingredients")
    ingredient = relationship("Ingredient", back_populates="recipes")

    __table_args__ = (
        CheckConstraint("quantity > 0", name="chk_recipe_ingredient_quantity"),
    )


class AvailableIngredient(Base):
    __tablename__ = "available_ingredient"

    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), primary_key=True)
    ingredient_id = Column(Integer, ForeignKey("ingredient.ingredient_id", ondelete="CASCADE"), primary_key=True)
    quantity = Column(Numeric(10, 2), nullable=False)
    unit = Column(String(30), nullable=False)
    expiry_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="available_ingredients")
    ingredient = relationship("Ingredient", back_populates="available_in")

    __table_args__ = (
        CheckConstraint("quantity >= 0", name="chk_available_ingredient_quantity"),
    )


class ShoppingListItem(Base):
    __tablename__ = "shopping_list_item"

    shopping_list_id = Column(Integer, ForeignKey("shopping_list.shopping_list_id", ondelete="CASCADE"), primary_key=True)
    ingredient_id = Column(Integer, ForeignKey("ingredient.ingredient_id", ondelete="CASCADE"), primary_key=True)
    quantity = Column(Numeric(10, 2), nullable=False)
    unit = Column(String(30), nullable=False)
    is_purchased = Column(Boolean, default=False, nullable=False)

    shopping_list = relationship("ShoppingList", back_populates="items")
    ingredient = relationship("Ingredient", back_populates="in_shopping_lists")

    __table_args__ = (
        CheckConstraint("quantity > 0", name="chk_shopping_list_item_quantity"),
    )


class MealHistoryRecipe(Base):
    __tablename__ = "meal_history_recipe"

    history_id = Column(Integer, ForeignKey("meal_history.history_id", ondelete="CASCADE"), primary_key=True)
    recipe_id = Column(Integer, ForeignKey("recipe.recipe_id", ondelete="CASCADE"), primary_key=True)

    history = relationship("MealHistory", back_populates="recipes")
    recipe = relationship("Recipe", back_populates="in_meal_histories")


class FavoriteRecipe(Base):
    __tablename__ = "favorite_recipe"

    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), primary_key=True)
    recipe_id = Column(Integer, ForeignKey("recipe.recipe_id", ondelete="CASCADE"), primary_key=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="favorites")
    recipe = relationship("Recipe", back_populates="favorited_by")

    __table_args__ = (
        Index("idx_favorite_recipe_user", "user_id", "created_at"),
    )

