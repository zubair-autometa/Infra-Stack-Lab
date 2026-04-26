from typing import Annotated, Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import settings
from app.core.oidc import verify_access_token
from app.db.session import get_db

_bearer = HTTPBearer(auto_error=False)

# Re-export for routes that use SQLAlchemy sessions
get_database = get_db


async def get_access_token_claims(
    cred: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
) -> dict[str, Any]:
    if cred is None or cred.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    try:
        return verify_access_token(
            cred.credentials,
            issuer=settings.oidc_issuer_url,
            jwks_url=settings.oidc_jwks_url_resolved,
            expected_azp=settings.oidc_expected_azp,
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        ) from None
