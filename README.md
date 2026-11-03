# RemoteSys — Система удалённого управления устройствами

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18.x-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6)
![Tailwind](https://img.shields.io/badge/Tailwind-4.x-38bdf8)

**Автоматическое подключение к устройствам по SSH/ADB/PLINK, сбор системной информации и рекомендации по оптимизации**

</div>

---

## 📋 Содержание

- [Описание](#-описание)
- [Возможности](#-возможности)
- [Архитектура](#-архитектура)
- [Технологический стек](#-технологический-стек)
- [Установка и запуск](#-установка-и-запуск)
- [Использование](#-использование)
- [Интеграция с реальными устройствами](#-интеграция-с-реальными-устройствами)
- [Структура проекта](#-структура-проекта)
- [Примеры команд](#-примеры-команд)
- [Безопасность](#-безопасность)
- [Roadmap](#-roadmap)

---

## 🎯 Описание

**RemoteSys** — это веб-приложение для централизованного управления удалёнными устройствами. Приложение позволяет:

- Подключаться к компьютерам и мобильным устройствам по протоколам SSH, ADB и PLINK
- Автоматически собирать полную информацию о системе (ОС, железо, процессы, службы)
- Анализировать состояние системы и выдавать рекомендации по оптимизации
- Отключать телеметрию, ненужные службы и процессы
- Выполнять команды через встроенный терминал
- Мониторить ресурсы в реальном времени

### Для чего это нужно?

- **Системные администраторы**: централизованное управление парком машин
- **Разработчики**: быстрый доступ к серверам и отладочным устройствам
- **DevOps инженеры**: мониторинг и оптимизация инфраструктуры
- **Энтузиасты**: настройка и оптимизация своих устройств

---

## ✨ Возможности

### 🔌 Подключение к устройствам

| Протокол | Описание | Типичное использование |
|----------|----------|----------------------|
| **SSH** | Secure Shell — безопасное удалённое управление | Linux/macOS серверы, роутеры, IoT |
| **PLINK** | PuTTY Link — консольный SSH-клиент для Windows | Windows-серверы через PuTTY |
| **ADB** | Android Debug Bridge — отладка Android | Смартфоны, планшеты, ТВ-приставки |

### 📊 Сбор системной информации

При подключении автоматически собираются:

- **Операционная система**: версия, хостнейм, аптайм
- **Процессор**: модель, количество ядер, текущая загрузка
- **Оперативная память**: общий объём, использовано, свободно
- **Дисковое пространство**: общий объём, занято, свободно
- **Видеокарта**: модель GPU (если доступно)
- **Сеть**: сетевые интерфейсы, IP/MAC адреса, скорость
- **Процессы**: список запущенных процессов с потреблением CPU/RAM
- **Службы**: список системных служб и их статус

### 💡 Рекомендации по оптимизации

Система автоматически анализирует состояние и предлагает:

#### 🔴 Критические рекомендации
- Высокая загрузка CPU/RAM
- Критически мало места на диске
- Устаревшие пакеты с уязвимостями

#### 🟡 Предупреждения
- Ресурсоёмкие процессы (Chrome, Electron-приложения)
- Активная телеметрия
- Неоптимальные настройки служб

#### 🔵 Информационные
- Возможности очистки временных файлов
- Отключение неиспользуемых служб
- Оптимизация конфигурации

### 🛡️ Приватность и безопасность

Автоматическое обнаружение и предложение отключения:

**Windows:**
- Телеметрия Windows (DiagTrack)
- WAP Push Message Service
- Cortana
- Xbox Live сервисы
- Windows Search Indexer
- Службы геолокации

**Linux:**
- CUPS (если принтер не используется)
- Bluetooth (на серверах)
- ModemManager
- Snapd (опционально)
- Avahi/mDNS

**Android:**
- Facebook/Instagram (фоновая активность)
- Samsung Bixby
- Google Play Services (ограничение)
- Очистка кэша приложений

### 💻 Встроенный терминал

Интерактивный терминал с поддержкой:
- Выполнение команд на удалённом устройстве
- История команд (стрелки вверх/вниз)
- Быстрые команды одним кликом
- Цветная подсветка вывода
- Автодополнение (в планах)

---

## 🏗️ Архитектура

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                    │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Dashboard │  │  Device  │  │Recommend │  │ Terminal │   │
│  │          │  │  Detail  │  │  ations  │  │          │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ API (REST/WebSocket)
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Node.js/Python)                   │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   SSH    │  │   ADB    │  │  PLINK   │  │  Parser  │   │
│  │ Client   │  │ Client   │  │ Client   │  │  Engine  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                      Remote Devices                          │
├─────────────────────────────────────────────────────────────┤
│  Windows PC  │  Linux Server  │  Android  │  macOS/iOS      │
└─────────────────────────────────────────────────────────────┘
```

### Текущая версия

Текущая версия работает как **демо-приложение** с симуляцией данных. Для реального подключения к устройствам необходим бэкенд-сервер.

### Планируемая архитектура

Для production-версии рекомендуется:

1. **Backend API** (Node.js + Express или Python + FastAPI)
2. **SSH-библиотека**: `ssh2` (Node.js) или `paramiko` (Python)
3. **ADB-интеграция**: вызов `adb` CLI через child_process
4. **WebSocket** для real-time обновлений
5. **База данных**: PostgreSQL для хранения устройств и истории
6. **Аутентификация**: JWT для защиты API

---

## 🛠️ Технологический стек

| Технология | Назначение |
|------------|-----------|
| **React 18** | UI фреймворк |
| **TypeScript** | Типизация и безопасность кода |
| **Vite** | Сборщик и dev-сервер |
| **Tailwind CSS 4** | Стилизация компонентов |
| **Font Awesome 6** | Иконки |

---

## 🚀 Установка и запуск

### Требования

- **Node.js** 18+ 
- **npm** 9+ или **yarn** 1.22+

### Быстрый старт

```bash
# 1. Клонировать репозиторий
git clone https://github.com/your-username/remotesys.git
cd remotesys

# 2. Установить зависимости
npm install

# 3. Запустить dev-сервер
npm run dev

# 4. Открыть в браузере
# http://localhost:5173
```

### Production сборка

```bash
# Собрать production версию
npm run build

# Результат будет в папке dist/
# Можно развернуть на любом статическом хостинге
```

### Развёртывание с Docker

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
# Собрать и запустить контейнер
docker build -t remotesys .
docker run -p 8080:80 remotesys
```

---

## 📖 Использование

### 1. Добавление устройства

1. Нажмите **"Добавить"** в боковом меню
2. Выберите тип подключения (SSH/PLINK/ADB)
3. Заполните форму:
   - **Имя устройства**: произвольное название для идентификации
   - **IP адрес**: IP или hostname устройства
   - **Порт**: порт подключения (22 для SSH, 5555 для ADB)
   - **Логин**: имя пользователя
   - **Пароль**: пароль для аутентификации
4. Нажмите **"Подключить и сканировать"**

### 2. Просмотр информации

После подключения автоматически собирается информация:

- **Панель управления**: обзор всех устройств с ключевыми метриками
- **Детальная информация**: полная системная информация
  - ОС и версия
  - CPU и GPU
  - RAM и дисковое пространство
  - Сетевые интерфейсы
  - Список процессов
  - Список служб

### 3. Применение рекомендаций

1. Перейдите в раздел **"Оптимизация"**
2. Выберите категорию рекомендаций
3. Просмотрите описание и команду
4. Нажмите **"Применить"** для выполнения

### 4. Работа с терминалом

1. Откройте устройство → нажмите **"Терминал"**
2. Введите команду или выберите из быстрых команд
3. Используйте стрелки ↑↓ для навигации по истории

**Доступные команды терминала:**
- `help` — список команд
- `sysinfo` — информация о системе
- `processes` / `top` — список процессов
- `services` — список служб
- `network` / `ifconfig` — сетевые интерфейсы
- `disk` / `df -h` — дисковое пространство
- `optimize` — запустить анализ и оптимизацию
- `clear` — очистить терминал

---

## 🔗 Интеграция с реальными устройствами

Для подключения к реальным устройствам необходим backend-сервер.

### Пример backend на Node.js

```javascript
// server.js
const express = require('express');
const { Client } = require('ssh2');
const { exec } = require('child_process');

const app = express();
app.use(express.json());

// SSH подключение
app.post('/api/connect/ssh', (req, res) => {
  const { ip, port, login, password } = req.body;
  const conn = new Client();
  
  conn.on('ready', () => {
    // Сбор информации о системе
    const commands = {
      os: 'cat /etc/os-release',
      cpu: 'lscpu',
      ram: 'free -h',
      disk: 'df -h',
      processes: 'ps aux --sort=-%cpu'
    };
    
    let results = {};
    let completed = 0;
    const total = Object.keys(commands).length;
    
    Object.entries(commands).forEach(([key, cmd]) => {
      conn.exec(cmd, (err, stream) => {
        let output = '';
        stream.on('data', (data) => { output += data; });
        stream.on('close', () => {
          results[key] = output;
          completed++;
          if (completed === total) {
            conn.end();
            res.json({ success: true, data: results });
          }
        });
      });
    });
  }).connect({
    host: ip,
    port: port,
    username: login,
    password: password
  });
});

// ADB подключение
app.post('/api/connect/adb', (req, res) => {
  const { ip, port } = req.body;
  
  exec(`adb connect ${ip}:${port}`, (error, stdout) => {
    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
    
    // Сбор информации
    const commands = [
      'adb -s ${ip}:${port} shell getprop ro.product.model',
      'adb -s ${ip}:${port} shell cat /proc/cpuinfo',
      'adb -s ${ip}:${port} shell cat /proc/meminfo',
      'adb -s ${ip}:${port} shell df -h'
    ];
    
    Promise.all(commands.map(cmd => 
      new Promise(resolve => exec(cmd, (err, stdout) => resolve(stdout)))
    )).then(results => {
      res.json({ success: true, data: results });
    });
  });
});

app.listen(3001, () => {
  console.log('Backend server running on port 3001');
});
```

### Пример frontend интеграции

```typescript
// src/api.ts
const API_BASE = 'http://localhost:3001/api';

export async function connectDevice(device: DeviceConfig) {
  const response = await fetch(`${API_BASE}/connect/${device.connectionType}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(device)
  });
  return response.json();
}

export async function executeCommand(deviceId: string, command: string) {
  const response = await fetch(`${API_BASE}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deviceId, command })
  });
  return response.json();
}
```

---

## 📁 Структура проекта

```
remotesys/
├── src/
│   ├── components/
│   │   ├── Sidebar.tsx          # Боковое меню навигации
│   │   ├── Dashboard.tsx        # Главная панель с обзором устройств
│   │   ├── DeviceForm.tsx       # Форма добавления устройства
│   │   ├── DeviceDetail.tsx     # Детальная информация об устройстве
│   │   ├── Recommendations.tsx  # Рекомендации по оптимизации
│   │   └── Terminal.tsx         # Интерактивный терминал
│   ├── types.ts                 # TypeScript типы
│   ├── dataGenerator.ts         # Генерация демо-данных
│   ├── App.tsx                  # Главный компонент приложения
│   ├── main.tsx                 # Точка входа
│   └── index.css                # Глобальные стили
├── public/                      # Статические ресурсы
├── dist/                        # Production сборка
├── package.json                 # Зависимости проекта
├── tsconfig.json                # Конфигурация TypeScript
├── vite.config.ts               # Конфигурация Vite
├── tailwind.config.js           # Конфигурация Tailwind
└── README.md                    # Документация
```

---

## 💻 Примеры команд

### SSH (Linux)

```bash
# Информация о системе
uname -a
cat /etc/os-release
hostnamectl

# Мониторинг ресурсов
top -bn1 | head -20
free -h
df -h
lscpu

# Управление службами
systemctl list-units --type=service
systemctl status nginx
systemctl stop cups
systemctl disable bluetooth

# Оптимизация
apt update && apt upgrade -y
journalctl --vacuum-time=7d
apt autoremove
```

### SSH (Windows через PLINK)

```cmd
# Информация о системе
systeminfo
wmic cpu get name,numberofcores
wmic memorychip get capacity

# Управление службами
sc query type= service state= all
sc stop DiagTrack
sc config DiagTrack start= disabled

# Очистка
del /q /s %TEMP%\*
cleanmgr /sagerun:1
```

### ADB (Android)

```bash
# Подключение
adb connect 192.168.1.50:5555
adb devices

# Информация
adb shell getprop ro.product.model
adb shell cat /proc/cpuinfo
adb shell cat /proc/meminfo
adb shell df -h

# Управление приложениями
adb shell pm list packages
adb shell am force-stop com.facebook.katana
adb shell pm disable-user --user 0 com.samsung.android.bixby.agent

# Очистка
adb shell pm trim-caches 500M
adb shell cmd appops set com.instagram.android RUN_IN_BACKGROUND deny
```

---

## 🔒 Безопасность

### Текущие меры

- Пароли хранятся только в памяти браузера (не сохраняются на диск)
- Все данные передаются через HTTPS (в production)
- Нет сохранения чувствительных данных в localStorage

### Рекомендации для production

1. **Шифрование паролей**: используйте AES-256 для хранения учётных данных
2. **SSH ключи**: поддерживайте аутентификацию по SSH-ключам вместо паролей
3. **RBAC**: реализуйте ролевую модель доступа
4. **Аудит**: логируйте все подключения и выполненные команды
5. **2FA**: добавьте двухфакторную аутентификацию
6. **Vault**: используйте HashiCorp Vault для управления секретами
7. **TLS**: используйте TLS 1.3 для всех подключений
8. **Rate limiting**: ограничьте количество попыток подключения

### Пример безопасного хранения

```javascript
// Используйте crypto для шифрования
const crypto = require('crypto');

function encrypt(text, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(encrypted, key) {
  const [ivHex, encryptedHex] = encrypted.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

---

## 🗺️ Roadmap

### Версия 1.1 (Q1 2025)
- [ ] Backend API на Node.js/Express
- [ ] Реальное SSH подключение через ssh2
- [ ] Реальное ADB подключение
- [ ] Аутентификация пользователей (JWT)
- [ ] База данных (PostgreSQL)

### Версия 1.2 (Q2 2025)
- [ ] WebSocket для real-time мониторинга
- [ ] Графики и метрики в реальном времени
- [ ] Автоматическое выполнение рекомендаций
- [ ] Экспорт отчётов (PDF/CSV)
- [ ] Группировка устройств

### Версия 1.3 (Q3 2025)
- [ ] Поддержка SNMP для сетевого оборудования
- [ ] Интеграция с Prometheus/Grafana
- [ ] Мобильное приложение (React Native)
- [ ] Плагины для расширения функциональности
- [ ] API для сторонних интеграций

### Версия 2.0 (Q4 2025)
- [ ] AI-powered оптимизация (машинное обучение)
- [ ] Предиктивная аналитика
- [ ] Автоматическое масштабирование
- [ ] Multi-tenant архитектура
- [ ] Marketplace плагинов

---

## 🤝 Вклад в проект

Приветствуется любой вклад! Пожалуйста:

1. Форкните репозиторий
2. Создайте ветку для фичи (`git checkout -b feature/AmazingFeature`)
3. Закоммитьте изменения (`git commit -m 'Add AmazingFeature'`)
4. Запушьте в ветку (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

---

## 📄 Лицензия

Этот проект распространяется под лицензией MIT. См. файл `LICENSE` для подробностей.

---

## 📞 Поддержка

- **Issues**: Используйте GitHub Issues для багов и предложений
- **Discussions**: GitHub Discussions для вопросов и обсуждений
- **Email**: support@remotesys.dev

---

## 🙏 Благодарности

- [React](https://reactjs.org/) — UI фреймворк
- [Vite](https://vitejs.dev/) — Сборщик
- [Tailwind CSS](https://tailwindcss.com/) — CSS фреймворк
- [Font Awesome](https://fontawesome.com/) — Иконки
- [ssh2](https://github.com/mscdex/ssh2) — SSH библиотека для Node.js
- [Paramiko](http://www.paramiko.org/) — SSH библиотека для Python

---

<div align="center">

**Сделано с ❤️ для системных администраторов и разработчиков**

[⭐ Поставьте звезду, если проект полезен!](https://github.com/your-username/remotesys)

</div>
