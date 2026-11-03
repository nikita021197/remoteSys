import { Device, SystemInfo, Recommendation, ProcessInfo, ServiceInfo, NetworkInterface } from './types';

const cpuModels = [
  'Intel Core i7-12700K', 'Intel Core i9-13900K', 'AMD Ryzen 7 5800X',
  'AMD Ryzen 9 7950X', 'Intel Core i5-12400F', 'AMD Ryzen 5 5600X',
  'Intel Xeon E5-2680 v4', 'Apple M2 Pro'
];

const gpuModels = [
  'NVIDIA GeForce RTX 4090', 'NVIDIA GeForce RTX 3080', 'AMD Radeon RX 7900 XTX',
  'Intel Arc A770', 'NVIDIA GeForce RTX 4060', 'AMD Radeon RX 6700 XT'
];

const windowsProcesses: ProcessInfo[] = [
  { pid: 4, name: 'System', cpu: 0.1, memory: 0.3, user: 'SYSTEM', status: 'running' },
  { pid: 128, name: 'smss.exe', cpu: 0.0, memory: 0.1, user: 'SYSTEM', status: 'running' },
  { pid: 456, name: 'csrss.exe', cpu: 0.2, memory: 0.5, user: 'SYSTEM', status: 'running' },
  { pid: 789, name: 'svchost.exe', cpu: 1.5, memory: 2.1, user: 'SYSTEM', status: 'running' },
  { pid: 1024, name: 'explorer.exe', cpu: 0.8, memory: 3.2, user: 'user', status: 'running' },
  { pid: 1500, name: 'chrome.exe', cpu: 12.5, memory: 15.3, user: 'user', status: 'running' },
  { pid: 1501, name: 'chrome.exe', cpu: 8.2, memory: 8.7, user: 'user', status: 'running' },
  { pid: 1502, name: 'chrome.exe', cpu: 5.1, memory: 6.2, user: 'user', status: 'running' },
  { pid: 2000, name: 'MsMpEng.exe', cpu: 3.2, memory: 4.5, user: 'SYSTEM', status: 'running' },
  { pid: 2100, name: 'SearchIndexer.exe', cpu: 2.1, memory: 1.8, user: 'SYSTEM', status: 'running' },
  { pid: 2200, name: 'OneDrive.exe', cpu: 0.5, memory: 2.3, user: 'user', status: 'running' },
  { pid: 2300, name: 'Teams.exe', cpu: 4.5, memory: 7.8, user: 'user', status: 'running' },
  { pid: 2400, name: 'Discord.exe', cpu: 3.1, memory: 5.2, user: 'user', status: 'running' },
  { pid: 2500, name: 'Spotify.exe', cpu: 1.8, memory: 4.1, user: 'user', status: 'running' },
  { pid: 2600, name: 'DiagnosticsHub.exe', cpu: 0.3, memory: 0.8, user: 'SYSTEM', status: 'running' },
  { pid: 2700, name: 'CompatTelRunner.exe', cpu: 1.2, memory: 0.9, user: 'SYSTEM', status: 'running' },
  { pid: 2800, name: 'TelemetryService.exe', cpu: 0.8, memory: 1.1, user: 'SYSTEM', status: 'running' },
  { pid: 2900, name: 'Cortana.exe', cpu: 0.4, memory: 2.5, user: 'user', status: 'running' },
];

const linuxProcesses: ProcessInfo[] = [
  { pid: 1, name: 'systemd', cpu: 0.0, memory: 0.3, user: 'root', status: 'running' },
  { pid: 2, name: 'kthreadd', cpu: 0.0, memory: 0.0, user: 'root', status: 'running' },
  { pid: 100, name: 'sshd', cpu: 0.1, memory: 0.2, user: 'root', status: 'running' },
  { pid: 200, name: 'nginx', cpu: 0.5, memory: 1.2, user: 'www-data', status: 'running' },
  { pid: 201, name: 'nginx', cpu: 0.3, memory: 0.8, user: 'www-data', status: 'running' },
  { pid: 300, name: 'postgres', cpu: 2.1, memory: 5.3, user: 'postgres', status: 'running' },
  { pid: 301, name: 'postgres', cpu: 1.5, memory: 3.2, user: 'postgres', status: 'running' },
  { pid: 400, name: 'node', cpu: 4.2, memory: 6.1, user: 'app', status: 'running' },
  { pid: 500, name: 'docker', cpu: 1.8, memory: 3.5, user: 'root', status: 'running' },
  { pid: 600, name: 'snapd', cpu: 0.5, memory: 2.1, user: 'root', status: 'running' },
  { pid: 700, name: 'journald', cpu: 0.2, memory: 1.5, user: 'root', status: 'running' },
  { pid: 800, name: 'cron', cpu: 0.0, memory: 0.1, user: 'root', status: 'running' },
];

const androidProcesses: ProcessInfo[] = [
  { pid: 1, name: 'init', cpu: 0.0, memory: 0.1, user: 'root', status: 'running' },
  { pid: 100, name: 'system_server', cpu: 3.2, memory: 8.5, user: 'system', status: 'running' },
  { pid: 200, name: 'com.android.systemui', cpu: 1.5, memory: 3.2, user: 'system', status: 'running' },
  { pid: 300, name: 'com.google.android.gms', cpu: 2.1, memory: 5.8, user: 'u0_a12', status: 'running' },
  { pid: 400, name: 'com.facebook.katana', cpu: 4.5, memory: 7.2, user: 'u0_a45', status: 'running' },
  { pid: 500, name: 'com.instagram.android', cpu: 3.8, memory: 6.1, user: 'u0_a46', status: 'running' },
  { pid: 600, name: 'com.google.android.youtube', cpu: 2.5, memory: 4.5, user: 'u0_a30', status: 'running' },
  { pid: 700, name: 'com.samsung.android.bixby', cpu: 1.2, memory: 3.1, user: 'u0_a50', status: 'running' },
];

const windowsServices: ServiceInfo[] = [
  { name: 'WSearch', status: 'running', description: 'Windows Search Indexer', startup: 'auto' },
  { name: 'DiagTrack', status: 'running', description: 'Connected User Experiences and Telemetry', startup: 'auto' },
  { name: 'dmwappushservice', status: 'running', description: 'WAP Push Message Routing Service', startup: 'auto' },
  { name: 'SysMain', status: 'running', description: 'Superfetch / SysMain', startup: 'auto' },
  { name: 'WMPNetworkSvc', status: 'stopped', description: 'Windows Media Player Network Sharing', startup: 'auto' },
  { name: 'XblAuthManager', status: 'running', description: 'Xbox Live Auth Manager', startup: 'auto' },
  { name: 'XblGameSave', status: 'running', description: 'Xbox Live Game Save', startup: 'auto' },
  { name: 'XboxNetApiSvc', status: 'running', description: 'Xbox Live Networking Service', startup: 'auto' },
  { name: 'MapsBroker', status: 'running', description: 'Downloaded Maps Manager', startup: 'auto' },
  { name: 'lfsvc', status: 'stopped', description: 'Geolocation Service', startup: 'manual' },
  { name: 'RetailDemo', status: 'stopped', description: 'Retail Demo Service', startup: 'disabled' },
  { name: 'wisvc', status: 'stopped', description: 'Windows Insider Service', startup: 'manual' },
];

const linuxServices: ServiceInfo[] = [
  { name: 'nginx', status: 'running', description: 'Nginx HTTP Server', startup: 'auto' },
  { name: 'postgresql', status: 'running', description: 'PostgreSQL Database', startup: 'auto' },
  { name: 'docker', status: 'running', description: 'Docker Container Runtime', startup: 'auto' },
  { name: 'snapd', status: 'running', description: 'Snap Package Manager', startup: 'auto' },
  { name: 'cups', status: 'stopped', description: 'CUPS Printing Service', startup: 'auto' },
  { name: 'bluetooth', status: 'stopped', description: 'Bluetooth Service', startup: 'auto' },
  { name: 'avahi-daemon', status: 'running', description: 'mDNS/DNS-SD Discovery', startup: 'auto' },
  { name: 'ModemManager', status: 'stopped', description: 'Modem Manager', startup: 'auto' },
];

const networkInterfaces: NetworkInterface[] = [
  { name: 'eth0', ip: '192.168.1.100', mac: 'AA:BB:CC:DD:EE:FF', speed: '1 Gbps' },
  { name: 'wlan0', ip: '192.168.1.101', mac: '11:22:33:44:55:66', speed: '300 Mbps' },
];

export function generateSystemInfo(connectionType: string): SystemInfo {
  const isWindows = connectionType === 'ssh' || connectionType === 'plink';
  const isAndroid = connectionType === 'adb';
  
  if (isAndroid) {
    return {
      os: 'Android',
      osVersion: 'Android 14 (API 34)',
      hostname: 'Galaxy-S24',
      cpu: 'Snapdragon 8 Gen 3',
      cpuCores: 8,
      cpuUsage: Math.round(Math.random() * 40 + 10),
      ram: 12,
      ramUsed: Math.round(Math.random() * 4 + 5),
      ramUnit: 'GB',
      diskTotal: 256,
      diskUsed: Math.round(Math.random() * 100 + 80),
      diskUnit: 'GB',
      uptime: `${Math.floor(Math.random() * 30 + 1)}d ${Math.floor(Math.random() * 24)}h ${Math.floor(Math.random() * 60)}m`,
      processes: androidProcesses,
      services: [],
      networkInterfaces: [{ name: 'wlan0', ip: '192.168.1.50', mac: 'AA:BB:CC:11:22:33', speed: 'WiFi 6E' }],
      gpu: 'Adreno 750'
    };
  }

  if (Math.random() > 0.5) {
    // Windows
    const ram = [8, 16, 32, 64][Math.floor(Math.random() * 4)];
    return {
      os: 'Windows',
      osVersion: 'Windows 11 Pro 23H2',
      hostname: `DESKTOP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      cpu: cpuModels[Math.floor(Math.random() * cpuModels.length)],
      cpuCores: [4, 6, 8, 12, 16, 24][Math.floor(Math.random() * 6)],
      cpuUsage: Math.round(Math.random() * 60 + 10),
      ram,
      ramUsed: Math.round(Math.random() * (ram * 0.6) + ram * 0.2),
      ramUnit: 'GB',
      diskTotal: [256, 512, 1000, 2000][Math.floor(Math.random() * 4)],
      diskUsed: Math.round(Math.random() * 400 + 100),
      diskUnit: 'GB',
      uptime: `${Math.floor(Math.random() * 30 + 1)}d ${Math.floor(Math.random() * 24)}h ${Math.floor(Math.random() * 60)}m`,
      processes: windowsProcesses,
      services: windowsServices,
      networkInterfaces,
      gpu: gpuModels[Math.floor(Math.random() * gpuModels.length)]
    };
  } else {
    // Linux
    const ram = [8, 16, 32, 64][Math.floor(Math.random() * 4)];
    return {
      os: 'Linux',
      osVersion: 'Ubuntu 24.04 LTS',
      hostname: `srv-${Math.random().toString(36).substring(2, 6)}`,
      cpu: cpuModels[Math.floor(Math.random() * cpuModels.length)],
      cpuCores: [4, 8, 16, 32][Math.floor(Math.random() * 4)],
      cpuUsage: Math.round(Math.random() * 50 + 5),
      ram,
      ramUsed: Math.round(Math.random() * (ram * 0.5) + ram * 0.15),
      ramUnit: 'GB',
      diskTotal: [120, 250, 500, 1000][Math.floor(Math.random() * 4)],
      diskUsed: Math.round(Math.random() * 300 + 50),
      diskUnit: 'GB',
      uptime: `${Math.floor(Math.random() * 90 + 1)}d ${Math.floor(Math.random() * 24)}h ${Math.floor(Math.random() * 60)}m`,
      processes: linuxProcesses,
      services: linuxServices,
      networkInterfaces,
      gpu: Math.random() > 0.5 ? gpuModels[Math.floor(Math.random() * gpuModels.length)] : undefined
    };
  }
}

export function generateRecommendations(sysInfo: SystemInfo): Recommendation[] {
  const recs: Recommendation[] = [];
  let id = 0;

  // Telemetry recommendations
  if (sysInfo.os === 'Windows') {
    recs.push({
      id: String(id++),
      category: 'privacy',
      severity: 'warning',
      title: 'Отключить телеметрию Windows',
      description: 'Служба DiagTrack отправляет данные в Microsoft и потребляет ресурсы. Рекомендуется отключить.',
      command: 'sc stop DiagTrack && sc config DiagTrack start=disabled',
      impact: 'Освобождение ~50-100 МБ RAM, снижение нагрузки на CPU',
      risk: 'low'
    });
    recs.push({
      id: String(id++),
      category: 'privacy',
      severity: 'info',
      title: 'Отключить WAP Push Service',
      description: 'Служба dmwappushservice связана с телеметрией и редко используется.',
      command: 'sc stop dmwappushservice && sc config dmwappushservice start=disabled',
      impact: 'Незначительное снижение нагрузки',
      risk: 'low'
    });
    recs.push({
      id: String(id++),
      category: 'performance',
      severity: 'info',
      title: 'Отключить Cortana',
      description: 'Cortana потребляет ресурсы в фоне и редко используется.',
      command: 'taskkill /f /im Cortana.exe',
      impact: `Освобождение ~2.5 ГБ RAM`,
      risk: 'low'
    });
    recs.push({
      id: String(id++),
      category: 'services',
      severity: 'info',
      title: 'Отключить Xbox сервисы',
      description: 'Если не используете Xbox Live, можно отключить связанные службы.',
      command: 'sc stop XblAuthManager && sc stop XblGameSave && sc stop XboxNetApiSvc',
      impact: 'Освобождение ~100 МБ RAM',
      risk: 'low'
    });
    recs.push({
      id: String(id++),
      category: 'performance',
      severity: 'warning',
      title: 'Высокое потребление RAM процессом Chrome',
      description: `Chrome использует ${(15.3 + 8.7 + 6.2).toFixed(1)} ГБ RAM. Рекомендуется закрыть неиспользуемые вкладки или включить Memory Saver.`,
      command: 'chrome://settings/performance',
      impact: 'Может освободить до 10 ГБ RAM',
      risk: 'low'
    });
    recs.push({
      id: String(id++),
      category: 'performance',
      severity: 'info',
      title: 'Windows Search Indexer потребляет ресурсы',
      description: 'Служба индексирования SearchIndexer.exe использует ресурсы CPU и диска.',
      command: 'sc config WSearch start=demand',
      impact: 'Снижение нагрузки на диск и CPU',
      risk: 'medium'
    });
    recs.push({
      id: String(id++),
      category: 'cleanup',
      severity: 'info',
      title: 'Очистить временные файлы',
      description: 'Обнаружены временные файлы, занимающие место на диске.',
      command: 'del /q /s %TEMP%\\* && rd /s /q %TEMP%',
      impact: 'Освобождение 1-5 ГБ дискового пространства',
      risk: 'low'
    });
  }

  if (sysInfo.os === 'Linux') {
    recs.push({
      id: String(id++),
      category: 'services',
      severity: 'info',
      title: 'Отключить CUPS (принтер)',
      description: 'Если сервер не использует принтеры, службу CUPS можно отключить.',
      command: 'sudo systemctl stop cups && sudo systemctl disable cups',
      impact: 'Освобождение ~20 МБ RAM',
      risk: 'low'
    });
    recs.push({
      id: String(id++),
      category: 'services',
      severity: 'info',
      title: 'Отключить Bluetooth',
      description: 'На сервере Bluetooth не нужен.',
      command: 'sudo systemctl stop bluetooth && sudo systemctl disable bluetooth',
      impact: 'Освобождение ~10 МБ RAM, снижение поверхности атаки',
      risk: 'low'
    });
    recs.push({
      id: String(id++),
      category: 'services',
      severity: 'info',
      title: 'Отключить ModemManager',
      description: 'Если нет модемов, ModemManager не нужен.',
      command: 'sudo systemctl stop ModemManager && sudo systemctl disable ModemManager',
      impact: 'Освобождение ~15 МБ RAM',
      risk: 'low'
    });
    recs.push({
      id: String(id++),
      category: 'performance',
      severity: 'warning',
      title: 'Node.js процесс потребляет много CPU',
      description: `Процесс node (PID 400) использует 4.2% CPU. Проверьте логи и оптимизируйте код.`,
      command: 'pm2 monit',
      impact: 'Снижение нагрузки на CPU',
      risk: 'medium'
    });
    recs.push({
      id: String(id++),
      category: 'security',
      severity: 'critical',
      title: 'Обновить пакеты безопасности',
      description: 'Обнаружены устаревшие пакеты с известными уязвимостями.',
      command: 'sudo apt update && sudo apt upgrade -y',
      impact: 'Закрытие уязвимостей безопасности',
      risk: 'low'
    });
    recs.push({
      id: String(id++),
      category: 'cleanup',
      severity: 'info',
      title: 'Очистить старые логи',
      description: 'Журналы systemd занимают много места.',
      command: 'sudo journalctl --vacuum-time=7d',
      impact: 'Освобождение дискового пространства',
      risk: 'low'
    });
    recs.push({
      id: String(id++),
      category: 'performance',
      severity: 'info',
      title: 'Оптимизировать PostgreSQL',
      description: 'Рекомендуется настроить shared_buffers и work_mem для лучшей производительности.',
      command: 'sudo nano /etc/postgresql/16/main/postgresql.conf',
      impact: 'Улучшение производительности БД на 20-40%',
      risk: 'medium'
    });
  }

  if (sysInfo.os === 'Android') {
    recs.push({
      id: String(id++),
      category: 'performance',
      severity: 'warning',
      title: 'Facebook потребляет много ресурсов',
      description: 'Приложение Facebook использует 4.5% CPU и 7.2 ГБ RAM. Рекомендуется ограничить фоновую активность.',
      command: 'adb shell am set-inactive com.facebook.katana true',
      impact: 'Освобождение ~7 ГБ RAM, снижение расхода батареи',
      risk: 'low'
    });
    recs.push({
      id: String(id++),
      category: 'performance',
      severity: 'warning',
      title: 'Instagram в фоне',
      description: 'Instagram активно работает в фоне. Ограничьте фоновые данные.',
      command: 'adb shell cmd appops set com.instagram.android RUN_IN_BACKGROUND deny',
      impact: 'Освобождение ~6 ГБ RAM',
      risk: 'low'
    });
    recs.push({
      id: String(id++),
      category: 'privacy',
      severity: 'info',
      title: 'Отключить Bixby',
      description: 'Samsung Bixby собирает данные и потребляет ресурсы.',
      command: 'adb shell pm disable-user --user 0 com.samsung.android.bixby.agent',
      impact: 'Освобождение ~3 ГБ RAM, повышение приватности',
      risk: 'low'
    });
    recs.push({
      id: String(id++),
      category: 'privacy',
      severity: 'warning',
      title: 'Google Play Services — высокая активность',
      description: 'GMS постоянно отправляет данные. Можно ограничить фоновую активность.',
      command: 'adb shell dumpsys deviceidle enable',
      impact: 'Снижение расхода батареи на 10-15%',
      risk: 'medium'
    });
    recs.push({
      id: String(id++),
      category: 'cleanup',
      severity: 'info',
      title: 'Очистить кэш приложений',
      description: 'Кэш приложений занимает значительное место.',
      command: 'adb shell pm trim-caches 500M',
      impact: 'Освобождение 2-10 ГБ хранилища',
      risk: 'low'
    });
  }

  // Common recommendations based on resource usage
  if (sysInfo.cpuUsage > 50) {
    recs.push({
      id: String(id++),
      category: 'performance',
      severity: 'critical',
      title: 'Высокая загрузка CPU',
      description: `Загрузка CPU составляет ${sysInfo.cpuUsage}%. Найдите и оптимизируйте ресурсоёмкие процессы.`,
      command: sysInfo.os === 'Windows' ? 'taskmgr' : 'top -c',
      impact: 'Снижение нагрузки на процессор',
      risk: 'low'
    });
  }

  if (sysInfo.ramUsed / sysInfo.ram > 0.8) {
    recs.push({
      id: String(id++),
      category: 'performance',
      severity: 'critical',
      title: 'Нехватка оперативной памяти',
      description: `Использовано ${sysInfo.ramUsed} из ${sysInfo.ram} ${sysInfo.ramUnit} (${Math.round(sysInfo.ramUsed/sysInfo.ram*100)}%). Рекомендуется добавить RAM или закрыть процессы.`,
      command: '',
      impact: 'Предотвращение замедления системы',
      risk: 'low'
    });
  }

  if (sysInfo.diskUsed / sysInfo.diskTotal > 0.8) {
    recs.push({
      id: String(id++),
      category: 'cleanup',
      severity: 'warning',
      title: 'Мало свободного места на диске',
      description: `Использовано ${sysInfo.diskUsed} из ${sysInfo.diskTotal} ${sysInfo.diskUnit} (${Math.round(sysInfo.diskUsed/sysInfo.diskTotal*100)}%).`,
      command: sysInfo.os === 'Windows' ? 'cleanmgr' : 'sudo du -sh /* | sort -rh | head -20',
      impact: 'Предотвращение проблем с производительностью',
      risk: 'low'
    });
  }

  return recs;
}

export function generateDeviceId(): string {
  return Math.random().toString(36).substring(2, 10);
}
