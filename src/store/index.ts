import { create } from 'zustand';
import type {
  User,
  Plot,
  Sensor,
  Pipeline,
  WaterFertilizerPlan,
  FertilizerFormula,
  IrrigationRecord,
  FertilizationRecord,
  Alert,
  FlowerPeriod,
  Inspection,
  YieldData,
  CostData,
  WeatherData,
  WeatherForecast,
  DashboardStats,
  SensorData,
} from '@/types';
import {
  mockUsers,
  mockPlots,
  mockSensors,
  mockPipelines,
  mockPlans,
  mockFormulas,
  mockIrrigationRecords,
  mockFertilizationRecords,
  mockAlerts,
  mockFlowerPeriods,
  mockInspections,
  mockYieldData,
  mockCostData,
  mockWeatherData,
  mockWeatherForecast,
  mockSensorHistoryData,
  mockDashboardStats,
} from '@/services/mock/data';

interface AppState {
  currentUser: User;
  users: User[];
  plots: Plot[];
  sensors: Sensor[];
  pipelines: Pipeline[];
  plans: WaterFertilizerPlan[];
  formulas: FertilizerFormula[];
  irrigationRecords: IrrigationRecord[];
  fertilizationRecords: FertilizationRecord[];
  alerts: Alert[];
  flowerPeriods: FlowerPeriod[];
  inspections: Inspection[];
  yieldData: YieldData[];
  costData: CostData[];
  weatherData: WeatherData[];
  weatherForecast: WeatherForecast[];
  sensorHistoryData: Record<string, SensorData[]>;
  dashboardStats: DashboardStats;
  selectedPlot: Plot | null;
  selectedSensor: Sensor | null;
  loading: boolean;

  setCurrentUser: (user: User) => void;
  setSelectedPlot: (plot: Plot | null) => void;
  setSelectedSensor: (sensor: Sensor | null) => void;
  
  addPlan: (plan: WaterFertilizerPlan) => void;
  updatePlan: (id: string, updates: Partial<WaterFertilizerPlan>) => void;
  approvePlan: (id: string, approverId: string, notes?: string) => void;
  rejectPlan: (id: string, approverId: string, notes: string) => void;
  
  handleAlert: (id: string, handler: string, notes: string) => void;
  resolveAlert: (id: string, notes: string) => void;
  
  addInspection: (inspection: Inspection) => void;
  addFlowerPeriod: (period: FlowerPeriod) => void;
  
  controlValve: (sensorId: string, status: 'open' | 'closed') => void;
  pausePlan: (planId: string) => void;
  resumePlan: (planId: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentUser: mockUsers[0],
  users: mockUsers,
  plots: mockPlots,
  sensors: mockSensors,
  pipelines: mockPipelines,
  plans: mockPlans,
  formulas: mockFormulas,
  irrigationRecords: mockIrrigationRecords,
  fertilizationRecords: mockFertilizationRecords,
  alerts: mockAlerts,
  flowerPeriods: mockFlowerPeriods,
  inspections: mockInspections,
  yieldData: mockYieldData,
  costData: mockCostData,
  weatherData: mockWeatherData,
  weatherForecast: mockWeatherForecast,
  sensorHistoryData: mockSensorHistoryData,
  dashboardStats: mockDashboardStats,
  selectedPlot: null,
  selectedSensor: null,
  loading: false,

  setCurrentUser: (user) => set({ currentUser: user }),
  setSelectedPlot: (plot) => set({ selectedPlot: plot }),
  setSelectedSensor: (sensor) => set({ selectedSensor: sensor }),

  addPlan: (plan) => set((state) => ({
    plans: [plan, ...state.plans],
    dashboardStats: {
      ...state.dashboardStats,
      pendingPlans: state.dashboardStats.pendingPlans + 1,
    },
  })),

  updatePlan: (id, updates) => set((state) => ({
    plans: state.plans.map((p) => (p.id === id ? { ...p, ...updates } : p)),
  })),

  approvePlan: (id, approverId, notes) => set((state) => ({
    plans: state.plans.map((p) =>
      p.id === id
        ? {
            ...p,
            status: 'approved',
            approvalStatus: 'approved',
            approverId,
            approvalNotes: notes,
          }
        : p
    ),
    dashboardStats: {
      ...state.dashboardStats,
      pendingPlans: state.dashboardStats.pendingPlans - 1,
    },
  })),

  rejectPlan: (id, approverId, notes) => set((state) => ({
    plans: state.plans.map((p) =>
      p.id === id
        ? {
            ...p,
            status: 'rejected',
            approvalStatus: 'rejected',
            approverId,
            approvalNotes: notes,
          }
        : p
    ),
    dashboardStats: {
      ...state.dashboardStats,
      pendingPlans: state.dashboardStats.pendingPlans - 1,
    },
  })),

  handleAlert: (id, handler, notes) => set((state) => ({
    alerts: state.alerts.map((a) =>
      a.id === id
        ? {
            ...a,
            status: 'processing',
            handler,
            handledAt: new Date().toISOString(),
            handleNotes: notes,
          }
        : a
    ),
  })),

  resolveAlert: (id, notes) => set((state) => ({
    alerts: state.alerts.map((a) =>
      a.id === id
        ? {
            ...a,
            status: 'resolved',
            handledAt: new Date().toISOString(),
            handleNotes: notes,
          }
        : a
    ),
    dashboardStats: {
      ...state.dashboardStats,
      todayAlerts: Math.max(0, state.dashboardStats.todayAlerts - 1),
    },
  })),

  addInspection: (inspection) => set((state) => ({
    inspections: [inspection, ...state.inspections],
  })),

  addFlowerPeriod: (period) => set((state) => ({
    flowerPeriods: [period, ...state.flowerPeriods],
  })),

  controlValve: (sensorId, status) => set((state) => ({
    sensors: state.sensors.map((s) =>
      s.id === sensorId
        ? {
            ...s,
            lastData: {
              ...s.lastData!,
              valveStatus: status,
              flowRate: status === 'open' ? 10 + Math.random() * 5 : 0,
            },
          }
        : s
    ),
  })),

  pausePlan: (planId) => set((state) => ({
    plans: state.plans.map((p) =>
      p.id === planId ? { ...p, status: 'paused' } : p
    ),
    dashboardStats: {
      ...state.dashboardStats,
      activeTasks: Math.max(0, state.dashboardStats.activeTasks - 1),
    },
  })),

  resumePlan: (planId) => set((state) => ({
    plans: state.plans.map((p) =>
      p.id === planId ? { ...p, status: 'executing' } : p
    ),
    dashboardStats: {
      ...state.dashboardStats,
      activeTasks: state.dashboardStats.activeTasks + 1,
    },
  })),
}));
