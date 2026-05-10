# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=20-bookworm-slim
ARG PNPM_VERSION=10.15.0

FROM node:${NODE_VERSION} AS base

ENV PNPM_HOME=/pnpm
ENV PATH="${PNPM_HOME}:${PATH}"

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable \
  && corepack prepare pnpm@${PNPM_VERSION} --activate

FROM base AS dependencies

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY shared/package.json ./shared/package.json
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json

RUN --mount=type=cache,id=pnpm-store-v1,target=/pnpm/store \
  pnpm install --frozen-lockfile

FROM dependencies AS build

ARG VITE_API_URL=""
ARG VITE_SENTRY_DSN=""
ARG VITE_SENTRY_ENVIRONMENT="production"
ARG VITE_SENTRY_RELEASE=""
ARG VITE_SENTRY_TRACES_SAMPLE_RATE="0.1"
ARG VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE="0"
ARG VITE_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE="1"
ARG SENTRY_AUTH_TOKEN=""

ENV NODE_ENV=production
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_SENTRY_DSN=${VITE_SENTRY_DSN}
ENV VITE_SENTRY_ENVIRONMENT=${VITE_SENTRY_ENVIRONMENT}
ENV VITE_SENTRY_RELEASE=${VITE_SENTRY_RELEASE}
ENV VITE_SENTRY_TRACES_SAMPLE_RATE=${VITE_SENTRY_TRACES_SAMPLE_RATE}
ENV VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE=${VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE}
ENV VITE_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE=${VITE_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE}
ENV SENTRY_AUTH_TOKEN=${SENTRY_AUTH_TOKEN}

COPY . .

RUN pnpm build

FROM base AS production-dependencies

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY shared/package.json ./shared/package.json
COPY backend/package.json ./backend/package.json
COPY backend/prisma ./backend/prisma

RUN --mount=type=cache,id=pnpm-store-v1,target=/pnpm/store \
  pnpm install --frozen-lockfile --prod \
  && pnpm --filter backend prisma:generate

FROM base AS runner

ENV NODE_ENV=production
ENV PORT=3001

COPY --from=production-dependencies /app/node_modules ./node_modules
COPY --from=production-dependencies /app/package.json ./package.json
COPY --from=production-dependencies /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=production-dependencies /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=production-dependencies /app/shared/package.json ./shared/package.json
COPY --from=production-dependencies /app/backend/package.json ./backend/package.json
COPY --from=production-dependencies /app/backend/prisma ./backend/prisma

COPY --from=build /app/shared/dist ./shared/dist
COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/backend/public ./backend/public
COPY knowledge-base.md ./knowledge-base.md

RUN chown -R node:node /app

USER node

EXPOSE 3001

CMD ["node", "backend/dist/index.js"]
