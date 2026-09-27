FROM node:22-alpine AS base
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/api/package.json packages/api/
COPY packages/web/package.json packages/web/

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --store-dir /pnpm/store
COPY . .
RUN pnpm build

FROM base AS deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --prod --filter @tomo/api --store-dir /pnpm/store

FROM node:22-alpine
ENV NODE_ENV=production ENVIRONMENT=production PORT=8666
WORKDIR /app/packages/api
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=deps /app/packages/api/node_modules ./node_modules
COPY --from=build /app/packages/api/dist ./dist
COPY --from=build /app/packages/api/assets ./assets
COPY --from=build /app/packages/api/src/api/db/migrations ./src/api/db/migrations
COPY --from=build /app/packages/web/build/client ../web/build/client
USER node
EXPOSE 8666
CMD ["node", "dist/index.mjs"]
