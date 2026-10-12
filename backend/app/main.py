from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1.api import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="""
# DailyMeal Backend API - "Hôm Nay Ăn Gì?"
Hệ thống Web App Trợ lý lập mâm cơm gia đình và điều phối nấu ăn thông minh tích hợp AI.

### Các phân hệ chính:
1. **Decision Flow**: Gợi ý 3 combo mâm cơm Việt cân bằng dinh dưỡng.
2. **Smart Grocery & Rescue Fridge**: Đi chợ gom quầy & Giải cứu thực phẩm sắp hết hạn.
3. **Parallel Cooking Assistant**: Điều phối timeline song song nhiều bếp & Chế độ rảnh tay.
4. **Personalization & Nutrition**: Hồ sơ khẩu vị gia đình, chia nhánh nêm gia vị cho trẻ nhỏ/người lớn.
5. **Database Reports**: Thống kê, truy vấn phân tích phục vụ đồ án học phần CSDL Web & HTTT 2026.
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API v1
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["Hệ thống"])
async def health_check():
    """Kiểm tra trạng thái hoạt động của hệ thống (Liveness & Readiness probe)."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "api_version": "v1"
    }


@app.get("/", tags=["Hệ thống"])
async def root():
    return {
        "message": "Chào mừng đến với DailyMeal API!",
        "docs": "/docs",
        "health": "/health"
    }
