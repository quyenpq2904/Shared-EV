FROM node:18-alpine AS build
WORKDIR /usr/src/app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
COPY nx.json ./
COPY tsconfig.base.json ./

RUN pnpm install --frozen-lockfile

COPY . .
ARG APP_NAME
RUN pnpm exec nx build ${APP_NAME}

FROM node:18-alpine AS production
ARG APP_NAME
WORKDIR /usr/src/app

RUN npm install -g pnpm

COPY --from=build /usr/src/app/dist/apps/${APP_NAME} ./

RUN pnpm install --prod

RUN pnpm add tslib

CMD ["node", "main.js"]