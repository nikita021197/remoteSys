/**
 * API клиент для RemoteSys
 * Работает с backend сервером, с fallback на демо-данные
 */

import { Device, ConnectionType, SystemInfo, Recommendation } from './types';
import { generateSystemInfo, generateRecommendations } from './dataGenerator';

const API_BASE = '/api';

// Флаг: доступен ли backend
let backendAvailable: boolean | null = null;

/**
 * Проверяет доступность backend сервера
 */
async function checkBackend(): Promise<boolean> {
  if (backendAvailable !== null) return backendAvailable;
  
  try {
    const response = await fetch(`${API_BASE}/health`, { 
      method: 'GET',
      signal: AbortSignal.timeout(3000)
    });
    backendAvailable = response.ok;
  } catch {
    backendAvailable = false;
  }
  
  return backendAvailable;
}

/**
 * Получает список всех устройств
 */
export async function fetchDevices(): Promise<Device[]> {
  const hasBackend = await checkBackend();
  
  if (hasBackend) {
    try {
      const response = await fetch(`${API_BASE}/devices`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Backend unavailable, using local state');
    }
  }
  
  return [];
}

/**
 * Добавляет новое устройство
 */
export async function addDevice(data: { name: string; ip: string; port: number; login: string; password: string; connectionType: ConnectionType }): Promise<Device> {
  const hasBackend = await checkBackend();
  
  if (hasBackend) {
    try {
      const response = await fetch(`${API_BASE}/devices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Backend unavailable, using local simulation');
    }
  }
  
  // Fallback: локальная симуляция
  const device: Device = {
    id: Math.random().toString(36).substring(2, 10),
    name: data.name,
    ip: data.ip,
    port: data.port,
    login: data.login,
    password: data.password,
    connectionType: data.connectionType,
    status: 'connecting',
    lastSeen: new Date().toISOString(),
  };
  
  return device;
}

/**
 * Подключается к устройству и сканирует
 */
export async function connectToDevice(device: Device): Promise<Device> {
  const hasBackend = await checkBackend();
  
  if (hasBackend) {
    try {
      const response = await fetch(`${API_BASE}/devices/${device.id}/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const result = await response.json();
        return result.device;
      } else {
        const error = await response.json();
        throw new Error(error.details || error.error || 'Connection failed');
      }
    } catch (error: any) {
      if (error.message.includes('fetch')) {
        // Network error — fallback to simulation
      } else {
        throw error;
      }
    }
  }
  
  // Fallback: симуляция
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
  const sysInfo = generateSystemInfo(device.connectionType);
  const recommendations = generateRecommendations(sysInfo);
  
  return {
    ...device,
    status: 'online',
    systemInfo: sysInfo,
    recommendations,
    lastSeen: new Date().toISOString()
  };
}

/**
 * Отключается от устройства
 */
export async function disconnectDevice(deviceId: string): Promise<void> {
  const hasBackend = await checkBackend();
  
  if (hasBackend) {
    try {
      await fetch(`${API_BASE}/devices/${deviceId}/disconnect`, {
        method: 'POST'
      });
    } catch {
      // Ignore
    }
  }
}

/**
 * Удаляет устройство
 */
export async function removeDevice(deviceId: string): Promise<void> {
  const hasBackend = await checkBackend();
  
  if (hasBackend) {
    try {
      await fetch(`${API_BASE}/devices/${deviceId}`, {
        method: 'DELETE'
      });
    } catch {
      // Ignore
    }
  }
}

/**
 * Выполняет команду на устройстве
 */
export async function executeCommand(deviceId: string, command: string): Promise<{ output: string; error?: string }> {
  const hasBackend = await checkBackend();
  
  if (hasBackend) {
    try {
      const response = await fetch(`${API_BASE}/devices/${deviceId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      });
      if (response.ok) {
        const result = await response.json();
        return { output: result.output || result.stdout || '', error: result.error || result.stderr };
      }
    } catch {
      // Fallback
    }
  }
  
  return { output: `[Demo] Command executed: ${command}`, error: undefined };
}

/**
 * Применяет рекомендацию
 */
export async function applyRecommendation(deviceId: string, recommendationId: string): Promise<{ success: boolean; output: string }> {
  const hasBackend = await checkBackend();
  
  if (hasBackend) {
    try {
      const response = await fetch(`${API_BASE}/devices/${deviceId}/apply-recommendation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recommendationId })
      });
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Fallback
    }
  }
  
  return { success: true, output: '[Demo] Recommendation applied successfully' };
}

/**
 * Создаёт WebSocket подключение для терминала
 */
export function createTerminalWebSocket(deviceId: string): WebSocket | null {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws/terminal?deviceId=${deviceId}`;
  
  try {
    return new WebSocket(wsUrl);
  } catch {
    return null;
  }
}

/**
 * Проверяет, используется ли реальный backend
 */
export function isBackendAvailable(): boolean {
  return backendAvailable === true;
}
