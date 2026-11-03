/**
 * Команды для сбора информации с Linux-систем
 */

const commands = {
  // Базовая информация о системе
  hostname: 'hostname',
  
  osInfo: `cat /etc/os-release 2>/dev/null || cat /etc/issue 2>/dev/null || uname -o`,
  
  kernelInfo: 'uname -a',
  
  uptime: 'uptime -p 2>/dev/null || uptime',
  
  // Информация о CPU
  cpuInfo: 'cat /proc/cpuinfo',
  
  cpuLoad: `cat /proc/loadavg`,
  
  cpuModel: `grep 'model name' /proc/cpuinfo | head -1 | cut -d':' -f2 | xargs`,
  
  cpuCores: `nproc 2>/dev/null || grep -c '^processor' /proc/cpuinfo`,
  
  // Информация о памяти
  memoryInfo: 'free -b',
  
  memoryInfoHuman: 'free -h',
  
  // Информация о дисках
  diskInfo: 'df -B1 2>/dev/null || df',
  
  diskInfoHuman: 'df -h',
  
  // GPU информация
  gpuInfo: `lspci 2>/dev/null | grep -i 'vga\\|3d\\|display' || echo "No GPU info available"`,
  
  // Сетевые интерфейсы
  networkInfo: `ip -j addr show 2>/dev/null || ifconfig 2>/dev/null || cat /proc/net/dev`,
  
  networkInterfaces: `ip -o link show 2>/dev/null | awk '{print $2, $NF}' || ifconfig -l`,
  
  // Процессы
  processes: `ps aux --sort=-%cpu 2>/dev/null || ps aux`,
  
  processesTop15: `ps aux --sort=-%cpu | head -16 2>/dev/null || ps aux | head -16`,
  
  // Службы (systemd)
  services: `systemctl list-units --type=service --all --no-pager --no-legend 2>/dev/null || echo "systemctl not available"`,
  
  servicesEnabled: `systemctl list-unit-files --type=service --state=enabled --no-pager --no-legend 2>/dev/null || echo "systemctl not available"`,
  
  // Установленные пакеты (для анализа уязвимостей)
  packageManager: `which apt 2>/dev/null && echo "apt" || which yum 2>/dev/null && echo "yum" || which dnf 2>/dev/null && echo "dnf" || which pacman 2>/dev/null && echo "pacman" || echo "unknown"`,
  
  securityUpdates: `apt list --upgradable 2>/dev/null | head -20 || yum check-update 2>/dev/null | head -20 || echo "Package manager not found"`,
  
  // Логи (размер)
  logsSize: `du -sh /var/log 2>/dev/null || echo "Cannot read /var/log"`,
  
  // Docker (если установлен)
  dockerInfo: `docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || echo "Docker not available"`,
  
  // Температура (если доступно)
  temperature: `cat /sys/class/thermal/thermal_zone*/temp 2>/dev/null | head -1 || echo "N/A"`,
  
  // Все команды одним запросом (для быстрого сканирования)
  quickScan: `echo "===HOSTNAME===" && hostname && echo "===OS===" && cat /etc/os-release 2>/dev/null && echo "===KERNEL===" && uname -a && echo "===UPTIME===" && uptime && echo "===CPU_MODEL===" && grep 'model name' /proc/cpuinfo | head -1 | cut -d':' -f2 | xargs && echo "===CPU_CORES===" && nproc && echo "===CPU_LOAD===" && cat /proc/loadavg && echo "===MEMORY===" && free -b && echo "===DISK===" && df -B1 && echo "===GPU===" && (lspci 2>/dev/null | grep -i 'vga\\|3d\\|display' || echo "N/A") && echo "===NETWORK===" && ip -j addr show 2>/dev/null && echo "===PROCESSES===" && ps aux --sort=-%cpu | head -20 && echo "===SERVICES===" && (systemctl list-units --type=service --state=running --no-pager --no-legend 2>/dev/null || echo "N/A") && echo "===END==="`,
};

/**
 * Парсит вывод команд в структурированные данные
 */
function parseLinuxData(rawData) {
  const result = {
    os: 'Linux',
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
    // Hostname
    const hostnameMatch = rawData.match(/===HOSTNAME===\n(.+)/);
    if (hostnameMatch) result.hostname = hostnameMatch[1].trim();

    // OS
    const osMatch = rawData.match(/===OS===\n([\s\S]*?)(?====)/);
    if (osMatch) {
      const osData = osMatch[1];
      const prettyName = osData.match(/PRETTY_NAME="(.+?)"/);
      const versionId = osData.match(/VERSION_ID="(.+?)"/);
      result.osVersion = prettyName ? prettyName[1] : (versionId ? versionId[1] : 'Linux');
    }

    // CPU Model
    const cpuMatch = rawData.match(/===CPU_MODEL===\n(.+)/);
    if (cpuMatch) result.cpu = cpuMatch[1].trim();

    // CPU Cores
    const coresMatch = rawData.match(/===CPU_CORES===\n(\d+)/);
    if (coresMatch) result.cpuCores = parseInt(coresMatch[1]);

    // CPU Load
    const loadMatch = rawData.match(/===CPU_LOAD===\n([\d.]+)\s/);
    if (loadMatch) {
      const load1min = parseFloat(loadMatch[1]);
      result.cpuUsage = Math.min(100, Math.round((load1min / (result.cpuCores || 1)) * 100));
    }

    // Memory
    const memMatch = rawData.match(/===MEMORY===\nMem:\s+total\s+used\s+free[\s\S]*?Mem:\s+(\d+)\s+(\d+)/);
    if (memMatch) {
      result.ram = Math.round(parseInt(memMatch[1]) / (1024 * 1024 * 1024) * 10) / 10;
      result.ramUsed = Math.round(parseInt(memMatch[2]) / (1024 * 1024 * 1024) * 10) / 10;
    } else {
      // Fallback: free -b формат
      const memMatch2 = rawData.match(/===MEMORY===\nMemTotal:\s+(\d+)\s+kB[\s\S]*?MemAvailable:\s+(\d+)/);
      if (memMatch2) {
        const totalKB = parseInt(memMatch2[1]);
        const availKB = parseInt(memMatch2[2]);
        result.ram = Math.round(totalKB / (1024 * 1024) * 10) / 10;
        result.ramUsed = Math.round((totalKB - availKB) / (1024 * 1024) * 10) / 10;
      }
    }

    // Disk
    const diskMatch = rawData.match(/===DISK===\n([\s\S]*?)(?====)/);
    if (diskMatch) {
      const lines = diskMatch[1].trim().split('\n').slice(1);
      let totalBytes = 0;
      let usedBytes = 0;
      lines.forEach(line => {
        const parts = line.split(/\s+/);
        if (parts.length >= 3 && parts[0].startsWith('/dev/')) {
          totalBytes += parseInt(parts[1]) || 0;
          usedBytes += parseInt(parts[2]) || 0;
        }
      });
      result.diskTotal = Math.round(totalBytes / (1024 * 1024 * 1024));
      result.diskUsed = Math.round(usedBytes / (1024 * 1024 * 1024));
    }

    // GPU
    const gpuMatch = rawData.match(/===GPU===\n(.+)/);
    if (gpuMatch && gpuMatch[1].trim() !== 'N/A') {
      result.gpu = gpuMatch[1].trim().replace(/^.*:\s*/, '');
    }

    // Uptime
    const uptimeMatch = rawData.match(/===UPTIME===\nup\s+(.+)/);
    if (uptimeMatch) result.uptime = uptimeMatch[1].trim();

    // Processes
    const procMatch = rawData.match(/===PROCESSES===\n([\s\S]*?)(?====)/);
    if (procMatch) {
      const lines = procMatch[1].trim().split('\n').slice(1);
      result.processes = lines.slice(0, 15).map(line => {
        const parts = line.split(/\s+/);
        return {
          user: parts[0] || 'unknown',
          pid: parseInt(parts[1]) || 0,
          cpu: parseFloat(parts[2]) || 0,
          memory: parseFloat(parts[3]) || 0,
          status: 'running',
          name: parts[10] || parts[parts.length - 1] || 'unknown'
        };
      }).filter(p => p.pid > 0);
    }

    // Services
    const svcMatch = rawData.match(/===SERVICES===\n([\s\S]*?)(?====)/);
    if (svcMatch && svcMatch[1].trim() !== 'N/A') {
      const lines = svcMatch[1].trim().split('\n');
      result.services = lines.slice(0, 20).map(line => {
        const parts = line.split(/\s+/);
        const name = parts[0] || '';
        const status = parts[2] === 'running' ? 'running' : parts[2] === 'dead' ? 'stopped' : 'unknown';
        return {
          name: name.replace('.service', ''),
          status,
          description: name.replace('.service', ''),
          startup: 'auto'
        };
      }).filter(s => s.name);
    }

    // Network
    const netMatch = rawData.match(/===NETWORK===\n([\s\S]*?)(?====)/);
    if (netMatch) {
      try {
        const netData = JSON.parse(netMatch[1].trim());
        result.networkInterfaces = netData.map(iface => ({
          name: iface.ifname || '',
          ip: (iface.addr_info || []).find(a => a.family === 'inet')?.local || '',
          mac: iface.address || '',
          speed: 'N/A'
        }));
      } catch (e) {
        // Fallback парсинг
        const ifLines = netMatch[1].trim().split('\n');
        result.networkInterfaces = ifLines
          .filter(l => l.includes(':') && !l.startsWith(' '))
          .slice(0, 5)
          .map(line => ({
            name: line.split(':')[1]?.trim() || '',
            ip: '',
            mac: '',
            speed: 'N/A'
          }));
      }
    }

  } catch (error) {
    console.error('Error parsing Linux data:', error);
  }

  return result;
}

module.exports = { commands, parseLinuxData };
