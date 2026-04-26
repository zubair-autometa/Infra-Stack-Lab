from typing import Any

from fastapi import APIRouter, Depends

from app.api.deps import get_access_token_claims

router = APIRouter()


@router.get("", summary="Current user (JWT validated via Keycloak JWKS)")
def read_me(claims: dict[str, Any] = Depends(get_access_token_claims)) -> dict[str, Any]:
    return {
        "sub": claims.get("sub"),
        "preferred_username": claims.get("preferred_username"),
        "email": claims.get("email"),
        "realm_access": claims.get("realm_access"),
    }
