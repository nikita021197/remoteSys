import { useState } from 'react';
import { ConnectionType } from '../types';

interface DeviceFormProps {
  onAdd: (data: { name: string; ip: string; port: number; login: string; password: string; connectionType: ConnectionType }) => void;
  onCancel: () => void;
}

export default function DeviceForm({ onAdd, onCancel }: DeviceFormProps) {
  const [name, setName] = useState('');
  const [ip, setIp] = useState('');
  const [port, setPort] = useState(22);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [connectionType, setConnectionType] = useState<ConnectionType>('ssh');
  const [showPassword, setShowPassword] = useState(false);

  const handleConnectionTypeChange = (type: ConnectionType) => {
    setConnectionType(type);
    if (type === 'ssh') setPort(22);
    else if (type === 'plink') setPort(22);
    else if (type === 'adb') setPort(5555);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !ip || !login) return;
    onAdd({ name, ip, port, login, password, connectionType });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button onClick={onCancel} className="text-gray-400 hover:text-white text-sm mb-3 flex items-center gap-2">
          <i className="fas fa-arrow-left"></i> Назад
        </button>
        <h2 className="text-2xl font-bold text-white">Добавить устройство</h2>
        <p className="text-gray-400 mt-1">Подключитесь к устройству по SSH, ADB или PLINK</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Connection Type */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Тип подключения</label>
          <div className="grid grid-cols-3 gap-3">
            {(['ssh', 'plink', 'adb'] as ConnectionType[]).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => handleConnectionTypeChange(type)}
                className={`p-4 rounded-xl border text-center transition-all ${
                  connectionType === type
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                    : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600'
                }`}
              >
                <i className={`fas ${type === 'ssh' ? 'fa-lock' : type === 'adb' ? 'fa-mobile-alt' : 'fa-plug'} text-2xl mb-2`}></i>
                <div className="text-sm font-medium">{type.toUpperCase()}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {type === 'ssh' && 'Secure Shell'}
                  {type === 'plink' && 'PuTTY Link'}
                  {type === 'adb' && 'Android Debug'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Device Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Имя устройства</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Например: Сервер разработки"
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none transition-colors"
            required
          />
        </div>

        {/* IP & Port */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">IP адрес / Хост</label>
            <input
              type="text"
              value={ip}
              onChange={e => setIp(e.target.value)}
              placeholder="192.168.1.100"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Порт</label>
            <input
              type="number"
              value={port}
              onChange={e => setPort(Number(e.target.value))}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none transition-colors"
              required
            />
          </div>
        </div>

        {/* Login */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Логин</label>
          <div className="relative">
            <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"></i>
            <input
              type="text"
              value={login}
              onChange={e => setLogin(e.target.value)}
              placeholder="root / admin / user"
              className="w-full pl-11 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none transition-colors"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Пароль</label>
          <div className="relative">
            <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"></i>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-11 pr-12 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <i className="fas fa-info-circle text-blue-400 mt-0.5"></i>
            <div className="text-sm text-gray-300">
              <p className="font-medium text-blue-400 mb-1">Подключение через {connectionType.toUpperCase()}</p>
              <p className="text-gray-400">
                {connectionType === 'ssh' && 'Используется OpenSSH для безопасного удалённого подключения. Будет выполнен сбор системной информации через команды SSH.'}
                {connectionType === 'plink' && 'PuTTY Plink — консольный клиент SSH для Windows. Подключение аналогично SSH.'}
                {connectionType === 'adb' && 'Android Debug Bridge для подключения к Android-устройствам. Устройство должно иметь включённую отладку по USB/WiFi.'}
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all shadow-lg shadow-cyan-500/20"
          >
            <i className="fas fa-plug mr-2"></i>
            Подключить и сканировать
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors"
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}
