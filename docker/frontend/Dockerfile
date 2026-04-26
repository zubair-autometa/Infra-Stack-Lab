# Build context: monorepo lab root (directory that contains docker-compose.yml).
FROM node:20-alpine AS build

WORKDIR /app

COPY apps/frontend/package.json apps/frontend/package-lock.json ./
RUN npm ci

COPY apps/frontend/ .

ARG VITE_APP_NAME=Infra Stack Lab
ARG VITE_STAGE=docker
ARG VITE_API_BASE_URL=http://localhost:8000
ARG VITE_ENABLE_APP_ROUTE=true
ARG VITE_AUTH_ENABLED=false
ARG VITE_OIDC_AUTHORITY=http://localhost:8080/realms/learning
ARG VITE_OIDC_CLIENT_ID=learning-spa
ARG VITE_OIDC_REDIRECT_URI=http://localhost:5173/signin-callback
ARG VITE_OIDC_POST_LOGOUT_REDIRECT_URI=http://localhost:5173/

ENV VITE_APP_NAME=$VITE_APP_NAME \
    VITE_STAGE=$VITE_STAGE \
    VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_ENABLE_APP_ROUTE=$VITE_ENABLE_APP_ROUTE \
    VITE_AUTH_ENABLED=$VITE_AUTH_ENABLED \
    VITE_OIDC_AUTHORITY=$VITE_OIDC_AUTHORITY \
    VITE_OIDC_CLIENT_ID=$VITE_OIDC_CLIENT_ID \
    VITE_OIDC_REDIRECT_URI=$VITE_OIDC_REDIRECT_URI \
    VITE_OIDC_POST_LOGOUT_REDIRECT_URI=$VITE_OIDC_POST_LOGOUT_REDIRECT_URI

RUN npm run build

FROM nginx:1.27-alpine

COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/frontend/startup.sh /startup.sh
RUN chmod +x /startup.sh

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

ENTRYPOINT ["/startup.sh"]
