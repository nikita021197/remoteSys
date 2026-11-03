@echo off
chcp 65001 >nul

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║                                                          ║
echo ║   RemoteSys — Установка и запуск (Windows)              ║
echo ║                                                          ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

:: Проверяем Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js не установлен. Установите Node.js 18+ с https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Node.js найден
node -v

:: Проверяем Docker
where docker >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Docker найден
    echo.
    set /p USE_DOCKER="Использовать Docker? (y/n): "
    if /i "%USE_DOCKER%"=="y" (
        echo.
        echo 🐳 Запуск через Docker...
        docker-compose up -d --build
        echo.
        echo ✅ RemoteSys запущен!
        echo 🌐 Откройте: http://localhost:3001
        pause
        exit /b 0
    )
)

echo.
echo 📦 Установка зависимостей...

:: Frontend
echo   → Frontend...
call npm install
call npm run build

:: Backend
echo   → Backend...
cd server
call npm install --production
cd ..

echo.
echo 🚀 Запуск сервера...
echo.
echo ✅ RemoteSys запущен!
echo 🌐 Откройте: http://localhost:3001
echo.
echo ⚠️  Сервер работает. Закройте окно для остановки.
echo.

node server/index.js
pause
