from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.user import User


def main() -> None:
    db = SessionLocal()
    try:
        existing = db.scalar(select(User).where(User.email == "demo@example.com"))
        if existing:
            print("Seed already exists: demo@example.com")
            return

        user = User(email="demo@example.com", full_name="Demo User")
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"Seeded user id={user.id}, email={user.email}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
