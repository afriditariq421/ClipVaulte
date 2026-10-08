# Single image for both the web app and the worker (command differs). Not built in the authoring sandbox: verify with `docker build .`
FROM node:22-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM base AS run
ENV NODE_ENV=production
# Optional extractor. Remove this block if you do not enable YTDLP_ENABLED.
RUN apt-get update && apt-get install -y --no-install-recommends python3 ca-certificates curl \
 && curl -fsSL https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
 && chmod 0755 /usr/local/bin/yt-dlp && rm -rf /var/lib/apt/lists/*
COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.ts ./
COPY --from=build /app/lib ./lib
COPY --from=build /app/workers ./workers
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/tsconfig.json ./
RUN mkdir -p /data/downloads && chown -R node:node /data /app
USER node
ENV DOWNLOAD_DIR=/data/downloads
EXPOSE 3000
CMD ["npx", "next", "start", "-H", "0.0.0.0", "-p", "3000"]
