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
ARG NEXT_PUBLIC_KIRA_API_URL=https://api.kiramanga.me
ENV KIRA_WEB_PRODUCTION=$KIRA_WEB_PRODUCTION \
    ANDROID_APP_SHA256_CERT_FINGERPRINT=$ANDROID_APP_SHA256_CERT_FINGERPRINT \
    ANDROID_PACKAGE_NAME=$ANDROID_PACKAGE_NAME \
    APPLE_TEAM_ID=$APPLE_TEAM_ID \
    IOS_BUNDLE_ID=$IOS_BUNDLE_ID \
    NEXT_PUBLIC_KIRA_API_URL=$NEXT_PUBLIC_KIRA_API_URL
RUN npm run verify

FROM node:22-alpine AS runtime
ENV NODE_ENV=production \
    HOSTNAME=0.0.0.0 \
    PORT=8080 \
    KIRA_TUTORIAL_API_URL=http://backend:8080 \
    NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
COPY --from=builder --chown=node:node /workspace/.next/standalone ./
COPY --from=builder --chown=node:node /workspace/.next/static ./.next/static
RUN mkdir -p .next/cache && chown -R node:node .next/cache
USER node
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1
CMD ["node", "server.js"]
