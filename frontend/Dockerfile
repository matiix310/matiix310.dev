FROM node:24.5.0-alpine AS base
ENV PNPM_HOME="/pnpm" \
    PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

FROM base AS prod-deps
COPY package.json pnpm-lock.yaml /app/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS dev
COPY . /app/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
ENV PORT=3000 \
    HOSTNAME="0.0.0.0" \
    NODE_ENV=development
CMD [ "pnpm", "run", "dev" ]

FROM base AS build
COPY . /app/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

FROM base AS release
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=prod-deps /app/package.json /app/package.json
COPY --from=build --chown=nextjs:nodejs /app/public /app/public
COPY --from=build --chown=nextjs:nodejs /app/.next /app/.next

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN chown -R nextjs:nodejs /app
USER nextjs

ENV PORT=3000 \
    HOSTNAME="0.0.0.0" \
    NODE_ENV=production

CMD [ "pnpm", "run", "start" ]
