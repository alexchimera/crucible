FROM oven/bun:1.3.14-debian AS base

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM base AS dev
COPY . .

EXPOSE 5173

CMD ["bun", "run", "dev", "--", "--host", "0.0.0.0"]

FROM base AS build
COPY . .
RUN bun run build

FROM oven/bun:1.3.14-debian AS prod

ENV NODE_ENV=production

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY package.json server.ts ./

EXPOSE 4173

CMD ["bun", "run", "start"]
