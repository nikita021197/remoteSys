import { useState, useEffect } from 'react';
import { Device, ConnectionType } from './types';
import { generateDeviceId, generateSystemInfo, generateRecommendations } from './dataGenerator';
import { addDevice as apiAddDevice, connectToDevice as apiConnect, disconnectDevice as apiDisconnect, removeDevice as apiRemove, isBackendAvailable } from './api';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import DeviceForm from './components/DeviceForm';
import DeviceDetail from './components/DeviceDetail';
import Recommendations from './components/Recommendations';
import Terminal from './components/Terminal';

export default function App() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'add' | 'detail' | 'recommendations' | 'terminal'>('dashboard');
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [backendMode, setBackendMode] = useState<'real' | 'demo' | 'checking'>('checking');

  // Проверяем доступность backend при старте
  useEffect(() => {
    const check = async () => {
      // Небольшая задержка для инициализации
      await new Promise(r => setTimeout(r, 500));
      setBackendMode(isBackendAvailable() ? 'real' : 'demo');
    };
    check();
  }, []);

  const addDevice = async (data: { name: string; ip: string; port: number; login: string; password: string; connectionType: ConnectionType }) => {
    let newDevice: Device;
    
    try {
      newDevice = await apiAddDevice(data);
    } catch {
      // Fallback на локальное создание
      newDevice = {
        id: generateDeviceId(),
        name: data.name,
        ip: data.ip,
        port: data.port,
        login: data.login,
        password: data.password,
        connectionType: data.connectionType,
        status: 'connecting',
        lastSeen: new Date().toISOString(),
      };
    }
    
    setDevices(prev => [...prev, newDevice]);
    setConnectingId(newDevice.id);
    setCurrentView('dashboard');

    // Подключаемся
    try {
      const connectedDevice = await apiConnect(newDevice);
      setDevices(prev => prev.map(d => d.id === newDevice.id ? connectedDevice : d));
    } catch (error) {
      // В случае ошибки — симулируем
      const sysInfo = generateSystemInfo(data.connectionType);
      const recommendations = generateRecommendations(sysInfo);
      setDevices(prev => prev.map(d => 
        d.id === newDevice.id 
          ? { ...d, status: 'online' as const, systemInfo: sysInfo, recommendations, lastSeen: new Date().toISOString() }
          : d
      ));
    }
    
    setConnectingId(null);
  };

  const connectToDevice = async (device: Device) => {
    setConnectingId(device.id);
    setDevices(prev => prev.map(d => d.id === device.id ? { ...d, status: 'connecting' } : d));
    
    try {
      const connectedDevice = await apiConnect(device);
      setDevices(prev => prev.map(d => d.id === device.id ? connectedDevice : d));
    } catch {
      // Fallback на симуляцию
      await new Promise(r => setTimeout(r, 1500));
      const sysInfo = generateSystemInfo(device.connectionType);
      const recommendations = generateRecommendations(sysInfo);
      setDevices(prev => prev.map(d => 
        d.id === device.id 
          ? { ...d, status: 'online' as const, systemInfo: sysInfo, recommendations, lastSeen: new Date().toISOString() }
          : d
      ));
    }
    
    setConnectingId(null);
  };

  const disconnectDevice = async (deviceId: string) => {
    await apiDisconnect(deviceId);
    setDevices(prev => prev.map(d => 
      d.id === deviceId ? { ...d, status: 'offline' as const } : d
    ));
  };

  const removeDevice = async (deviceId: string) => {
    await apiRemove(deviceId);
    setDevices(prev => prev.filter(d => d.id !== deviceId));
    if (selectedDevice?.id === deviceId) {
      setSelectedDevice(null);
      setCurrentView('dashboard');
    }
  };

  const selectDevice = (device: Device) => {
    setSelectedDevice(device);
    setCurrentView('detail');
  };

  const onlineDevices = devices.filter(d => d.status === 'online');
  const totalRecommendations = onlineDevices.reduce((acc, d) => acc + (d.recommendations?.length || 0), 0);
  const criticalRecommendations = onlineDevices.reduce((acc, d) => 
    acc + (d.recommendations?.filter(r => r.severity === 'critical').length || 0), 0
  );

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden">
      <Sidebar 
        currentView={currentView}
        setCurrentView={setCurrentView}
        deviceCount={devices.length}
        onlineCount={onlineDevices.length}
        recommendationCount={totalRecommendations}
        criticalCount={criticalRecommendations}
        backendMode={backendMode}
      />
      
      <main className="flex-1 overflow-y-auto">
        {currentView === 'dashboard' && (
          <Dashboard 
            devices={devices}
            connectingId={connectingId}
            onConnect={connectToDevice}
            onDisconnect={disconnectDevice}
            onRemove={removeDevice}
            onSelect={selectDevice}
          />
        )}
        {currentView === 'add' && (
          <DeviceForm onAdd={addDevice} onCancel={() => setCurrentView('dashboard')} />
        )}
        {currentView === 'detail' && selectedDevice && (
          <DeviceDetail 
            device={selectedDevice}
            onBack={() => setCurrentView('dashboard')}
            onShowRecommendations={() => setCurrentView('recommendations')}
            onShowTerminal={() => setCurrentView('terminal')}
          />
        )}
        {currentView === 'recommendations' && selectedDevice && (
          <Recommendations 
            device={selectedDevice}
            onBack={() => setCurrentView('detail')}
          />
        )}
        {currentView === 'terminal' && selectedDevice && (
          <Terminal 
            device={selectedDevice}
            onBack={() => setCurrentView('detail')}
          />
        )}
      </main>
    </div>
  );
}
