# Multi-stage build для RemoteSys
# Stage 1: Сборка фронтенда
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# Копируем файлы фронтенда
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.js ./
COPY index.html ./
COPY src/ ./src/

# Устанавливаем зависимости и собираем
RUN npm ci
RUN npm run build

# Stage 2: Production сервер
FROM node:18-alpine AS production

# Устанавливаем ADB для Android поддержки
RUN apk add --no-cache \
    android-tools \
    openssh-client \
    bash \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Копируем серверные файлы
COPY server/package*.json ./server/

# Устанавливаем серверные зависимости
RUN cd server && npm ci --production

# Копируем серверный код
COPY server/ ./server/

# Копируем собранный фронтенд
COPY --from=frontend-builder /app/dist ./dist

# Создаём директорию для логов
RUN mkdir -p /app/logs

# Переменные окружения
ENV NODE_ENV=production
ENV PORT=3001

# Открываем порт
EXPOSE 3001

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

# Запускаем сервер
CMD ["node", "server/index.js"]
