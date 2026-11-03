export type ConnectionType = 'ssh' | 'adb' | 'plink';
export type DeviceStatus = 'online' | 'offline' | 'connecting' | 'error';
export type OSType = 'Windows' | 'Linux' | 'Android' | 'macOS';

export interface Device {
  id: string;
  name: string;
  ip: string;
  port: number;
  login: string;
  password: string;
  connectionType: ConnectionType;
  status: DeviceStatus;
  lastSeen: string;
  systemInfo?: SystemInfo;
  recommendations?: Recommendation[];
}

export interface SystemInfo {
  os: OSType;
  osVersion: string;
  hostname: string;
  cpu: string;
  cpuCores: number;
  cpuUsage: number;
  ram: number;
  ramUsed: number;
  ramUnit: string;
  diskTotal: number;
  diskUsed: number;
  diskUnit: string;
  uptime: string;
  processes: ProcessInfo[];
  services: ServiceInfo[];
  networkInterfaces: NetworkInterface[];
  gpu?: string;
}

export interface ProcessInfo {
  pid: number;
  name: string;
  cpu: number;
  memory: number;
  user: string;
  status: string;
}

export interface ServiceInfo {
  name: string;
  status: 'running' | 'stopped' | 'disabled';
  description: string;
  startup: 'auto' | 'manual' | 'disabled';
}

export interface NetworkInterface {
  name: string;
  ip: string;
  mac: string;
  speed: string;
}

export interface Recommendation {
  id: string;
  category: 'performance' | 'security' | 'privacy' | 'cleanup' | 'network' | 'services';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  command?: string;
  impact: string;
  risk: 'low' | 'medium' | 'high';
}
