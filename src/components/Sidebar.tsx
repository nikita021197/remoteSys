interface SidebarProps {
  currentView: string;
  setCurrentView: (view: 'dashboard' | 'add' | 'detail' | 'recommendations' | 'terminal') => void;
  deviceCount: number;
  onlineCount: number;
  recommendationCount: number;
  criticalCount: number;
}

export default function Sidebar({ currentView, setCurrentView, deviceCount, onlineCount, recommendationCount, criticalCount }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', icon: 'fa-server', label: 'Устройства', badge: `${onlineCount}/${deviceCount}` },
    { id: 'add', icon: 'fa-plus-circle', label: 'Добавить', badge: null },
    { id: 'recommendations', icon: 'fa-lightbulb', label: 'Оптимизация', badge: criticalCount > 0 ? String(criticalCount) : recommendationCount > 0 ? String(recommendationCount) : null },
  ];

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
            <i className="fas fa-terminal text-white text-sm"></i>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">RemoteSys</h1>
            <p className="text-xs text-gray-400">Device Manager</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id as any)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              currentView === item.id
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            }`}
          >
            <i className={`fas ${item.icon} w-5 text-center`}></i>
            <span>{item.label}</span>
            {item.badge && (
              <span className={`ml-auto px-2 py-0.5 rounded-full text-xs ${
                item.id === 'recommendations' && criticalCount > 0
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-gray-700 text-gray-300'
              }`}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Status */}
      <div className="p-4 border-t border-gray-800">
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${onlineCount > 0 ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`}></div>
            <span className="text-xs text-gray-400">Система</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div>
              <div className="text-lg font-bold text-green-400">{onlineCount}</div>
              <div className="text-xs text-gray-500">Онлайн</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-400">{deviceCount - onlineCount}</div>
              <div className="text-xs text-gray-500">Оффлайн</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
