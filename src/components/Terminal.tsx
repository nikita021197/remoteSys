import { useState, useRef, useEffect } from 'react';
import { Device } from '../types';

interface TerminalProps {
  device: Device;
  onBack: () => void;
}

interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'system';
  content: string;
}

export default function Terminal({ device, onBack }: TerminalProps) {
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'system', content: `Подключение к ${device.name} (${device.ip}:${device.port}) через ${device.connectionType.toUpperCase()}...` },
    { type: 'system', content: `Аутентификация: ${device.login}@${device.ip}` },
    { type: 'system', content: '═══════════════════════════════════════════════' },
    { type: 'system', content: `Добро пожаловать в интерактивный терминал ${device.systemInfo?.os || ''}` },
    { type: 'system', content: 'Введите команду для выполнения на удалённом устройстве.' },
    { type: 'system', content: 'Доступные команды: help, sysinfo, processes, services, network, disk, optimize' },
    { type: 'system', content: '═══════════════════════════════════════════════' },
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  const simulateCommand = (cmd: string): TerminalLine[] => {
    const info = device.systemInfo;
    const output: TerminalLine[] = [];

    switch (cmd.toLowerCase().trim()) {
      case 'help':
        output.push({ type: 'output', content: 'Доступные команды:' });
        output.push({ type: 'output', content: '  sysinfo     — Информация о системе' });
        output.push({ type: 'output', content: '  processes   — Список процессов' });
        output.push({ type: 'output', content: '  services    — Список служб' });
        output.push({ type: 'output', content: '  network     — Сетевые интерфейсы' });
        output.push({ type: 'output', content: '  disk        — Дисковое пространство' });
        output.push({ type: 'output', content: '  optimize    — Запустить оптимизацию' });
        output.push({ type: 'output', content: '  top         — Мониторинг в реальном времени' });
        output.push({ type: 'output', content: '  clear       — Очистить терминал' });
        output.push({ type: 'output', content: '  whoami      — Текущий пользователь' });
        output.push({ type: 'output', content: '  uname -a    — Информация о ядре' });
        output.push({ type: 'output', content: '  ifconfig    — Сетевые настройки' });
        output.push({ type: 'output', content: '  df -h       — Использование дисков' });
        break;

      case 'sysinfo':
        if (info) {
          output.push({ type: 'output', content: `ОС:          ${info.os} ${info.osVersion}` });
          output.push({ type: 'output', content: `Хост:        ${info.hostname}` });
          output.push({ type: 'output', content: `CPU:         ${info.cpu} (${info.cpuCores} cores)` });
          output.push({ type: 'output', content: `CPU Load:    ${info.cpuUsage}%` });
          output.push({ type: 'output', content: `RAM:         ${info.ramUsed}/${info.ram} ${info.ramUnit}` });
          output.push({ type: 'output', content: `Disk:        ${info.diskUsed}/${info.diskTotal} ${info.diskUnit}` });
          output.push({ type: 'output', content: `Uptime:      ${info.uptime}` });
          if (info.gpu) output.push({ type: 'output', content: `GPU:         ${info.gpu}` });
        }
        break;

      case 'processes':
      case 'top':
        if (info) {
          output.push({ type: 'output', content: 'PID    USER        CPU%   MEM%   STATUS    COMMAND' });
          output.push({ type: 'output', content: '─'.repeat(65) });
          info.processes.forEach(p => {
            output.push({ 
              type: 'output', 
              content: `${String(p.pid).padEnd(6)} ${p.user.padEnd(11)} ${String(p.cpu.toFixed(1)).padStart(5)} ${String(p.memory.toFixed(1)).padStart(6)}   ${p.status.padEnd(9)} ${p.name}` 
            });
          });
        }
        break;

      case 'services':
        if (info && info.services.length > 0) {
          output.push({ type: 'output', content: 'SERVICE              STATUS     STARTUP    DESCRIPTION' });
          output.push({ type: 'output', content: '─'.repeat(75) });
          info.services.forEach(s => {
            output.push({ 
              type: 'output', 
              content: `${s.name.padEnd(20)} ${s.status.padEnd(10)} ${s.startup.padEnd(10)} ${s.description}` 
            });
          });
        } else {
          output.push({ type: 'output', content: 'Нет информации о службах для данного устройства.' });
        }
        break;

      case 'network':
      case 'ifconfig':
        if (info) {
          info.networkInterfaces.forEach(iface => {
            output.push({ type: 'output', content: `${iface.name}: flags=UP,BROADCAST,RUNNING  mtu 1500` });
            output.push({ type: 'output', content: `        inet ${iface.ip}  netmask 255.255.255.0` });
            output.push({ type: 'output', content: `        ether ${iface.mac}` });
            output.push({ type: 'output', content: `        speed: ${iface.speed}` });
            output.push({ type: 'output', content: '' });
          });
        }
        break;

      case 'disk':
      case 'df -h':
        if (info) {
          output.push({ type: 'output', content: 'Filesystem      Size   Used  Avail  Use%  Mounted on' });
          output.push({ type: 'output', content: '─'.repeat(60) });
          output.push({ type: 'output', content: `/dev/sda1       ${info.diskTotal}G   ${info.diskUsed}G   ${info.diskTotal - info.diskUsed}G   ${Math.round(info.diskUsed/info.diskTotal*100)}%    /` });
          output.push({ type: 'output', content: `tmpfs           ${Math.round(info.ram/2)}G    0G   ${Math.round(info.ram/2)}G    0%    /dev/shm` });
        }
        break;

      case 'optimize':
        output.push({ type: 'system', content: '🔍 Сканирование системы...' });
        output.push({ type: 'system', content: '⚡ Анализ процессов...' });
        output.push({ type: 'system', content: '🔒 Проверка безопасности...' });
        output.push({ type: 'system', content: '📊 Анализ ресурсов...' });
        output.push({ type: 'output', content: '' });
        if (device.recommendations) {
          device.recommendations.forEach(rec => {
            const icon = rec.severity === 'critical' ? '🔴' : rec.severity === 'warning' ? '🟡' : '🔵';
            output.push({ type: 'output', content: `${icon} [${rec.category}] ${rec.title}` });
          });
        }
        output.push({ type: 'output', content: '' });
        output.push({ type: 'system', content: `Найдено ${device.recommendations?.length || 0} рекомендаций. Перейдите во вкладку "Оптимизация" для применения.` });
        break;

      case 'whoami':
        output.push({ type: 'output', content: device.login });
        break;

      case 'uname -a':
        if (info) {
          output.push({ type: 'output', content: `${info.os} ${info.hostname} 5.15.0-generic #1 SMP x86_64 GNU/Linux` });
        }
        break;

      case 'clear':
        return [{ type: 'system', content: 'Терминал очищен.' }];

      default:
        if (cmd.trim()) {
          output.push({ type: 'error', content: `bash: ${cmd.split(' ')[0]}: команда не найдена. Введите 'help' для списка команд.` });
        }
    }

    return output;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const prompt = `${device.login}@${device.systemInfo?.hostname || 'device'}:~$ ${input}`;
    const newLines: TerminalLine[] = [
      { type: 'input', content: prompt },
      ...simulateCommand(input)
    ];

    setLines(prev => [...prev, ...newLines]);
    setHistory(prev => [input, ...prev]);
    setHistoryIndex(-1);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <button onClick={onBack} className="text-gray-400 hover:text-white text-sm mb-2 flex items-center gap-2">
            <i className="fas fa-arrow-left"></i> Назад
          </button>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <i className="fas fa-terminal text-green-400"></i>
            Терминал — {device.name}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
      </div>

      {/* Terminal Window */}
      <div className="flex-1 bg-gray-950 border border-gray-800 rounded-xl overflow-hidden flex flex-col">
        {/* Title Bar */}
        <div className="bg-gray-900 border-b border-gray-800 px-4 py-2 flex items-center gap-3">
          <i className="fas fa-terminal text-green-400 text-xs"></i>
          <span className="text-sm text-gray-400">{device.login}@{device.ip} — {device.connectionType.toUpperCase()}</span>
          <span className="ml-auto text-xs text-gray-600">UTF-8 | bash</span>
        </div>

        {/* Terminal Content */}
        <div 
          ref={terminalRef}
          className="flex-1 overflow-y-auto p-4 font-mono text-sm"
          onClick={() => inputRef.current?.focus()}
        >
          {lines.map((line, i) => (
            <div key={i} className={`mb-0.5 ${
              line.type === 'input' ? 'text-white' :
              line.type === 'error' ? 'text-red-400' :
              line.type === 'system' ? 'text-cyan-400' :
              'text-gray-300'
            }`}>
              {line.content || '\u00A0'}
            </div>
          ))}
          
          {/* Input Line */}
          <form onSubmit={handleSubmit} className="flex items-center">
            <span className="text-green-400 mr-2">
              {device.login}@{device.systemInfo?.hostname || 'device'}:~$
            </span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-white outline-none font-mono text-sm"
              autoFocus
              spellCheck={false}
            />
          </form>
        </div>
      </div>

      {/* Quick Commands */}
      <div className="mt-3 flex flex-wrap gap-2">
        {['sysinfo', 'processes', 'services', 'network', 'disk', 'optimize', 'top'].map(cmd => (
          <button
            key={cmd}
            onClick={() => {
              setInput(cmd);
              setTimeout(() => {
                const prompt = `${device.login}@${device.systemInfo?.hostname || 'device'}:~$ ${cmd}`;
                const newLines: TerminalLine[] = [
                  { type: 'input', content: prompt },
                  ...simulateCommand(cmd)
                ];
                setLines(prev => [...prev, ...newLines]);
                setInput('');
              }, 50);
            }}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs font-mono transition-colors border border-gray-700"
          >
            {cmd}
          </button>
        ))}
      </div>
    </div>
  );
}
