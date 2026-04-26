from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Infra Stack Lab API"
    app_env: str = "local"
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    api_prefix: str = "/api"
    cors_origins: str = "http://localhost:5173"
    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/stack_lab"

    # OIDC / Keycloak (Phase C) — issuer must match JWT `iss`; `azp` must match public SPA client id
    oidc_issuer_url: str = "http://localhost:8080/realms/learning"
    oidc_expected_azp: str = "learning-spa"
    # When the API runs inside Docker, JWKS must use the Compose service hostname (not localhost).
    oidc_jwks_url: str | None = None

    @property
    def cors_origins_list(self) -> list[str]:
        return [v.strip() for v in self.cors_origins.split(",") if v.strip()]

    @property
    def oidc_jwks_url_resolved(self) -> str:
        if self.oidc_jwks_url:
            return self.oidc_jwks_url.strip()
        base = self.oidc_issuer_url.rstrip("/")
        return f"{base}/protocol/openid-connect/certs"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
