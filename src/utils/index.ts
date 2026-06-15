import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Plot, Sensor, WaterFertilizerPlan, Alert } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatNumber(num: number, decimals = 1): string {
  return num.toFixed(decimals);
}

export function formatCurrency(num: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0,
  }).format(num);
}

export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    normal: 'bg-success-100 text-success-700',
    online: 'bg-success-100 text-success-700',
    completed: 'bg-success-100 text-success-700',
    approved: 'bg-success-100 text-success-700',
    resolved: 'bg-success-100 text-success-700',
    executing: 'bg-sky-100 text-sky-700',
    in_progress: 'bg-sky-100 text-sky-700',
    processing: 'bg-sky-100 text-sky-700',
    pending: 'bg-soil-100 text-soil-700',
    drought: 'bg-warning-100 text-warning-700',
    warning: 'bg-warning-100 text-warning-700',
    low_battery: 'bg-warning-100 text-warning-700',
    low_signal: 'bg-warning-100 text-warning-700',
    low_pressure: 'bg-warning-100 text-warning-700',
    paused: 'bg-warning-100 text-warning-700',
    offline: 'bg-red-100 text-red-700',
    danger: 'bg-red-100 text-red-700',
    diseased: 'bg-red-100 text-red-700',
    rejected: 'bg-red-100 text-red-700',
    unhandled: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    flooded: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-gray-100 text-gray-700',
    interrupted: 'bg-gray-100 text-gray-700',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-700';
}

export function getStatusText(status: string): string {
  const textMap: Record<string, string> = {
    normal: '正常',
    online: '在线',
    offline: '离线',
    low_battery: '低电量',
    low_signal: '信号弱',
    drought: '干旱',
    flooded: '积水',
    diseased: '病虫害',
    pending: '待审批',
    approved: '已批准',
    rejected: '已拒绝',
    executing: '执行中',
    completed: '已完成',
    paused: '已暂停',
    cancelled: '已取消',
    in_progress: '进行中',
    interrupted: '已中断',
    unhandled: '未处理',
    processing: '处理中',
    resolved: '已解决',
    low_pressure: '低压',
    blocked: '堵塞',
    leaking: '泄漏',
  };
  return textMap[status] || status;
}

export function getAlertTypeText(type: string): string {
  const textMap: Record<string, string> = {
    device_offline: '设备离线',
    low_pressure: '水压过低',
    low_moisture: '土壤湿度过低',
    high_ec: 'EC值过高',
    low_battery: '电量不足',
    valve_failure: '阀门故障',
    flow_abnormal: '流量异常',
  };
  return textMap[type] || type;
}

export function getSensorTypeText(type: string): string {
  const textMap: Record<string, string> = {
    soil_moisture: '土壤湿度传感器',
    temperature: '温度传感器',
    ec: 'EC值传感器',
    pressure: '压力传感器',
    flow: '流量计',
    valve: '灌溉阀门',
  };
  return textMap[type] || type;
}

export function getFlowerStageText(stage: string): string {
  const textMap: Record<string, string> = {
    germination: '萌芽期',
    vegetative: '营养生长期',
    flowering: '开花期',
    fruit_setting: '坐果期',
    maturation: '成熟期',
    harvest: '采收期',
  };
  return textMap[stage] || stage;
}

export function getWeatherIcon(condition: string): string {
  const iconMap: Record<string, string> = {
    sunny: '☀️',
    cloudy: '⛅',
    rainy: '🌧️',
    stormy: '⛈️',
  };
  return iconMap[condition] || '🌤️';
}

export function getPlotById(plots: Plot[], id: string): Plot | undefined {
  return plots.find((p) => p.id === id);
}

export function getSensorById(sensors: Sensor[], id: string): Sensor | undefined {
  return sensors.find((s) => s.id === id);
}

export function getSensorsByPlotId(sensors: Sensor[], plotId: string): Sensor[] {
  return sensors.filter((s) => s.plotId === plotId);
}

export function getPlansByPlotId(plans: WaterFertilizerPlan[], plotId: string): WaterFertilizerPlan[] {
  return plans.filter((p) => p.plotId === plotId);
}

export function getAlertsByDeviceId(alerts: Alert[], deviceId: string): Alert[] {
  return alerts.filter((a) => a.deviceId === deviceId);
}

export function calculatePolygonArea(coordinates: Array<{ lat: number; lng: number }>): number {
  const area =
    coordinates.reduce((acc, coord, index) => {
      const nextCoord = coordinates[(index + 1) % coordinates.length];
      return acc + coord.lng * nextCoord.lat - nextCoord.lng * coord.lat;
    }, 0) / 2;
  return Math.abs(area) * 111319.9 * 111319.9 * Math.cos((coordinates[0].lat * Math.PI) / 180) / 10000;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
