# syntax=docker/dockerfile:1.7
FROM node:22-alpine AS builder

WORKDIR /workspace
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . .

ARG KIRA_WEB_PRODUCTION=false
ARG ANDROID_APP_SHA256_CERT_FINGERPRINT
ARG ANDROID_PACKAGE_NAME=me.manga.kira
ARG APPLE_TEAM_ID=7CGZ2343AA
ARG IOS_BUNDLE_ID=me.manga.kira
ENV KIRA_WEB_PRODUCTION=$KIRA_WEB_PRODUCTION \
    ANDROID_APP_SHA256_CERT_FINGERPRINT=$ANDROID_APP_SHA256_CERT_FINGERPRINT \
    ANDROID_PACKAGE_NAME=$ANDROID_PACKAGE_NAME \
    APPLE_TEAM_ID=$APPLE_TEAM_ID \
    IOS_BUNDLE_ID=$IOS_BUNDLE_ID
RUN npm run verify

FROM nginx:1.28-alpine AS runtime
COPY deploy/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder --chown=nginx:nginx /workspace/out /usr/share/nginx/html
USER nginx
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1

