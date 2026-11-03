import { Device } from '../types';

interface DashboardProps {
  devices: Device[];
  connectingId: string | null;
  onConnect: (device: Device) => void;
  onDisconnect: (deviceId: string) => void;
  onRemove: (deviceId: string) => void;
  onSelect: (device: Device) => void;
}

export default function Dashboard({ devices, connectingId, onConnect, onDisconnect, onRemove, onSelect }: DashboardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-400';
      case 'offline': return 'bg-gray-500';
      case 'connecting': return 'bg-yellow-400 animate-pulse';
      case 'error': return 'bg-red-400';
      default: return 'bg-gray-500';
    }
  };

  const getConnectionIcon = (type: string) => {
    switch (type) {
      case 'ssh': return 'fa-lock';
      case 'adb': return 'fa-mobile-alt';
      case 'plink': return 'fa-plug';
      default: return 'fa-server';
    }
  };

  const getOSIcon = (os?: string) => {
    switch (os) {
      case 'Windows': return 'fab fa-windows text-blue-400';
      case 'Linux': return 'fab fa-linux text-yellow-400';
      case 'Android': return 'fab fa-android text-green-400';
      case 'macOS': return 'fab fa-apple text-gray-300';
      default: return 'fas fa-server text-gray-400';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Панель управления</h2>
        <p className="text-gray-400 mt-1">Управление подключёнными устройствами и мониторинг</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
              <i className="fas fa-server text-cyan-400"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{devices.length}</div>
              <div className="text-xs text-gray-400">Устройств</div>
            </div>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <i className="fas fa-wifi text-green-400"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">{devices.filter(d => d.status === 'online').length}</div>
              <div className="text-xs text-gray-400">Онлайн</div>
            </div>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <i className="fas fa-exclamation-triangle text-yellow-400"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-400">
                {devices.reduce((acc, d) => acc + (d.recommendations?.filter(r => r.severity === 'warning' || r.severity === 'critical').length || 0), 0)}
              </div>
              <div className="text-xs text-gray-400">Предупреждений</div>
            </div>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <i className="fas fa-lightbulb text-purple-400"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">
                {devices.reduce((acc, d) => acc + (d.recommendations?.length || 0), 0)}
              </div>
              <div className="text-xs text-gray-400">Рекомендаций</div>
            </div>
          </div>
        </div>
      </div>

      {/* Device List */}
      {devices.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-server text-2xl text-gray-600"></i>
          </div>
          <h3 className="text-lg font-medium text-gray-300 mb-2">Нет устройств</h3>
          <p className="text-gray-500 mb-4">Добавьте устройство для начала мониторинга</p>
          <button className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm font-medium transition-colors">
            <i className="fas fa-plus mr-2"></i>Добавить устройство
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {devices.map(device => (
            <div
              key={device.id}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                      <i className={`${getOSIcon(device.systemInfo?.os)} text-xl`}></i>
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-gray-900 ${getStatusColor(device.status)}`}></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{device.name}</h3>
                    <p className="text-sm text-gray-400">{device.ip}:{device.port}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-400">
                    <i className={`fas ${getConnectionIcon(device.connectionType)} mr-1`}></i>
                    {device.connectionType.toUpperCase()}
                  </span>
                </div>
              </div>

              {device.systemInfo && (
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                    <div className="text-xs text-gray-500">CPU</div>
                    <div className="text-sm font-bold text-white">{device.systemInfo.cpuUsage}%</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                    <div className="text-xs text-gray-500">RAM</div>
                    <div className="text-sm font-bold text-white">{Math.round(device.systemInfo.ramUsed/device.systemInfo.ram*100)}%</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                    <div className="text-xs text-gray-500">Диск</div>
                    <div className="text-sm font-bold text-white">{Math.round(device.systemInfo.diskUsed/device.systemInfo.diskTotal*100)}%</div>
                  </div>
                </div>
              )}

              {device.status === 'connecting' && (
                <div className="mb-4 flex items-center gap-2 text-yellow-400">
                  <i className="fas fa-spinner fa-spin"></i>
                  <span className="text-sm">Подключение...</span>
                </div>
              )}

              {device.recommendations && (
                <div className="mb-4 flex items-center gap-2">
                  <i className="fas fa-lightbulb text-purple-400 text-xs"></i>
                  <span className="text-xs text-gray-400">
                    {device.recommendations.length} рекомендаций
                    {device.recommendations.filter(r => r.severity === 'critical').length > 0 && (
                      <span className="text-red-400 ml-1">
                        ({device.recommendations.filter(r => r.severity === 'critical').length} критич.)
                      </span>
                    )}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                {device.status === 'online' && (
                  <>
                    <button
                      onClick={() => onSelect(device)}
                      className="flex-1 px-3 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-lg text-xs font-medium transition-colors"
                    >
                      <i className="fas fa-info-circle mr-1"></i>Детали
                    </button>
                    <button
                      onClick={() => onDisconnect(device.id)}
                      className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-medium transition-colors"
                    >
                      <i className="fas fa-power-off"></i>
                    </button>
                  </>
                )}
                {(device.status === 'offline' || device.status === 'error') && (
                  <button
                    onClick={() => onConnect(device)}
                    className="flex-1 px-3 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg text-xs font-medium transition-colors"
                  >
                    <i className="fas fa-plug mr-1"></i>Подключить
                  </button>
                )}
                <button
                  onClick={() => onRemove(device.id)}
                  className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-lg text-xs font-medium transition-colors"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
