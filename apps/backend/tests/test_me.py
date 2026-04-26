import jwt
from fastapi.testclient import TestClient
from pytest import MonkeyPatch

from app.main import app

client = TestClient(app)


def test_me_unauthenticated() -> None:
    response = client.get("/api/me")
    assert response.status_code == 401
    body = response.json()
    assert "detail" in body


def test_me_invalid_bearer(monkeypatch: MonkeyPatch) -> None:
    def boom(
        token: str,
        *,
        issuer: str,
        jwks_url: str,
        expected_azp: str,
    ) -> dict[str, str]:
        raise jwt.PyJWTError("bad token")

    monkeypatch.setattr("app.api.deps.verify_access_token", boom)
    response = client.get("/api/me", headers={"Authorization": "Bearer not-a-real-jwt"})
    assert response.status_code == 401


def test_me_authenticated(monkeypatch: MonkeyPatch) -> None:
    def fake(
        token: str,
        *,
        issuer: str,
        jwks_url: str,
        expected_azp: str,
    ) -> dict:
        return {
            "sub": "user-1",
            "preferred_username": "alice",
            "email": "alice@example.com",
            "realm_access": {"roles": ["lab-user"]},
        }

    monkeypatch.setattr("app.api.deps.verify_access_token", fake)
    response = client.get("/api/me", headers={"Authorization": "Bearer fake.jwt"})
    assert response.status_code == 200
    data = response.json()
    assert data["preferred_username"] == "alice"
    assert data["email"] == "alice@example.com"
    assert data["sub"] == "user-1"
