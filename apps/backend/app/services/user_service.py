from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate


class UserService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_users(self) -> list[User]:
        return list(self.db.scalars(select(User).order_by(User.id)).all())

    def create_user(self, payload: UserCreate) -> User:
        user = User(email=str(payload.email), full_name=payload.full_name)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
