from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float, CheckConstraint, Index
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    family_members = relationship("FamilyMember", back_populates="user", cascade="all, delete-orphan")
    fridge_items = relationship("FridgeItem", back_populates="user", cascade="all, delete-orphan")
    grocery_items = relationship("GroceryItem", back_populates="user", cascade="all, delete-orphan")
    cooking_sessions = relationship("CookingSession", back_populates="user")


class FamilyMember(Base):
    __tablename__ = "family_members"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    role_name = Column(String(50), nullable=True) # "Bố", "Mẹ", "Bé Bông", "Ông/Bà"
    spice_level = Column(Integer, default=2) # 0 to 5
    is_child = Column(Boolean, default=False)
    is_elderly = Column(Boolean, default=False)
    dietary_notes = Column(Text, nullable=True)

    user = relationship("User", back_populates="family_members")

    __table_args__ = (
        CheckConstraint("spice_level >= 0 AND spice_level <= 5", name="check_spice_level_range"),
    )


class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), unique=True, index=True, nullable=False)
    category = Column(String(50), nullable=False, index=True) # Thịt cá, Rau củ, Gia vị & đồ khô
    stall = Column(String(100), nullable=False) # Quầy thịt tươi, Quầy cá & hải sản, Quầy rau củ, Gia vị & đồ khô
    default_unit = Column(String(30), default="g")
    estimated_price_per_unit = Column(Float, default=0.0)
    shelf_life_days = Column(Integer, default=7)

    recipes = relationship("RecipeIngredient", back_populates="ingredient")


class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), index=True, nullable=False)
    dish_type = Column(String(20), nullable=False, index=True) # 'main', 'soup', 'side'
    emoji = Column(String(20), default="🍲")
    description = Column(Text, nullable=True)
    cook_time_minutes = Column(Integer, default=20)
    kcal = Column(Integer, default=300)
    protein_g = Column(Float, default=20.0)
    carb_g = Column(Float, default=30.0)
    fat_g = Column(Float, default=10.0)
    sodium_note = Column(Text, nullable=True)
    branch_baby_tip = Column(Text, nullable=True)
    branch_adult_tip = Column(Text, nullable=True)
    instructions_json = Column(Text, nullable=True) # JSON steps

    ingredients = relationship("RecipeIngredient", back_populates="recipe", cascade="all, delete-orphan")
    combos = relationship("MealComboRecipe", back_populates="recipe")

    __table_args__ = (
        CheckConstraint("dish_type IN ('main', 'soup', 'side')", name="check_recipe_dish_type"),
        CheckConstraint("cook_time_minutes > 0", name="check_recipe_cook_time_positive"),
    )


class RecipeIngredient(Base):
    __tablename__ = "recipe_ingredients"

    id = Column(Integer, primary_key=True, index=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id", ondelete="CASCADE"), nullable=False, index=True)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id", ondelete="RESTRICT"), nullable=False, index=True)
    quantity = Column(Float, nullable=False)
    unit = Column(String(50), nullable=False)
    note = Column(String(100), nullable=True)

    recipe = relationship("Recipe", back_populates="ingredients")
    ingredient = relationship("Ingredient", back_populates="recipes")


class MealCombo(Base):
    __tablename__ = "meal_combos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    tag = Column(String(50), nullable=True) # "Hợp cả nhà", "Thanh mát", "25 phút gọn nhẹ"
    tag_color = Column(String(100), default="bg-emerald-100 text-emerald-800")
    photo_emoji = Column(String(20), default="🍲")
    theme_gradient = Column(String(100), default="from-amber-100 to-emerald-100")
    cook_time = Column(Integer, default=30)
    estimated_price = Column(Float, default=120000)
    match_rate = Column(Integer, default=90)
    is_active = Column(Boolean, default=True)

    combo_recipes = relationship("MealComboRecipe", back_populates="combo", cascade="all, delete-orphan")
    cooking_sessions = relationship("CookingSession", back_populates="combo")


class MealComboRecipe(Base):
    __tablename__ = "meal_combo_recipes"

    id = Column(Integer, primary_key=True, index=True)
    combo_id = Column(Integer, ForeignKey("meal_combos.id", ondelete="CASCADE"), nullable=False, index=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id", ondelete="CASCADE"), nullable=False, index=True)
    dish_role = Column(String(20), nullable=False) # 'main', 'soup', 'side'

    combo = relationship("MealCombo", back_populates="combo_recipes")
    recipe = relationship("Recipe", back_populates="combos")


class FridgeItem(Base):
    __tablename__ = "fridge_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id", ondelete="SET NULL"), nullable=True, index=True)
    name = Column(String(150), nullable=False)
    quantity = Column(Float, default=1.0)
    unit = Column(String(30), default="phần")
    expiry_date = Column(DateTime, nullable=False, index=True)
    status = Column(String(20), default="fresh") # fresh, warning, expired
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="fridge_items")

    __table_args__ = (
        CheckConstraint("status IN ('fresh', 'warning', 'expired')", name="check_fridge_item_status"),
        Index("idx_fridge_user_expiry", "user_id", "expiry_date"),
    )


class GroceryItem(Base):
    __tablename__ = "grocery_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    combo_id = Column(Integer, ForeignKey("meal_combos.id", ondelete="SET NULL"), nullable=True)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id", ondelete="SET NULL"), nullable=True)
    name = Column(String(150), nullable=False)
    stall = Column(String(100), default="Chợ truyền thống")
    quantity = Column(String(50), default="1 phần")
    estimated_price = Column(Float, default=0.0)
    is_bought = Column(Boolean, default=False)
    is_have = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="grocery_items")


class CookingSession(Base):
    __tablename__ = "cooking_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    combo_id = Column(Integer, ForeignKey("meal_combos.id", ondelete="SET NULL"), nullable=True, index=True)
    status = Column(String(30), default="completed") # 'in_progress', 'completed', 'cancelled'
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    completed_at = Column(DateTime, nullable=True)
    total_minutes = Column(Integer, default=30)
    rating = Column(Integer, nullable=True) # 1-5 sao

    user = relationship("User", back_populates="cooking_sessions")
    combo = relationship("MealCombo", back_populates="cooking_sessions")
    logs = relationship("CookingLog", back_populates="session", cascade="all, delete-orphan")


class CookingLog(Base):
    __tablename__ = "cooking_logs"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("cooking_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    step_name = Column(String(100), nullable=False)
    stove_index = Column(Integer, default=1) # Bếp 1, Bếp 2
    duration_seconds = Column(Integer, default=300)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    session = relationship("CookingSession", back_populates="logs")

    __table_args__ = (
        Index("idx_cooking_log_session_time", "session_id", "timestamp"),
    )
