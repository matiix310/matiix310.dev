# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM registry.hub.docker.com/oven/bun:1.2.19-alpine AS base

WORKDIR /usr/src/app

FROM base AS api
RUN apk update && \
    apk add --no-cache \
    openssl

ENV HOST=localhost \
    PORT=8000 \
    BASE_FOLDER=/usr/ \
    BACKEND_BASE_FOLDER=/usr/src/app/ \
    DOWNLOADS_FOLDER=downloads/ \
    LOGS_FOLDER=logs/ \
    MUSICS_FOLDER=musics/ \
    DB_HOST=db \
    DB_NAME=website

# init required folders
RUN mkdir -p      \
        ${BASE_FOLDER}${LOGS_FOLDER} \
        ${BASE_FOLDER}${DOWNLOADS_FOLDER} \
        ${BASE_FOLDER}${MUSICS_FOLDER}
RUN chown -R bun:bun \
        ${BASE_FOLDER}${LOGS_FOLDER} \
        ${BASE_FOLDER}${DOWNLOADS_FOLDER} \
        ${BASE_FOLDER}${MUSICS_FOLDER}

# install dependencies into tmp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /tmp/dev
COPY package.json bun.lock /tmp/dev/
RUN cd /tmp/dev/ && \
    bun install --frozen-lockfile && \
    bun install --save false drizzle-orm drizzle-kit mysql2 && \
    rm package.json bun.lock

# api build
FROM api AS dev
COPY --from=install /tmp/dev/node_modules node_modules
COPY . .
EXPOSE 8000/tcp
ENV NODE_ENV=development
ENTRYPOINT [ "sh", "run.sh", "dev" ]


# api build
FROM api AS release
COPY --from=install /tmp/dev/node_modules node_modules
COPY . .
RUN bun run build

# run the app
USER bun
EXPOSE 8000/tcp
ENV NODE_ENV=production

ENTRYPOINT [ "sh", "run.sh" ]
