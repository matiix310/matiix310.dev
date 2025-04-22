# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1.2.1-alpine as base
WORKDIR /usr/src/app

ENV HOST=localhost \
    PORT=8000 \
#     TLS=1 \
    BASE_FOLDER=/usr/ \
    BACKEND_BASE_FOLDER=/usr/src/app/backend/ \
    DOWNLOADS_FOLDER=downloads/ \
    LOGS_FOLDER=logs/ \
    MUSICS_FOLDER=musics/ \
    KEYS_FOLDER=keys/ \
    DB_HOST=db \
    DB_NAME=website

# init required folders
RUN mkdir -p      \
        ${BASE_FOLDER}${LOGS_FOLDER} \
        ${BASE_FOLDER}${DOWNLOADS_FOLDER} \
        ${BASE_FOLDER}${MUSICS_FOLDER} \
        ${BASE_FOLDER}${KEYS_FOLDER}
RUN chown bun:bun \
        ${BASE_FOLDER}${LOGS_FOLDER} \
        ${BASE_FOLDER}${DOWNLOADS_FOLDER} \
        ${BASE_FOLDER}${MUSICS_FOLDER} \
        ${BASE_FOLDER}${KEYS_FOLDER}

# install dependencies into tmp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /tmp/dev
COPY package.json bun.lockb /tmp/dev/
COPY packages /tmp/dev/packages
RUN cd /tmp/dev/ && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
RUN mkdir -p /tmp/prod
COPY package.json bun.lockb /tmp/prod/
COPY packages /tmp/prod/packages
RUN cd /tmp/prod/ && bun install --frozen-lockfile --production

# TODO: faire pour que les tests puissent être run en mode "dev"

# copy node_modules from tmp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY packages/backend backend
COPY --from=install /tmp/dev/node_modules backend/node_modules
COPY frontend-builds/. .

# Test
ENV NODE_ENV=production
# RUN bun test

# copy production dependencies and source code into final image
FROM base AS release
RUN mkdir backend
COPY --from=install /tmp/prod/node_modules backend/node_modules
COPY --from=prerelease /usr/src/app/backend/src backend/src
COPY --from=prerelease /usr/src/app/backend/cert backend/cert
COPY --from=prerelease /usr/src/app/backend/drizzle backend/drizzle
COPY --from=prerelease /usr/src/app/backend/drizzle.config.ts backend/drizzle.config.ts
COPY --from=prerelease /usr/src/app/backend/run.sh backend/run.sh
COPY --from=prerelease /usr/src/app/backend/package.json backend/package.json
COPY --from=prerelease /usr/src/app/backend/tsconfig.json backend/tsconfig.json
COPY --from=prerelease /usr/src/app/backend/secrets /usr/src/app/backend/secrets
COPY frontend-builds/. .

# run the app
USER bun
EXPOSE 8000/tcp
ENV NODE_ENV=production

ENTRYPOINT [ "sh", "backend/run.sh" ]