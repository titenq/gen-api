FROM node:22-alpine3.21 AS base
WORKDIR /app
COPY package*.json ./

# Development Stage
FROM base AS dev
RUN apk add --no-cache bash git
RUN npm install
ENV PATH=/app/node_modules/.bin:$PATH
COPY . .
ARG APP_PORT=3300
ENV APP_PORT=${APP_PORT}
EXPOSE ${APP_PORT}
CMD ["npm", "run", "dev"]

FROM base AS builder
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine3.21 AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist

RUN addgroup -g 1001 -S nodejs && \
    adduser -S api -u 1001

RUN chown -R api:nodejs /app

USER api

ARG APP_PORT=3300
ENV APP_PORT=${APP_PORT}
EXPOSE ${APP_PORT}

CMD ["node", "dist/index.js"]
