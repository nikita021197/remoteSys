import { Device } from '../types';

interface DeviceDetailProps {
  device: Device;
  onBack: () => void;
  onShowRecommendations: () => void;
  onShowTerminal: () => void;
}

export default function DeviceDetail({ device, onBack, onShowRecommendations, onShowTerminal }: DeviceDetailProps) {
  const info = device.systemInfo;
  if (!info) return null;

  const ramPercent = Math.round((info.ramUsed / info.ram) * 100);
  const diskPercent = Math.round((info.diskUsed / info.diskTotal) * 100);

  const getOSIcon = (os: string) => {
    switch (os) {
      case 'Windows': return 'fab fa-windows text-blue-400';
      case 'Linux': return 'fab fa-linux text-yellow-400';
      case 'Android': return 'fab fa-android text-green-400';
      default: return 'fas fa-server text-gray-400';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button onClick={onBack} className="text-gray-400 hover:text-white text-sm mb-3 flex items-center gap-2">
          <i className="fas fa-arrow-left"></i> Назад к устройствам
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gray-800 rounded-xl flex items-center justify-center">
              <i className={`${getOSIcon(info.os)} text-2xl`}></i>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{device.name}</h2>
              <p className="text-gray-400">{info.hostname} • {device.ip}:{device.port}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onShowRecommendations}
              className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg text-sm font-medium transition-colors border border-purple-500/20"
            >
              <i className="fas fa-lightbulb mr-2"></i>Оптимизация
            </button>
            <button
              onClick={onShowTerminal}
              className="px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg text-sm font-medium transition-colors border border-green-500/20"
            >
              <i className="fas fa-terminal mr-2"></i>Терминал
            </button>
          </div>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* OS Info */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
            <i className="fas fa-desktop"></i> Операционная система
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">ОС</span>
              <span className="text-white text-sm font-medium">{info.os}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Версия</span>
              <span className="text-white text-sm font-medium">{info.osVersion}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Хост</span>
              <span className="text-white text-sm font-medium">{info.hostname}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Аптайм</span>
              <span className="text-white text-sm font-medium">{info.uptime}</span>
            </div>
          </div>
        </div>

        {/* CPU */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
            <i className="fas fa-microchip"></i> Процессор
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Модель</span>
              <span className="text-white text-sm font-medium truncate ml-2">{info.cpu}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Ядра</span>
              <span className="text-white text-sm font-medium">{info.cpuCores}</span>
            </div>
            {info.gpu && (
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">GPU</span>
                <span className="text-white text-sm font-medium truncate ml-2">{info.gpu}</span>
              </div>
            )}
            <div className="mt-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Загрузка</span>
                <span className={`font-bold ${info.cpuUsage > 70 ? 'text-red-400' : info.cpuUsage > 40 ? 'text-yellow-400' : 'text-green-400'}`}>
                  {info.cpuUsage}%
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${info.cpuUsage > 70 ? 'bg-red-500' : info.cpuUsage > 40 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${info.cpuUsage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* RAM */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
            <i className="fas fa-memory"></i> Оперативная память
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Всего</span>
              <span className="text-white text-sm font-medium">{info.ram} {info.ramUnit}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Используется</span>
              <span className="text-white text-sm font-medium">{info.ramUsed} {info.ramUnit}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Свободно</span>
              <span className="text-green-400 text-sm font-medium">{info.ram - info.ramUsed} {info.ramUnit}</span>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Использование</span>
                <span className={`font-bold ${ramPercent > 80 ? 'text-red-400' : ramPercent > 50 ? 'text-yellow-400' : 'text-green-400'}`}>
                  {ramPercent}%
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${ramPercent > 80 ? 'bg-red-500' : ramPercent > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${ramPercent}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Disk & Network */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Disk */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
            <i className="fas fa-hdd"></i> Дисковое пространство
          </h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#374151"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={diskPercent > 80 ? '#ef4444' : diskPercent > 50 ? '#eab308' : '#22c55e'}
                  strokeWidth="3"
                  strokeDasharray={`${diskPercent}, 100`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-white">{diskPercent}%</span>
              </div>
            </div>
            <div>
              <div className="text-lg font-bold text-white">{info.diskUsed} / {info.diskTotal} {info.diskUnit}</div>
              <div className="text-sm text-gray-400">Свободно: {info.diskTotal - info.diskUsed} {info.diskUnit}</div>
            </div>
          </div>
        </div>

        {/* Network */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
            <i className="fas fa-network-wired"></i> Сеть
          </h3>
          <div className="space-y-3">
            {info.networkInterfaces.map((iface, i) => (
              <div key={i} className="bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white text-sm font-medium">{iface.name}</span>
                  <span className="text-xs text-gray-500">{iface.speed}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">IP: {iface.ip}</span>
                  <span className="text-gray-500">MAC: {iface.mac}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Processes */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
        <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
          <i className="fas fa-tasks"></i> Процессы ({info.processes.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-2 px-3 text-gray-500 font-medium">PID</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Имя</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Пользователь</th>
                <th className="text-right py-2 px-3 text-gray-500 font-medium">CPU %</th>
                <th className="text-right py-2 px-3 text-gray-500 font-medium">RAM (МБ)</th>
                <th className="text-right py-2 px-3 text-gray-500 font-medium">Статус</th>
              </tr>
            </thead>
            <tbody>
              {info.processes.slice(0, 12).map(proc => (
                <tr key={proc.pid} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="py-2 px-3 text-gray-400">{proc.pid}</td>
                  <td className="py-2 px-3 text-white font-medium">{proc.name}</td>
                  <td className="py-2 px-3 text-gray-400">{proc.user}</td>
                  <td className={`py-2 px-3 text-right font-mono ${proc.cpu > 5 ? 'text-red-400' : proc.cpu > 2 ? 'text-yellow-400' : 'text-gray-300'}`}>
                    {proc.cpu.toFixed(1)}
                  </td>
                  <td className={`py-2 px-3 text-right font-mono ${proc.memory > 10 ? 'text-red-400' : proc.memory > 5 ? 'text-yellow-400' : 'text-gray-300'}`}>
                    {proc.memory.toFixed(1)}
                  </td>
                  <td className="py-2 px-3 text-right">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      proc.status === 'running' ? 'bg-green-500/10 text-green-400' : 'bg-gray-700 text-gray-400'
                    }`}>
                      {proc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Services (if available) */}
      {info.services.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
            <i className="fas fa-cogs"></i> Службы ({info.services.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {info.services.map(service => (
              <div key={service.name} className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
                <div>
                  <div className="text-sm font-medium text-white">{service.name}</div>
                  <div className="text-xs text-gray-500">{service.description}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    service.status === 'running' ? 'bg-green-500/10 text-green-400' :
                    service.status === 'stopped' ? 'bg-gray-700 text-gray-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>
                    {service.status}
                  </span>
                  <span className="text-xs text-gray-600">{service.startup}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
