/**
 * RemoteSys Backend Server
 * 
 * Сервер для удалённого управления устройствами через SSH/ADB/PLINK
 * Автоматический сбор системной информации и рекомендации по оптимизации
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

// Клиенты
const sshClient = require('./ssh-client');
const androidClient = require('./commands/android');

// Команды
const { commands: linuxCommands, parseLinuxData } = require('./commands/linux');
const { commands: windowsCommands, parseWindowsData } = require('./commands/windows');
const { parseAndroidData } = require('./commands/android');

// Анализ
const { analyzeSystem } = require('./analyzer');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // 100 запросов
  message: { error: 'Слишком много запросов. Попробуйте позже.' }
});
app.use('/api/', limiter);

// Хранилище устройств (в памяти, в production использовать БД)
const devices = new Map();
const terminalSessions = new Map();

// Раздаём статику фронтенда
app.use(express.static(path.join(__dirname, '../dist')));

// ==================== API ROUTES ====================

/**
 * GET /api/devices — список всех устройств
 */
app.get('/api/devices', (req, res) => {
  const deviceList = Array.from(devices.values()).map(d => ({
    ...d,
    password: undefined // Не отдаём пароль
  }));
  res.json(deviceList);
});

/**
 * POST /api/devices — добавить устройство
 */
app.post('/api/devices', (req, res) => {
  const { name, ip, port, login, password, connectionType } = req.body;

  if (!name || !ip || !login || !connectionType) {
    return res.status(400).json({ error: 'Необходимо указать name, ip, login и connectionType' });
  }

  const device = {
    id: uuidv4(),
    name,
    ip,
    port: port || (connectionType === 'adb' ? 5555 : 22),
    login,
    password,
    connectionType,
    status: 'offline',
    lastSeen: null,
    systemInfo: null,
    recommendations: null,
    createdAt: new Date().toISOString()
  };

  devices.set(device.id, device);
  res.json({ ...device, password: undefined });
});

/**
 * DELETE /api/devices/:id — удалить устройство
 */
app.delete('/api/devices/:id', (req, res) => {
  const { id } = req.params;
  if (!devices.has(id)) {
    return res.status(404).json({ error: 'Устройство не найдено' });
  }
  devices.delete(id);
  res.json({ success: true });
});

/**
 * POST /api/devices/:id/connect — подключиться к устройству и сканировать
 */
app.post('/api/devices/:id/connect', async (req, res) => {
  const { id } = req.params;
  const device = devices.get(id);

  if (!device) {
    return res.status(404).json({ error: 'Устройство не найдено' });
  }

  // Обновляем статус
  device.status = 'connecting';
  devices.set(id, device);

  try {
    let systemInfo;

    if (device.connectionType === 'ssh' || device.connectionType === 'plink') {
      // SSH/PLINK подключение
      const config = {
        ip: device.ip,
        port: device.port,
        login: device.login,
        password: device.password
      };

      // Определяем ОС (попробуем Linux, если не получится — Windows)
      let result = await sshClient.quickScan(config, linuxCommands);
      
      if (result.success && result.output.includes('===END===')) {
        systemInfo = parseLinuxData(result.output);
      } else {
        // Попробуем Windows
        result = await sshClient.quickScan(config, windowsCommands);
        if (result.success && result.output.includes('===END===')) {
          systemInfo = parseWindowsData(result.output);
        } else {
          throw new Error(result.error || 'Не удалось определить тип ОС');
        }
      }
    } else if (device.connectionType === 'adb') {
      // ADB подключение
      const connectResult = androidClient.connectDevice(device.ip, device.port);
      if (!connectResult.success) {
        throw new Error(`ADB connection failed: ${connectResult.output}`);
      }

      const serial = `${device.ip}:${device.port}`;
      const scanResult = androidClient.quickScan(serial);
      
      if (scanResult.success) {
        systemInfo = parseAndroidData(scanResult.output);
      } else {
        throw new Error(`ADB scan failed: ${scanResult.output}`);
      }
    }

    // Генерируем рекомендации
    const recommendations = analyzeSystem(systemInfo);

    // Обновляем устройство
    device.status = 'online';
    device.systemInfo = systemInfo;
    device.recommendations = recommendations;
    device.lastSeen = new Date().toISOString();
    devices.set(id, device);

    res.json({
      success: true,
      device: { ...device, password: undefined }
    });

  } catch (error) {
    device.status = 'error';
    devices.set(id, device);
    res.status(500).json({ 
      error: 'Ошибка подключения',
      details: error.message 
    });
  }
});

/**
 * POST /api/devices/:id/disconnect — отключиться от устройства
 */
app.post('/api/devices/:id/disconnect', (req, res) => {
  const { id } = req.params;
  const device = devices.get(id);

  if (!device) {
    return res.status(404).json({ error: 'Устройство не найдено' });
  }

  if (device.connectionType === 'adb') {
    androidClient.disconnectDevice(device.ip, device.port);
  }

  device.status = 'offline';
  devices.set(id, device);
  res.json({ success: true });
});

/**
 * POST /api/devices/:id/execute — выполнить команду на устройстве
 */
app.post('/api/devices/:id/execute', async (req, res) => {
  const { id } = req.params;
  const { command } = req.body;
  const device = devices.get(id);

  if (!device) {
    return res.status(404).json({ error: 'Устройство не найдено' });
  }

  if (device.status !== 'online') {
    return res.status(400).json({ error: 'Устройство не подключено' });
  }

  try {
    let result;

    if (device.connectionType === 'ssh' || device.connectionType === 'plink') {
      result = await sshClient.executeCommand(
        { ip: device.ip, port: device.port, login: device.login, password: device.password },
        command
      );
    } else if (device.connectionType === 'adb') {
      result = androidClient.execAdbCommand(command, `${device.ip}:${device.port}`);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/devices/:id/recommendations — получить рекомендации
 */
app.get('/api/devices/:id/recommendations', (req, res) => {
  const { id } = req.params;
  const device = devices.get(id);

  if (!device) {
    return res.status(404).json({ error: 'Устройство не найдено' });
  }

  res.json(device.recommendations || []);
});

/**
 * POST /api/devices/:id/apply-recommendation — применить рекомендацию
 */
app.post('/api/devices/:id/apply-recommendation', async (req, res) => {
  const { id } = req.params;
  const { recommendationId } = req.body;
  const device = devices.get(id);

  if (!device) {
    return res.status(404).json({ error: 'Устройство не найдено' });
  }

  const rec = device.recommendations?.find(r => r.id === recommendationId);
  if (!rec || !rec.command) {
    return res.status(400).json({ error: 'Рекомендация не найдена или не имеет команды' });
  }

  try {
    let result;

    if (device.connectionType === 'ssh' || device.connectionType === 'plink') {
      result = await sshClient.executeCommand(
        { ip: device.ip, port: device.port, login: device.login, password: device.password },
        rec.command
      );
    } else if (device.connectionType === 'adb') {
      result = androidClient.execAdbCommand(rec.command, `${device.ip}:${device.port}`);
    }

    // Переанализируем систему
    if (device.systemInfo) {
      device.recommendations = analyzeSystem(device.systemInfo);
      devices.set(id, device);
    }

    res.json({
      success: true,
      output: result?.output || result?.stdout || '',
      error: result?.error || result?.stderr || ''
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/health — проверка работоспособности
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    uptime: process.uptime(),
    devices: devices.size,
    timestamp: new Date().toISOString()
  });
});

// ==================== WEBSOCKET ДЛЯ ТЕРМИНАЛА ====================

const wss = new WebSocket.Server({ server, path: '/ws/terminal' });

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const deviceId = url.searchParams.get('deviceId');
  
  if (!deviceId) {
    ws.close(4001, 'deviceId required');
    return;
  }

  const device = devices.get(deviceId);
  if (!device || device.status !== 'online') {
    ws.close(4002, 'Device not connected');
    return;
  }

  let shellSession = null;

  // Для SSH — создаём интерактивную shell сессию
  if (device.connectionType === 'ssh' || device.connectionType === 'plink') {
    sshClient.createShell({
      ip: device.ip,
      port: device.port,
      login: device.login,
      password: device.password
    }).then(({ conn, stream }) => {
      shellSession = { conn, stream };
      terminalSessions.set(ws, shellSession);

      stream.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'output', data: data.toString() }));
        }
      });

      stream.on('close', () => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'system', data: '\r\n[Сессия завершена]' }));
          ws.close();
        }
      });

      ws.send(JSON.stringify({ type: 'system', data: `Подключено к ${device.name} (${device.ip})\r\n` }));
    }).catch(err => {
      ws.send(JSON.stringify({ type: 'error', data: `Ошибка: ${err.message}` }));
      ws.close();
    });
  } else if (device.connectionType === 'adb') {
    // Для ADB — используем adb shell
    const { spawn } = require('child_process');
    const adbShell = spawn('adb', ['-s', `${device.ip}:${device.port}`, 'shell']);
    
    shellSession = { process: adbShell };
    terminalSessions.set(ws, shellSession);

    adbShell.stdout.on('data', (data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'output', data: data.toString() }));
      }
    });

    adbShell.stderr.on('data', (data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'error', data: data.toString() }));
      }
    });

    adbShell.on('close', () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    });

    ws.send(JSON.stringify({ type: 'system', data: `ADB Shell подключён к ${device.name}\r\n` }));
  }

  // Обработка входящих данных от клиента
  ws.on('message', (message) => {
    try {
      const msg = JSON.parse(message.toString());
      
      if (msg.type === 'input' && shellSession) {
        if (shellSession.stream) {
          shellSession.stream.write(msg.data);
        } else if (shellSession.process) {
          shellSession.process.stdin.write(msg.data);
        }
      } else if (msg.type === 'resize' && shellSession?.stream) {
        shellSession.stream.setWindow(msg.rows || 40, msg.cols || 120, 0, 0);
      }
    } catch (e) {
      // Игнорируем невалидные сообщения
    }
  });

  // Очистка при отключении
  ws.on('close', () => {
    if (shellSession) {
      if (shellSession.conn) shellSession.conn.end();
      if (shellSession.process) shellSession.process.kill();
      terminalSessions.delete(ws);
    }
  });
});

// ==================== SPA FALLBACK ====================

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// ==================== ЗАПУСК СЕРВЕРА ====================

const PORT = process.env.PORT || 3001;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   ██████╗ ███████╗███╗   ███╗ ██████╗██████╗ ██╗   ██╗  ║
║   ██╔══██╗██╔════╝████╗ ████║██╔════╝██╔══██╗╚██╗ ██╔╝  ║
║   ██████╔╝█████╗  ██╔████╔██║██║     ██████╔╝ ╚████╔╝   ║
║   ██╔══██╗██╔══╝  ██║╚██╔╝██║██║     ██╔══██╗  ╚██╔╝    ║
║   ██║  ██║███████╗██║ ╚═╝ ██║╚██████╗██║  ██║   ██║     ║
║   ╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝ ╚═════╝╚═╝  ╚═╝   ╚═╝    ║
║                                                          ║
║   RemoteSys Server v1.0.0                                ║
║   Port: ${PORT}                                           ║
║   WebSocket: ws://0.0.0.0:${PORT}/ws/terminal             ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down...');
  // Закрываем все SSH соединения
  terminalSessions.forEach((session) => {
    if (session.conn) session.conn.end();
    if (session.process) session.process.kill();
  });
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down...');
  terminalSessions.forEach((session) => {
    if (session.conn) session.conn.end();
    if (session.process) session.process.kill();
  });
  server.close(() => {
    process.exit(0);
  });
});
