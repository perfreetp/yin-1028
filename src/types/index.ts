export interface User {
  id: string;
  name: string;
  role: 'manager' | 'technician';
  avatar: string;
}

export interface Plot {
  id: string;
  name: string;
  area: number;
  cropType: string;
  soilType: string;
  plantDate: string;
  boundary: Array<{ lat: number; lng: number }>;
  status: 'normal' | 'drought' | 'flooded' | 'diseased';
  description?: string;
}

export interface Sensor {
  id: string;
  plotId: string;
  type: 'soil_moisture' | 'temperature' | 'ec' | 'pressure' | 'flow' | 'valve';
  name: string;
  lat: number;
  lng: number;
  status: 'online' | 'offline' | 'low_battery' | 'low_signal';
  battery: number;
  signal: number;
  lastData: SensorData | null;
  installDate: string;
}

export interface SensorData {
  timestamp: string;
  moisture?: number;
  temperature?: number;
  ecValue?: number;
  pressure?: number;
  flowRate?: number;
  valveStatus?: 'open' | 'closed';
}

export interface Pipeline {
  id: string;
  name: string;
  type: 'main' | 'branch';
  pressure: number;
  flowRate: number;
  status: 'normal' | 'low_pressure' | 'blocked' | 'leaking';
  valveCount: number;
}

export interface FertilizerFormula {
  id: string;
  name: string;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  traceElements: Record<string, number>;
  applicableCrops: string[];
  description: string;
  createdBy: string;
  createdAt: string;
}

export interface ApprovalHistoryItem {
  action: 'approved' | 'rejected' | 'submitted';
  userId: string;
  userName: string;
  time: string;
  notes?: string;
}

export interface WaterFertilizerPlan {
  id: string;
  plotId: string;
  creatorId: string;
  type: 'irrigation' | 'fertilization' | 'both';
  formulaId?: string;
  formula?: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    traceElements: Record<string, number>;
  };
  scheduleTime: string;
  waterAmount: number;
  fertilizerAmount: number;
  valveIds: string[];
  duration: number;
  status: 'pending' | 'approved' | 'rejected' | 'executing' | 'completed' | 'paused' | 'cancelled';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approverId?: string;
  approvalNotes?: string;
  approvalHistory?: ApprovalHistoryItem[];
  approvedAt?: string;
  rejectedAt?: string;
  createdAt: string;
  executedAt?: string;
  completedAt?: string;
}

export interface IrrigationRecord {
  id: string;
  plotId: string;
  planId?: string;
  startTime: string;
  endTime?: string;
  waterUsage: number;
  operator: string;
  status: 'in_progress' | 'completed' | 'interrupted';
  valveIds: string[];
  notes?: string;
}

export interface FertilizationRecord {
  id: string;
  plotId: string;
  planId?: string;
  time: string;
  formula: string;
  fertilizerUsage: number;
  operator: string;
  waterUsage: number;
  notes?: string;
}

export interface Alert {
  id: string;
  type: 'device_offline' | 'low_pressure' | 'low_moisture' | 'high_ec' | 'low_battery' | 'valve_failure' | 'flow_abnormal';
  level: 'info' | 'warning' | 'danger';
  message: string;
  deviceId: string;
  deviceName: string;
  timestamp: string;
  status: 'unhandled' | 'processing' | 'resolved';
  handler?: string;
  handledAt?: string;
  handleNotes?: string;
}

export interface FlowerPeriod {
  id: string;
  plotId: string;
  stage: 'germination' | 'vegetative' | 'flowering' | 'fruit_setting' | 'maturation' | 'harvest';
  date: string;
  notes: string;
  recordedBy: string;
}

export interface Inspection {
  id: string;
  userId: string;
  userName: string;
  plotId: string;
  plotName: string;
  time: string;
  lat: number;
  lng: number;
  notes: string;
  photos: string[];
  issues: string[];
  updatedAt?: string;
  updatedBy?: string;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
}

export interface YieldData {
  id: string;
  plotId: string;
  plotName: string;
  year: number;
  output: number;
  quality: number;
  unitPrice: number;
  totalRevenue: number;
}

export interface CostData {
  id: string;
  plotId: string;
  date: string;
  category: 'water' | 'fertilizer' | 'labor' | 'equipment' | 'other';
  amount: number;
  description: string;
  recordedBy: string;
}

export interface WeatherData {
  timestamp: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  rainfall: number;
  solarRadiation: number;
  pressure: number;
}

export interface WeatherForecast {
  date: string;
  highTemp: number;
  lowTemp: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
  rainfall: number;
  humidity: number;
  windSpeed: number;
}

export interface DashboardStats {
  totalArea: number;
  plotCount: number;
  onlineDevices: number;
  totalDevices: number;
  todayIrrigation: number;
  todayAlerts: number;
  pendingPlans: number;
  activeTasks: number;
}
