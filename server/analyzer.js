/**
 * Анализатор системной информации и генератор рекомендаций
 */

/**
 * Генерирует рекомендации на основе системной информации
 */
function analyzeSystem(systemInfo) {
  const recommendations = [];
  let id = 0;

  // === Windows рекомендации ===
  if (systemInfo.os === 'Windows') {
    // Телеметрия
    const diagTrack = systemInfo.services?.find(s => 
      s.name.toLowerCase().includes('diagtrack') || 
      s.name.toLowerCase().includes('telemetry')
    );
    if (diagTrack && diagTrack.status === 'running') {
      recommendations.push({
        id: String(id++),
        category: 'privacy',
        severity: 'warning',
        title: 'Отключить телеметрию Windows',
        description: 'Служба DiagTrack отправляет данные в Microsoft и потребляет ресурсы. Рекомендуется отключить для повышения приватности.',
        command: 'sc stop DiagTrack && sc config DiagTrack start=disabled',
        impact: 'Освобождение ~50-100 МБ RAM, снижение нагрузки на CPU',
        risk: 'low'
      });
    }

    // WAP Push
    const wapPush = systemInfo.services?.find(s => 
      s.name.toLowerCase().includes('dmwappush')
    );
    if (wapPush) {
      recommendations.push({
        id: String(id++),
        category: 'privacy',
        severity: 'info',
        title: 'Отключить WAP Push Service',
        description: 'Служба dmwappushservice связана с телеметрией и редко используется на десктопе.',
        command: 'sc stop dmwappushservice && sc config dmwappushservice start=disabled',
        impact: 'Незначительное снижение нагрузки',
        risk: 'low'
      });
    }

    // Xbox сервисы
    const xboxServices = systemInfo.services?.filter(s => 
      s.name.toLowerCase().includes('xbl') || s.name.toLowerCase().includes('xbox')
    );
    if (xboxServices && xboxServices.length > 0) {
      const svcNames = xboxServices.map(s => s.name).join(', ');
      recommendations.push({
        id: String(id++),
        category: 'services',
        severity: 'info',
        title: 'Отключить Xbox сервисы',
        description: `Обнаружены Xbox-службы: ${svcNames}. Если не используете Xbox Live, можно отключить.`,
        command: xboxServices.map(s => `sc stop ${s.name}`).join(' && ') + ' && ' + xboxServices.map(s => `sc config ${s.name} start=disabled`).join(' && '),
        impact: 'Освобождение ~100-200 МБ RAM',
        risk: 'low'
      });
    }

    // Windows Search
    const wsearch = systemInfo.services?.find(s => 
      s.name.toLowerCase().includes('wsearch')
    );
    if (wsearch && wsearch.status === 'running') {
      recommendations.push({
        id: String(id++),
        category: 'performance',
        severity: 'info',
        title: 'Оптимизировать Windows Search',
        description: 'Служба индексирования потребляет ресурсы CPU и диска. Можно переключить на ручной запуск.',
        command: 'sc config WSearch start=demand',
        impact: 'Снижение нагрузки на диск и CPU',
        risk: 'medium'
      });
    }

    // SysMain/Superfetch
    const sysmain = systemInfo.services?.find(s => 
      s.name.toLowerCase().includes('sysmain') || s.name.toLowerCase().includes('superfetch')
    );
    if (sysmain && systemInfo.ram >= 16) {
      recommendations.push({
        id: String(id++),
        category: 'performance',
        severity: 'info',
        title: 'Отключить SysMain (Superfetch)',
        description: 'При достаточном объёме RAM SysMain может быть отключён для снижения нагрузки на диск.',
        command: 'sc stop SysMain && sc config SysMain start=disabled',
        impact: 'Снижение нагрузки на SSD/HDD',
        risk: 'low'
      });
    }

    // Очистка временных файлов
    recommendations.push({
      id: String(id++),
      category: 'cleanup',
      severity: 'info',
      title: 'Очистить временные файлы',
      description: 'Рекомендуется периодически очищать временные файлы для освобождения дискового пространства.',
      command: 'del /q /s %TEMP%\\* & rd /s /q %TEMP% & mkdir %TEMP%',
      impact: 'Освобождение 1-10 ГБ дискового пространства',
      risk: 'low'
    });

    // Проверка обновлений
    recommendations.push({
      id: String(id++),
      category: 'security',
      severity: 'warning',
      title: 'Проверить обновления Windows',
      description: 'Убедитесь, что установлены все последние обновления безопасности.',
      command: 'powershell -Command "Install-Module PSWindowsUpdate -Force; Get-WindowsUpdate"',
      impact: 'Закрытие уязвимостей безопасности',
      risk: 'low'
    });
  }

  // === Linux рекомендации ===
  if (systemInfo.os === 'Linux') {
    // CUPS
    const cups = systemInfo.services?.find(s => 
      s.name.toLowerCase().includes('cups')
    );
    if (cups) {
      recommendations.push({
        id: String(id++),
        category: 'services',
        severity: 'info',
        title: 'Отключить CUPS (принтер)',
        description: 'Если сервер не использует принтеры, службу CUPS можно отключить для экономии ресурсов.',
        command: 'sudo systemctl stop cups && sudo systemctl disable cups',
        impact: 'Освобождение ~20 МБ RAM',
        risk: 'low'
      });
    }

    // Bluetooth
    const bluetooth = systemInfo.services?.find(s => 
      s.name.toLowerCase().includes('bluetooth')
    );
    if (bluetooth) {
      recommendations.push({
        id: String(id++),
        category: 'services',
        severity: 'info',
        title: 'Отключить Bluetooth',
        description: 'На сервере Bluetooth обычно не нужен. Отключение снижает поверхность атаки.',
        command: 'sudo systemctl stop bluetooth && sudo systemctl disable bluetooth',
        impact: 'Освобождение ~10 МБ RAM, повышение безопасности',
        risk: 'low'
      });
    }

    // ModemManager
    const modem = systemInfo.services?.find(s => 
      s.name.toLowerCase().includes('modemmanager')
    );
    if (modem) {
      recommendations.push({
        id: String(id++),
        category: 'services',
        severity: 'info',
        title: 'Отключить ModemManager',
        description: 'Если нет мобильных модемов, ModemManager не нужен.',
        command: 'sudo systemctl stop ModemManager && sudo systemctl disable ModemManager',
        impact: 'Освобождение ~15 МБ RAM',
        risk: 'low'
      });
    }

    // Avahi
    const avahi = systemInfo.services?.find(s => 
      s.name.toLowerCase().includes('avahi')
    );
    if (avahi) {
      recommendations.push({
        id: String(id++),
        category: 'services',
        severity: 'info',
        title: 'Отключить Avahi (mDNS)',
        description: 'Avahi обеспечивает обнаружение устройств в локальной сети. На сервере обычно не нужен.',
        command: 'sudo systemctl stop avahi-daemon && sudo systemctl disable avahi-daemon',
        impact: 'Освобождение ~5 МБ RAM, снижение поверхности атаки',
        risk: 'low'
      });
    }

    // Обновления безопасности
    recommendations.push({
      id: String(id++),
      category: 'security',
      severity: 'critical',
      title: 'Обновить пакеты безопасности',
      description: 'Рекомендуется регулярно обновлять пакеты для закрытия уязвимостей.',
      command: 'sudo apt update && sudo apt upgrade -y',
      impact: 'Закрытие уязвимостей безопасности',
      risk: 'low'
    });

    // Очистка логов
    recommendations.push({
      id: String(id++),
      category: 'cleanup',
      severity: 'info',
      title: 'Очистить старые логи',
      description: 'Журналы systemd могут занимать много места. Рекомендуется ограничить их размер.',
      command: 'sudo journalctl --vacuum-time=7d && sudo journalctl --vacuum-size=100M',
      impact: 'Освобождение дискового пространства',
      risk: 'low'
    });

    // Оптимизация ядра
    recommendations.push({
      id: String(id++),
      category: 'performance',
      severity: 'info',
      title: 'Оптимизировать sysctl параметры',
      description: 'Настройка параметров ядра может улучшить производительность сети и файловой системы.',
      command: 'sudo sysctl -w vm.swappiness=10 && sudo sysctl -w net.core.somaxconn=65535',
      impact: 'Улучшение производительности системы',
      risk: 'medium'
    });

    // Очистка пакетов
    recommendations.push({
      id: String(id++),
      category: 'cleanup',
      severity: 'info',
      title: 'Удалить неиспользуемые пакеты',
      description: 'Очистка кэша пакетов и удаление ненужных зависимостей.',
      command: 'sudo apt autoremove -y && sudo apt autoclean',
      impact: 'Освобождение 100 МБ - 2 ГБ',
      risk: 'low'
    });
  }

  // === Android рекомендации ===
  if (systemInfo.os === 'Android') {
    // Ресурсоёмкие приложения
    const heavyApps = systemInfo.processes?.filter(p => 
      p.name.includes('facebook') || p.name.includes('instagram') || p.name.includes('tiktok')
    );
    if (heavyApps && heavyApps.length > 0) {
      heavyApps.forEach(app => {
        recommendations.push({
          id: String(id++),
          category: 'performance',
          severity: 'warning',
          title: `Ограничить ${app.name}`,
          description: `Приложение ${app.name} активно работает в фоне и потребляет ресурсы.`,
          command: `adb shell am set-inactive ${app.name} true`,
          impact: 'Освобождение RAM, снижение расхода батареи',
          risk: 'low'
        });
      });
    }

    // Bixby
    const bixby = systemInfo.processes?.find(p => p.name.includes('bixby'));
    if (bixby) {
      recommendations.push({
        id: String(id++),
        category: 'privacy',
        severity: 'info',
        title: 'Отключить Samsung Bixby',
        description: 'Bixby собирает данные и потребляет ресурсы. Можно отключить.',
        command: 'adb shell pm disable-user --user 0 com.samsung.android.bixby.agent',
        impact: 'Освобождение ~3 ГБ RAM, повышение приватности',
        risk: 'low'
      });
    }

    // Google Services
    const gms = systemInfo.processes?.find(p => p.name.includes('com.google.android.gms'));
    if (gms) {
      recommendations.push({
        id: String(id++),
        category: 'privacy',
        severity: 'warning',
        title: 'Ограничить Google Play Services',
        description: 'GMS постоянно отправляет данные. Можно ограничить фоновую активность.',
        command: 'adb shell cmd appops set com.google.android.gms RUN_IN_BACKGROUND ignore',
        impact: 'Снижение расхода батареи на 10-15%',
        risk: 'medium'
      });
    }

    // Очистка кэша
    recommendations.push({
      id: String(id++),
      category: 'cleanup',
      severity: 'info',
      title: 'Очистить кэш приложений',
      description: 'Кэш приложений может занимать значительное место.',
      command: 'adb shell pm trim-caches 500M',
      impact: 'Освобождение 2-10 ГБ хранилища',
      risk: 'low'
    });

    // Doze mode
    recommendations.push({
      id: String(id++),
      category: 'performance',
      severity: 'info',
      title: 'Включить агрессивный Doze mode',
      description: 'Doze mode ограничивает фоновую активность приложений для экономии батареи.',
      command: 'adb shell dumpsys deviceidle enable',
      impact: 'Увеличение автономности на 20-30%',
      risk: 'low'
    });
  }

  // === Общие рекомендации на основе ресурсов ===

  // Высокая загрузка CPU
  if (systemInfo.cpuUsage > 70) {
    recommendations.push({
      id: String(id++),
      category: 'performance',
      severity: 'critical',
      title: 'Критическая загрузка CPU',
      description: `Загрузка CPU составляет ${systemInfo.cpuUsage}%. Найдите и оптимизируйте ресурсоёмкие процессы.`,
      command: systemInfo.os === 'Windows' ? 'taskmgr' : 'top -c',
      impact: 'Снижение нагрузки на процессор',
      risk: 'low'
    });
  } else if (systemInfo.cpuUsage > 40) {
    recommendations.push({
      id: String(id++),
      category: 'performance',
      severity: 'warning',
      title: 'Высокая загрузка CPU',
      description: `Загрузка CPU составляет ${systemInfo.cpuUsage}%. Рекомендуется проверить процессы.`,
      command: systemInfo.os === 'Windows' ? 'taskmgr' : 'top -c',
      impact: 'Снижение нагрузки на процессор',
      risk: 'low'
    });
  }

  // Нехватка RAM
  const ramPercent = (systemInfo.ramUsed / systemInfo.ram) * 100;
  if (ramPercent > 90) {
    recommendations.push({
      id: String(id++),
      category: 'performance',
      severity: 'critical',
      title: 'Критическая нехватка RAM',
      description: `Использовано ${systemInfo.ramUsed} из ${systemInfo.ram} ${systemInfo.ramUnit} (${Math.round(ramPercent)}%). Система может замедляться.`,
      command: '',
      impact: 'Предотвращение замедления и зависаний',
      risk: 'low'
    });
  } else if (ramPercent > 70) {
    recommendations.push({
      id: String(id++),
      category: 'performance',
      severity: 'warning',
      title: 'Высокое использование RAM',
      description: `Использовано ${systemInfo.ramUsed} из ${systemInfo.ram} ${systemInfo.ramUnit} (${Math.round(ramPercent)}%).`,
      command: '',
      impact: 'Предотвращение проблем с производительностью',
      risk: 'low'
    });
  }

  // Мало места на диске
  const diskPercent = (systemInfo.diskUsed / systemInfo.diskTotal) * 100;
  if (diskPercent > 90) {
    recommendations.push({
      id: String(id++),
      category: 'cleanup',
      severity: 'critical',
      title: 'Критически мало места на диске',
      description: `Использовано ${systemInfo.diskUsed} из ${systemInfo.diskTotal} ${systemInfo.diskUnit} (${Math.round(diskPercent)}%).`,
      command: systemInfo.os === 'Windows' ? 'cleanmgr' : 'sudo du -sh /* | sort -rh | head -20',
      impact: 'Предотвращение сбоев системы',
      risk: 'low'
    });
  } else if (diskPercent > 75) {
    recommendations.push({
      id: String(id++),
      category: 'cleanup',
      severity: 'warning',
      title: 'Мало свободного места на диске',
      description: `Использовано ${systemInfo.diskUsed} из ${systemInfo.diskTotal} ${systemInfo.diskUnit} (${Math.round(diskPercent)}%).`,
      command: systemInfo.os === 'Windows' ? 'cleanmgr' : 'sudo du -sh /* | sort -rh | head -20',
      impact: 'Предотвращение проблем с производительностью',
      risk: 'low'
    });
  }

  return recommendations;
}

module.exports = { analyzeSystem };
