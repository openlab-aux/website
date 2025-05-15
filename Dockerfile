FROM node:23-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app

RUN pnpm install --prod --frozen-lockfile
RUN pnpm run build

ENV HOST=0.0.0.0
ENV PORT=4321
CMD [ "node", "/app/dist/server/entry.mjs" ]
EXPOSE 4321
