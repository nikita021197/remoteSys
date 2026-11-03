/**
 * Команды для сбора информации с Windows-систем
 * Работает через SSH (если установлен OpenSSH Server) или PLINK
 */

const commands = {
  // Базовая информация
  hostname: 'hostname',
  
  osInfo: `powershell -Command "(Get-CimInstance Win32_OperatingSystem).Caption + ' ' + (Get-CimInstance Win32_OperatingSystem).Version"`,
  
  osVersion: `ver`,
  
  uptime: `powershell -Command "$os = Get-CimInstance Win32_OperatingSystem; $uptime = (Get-Date) - $os.LastBootUpTime; Write-Output ('{0}d {1}h {2}m' -f $uptime.Days, $uptime.Hours, $uptime.Minutes)"`,
  
  // CPU информация
  cpuInfo: `powershell -Command "(Get-CimInstance Win32_Processor).Name"`,
  
  cpuCores: `powershell -Command "(Get-CimInstance Win32_Processor).NumberOfLogicalProcessors"`,
  
  cpuLoad: `powershell -Command "(Get-CimInstance Win32_Processor).LoadPercentage"`,
  
  // RAM информация
  ramInfo: `powershell -Command "$os = Get-CimInstance Win32_OperatingSystem; Write-Output ('{0} {1}' -f [math]::Round($os.TotalVisibleMemorySize/1MB, 1), [math]::Round(($os.TotalVisibleMemorySize - $os.FreePhysicalMemory)/1MB, 1))"`,
  
  ramDetailed: `powershell -Command "Get-CimInstance Win32_PhysicalMemory | Select-Object Capacity, Speed, Manufacturer | Format-Table"`,
  
  // Disk информация
  diskInfo: `powershell -Command "Get-CimInstance Win32_LogicalDisk | Where-Object {$_.DriveType -eq 3} | Select-Object DeviceID, @{N='Size';E={[math]::Round($_.Size/1GB,1)}}, @{N='Free';E={[math]::Round($_.FreeSpace/1GB,1)}} | Format-Table"`,
  
  // GPU информация
  gpuInfo: `powershell -Command "(Get-CimInstance Win32_VideoController).Name"`,
  
  // Сеть
  networkInfo: `ipconfig /all`,
  
  networkInterfaces: `powershell -Command "Get-NetAdapter | Select-Object Name, InterfaceDescription, MacAddress, LinkSpeed, Status | Format-Table"`,
  
  networkIP: `powershell -Command "Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notmatch 'Loopback'} | Select-Object InterfaceAlias, IPAddress | Format-Table"`,
  
  // Процессы
  processes: `powershell -Command "Get-Process | Sort-Object CPU -Descending | Select-Object Id, ProcessName, @{N='CPU_s';E={[math]::Round($_.CPU,1)}}, @{N='Mem_MB';E={[math]::Round($_.WorkingSet64/1MB,1)}} -First 20 | Format-Table"`,
  
  // Службы
  services: `powershell -Command "Get-Service | Select-Object Name, DisplayName, Status, StartType | Format-Table"`,
  
  servicesRunning: `powershell -Command "Get-Service | Where-Object {$_.Status -eq 'Running'} | Select-Object Name, DisplayName, StartType | Format-Table"`,
  
  // Автозагрузка
  startup: `powershell -Command "Get-CimInstance Win32_StartupCommand | Select-Object Name, Command, Location | Format-Table"`,
  
  // Обновления
  updates: `powershell -Command "Get-HotFix | Sort-Object InstalledOn -Descending | Select-Object -First 5 HotFixID, InstalledOn | Format-Table"`,
  
  // Быстрое сканирование (все команды одним запросом)
  quickScan: `powershell -Command "
Write-Output '===HOSTNAME==='; hostname;
Write-Output '===OS==='; (Get-CimInstance Win32_OperatingSystem).Caption + ' ' + (Get-CimInstance Win32_OperatingSystem).Version;
Write-Output '===UPTIME==='; $os = Get-CimInstance Win32_OperatingSystem; $up = (Get-Date) - $os.LastBootUpTime; Write-Output ('{0}d {1}h {2}m' -f $up.Days, $up.Hours, $up.Minutes);
Write-Output '===CPU==='; (Get-CimInstance Win32_Processor).Name;
Write-Output '===CPU_CORES==='; (Get-CimInstance Win32_Processor).NumberOfLogicalProcessors;
Write-Output '===CPU_LOAD==='; (Get-CimInstance Win32_Processor).LoadPercentage;
Write-Output '===RAM==='; $o = Get-CimInstance Win32_OperatingSystem; Write-Output ('{0}|{1}' -f [math]::Round($o.TotalVisibleMemorySize/1MB,1), [math]::Round(($o.TotalVisibleMemorySize - $o.FreePhysicalMemory)/1MB,1));
Write-Output '===DISK==='; Get-CimInstance Win32_LogicalDisk | Where-Object {$_.DriveType -eq 3} | ForEach-Object { Write-Output ('{0}|{1}|{2}' -f $_.DeviceID, [math]::Round($_.Size/1GB,1), [math]::Round($_.FreeSpace/1GB,1)) };
Write-Output '===GPU==='; (Get-CimInstance Win32_VideoController).Name;
Write-Output '===PROCESSES==='; Get-Process | Sort-Object CPU -Descending | Select-Object -First 15 Id, ProcessName, @{N='C';E={[math]::Round($_.CPU,1)}}, @{N='M';E={[math]::Round($_.WorkingSet64/1MB,1)}} | Format-Table -HideTableHeaders;
Write-Output '===SERVICES==='; Get-Service | Where-Object {$_.Status -eq 'Running'} | Select-Object -First 20 Name, DisplayName, StartType | Format-Table -HideTableHeaders;
Write-Output '===NETWORK==='; Get-NetAdapter | Where-Object {$_.Status -eq 'Up'} | Select-Object Name, MacAddress, LinkSpeed | Format-Table -HideTableHeaders;
Write-Output '===END==='
"`,
};

/**
 * Парсит вывод PowerShell команд в структурированные данные
 */
function parseWindowsData(rawData) {
  const result = {
    os: 'Windows',
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
    const hostnameMatch = rawData.match(/===HOSTNAME===\r?\n(.+)/);
    if (hostnameMatch) result.hostname = hostnameMatch[1].trim();

    // OS
    const osMatch = rawData.match(/===OS===\r?\n(.+)/);
    if (osMatch) result.osVersion = osMatch[1].trim();

    // CPU
    const cpuMatch = rawData.match(/===CPU===\r?\n(.+)/);
    if (cpuMatch) result.cpu = cpuMatch[1].trim();

    // CPU Cores
    const coresMatch = rawData.match(/===CPU_CORES===\r?\n(\d+)/);
    if (coresMatch) result.cpuCores = parseInt(coresMatch[1]);

    // CPU Load
    const loadMatch = rawData.match(/===CPU_LOAD===\r?\n(\d+)/);
    if (loadMatch) result.cpuUsage = parseInt(loadMatch[1]);

    // RAM (format: total|used in GB)
    const ramMatch = rawData.match(/===RAM===\r?\n([\d.]+)\|([\d.]+)/);
    if (ramMatch) {
      result.ram = parseFloat(ramMatch[1]);
      result.ramUsed = parseFloat(ramMatch[2]);
    }

    // Disk (format: C:|size|free per line)
    const diskMatch = rawData.match(/===DISK===\r?\n([\s\S]*?)(?====)/);
    if (diskMatch) {
      const lines = diskMatch[1].trim().split('\n');
      let totalGB = 0;
      let freeGB = 0;
      lines.forEach(line => {
        const parts = line.trim().split('|');
        if (parts.length >= 3) {
          totalGB += parseFloat(parts[1]) || 0;
          freeGB += parseFloat(parts[2]) || 0;
        }
      });
      result.diskTotal = Math.round(totalGB);
      result.diskUsed = Math.round(totalGB - freeGB);
    }

    // GPU
    const gpuMatch = rawData.match(/===GPU===\r?\n(.+)/);
    if (gpuMatch) result.gpu = gpuMatch[1].trim();

    // Uptime
    const uptimeMatch = rawData.match(/===UPTIME===\r?\n(.+)/);
    if (uptimeMatch) result.uptime = uptimeMatch[1].trim();

    // Processes
    const procMatch = rawData.match(/===PROCESSES===\r?\n([\s\S]*?)(?====)/);
    if (procMatch) {
      const lines = procMatch[1].trim().split('\n').filter(l => l.trim());
      result.processes = lines.slice(0, 15).map(line => {
        const parts = line.trim().split(/\s+/);
        return {
          pid: parseInt(parts[0]) || 0,
          name: parts[1] || 'unknown',
          cpu: parseFloat(parts[2]) || 0,
          memory: parseFloat(parts[3]) || 0,
          user: 'user',
          status: 'running'
        };
      }).filter(p => p.pid > 0);
    }

    // Services
    const svcMatch = rawData.match(/===SERVICES===\r?\n([\s\S]*?)(?====)/);
    if (svcMatch) {
      const lines = svcMatch[1].trim().split('\n').filter(l => l.trim());
      result.services = lines.slice(0, 20).map(line => {
        const parts = line.trim().split(/\s{2,}/);
        return {
          name: parts[0] || '',
          status: 'running',
          description: parts[1] || parts[0] || '',
          startup: parts[2] || 'auto'
        };
      }).filter(s => s.name);
    }

    // Network
    const netMatch = rawData.match(/===NETWORK===\r?\n([\s\S]*?)(?====)/);
    if (netMatch) {
      const lines = netMatch[1].trim().split('\n').filter(l => l.trim());
      result.networkInterfaces = lines.map(line => {
        const parts = line.trim().split(/\s{2,}/);
        return {
          name: parts[0] || '',
          ip: '',
          mac: parts[1] || '',
          speed: parts[2] || 'N/A'
        };
      }).filter(n => n.name);
    }

  } catch (error) {
    console.error('Error parsing Windows data:', error);
  }

  return result;
}

module.exports = { commands, parseWindowsData };
