# Build context: monorepo lab root — see root `docker-compose.yml`.
FROM python:3.11-slim AS runtime

WORKDIR /app

RUN useradd --create-home --uid 10001 appuser

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

COPY apps/backend/pyproject.toml /app/pyproject.toml
COPY apps/backend/app /app/app
COPY apps/backend/scripts /app/scripts
COPY docker/backend/startup.sh /app/startup.sh

RUN chmod +x /app/startup.sh \
    && pip install --upgrade pip setuptools wheel \
    && pip install --no-cache-dir /app

RUN chown -R appuser:appuser /app

USER appuser

EXPOSE 8000

ENTRYPOINT ["/app/startup.sh"]
