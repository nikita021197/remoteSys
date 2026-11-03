/**
 * Команды для сбора информации с Android-устройств через ADB
 */

const { execSync, exec } = require('child_process');

const adbCommands = {
  // Подключение
  connect: (ip, port) => `adb connect ${ip}:${port}`,
  disconnect: (ip, port) => `adb disconnect ${ip}:${port}`,
  devices: 'adb devices -l',

  // Базовая информация
  model: 'adb shell getprop ro.product.model',
  brand: 'adb shell getprop ro.product.brand',
  androidVersion: 'adb shell getprop ro.build.version.release',
  sdkVersion: 'adb shell getprop ro.build.version.sdk',
  buildId: 'adb shell getprop ro.build.id',
  serial: 'adb shell getprop ro.serialno',

  // CPU
  cpuInfo: 'adb shell cat /proc/cpuinfo',
  cpuAbi: 'adb shell getprop ro.product.cpu.abi',
  cpuCores: 'adb shell nproc 2>/dev/null || adb shell grep -c processor /proc/cpuinfo',

  // Память
  memInfo: 'adb shell cat /proc/meminfo',
  memTotal: 'adb shell grep MemTotal /proc/meminfo',
  memFree: 'adb shell grep MemFree /proc/meminfo',
  memAvailable: 'adb shell grep MemAvailable /proc/meminfo',

  // Хранилище
  diskInfo: 'adb shell df -h',
  diskInfoBytes: 'adb shell df',

  // Батарея
  batteryInfo: 'adb shell dumpsys battery',

  // Экран
  screenInfo: 'adb shell wm size',
  screenDensity: 'adb shell wm density',

  // Процессы
  processes: 'adb shell ps -A',
  processesTop: 'adb shell top -n 1 -b | head -30',

  // Приложения
  packages: 'adb shell pm list packages -3',
  packagesAll: 'adb shell pm list packages',

  // Сеть
  networkInfo: 'adb shell ip addr show',
  wifiInfo: 'adb shell dumpsys wifi | grep "mWifiInfo"',

  // Быстрое сканирование
  quickScan: `adb shell "
echo '===MODEL==='; getprop ro.product.model;
echo '===BRAND==='; getprop ro.product.brand;
echo '===ANDROID==='; getprop ro.build.version.release;
echo '===SDK==='; getprop ro.build.version.sdk;
echo '===CPU_ABI==='; getprop ro.product.cpu.abi;
echo '===CPU_INFO==='; cat /proc/cpuinfo | head -30;
echo '===MEM==='; cat /proc/meminfo | head -10;
echo '===DISK==='; df -h;
echo '===BATTERY==='; dumpsys battery;
echo '===SCREEN==='; wm size;
echo '===PROCESSES==='; ps -A | head -25;
echo '===PACKAGES==='; pm list packages -3 | head -30;
echo '===NETWORK==='; ip addr show | grep -E 'inet |link/' | head -10;
echo '===END==='
"`,
};

/**
 * Подключается к Android устройству по ADB
 */
function connectDevice(ip, port = 5555) {
  try {
    const result = execSync(`adb connect ${ip}:${port}`, { timeout: 10000 }).toString();
    return { success: result.includes('connected'), output: result };
  } catch (error) {
    return { success: false, output: error.message };
  }
}

/**
 * Отключается от Android устройства
 */
function disconnectDevice(ip, port = 5555) {
  try {
    const result = execSync(`adb disconnect ${ip}:${port}`, { timeout: 5000 }).toString();
    return { success: true, output: result };
  } catch (error) {
    return { success: false, output: error.message };
  }
}

/**
 * Выполняет ADB shell команду
 */
function execAdbCommand(command, serial = null) {
  try {
    const serialFlag = serial ? `-s ${serial}` : '';
    const result = execSync(`adb ${serialFlag} shell "${command}"`, { timeout: 15000 }).toString();
    return { success: true, output: result };
  } catch (error) {
    return { success: false, output: error.message };
  }
}

/**
 * Выполняет быстрое сканирование Android устройства
 */
function quickScan(serial = null) {
  try {
    const serialFlag = serial ? `-s ${serial}` : '';
    const result = execSync(`adb ${serialFlag} shell "${adbCommands.quickScan.replace(/"/g, '\\"')}"`, { timeout: 30000 }).toString();
    return { success: true, output: result };
  } catch (error) {
    return { success: false, output: error.message };
  }
}

/**
 * Парсит вывод Android команд в структурированные данные
 */
function parseAndroidData(rawData) {
  const result = {
    os: 'Android',
    osVersion: '',
    hostname: '',
    cpu: '',
    cpuCores: 0,
    cpuUsage: 0,
    ram: 0,
    ramUsed: 0,
    ramUnit: 'GB',
    diskTotal: 0,
    diskUsed: 0,
    diskUnit: 'GB',
    uptime: '',
    processes: [],
    services: [],
    networkInterfaces: [],
    gpu: ''
  };

  try {
    // Model & Brand
    const modelMatch = rawData.match(/===MODEL===\r?\n(.+)/);
    const brandMatch = rawData.match(/===BRAND===\r?\n(.+)/);
    if (modelMatch) {
      result.hostname = brandMatch ? `${brandMatch[1].trim()} ${modelMatch[1].trim()}` : modelMatch[1].trim();
    }

    // Android version
    const androidMatch = rawData.match(/===ANDROID===\r?\n(.+)/);
    const sdkMatch = rawData.match(/===SDK===\r?\n(.+)/);
    if (androidMatch) {
      result.osVersion = `Android ${androidMatch[1].trim()} (API ${sdkMatch ? sdkMatch[1].trim() : '?'})`;
    }

    // CPU
    const cpuMatch = rawData.match(/===CPU_INFO===\r?\n([\s\S]*?)(?====)/);
    if (cpuMatch) {
      const hwMatch = cpuMatch[1].match(/Hardware\s*:\s*(.+)/i);
      const procMatch = cpuMatch[1].match(/model name\s*:\s*(.+)/i) || cpuMatch[1].match(/Processor\s*:\s*(.+)/i);
      result.cpu = hwMatch ? hwMatch[1].trim() : (procMatch ? procMatch[1].trim() : 'ARM Processor');
      
      const coreCount = (cpuMatch[1].match(/processor\s*:/gi) || []).length;
      result.cpuCores = coreCount || 4;
    }

    // CPU ABI
    const abiMatch = rawData.match(/===CPU_ABI===\r?\n(.+)/);
    if (abiMatch && !result.cpu) {
      result.cpu = abiMatch[1].trim();
    }

    // Memory
    const memMatch = rawData.match(/===MEM===\r?\n([\s\S]*?)(?====)/);
    if (memMatch) {
      const totalMatch = memMatch[1].match(/MemTotal:\s+(\d+)\s+kB/);
      const freeMatch = memMatch[1].match(/MemFree:\s+(\d+)\s+kB/) || memMatch[1].match(/MemAvailable:\s+(\d+)\s+kB/);
      if (totalMatch) {
        result.ram = Math.round(parseInt(totalMatch[1]) / (1024 * 1024) * 10) / 10;
        if (freeMatch) {
          const freeKB = parseInt(freeMatch[1]);
          result.ramUsed = Math.round((parseInt(totalMatch[1]) - freeKB) / (1024 * 1024) * 10) / 10;
        }
      }
    }

    // Disk
    const diskMatch = rawData.match(/===DISK===\r?\n([\s\S]*?)(?====)/);
    if (diskMatch) {
      const lines = diskMatch[1].trim().split('\n').slice(1);
      let totalGB = 0;
      let usedGB = 0;
      lines.forEach(line => {
        const parts = line.split(/\s+/);
        if (parts.length >= 5 && !parts[0].includes('tmpfs') && !parts[0].includes('overlay')) {
          const size = parts[1];
          const used = parts[2];
          if (size && used) {
            const sizeGB = parseSizeToGB(size);
            const usedGBVal = parseSizeToGB(used);
            if (sizeGB > 0.5) { // Только значимые разделы
              totalGB += sizeGB;
              usedGB += usedGBVal;
            }
          }
        }
      });
      result.diskTotal = Math.round(totalGB) || 64;
      result.diskUsed = Math.round(usedGB) || 20;
    }

    // Battery
    const batteryMatch = rawData.match(/===BATTERY===\r?\n([\s\S]*?)(?====)/);
    if (batteryMatch) {
      const levelMatch = batteryMatch[1].match(/level:\s*(\d+)/);
      if (levelMatch) {
        result.uptime = `Battery: ${levelMatch[1]}%`;
      }
    }

    // Processes
    const procMatch = rawData.match(/===PROCESSES===\r?\n([\s\S]*?)(?====)/);
    if (procMatch) {
      const lines = procMatch[1].trim().split('\n').slice(1);
      result.processes = lines.slice(0, 15).map(line => {
        const parts = line.split(/\s+/);
        return {
          user: parts[0] || 'unknown',
          pid: parseInt(parts[1]) || 0,
          cpu: 0,
          memory: 0,
          status: 'running',
          name: parts[parts.length - 1] || 'unknown'
        };
      }).filter(p => p.pid > 0);
    }

    // Network
    const netMatch = rawData.match(/===NETWORK===\r?\n([\s\S]*?)(?====)/);
    if (netMatch) {
      const lines = netMatch[1].trim().split('\n');
      let currentIface = null;
      lines.forEach(line => {
        const inetMatch = line.match(/inet\s+([\d.]+)/);
        const linkMatch = line.match(/link\/\w+\s+([\w:]+)/);
        const ifMatch = line.match(/^\d+:\s+(\w+)/);
        
        if (ifMatch) {
          currentIface = { name: ifMatch[1], ip: '', mac: '', speed: 'N/A' };
        }
        if (currentIface) {
          if (inetMatch) currentIface.ip = inetMatch[1];
          if (linkMatch) currentIface.mac = linkMatch[1];
          if (currentIface.ip || currentIface.mac) {
            if (!result.networkInterfaces.find(n => n.name === currentIface.name)) {
              result.networkInterfaces.push({ ...currentIface });
            }
          }
        }
      });
    }

  } catch (error) {
    console.error('Error parsing Android data:', error);
  }

  return result;
}

/**
 * Парсит размер (K, M, G, T) в GB
 */
function parseSizeToGB(sizeStr) {
  const match = sizeStr.match(/([\d.]+)\s*([KMGT]?)/i);
  if (!match) return 0;
  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  switch (unit) {
    case 'K': return value / (1024 * 1024);
    case 'M': return value / 1024;
    case 'G': return value;
    case 'T': return value * 1024;
    default: return value / (1024 * 1024 * 1024); // bytes
  }
}

module.exports = {
  adbCommands,
  connectDevice,
  disconnectDevice,
  execAdbCommand,
  quickScan,
  parseAndroidData
};
