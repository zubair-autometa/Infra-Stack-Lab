from fastapi import APIRouter

from app.api.routes.me import router as me_router
from app.api.routes.users import router as users_router

api_router = APIRouter()
api_router.include_router(me_router, prefix="/me", tags=["auth"])
api_router.include_router(users_router, prefix="/users", tags=["users"])
