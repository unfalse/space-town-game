# ---- Build stage ----
FROM node:24.10.0-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile

COPY . .
# Build client bundle (webpack, production mode so NODE_ENV=production → port 80)
RUN yarn build && yarn compile

# ---- Run stage ----
FROM node:24.10.0-alpine

# Install nginx
RUN apk add --no-cache nginx

WORKDIR /app

# Install only production runtime deps (cors, express)
COPY package.json yarn.lock* ./
RUN yarn install --production --frozen-lockfile

# Copy compiled Express server
COPY --from=builder /app/dist ./dist

# Copy level data (read/written at runtime)
COPY --from=builder /app/src/server/levels.json ./src/server/levels.json

# Copy server config
COPY --from=builder /app/src/shared/config.json ./src/shared/config.json

# Copy built client to nginx html root
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/http.d/default.conf

# Expose only port 80 (nginx serves client + proxies API to Express on 8666)
EXPOSE 80

# Start both nginx and the Express server
CMD nginx && node dist/server/index.js