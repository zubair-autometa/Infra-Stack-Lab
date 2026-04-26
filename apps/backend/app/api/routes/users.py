from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_database
from app.schemas.user import UserCreate, UserRead
from app.services.user_service import UserService

router = APIRouter()


@router.get("", response_model=list[UserRead])
def list_users(db: Session = Depends(get_database)) -> list[UserRead]:
    service = UserService(db)
    return [UserRead.model_validate(user) for user in service.list_users()]


@router.post("", response_model=UserRead, status_code=201)
def create_user(payload: UserCreate, db: Session = Depends(get_database)) -> UserRead:
    service = UserService(db)
    return UserRead.model_validate(service.create_user(payload))
