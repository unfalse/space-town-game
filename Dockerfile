# ---- Build stage ----
FROM node:24.10.0-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare yarn@4.x --activate

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
RUN yarn install --immutable

COPY . .
# Build client bundle (webpack, production mode so NODE_ENV=production → port 80)
RUN yarn build && yarn compile

# ---- Run stage ----
FROM node:24.10.0-alpine

WORKDIR /app

RUN corepack enable && corepack prepare yarn@4.x --activate

# Install only production runtime deps (cors, express)
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
RUN yarn install --immutable

# Copy compiled Express server
COPY --from=builder /app/dist ./dist

# Copy level data (read/written at runtime)
COPY --from=builder /app/src/server/levels.json ./src/server/levels.json

# Copy server config
COPY --from=builder /app/src/shared/config.json ./src/shared/config.json

# Expose only port 80
EXPOSE 80

CMD node dist/server/index.js