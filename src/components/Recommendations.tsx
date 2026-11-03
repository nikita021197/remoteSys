import { useState } from 'react';
import { Device, Recommendation } from '../types';

interface RecommendationsProps {
  device: Device;
  onBack: () => void;
}

export default function Recommendations({ device, onBack }: RecommendationsProps) {
  const [filter, setFilter] = useState<string>('all');
  const [appliedRecs, setAppliedRecs] = useState<Set<string>>(new Set());

  const recommendations = device.recommendations || [];
  
  const filtered = filter === 'all' 
    ? recommendations 
    : recommendations.filter(r => r.category === filter);

  const categories = [
    { id: 'all', label: 'Все', icon: 'fa-list' },
    { id: 'performance', label: 'Производительность', icon: 'fa-tachometer-alt' },
    { id: 'privacy', label: 'Приватность', icon: 'fa-user-shield' },
    { id: 'security', label: 'Безопасность', icon: 'fa-shield-alt' },
    { id: 'cleanup', label: 'Очистка', icon: 'fa-broom' },
    { id: 'services', label: 'Службы', icon: 'fa-cogs' },
    { id: 'network', label: 'Сеть', icon: 'fa-network-wired' },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500/30 bg-red-500/5';
      case 'warning': return 'border-yellow-500/30 bg-yellow-500/5';
      case 'info': return 'border-blue-500/30 bg-blue-500/5';
      default: return 'border-gray-700 bg-gray-900';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return 'fa-exclamation-circle text-red-400';
      case 'warning': return 'fa-exclamation-triangle text-yellow-400';
      case 'info': return 'fa-info-circle text-blue-400';
      default: return 'fa-info-circle text-gray-400';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400 bg-green-500/10';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10';
      case 'high': return 'text-red-400 bg-red-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const applyRecommendation = (rec: Recommendation) => {
    setAppliedRecs(prev => new Set([...prev, rec.id]));
  };

  const criticalCount = recommendations.filter(r => r.severity === 'critical').length;
  const warningCount = recommendations.filter(r => r.severity === 'warning').length;
  const infoCount = recommendations.filter(r => r.severity === 'info').length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button onClick={onBack} className="text-gray-400 hover:text-white text-sm mb-3 flex items-center gap-2">
          <i className="fas fa-arrow-left"></i> Назад к устройству
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <i className="fas fa-lightbulb text-purple-400"></i>
              Рекомендации по оптимизации
            </h2>
            <p className="text-gray-400 mt-1">{device.name} — {recommendations.length} рекомендаций</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-red-400">{criticalCount}</div>
          <div className="text-sm text-gray-400 mt-1">Критичных</div>
        </div>
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-yellow-400">{warningCount}</div>
          <div className="text-sm text-gray-400 mt-1">Предупреждений</div>
        </div>
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-blue-400">{infoCount}</div>
          <div className="text-sm text-gray-400 mt-1">Информация</div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              filter === cat.id
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
            }`}
          >
            <i className={`fas ${cat.icon} text-xs`}></i>
            {cat.label}
            {cat.id !== 'all' && (
              <span className="ml-1 text-xs opacity-60">
                ({recommendations.filter(r => r.category === cat.id).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {filtered.map(rec => (
          <div
            key={rec.id}
            className={`border rounded-xl p-5 transition-all ${getSeverityColor(rec.severity)} ${
              appliedRecs.has(rec.id) ? 'opacity-50' : ''
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <i className={`fas ${getSeverityIcon(rec.severity)} text-lg`}></i>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-white font-semibold">{rec.title}</h4>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getRiskColor(rec.risk)}`}>
                    Риск: {rec.risk === 'low' ? 'низкий' : rec.risk === 'medium' ? 'средний' : 'высокий'}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-700 text-gray-300">
                    {categories.find(c => c.id === rec.category)?.label}
                  </span>
                </div>
                <p className="text-gray-300 text-sm mb-3">{rec.description}</p>
                
                {rec.command && (
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 mb-3">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                      <i className="fas fa-terminal"></i> Команда
                    </div>
                    <code className="text-green-400 text-sm font-mono">{rec.command}</code>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <i className="fas fa-chart-line text-cyan-400 text-xs"></i>
                    <span className="text-gray-400">{rec.impact}</span>
                  </div>
                  <button
                    onClick={() => applyRecommendation(rec)}
                    disabled={appliedRecs.has(rec.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      appliedRecs.has(rec.id)
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-500/20'
                    }`}
                  >
                    {appliedRecs.has(rec.id) ? (
                      <><i className="fas fa-check mr-1"></i>Применено</>
                    ) : (
                      <><i className="fas fa-play mr-1"></i>Применить</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <i className="fas fa-check-circle text-4xl mb-3 text-green-500/50"></i>
          <p>Нет рекомендаций в этой категории</p>
        </div>
      )}
    </div>
  );
}
