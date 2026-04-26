"""Verify Keycloak-issued access tokens (JWKS, RS256, iss, exp, azp)."""

from __future__ import annotations

from typing import Any

import jwt
from jwt import PyJWKClient, PyJWTError

_jwks_clients: dict[str, PyJWKClient] = {}


def _jwks_client(jwks_url: str) -> PyJWKClient:
    if jwks_url not in _jwks_clients:
        _jwks_clients[jwks_url] = PyJWKClient(jwks_url, cache_keys=True)
    return _jwks_clients[jwks_url]


def verify_access_token(
    token: str,
    *,
    issuer: str,
    jwks_url: str,
    expected_azp: str,
) -> dict[str, Any]:
    """Validate JWT signature via JWKS, issuer, expiry; enforce public SPA client id (azp)."""
    issuer = issuer.rstrip("/")
    if not issuer:
        raise PyJWTError("OIDC issuer is not configured")
    jwks = _jwks_client(jwks_url)
    signing_key = jwks.get_signing_key_from_jwt(token)
    payload = jwt.decode(
        token,
        signing_key.key,
        algorithms=["RS256"],
        issuer=issuer,
        options={"verify_aud": False},
        leeway=30,
    )
    azp = payload.get("azp")
    if azp != expected_azp:
        raise PyJWTError(
            f"Invalid authorized party (azp): {azp!r}, expected {expected_azp!r}",
        )
    return payload
