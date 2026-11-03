# RemoteSys — Система удалённого управления устройствами

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18.x-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED)

**Автоматическое подключение к устройствам по SSH/ADB/PLINK, сбор системной информации и рекомендации по оптимизации**

</div>

---

## 📋 Содержание

- [Описание](#-описание)
- [Возможности](#-возможности)
- [Быстрый старт](#-быстрый-старт)
- [Архитектура](#-архитектура)
- [Backend сервер](#-backend-сервер)
- [Docker развёртывание](#-docker-развёртывание)
- [API документация](#-api-документация)
- [WebSocket терминал](#-websocket-терминал)
- [Поддерживаемые ОС](#-поддерживаемые-ос)
- [Безопасность](#-безопасность)
- [Структура проекта](#-структура-проекта)

---

## 🎯 Описание

**RemoteSys** — полноценная система для удалённого управления устройствами с реальным backend-сервером. В отличие от демо-версий, RemoteSys:

- ✅ **Реально подключается** к устройствам по SSH, PLINK и ADB
- ✅ **Автоматически собирает** полную информацию о системе
- ✅ **Анализирует** состояние и выдаёт конкретные рекомендации
- ✅ **Позволяет применять** рекомендации одной кнопкой
- ✅ **Предоставляет** интерактивный WebSocket-терминал
- ✅ **Работает из коробки** в Docker-контейнере

---

## ✨ Возможности

### 🔌 Реальное подключение к устройствам

| Протокол | Описание | Библиотека | Порт |
|----------|----------|-----------|------|
| **SSH** | Secure Shell для Linux/macOS | `ssh2` (Node.js) | 22 |
| **PLINK** | PuTTY Link для Windows | `ssh2` (Node.js) | 22 |
| **ADB** | Android Debug Bridge | `adb` CLI | 5555 |

### 📊 Автоматический сбор информации

При подключении к устройству сервер выполняет набор команд и парсит результат:

**Linux:**
- OS: `cat /etc/os-release`
- CPU: `/proc/cpuinfo`, `nproc`, `/proc/loadavg`
- RAM: `free -b`
- Disk: `df -B1`
- GPU: `lspci | grep vga`
- Network: `ip -j addr show`
- Processes: `ps aux --sort=-%cpu`
- Services: `systemctl list-units`

**Windows:**
- OS: `Get-CimInstance Win32_OperatingSystem`
- CPU: `Get-CimInstance Win32_Processor`
- RAM: `Win32_OperatingSystem.TotalVisibleMemorySize`
- Disk: `Win32_LogicalDisk`
- GPU: `Win32_VideoController`
- Network: `Get-NetAdapter`
- Processes: `Get-Process | Sort-Object CPU`
- Services: `Get-Service`

**Android:**
- Model: `getprop ro.product.model`
- CPU: `/proc/cpuinfo`
- RAM: `/proc/meminfo`
- Disk: `df -h`
- Battery: `dumpsys battery`
- Processes: `ps -A`
- Packages: `pm list packages`

### 💡 Умные рекомендации

Система анализирует собранную информацию и предлагает:

- 🔴 **Критические**: высокая загрузка CPU/RAM, мало места на диске, уязвимости
- 🟡 **Предупреждения**: телеметрия, ресурсоёмкие приложения, неоптимальные настройки
- 🔵 **Информация**: возможности очистки, отключение лишних служб

### 💻 Интерактивный терминал

- **WebSocket** для real-time взаимодействия
- **SSH Shell** — полноценная интерактивная сессия
- **ADB Shell** — командная оболочка Android
- История команд, быстрые команды

---

## 🚀 Быстрый старт

### Вариант 1: Docker (рекомендуется)

```bash
# Клонировать репозиторий
git clone https://github.com/your-username/remotesys.git
cd remotesys

# Запустить одной командой
docker-compose up -d

# Открыть в браузере
open http://localhost:3001
```

### Вариант 2: Локальный запуск

```bash
# 1. Установить зависимости фронтенда
npm install

# 2. Собрать фронтенд
npm run build

# 3. Установить зависимости сервера
cd server && npm install && cd ..

# 4. Запустить сервер
node server/index.js

# 5. Открыть http://localhost:3001
```

### Вариант 3: Разработка

```bash
# Терминал 1: Backend
cd server && npm run dev

# Терминал 2: Frontend
npm run dev
```

---

## 🏗️ Архитектура

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                    │
│                    Port: 3001 (через nginx)                   │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Dashboard │  │  Device  │  │Recommend │  │ Terminal │   │
│  │          │  │  Detail  │  │  ations  │  │  (WS)    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ REST API + WebSocket
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Node.js + Express)                │
│                    Port: 3001                                 │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   SSH    │  │   ADB    │  │ Analyzer │  │  Parser  │   │
│  │  Client  │  │  Client  │  │  Engine  │  │  Engine  │   │
│  │ (ssh2)   │  │(adb CLI) │  │          │  │          │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ SSH/ADB protocols
┌─────────────────────────────────────────────────────────────┐
│                      Remote Devices                          │
├─────────────────────────────────────────────────────────────┤
│  Windows PC  │  Linux Server  │  Android  │  macOS/iOS      │
│  (via SSH)   │  (via SSH)     │  (ADB)    │  (via SSH)      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🖥️ Backend сервер

### Структура backend

```
server/
├── index.js              # Главный сервер (Express + WebSocket)
├── ssh-client.js         # SSH клиент (ssh2)
├── analyzer.js           # Анализ данных и рекомендации
├── package.json          # Зависимости сервера
└── commands/
    ├── linux.js          # Команды для Linux + парсер
    ├── windows.js        # Команды для Windows + парсер
    └── android.js        # Команды для Android + ADB клиент
```

### Зависимости сервера

```json
{
  "express": "^4.18.2",          // HTTP сервер
  "ssh2": "^1.15.0",             // SSH клиент
  "ws": "^8.16.0",               // WebSocket сервер
  "cors": "^2.8.5",              // CORS
  "uuid": "^9.0.1",              // Генерация ID
  "helmet": "^7.1.0",            // Безопасность HTTP
  "express-rate-limit": "^7.1.5" // Rate limiting
}
```

### Как работает подключение

1. **Пользователь** добавляет устройство через UI
2. **Frontend** отправляет POST `/api/devices/:id/connect`
3. **Backend** определяет тип подключения (SSH/ADB)
4. **SSH клиент** подключается к устройству:
   - Устанавливает SSH соединение через `ssh2`
   - Выполняет команду быстрого сканирования
   - Парсит вывод в структурированные данные
5. **Analyzer** анализирует данные и генерирует рекомендации
6. **Результат** возвращается на frontend

### Быстрое сканирование

Для минимизации времени подключения, сервер выполняет все команды одним запросом:

```bash
# Linux: одна команда собирает всё
echo "===HOSTNAME===" && hostname && echo "===OS===" && cat /etc/os-release && ...

# Windows: PowerShell скрипт
powershell -Command "Write-Output '===HOSTNAME==='; hostname; ..."

# Android: shell скрипт
adb shell "echo '===MODEL==='; getprop ro.product.model; ..."
```

---

## 🐳 Docker развёртывание

### Dockerfile (multi-stage build)

```dockerfile
# Stage 1: Сборка фронтенда
FROM node:18-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
COPY src/ ./src/
RUN npm ci && npm run build

# Stage 2: Production сервер
FROM node:18-alpine AS production
RUN apk add --no-cache android-tools openssh-client
WORKDIR /app
COPY server/package*.json ./server/
RUN cd server && npm ci --production
COPY server/ ./server/
COPY --from=frontend-builder /app/dist ./dist
EXPOSE 3001
CMD ["node", "server/index.js"]
```

### docker-compose.yml

```yaml
version: '3.8'
services:
  remotesys:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

### Команды Docker

```bash
# Сборка и запуск
docker-compose up -d --build

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down

# Пересборка после изменений
docker-compose up -d --build

# Подключение к ADB USB устройствам
# Раскомментируйте в docker-compose.yml:
#   volumes:
#     - /dev/bus/usb:/dev/bus/usb
#   privileged: true
```

### Docker образ

```bash
# Собрать образ
docker build -t remotesys:latest .

# Запустить
docker run -d \
  --name remotesys \
  -p 3001:3001 \
  --restart unless-stopped \
  remotesys:latest

# С доступом к USB для ADB
docker run -d \
  --name remotesys \
  -p 3001:3001 \
  --privileged \
  -v /dev/bus/usb:/dev/bus/usb \
  remotesys:latest
```

---

## 📡 API документация

### REST API

#### `GET /api/health`
Проверка работоспособности сервера.

```json
{
  "status": "ok",
  "version": "1.0.0",
  "uptime": 3600,
  "devices": 5,
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

#### `GET /api/devices`
Список всех устройств.

```json
[
  {
    "id": "abc123",
    "name": "Production Server",
    "ip": "192.168.1.100",
    "port": 22,
    "connectionType": "ssh",
    "status": "online",
    "systemInfo": { ... },
    "recommendations": [ ... ]
  }
]
```

#### `POST /api/devices`
Добавить новое устройство.

```json
{
  "name": "My Server",
  "ip": "192.168.1.100",
  "port": 22,
  "login": "root",
  "password": "secret",
  "connectionType": "ssh"
}
```

#### `POST /api/devices/:id/connect`
Подключиться к устройству и выполнить сканирование.

**Response:**
```json
{
  "success": true,
  "device": {
    "id": "abc123",
    "status": "online",
    "systemInfo": {
      "os": "Linux",
      "osVersion": "Ubuntu 24.04 LTS",
      "hostname": "srv-01",
      "cpu": "Intel Core i7-12700K",
      "cpuCores": 12,
      "cpuUsage": 23,
      "ram": 32,
      "ramUsed": 12,
      "diskTotal": 1000,
      "diskUsed": 450,
      "processes": [...],
      "services": [...],
      "networkInterfaces": [...]
    },
    "recommendations": [
      {
        "id": "0",
        "category": "security",
        "severity": "critical",
        "title": "Обновить пакеты безопасности",
        "command": "sudo apt update && sudo apt upgrade -y",
        "impact": "Закрытие уязвимостей",
        "risk": "low"
      }
    ]
  }
}
```

#### `POST /api/devices/:id/disconnect`
Отключиться от устройства.

#### `DELETE /api/devices/:id`
Удалить устройство.

#### `POST /api/devices/:id/execute`
Выполнить команду на устройстве.

```json
{
  "command": "ls -la /var/log"
}
```

**Response:**
```json
{
  "success": true,
  "output": "total 1234\ndrwxr-xr-x 15 root root 4096...",
  "error": ""
}
```

#### `POST /api/devices/:id/apply-recommendation`
Применить рекомендацию.

```json
{
  "recommendationId": "0"
}
```

### WebSocket API

#### Подключение
```
ws://localhost:3001/ws/terminal?deviceId=abc123
```

#### Сообщения клиент → сервер

```json
// Ввод команды
{ "type": "input", "data": "ls -la\n" }

// Изменение размера терминала
{ "type": "resize", "rows": 40, "cols": 120 }
```

#### Сообщения сервер → клиент

```json
// Вывод команды
{ "type": "output", "data": "file1.txt\nfile2.txt\n" }

// Системное сообщение
{ "type": "system", "data": "Подключено к server-01\n" }

// Ошибка
{ "type": "error", "data": "Permission denied\n" }
```

---

## 🖥️ WebSocket терминал

### Как работает

1. Frontend открывает WebSocket подключение к `/ws/terminal?deviceId=xxx`
2. Backend создаёт интерактивную shell-сессию:
   - **SSH**: `conn.shell()` через ssh2
   - **ADB**: `adb shell` через child_process
3. Данные передаются в реальном времени в обе стороны
4. Поддерживается изменение размера окна

### Пример использования

```javascript
// JavaScript клиент
const ws = new WebSocket('ws://localhost:3001/ws/terminal?deviceId=abc123');

ws.onopen = () => {
  console.log('Connected');
  ws.send(JSON.stringify({ type: 'input', data: 'ls -la\n' }));
};

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  console.log(`[${msg.type}] ${msg.data}`);
};

// Изменение размера
ws.send(JSON.stringify({ type: 'resize', rows: 50, cols: 150 }));
```

---

## 💻 Поддерживаемые ОС

### Linux
- Ubuntu 18.04+
- Debian 10+
- CentOS 7+
- Fedora 33+
- Arch Linux
- Любая с OpenSSH Server

**Требования:** OpenSSH Server, bash

### Windows
- Windows 10 (1809+) с OpenSSH Server
- Windows Server 2019+
- Windows 11

**Требования:** OpenSSH Server (включить через Settings → Optional Features)

```powershell
# Установка OpenSSH Server на Windows
Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
Start-Service sshd
Set-Service -Name sshd -StartupType 'Automatic'
```

### Android
- Android 5.0+ (API 21+)
- С включённой отладкой по USB/WiFi

**Включение ADB:**
```
Settings → About Phone → Tap Build Number 7 times
Settings → Developer Options → USB Debugging → ON
```

**Подключение по WiFi:**
```bash
# На устройстве (через USB сначала):
adb tcpip 5555

# Затем:
adb connect 192.168.1.50:5555
```

---

## 🔒 Безопасность

### Реализовано

- **Helmet.js** — HTTP security headers
- **Rate Limiting** — 100 запросов / 15 минут
- **CORS** — настраиваемый cross-origin
- **Graceful Shutdown** — корректное закрытие соединений
- **Connection Timeout** — 15 секунд на подключение

### Рекомендации для production

1. **SSH ключи** вместо паролей:
```javascript
conn.connect({
  host: ip,
  username: login,
  privateKey: require('fs').readFileSync('/path/to/key')
});
```

2. **HTTPS** — используйте nginx reverse proxy:
```nginx
server {
    listen 443 ssl;
    server_name remotesys.example.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

3. **Аутентификация** — добавьте JWT:
```javascript
const jwt = require('jsonwebtoken');

app.use('/api/', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});
```

4. **Шифрование паролей** — AES-256:
```javascript
const crypto = require('crypto');
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32 bytes

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  return iv.toString('hex') + ':' + cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
}
```

5. **База данных** — используйте PostgreSQL:
```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: remotesys
      POSTGRES_USER: remotesys
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
```

---

## 📁 Структура проекта

```
remotesys/
├── src/                          # Frontend (React + TypeScript)
│   ├── components/
│   │   ├── Sidebar.tsx          # Боковое меню
│   │   ├── Dashboard.tsx        # Панель управления
│   │   ├── DeviceForm.tsx       # Форма добавления
│   │   ├── DeviceDetail.tsx     # Детали устройства
│   │   ├── Recommendations.tsx  # Рекомендации
│   │   └── Terminal.tsx         # WebSocket терминал
│   ├── api.ts                   # API клиент
│   ├── types.ts                 # TypeScript типы
│   ├── dataGenerator.ts         # Демо-данные
│   ├── App.tsx                  # Главный компонент
│   ├── main.tsx                 # Точка входа
│   └── index.css                # Стили
│
├── server/                       # Backend (Node.js)
│   ├── index.js                 # Express + WebSocket сервер
│   ├── ssh-client.js            # SSH клиент (ssh2)
│   ├── analyzer.js              # Анализ и рекомендации
│   ├── package.json             # Зависимости
│   └── commands/
│       ├── linux.js             # Linux команды + парсер
│       ├── windows.js           # Windows команды + парсер
│       └── android.js           # Android ADB + парсер
│
├── dist/                         # Production сборка frontend
├── Dockerfile                    # Multi-stage Docker build
├── docker-compose.yml            # Docker Compose конфигурация
├── .dockerignore                 # Исключения для Docker
├── package.json                  # Frontend зависимости
├── tsconfig.json                 # TypeScript конфигурация
├── vite.config.js                # Vite конфигурация
└── README.md                     # Документация
```

---

## 🔧 Переменные окружения

```bash
# Сервер
PORT=3001                    # Порт сервера
NODE_ENV=production          # Окружение

# Безопасность (для production)
JWT_SECRET=your-secret-key   # Секрет для JWT
ENCRYPTION_KEY=32-byte-key   # Ключ шифрования (32 байта)

# База данных (опционально)
DATABASE_URL=postgresql://user:pass@localhost:5432/remotesys
```

---

## 🗺️ Roadmap

### Версия 1.1
- [ ] PostgreSQL для хранения устройств
- [ ] JWT аутентификация
- [ ] SSH ключи вместо паролей
- [ ] Группировка устройств

### Версия 1.2
- [ ] Графики метрик в реальном времени
- [ ] Алерты и уведомления
- [ ] Экспорт отчётов (PDF/CSV)
- [ ] Массовые операции

### Версия 2.0
- [ ] AI-powered оптимизация
- [ ] Предиктивная аналитика
- [ ] Мобильное приложение
- [ ] Marketplace плагинов

---

## 🤝 Вклад в проект

```bash
# 1. Форкните репозиторий
# 2. Создайте ветку
git checkout -b feature/amazing-feature

# 3. Закоммитьте изменения
git commit -m 'Add amazing feature'

# 4. Запушьте
git push origin feature/amazing-feature

# 5. Откройте Pull Request
```

---

## 📄 Лицензия

MIT License. См. файл `LICENSE`.

---

<div align="center">

**Сделано с ❤️ для системных администраторов и разработчиков**

⚡ Работает из коробки в Docker | 🔒 Безопасно | 🚀 Production-ready

</div>
