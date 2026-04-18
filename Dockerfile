# ===== Stage 1: Build =====
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

ARG VITE_KEYCLOAK_URL
ARG VITE_KEYCLOAK_REALM
ARG VITE_KEYCLOAK_CLIENT_ID
ARG VITE_AUTH_API_URL
ARG VITE_API_BASE_URL

RUN npm run build

# ===== Stage 2: Production =====
FROM nginx:alpine

# Копируем наш конфиг (перезаписываем дефолтный)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Копируем собранные файлы
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Запускаем nginx в foreground
CMD ["nginx", "-g", "daemon off;"]