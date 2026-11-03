#!/bin/bash

# RemoteSys — Quick Start Script
# Автоматическая установка и запуск

set -e

echo "╔══════════════════════════════════════════════════════════╗"
echo "║                                                          ║"
echo "║   RemoteSys — Установка и запуск                        ║"
echo "║                                                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Проверяем Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен. Установите Node.js 18+ с https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Требуется Node.js 18+. Текущая версия: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v)"

# Проверяем Docker (опционально)
USE_DOCKER=false
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo "✅ Docker найден"
    echo ""
    read -p "🐳 Использовать Docker? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        USE_DOCKER=true
    fi
fi

if [ "$USE_DOCKER" = true ]; then
    echo ""
    echo "🐳 Запуск через Docker..."
    docker-compose up -d --build
    echo ""
    echo "✅ RemoteSys запущен!"
    echo "🌐 Откройте: http://localhost:3001"
    echo ""
    echo "📋 Команды:"
    echo "   Логи:    docker-compose logs -f"
    echo "   Стоп:    docker-compose down"
    echo "   Рестарт: docker-compose restart"
else
    echo ""
    echo "📦 Установка зависимостей..."
    
    # Frontend
    echo "  → Frontend..."
    npm install
    npm run build
    
    # Backend
    echo "  → Backend..."
    cd server
    npm install --production
    cd ..
    
    echo ""
    echo "🚀 Запуск сервера..."
    echo ""
    echo "✅ RemoteSys запущен!"
    echo "🌐 Откройте: http://localhost:3001"
    echo ""
    echo "⚠️  Сервер работает в foreground. Нажмите Ctrl+C для остановки."
    echo ""
    
    node server/index.js
fi
