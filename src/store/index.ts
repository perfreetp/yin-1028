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

const STORAGE_KEY = 'orchard-platform-data';

interface PersistedState {
  plots: Plot[];
  plans: WaterFertilizerPlan[];
  formulas: FertilizerFormula[];
  alerts: Alert[];
  inspections: Inspection[];
  flowerPeriods: FlowerPeriod[];
  irrigationRecords: IrrigationRecord[];
  fertilizationRecords: FertilizationRecord[];
  sensors: Sensor[];
  costData: CostData[];
}

function loadPersistedData(): Partial<PersistedState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as Partial<PersistedState>;
    }
  } catch {
    // ignore
  }
  return null;
}

function persistData(data: PersistedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

const persisted = loadPersistedData();

function computeDashboardStats(
  plots: Plot[],
  sensors: Sensor[],
  plans: WaterFertilizerPlan[],
  alerts: Alert[],
  irrigationRecords: IrrigationRecord[],
): DashboardStats {
  const onlineDevices = sensors.filter((s) => s.status === 'online').length;
  const unhandledAlerts = alerts.filter((a) => a.status !== 'resolved').length;
  const pendingPlans = plans.filter((p) => p.approvalStatus === 'pending').length;
  const activeTasks = plans.filter((p) => p.status === 'executing').length;
  const today = new Date().toISOString().split('T')[0];
  const todayIrrigation = irrigationRecords
    .filter((r) => r.startTime.startsWith(today))
    .reduce((sum, r) => sum + r.waterUsage, 0);
  const totalArea = plots.reduce((sum, p) => sum + p.area, 0);

  return {
    totalArea,
    plotCount: plots.length,
    onlineDevices,
    totalDevices: sensors.length,
    todayIrrigation: Math.round(todayIrrigation * 10) / 10,
    todayAlerts: unhandledAlerts,
    pendingPlans,
    activeTasks,
  };
}

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

  updatePlot: (id: string, updates: Partial<Plot>) => void;
  addPlan: (plan: WaterFertilizerPlan) => void;
  updatePlan: (id: string, updates: Partial<WaterFertilizerPlan>) => void;
  approvePlan: (id: string, approverId: string, notes?: string) => void;
  rejectPlan: (id: string, approverId: string, notes: string) => void;

  addFormula: (formula: FertilizerFormula) => void;
  updateFormula: (id: string, updates: Partial<FertilizerFormula>) => void;
  deleteFormula: (id: string) => void;

  handleAlert: (id: string, handler: string, notes: string) => void;
  resolveAlert: (id: string, notes: string) => void;

  addInspection: (inspection: Inspection) => void;
  addFlowerPeriod: (period: FlowerPeriod) => void;

  controlValve: (sensorId: string, status: 'open' | 'closed') => void;
  pausePlan: (planId: string) => void;
  resumePlan: (planId: string) => void;

  getUserNameById: (userId: string) => string;
  resetData: () => void;
}

const initialPlots = persisted?.plots || mockPlots;
const initialPlans = persisted?.plans || mockPlans;
const initialFormulas = persisted?.formulas || mockFormulas;
const initialAlerts = persisted?.alerts || mockAlerts;
const initialInspections = persisted?.inspections || mockInspections;
const initialFlowerPeriods = persisted?.flowerPeriods || mockFlowerPeriods;
const initialIrrigationRecords = persisted?.irrigationRecords || mockIrrigationRecords;
const initialFertilizationRecords = persisted?.fertilizationRecords || mockFertilizationRecords;
const initialSensors = persisted?.sensors || mockSensors;
const initialCostData = persisted?.costData || mockCostData;

function syncPersist(state: Partial<AppState>) {
  persistData({
    plots: state.plots ?? initialPlots,
    plans: state.plans ?? initialPlans,
    formulas: state.formulas ?? initialFormulas,
    alerts: state.alerts ?? initialAlerts,
    inspections: state.inspections ?? initialInspections,
    flowerPeriods: state.flowerPeriods ?? initialFlowerPeriods,
    irrigationRecords: state.irrigationRecords ?? initialIrrigationRecords,
    fertilizationRecords: state.fertilizationRecords ?? initialFertilizationRecords,
    sensors: state.sensors ?? initialSensors,
    costData: state.costData ?? initialCostData,
  });
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: mockUsers[0],
  users: mockUsers,
  plots: initialPlots,
  sensors: initialSensors,
  pipelines: mockPipelines,
  plans: initialPlans,
  formulas: initialFormulas,
  irrigationRecords: initialIrrigationRecords,
  fertilizationRecords: initialFertilizationRecords,
  alerts: initialAlerts,
  flowerPeriods: initialFlowerPeriods,
  inspections: initialInspections,
  yieldData: mockYieldData,
  costData: initialCostData,
  weatherData: mockWeatherData,
  weatherForecast: mockWeatherForecast,
  sensorHistoryData: mockSensorHistoryData,
  dashboardStats: computeDashboardStats(initialPlots, initialSensors, initialPlans, initialAlerts, initialIrrigationRecords),
  selectedPlot: null,
  selectedSensor: null,
  loading: false,

  setCurrentUser: (user) => set({ currentUser: user }),
  setSelectedPlot: (plot) => set({ selectedPlot: plot }),
  setSelectedSensor: (sensor) => set({ selectedSensor: sensor }),

  updatePlot: (id, updates) =>
    set((state) => {
      const plots = state.plots.map((p) => (p.id === id ? { ...p, ...updates } : p));
      const dashboardStats = computeDashboardStats(plots, state.sensors, state.plans, state.alerts, state.irrigationRecords);
      const result = { plots, dashboardStats };
      syncPersist({ ...state, ...result });
      return result;
    }),

  addPlan: (plan) =>
    set((state) => {
      const plans = [plan, ...state.plans];
      const dashboardStats = computeDashboardStats(state.plots, state.sensors, plans, state.alerts, state.irrigationRecords);
      const result = { plans, dashboardStats };
      syncPersist({ ...state, ...result });
      return result;
    }),

  updatePlan: (id, updates) =>
    set((state) => {
      const plans = state.plans.map((p) => (p.id === id ? { ...p, ...updates } : p));
      const dashboardStats = computeDashboardStats(state.plots, state.sensors, plans, state.alerts, state.irrigationRecords);
      const result = { plans, dashboardStats };
      syncPersist({ ...state, ...result });
      return result;
    }),

  approvePlan: (id, approverId, notes) =>
    set((state) => {
      const plans = state.plans.map((p) =>
        p.id === id
          ? { ...p, status: 'approved' as const, approvalStatus: 'approved' as const, approverId, approvalNotes: notes }
          : p
      );
      const dashboardStats = computeDashboardStats(state.plots, state.sensors, plans, state.alerts, state.irrigationRecords);
      const result = { plans, dashboardStats };
      syncPersist({ ...state, ...result });
      return result;
    }),

  rejectPlan: (id, approverId, notes) =>
    set((state) => {
      const plans = state.plans.map((p) =>
        p.id === id
          ? { ...p, status: 'rejected' as const, approvalStatus: 'rejected' as const, approverId, approvalNotes: notes }
          : p
      );
      const dashboardStats = computeDashboardStats(state.plots, state.sensors, plans, state.alerts, state.irrigationRecords);
      const result = { plans, dashboardStats };
      syncPersist({ ...state, ...result });
      return result;
    }),

  addFormula: (formula) =>
    set((state) => {
      const formulas = [...state.formulas, formula];
      syncPersist({ ...state, formulas });
      return { formulas };
    }),

  updateFormula: (id, updates) =>
    set((state) => {
      const formulas = state.formulas.map((f) => (f.id === id ? { ...f, ...updates } : f));
      syncPersist({ ...state, formulas });
      return { formulas };
    }),

  deleteFormula: (id) =>
    set((state) => {
      const formulas = state.formulas.filter((f) => f.id !== id);
      syncPersist({ ...state, formulas });
      return { formulas };
    }),

  handleAlert: (id, handler, notes) =>
    set((state) => {
      const alerts = state.alerts.map((a) =>
        a.id === id
          ? { ...a, status: 'processing' as const, handler, handledAt: new Date().toISOString(), handleNotes: notes }
          : a
      );
      const dashboardStats = computeDashboardStats(state.plots, state.sensors, state.plans, alerts, state.irrigationRecords);
      syncPersist({ ...state, alerts });
      return { alerts, dashboardStats };
    }),

  resolveAlert: (id, notes) =>
    set((state) => {
      const alerts = state.alerts.map((a) =>
        a.id === id
          ? { ...a, status: 'resolved' as const, handledAt: new Date().toISOString(), handleNotes: notes }
          : a
      );
      const dashboardStats = computeDashboardStats(state.plots, state.sensors, state.plans, alerts, state.irrigationRecords);
      syncPersist({ ...state, alerts });
      return { alerts, dashboardStats };
    }),

  addInspection: (inspection) =>
    set((state) => {
      const inspections = [inspection, ...state.inspections];
      syncPersist({ ...state, inspections });
      return { inspections };
    }),

  addFlowerPeriod: (period) =>
    set((state) => {
      const flowerPeriods = [period, ...state.flowerPeriods];
      syncPersist({ ...state, flowerPeriods });
      return { flowerPeriods };
    }),

  controlValve: (sensorId, status) =>
    set((state) => {
      const sensors = state.sensors.map((s) =>
        s.id === sensorId
          ? { ...s, lastData: { ...s.lastData!, valveStatus: status, flowRate: status === 'open' ? 10 + Math.random() * 5 : 0 } }
          : s
      );
      syncPersist({ ...state, sensors });
      return { sensors };
    }),

  pausePlan: (planId) =>
    set((state) => {
      const plans = state.plans.map((p) => (p.id === planId ? { ...p, status: 'paused' as const } : p));
      const dashboardStats = computeDashboardStats(state.plots, state.sensors, plans, state.alerts, state.irrigationRecords);
      syncPersist({ ...state, plans });
      return { plans, dashboardStats };
    }),

  resumePlan: (planId) =>
    set((state) => {
      const plans = state.plans.map((p) => (p.id === planId ? { ...p, status: 'executing' as const } : p));
      const dashboardStats = computeDashboardStats(state.plots, state.sensors, plans, state.alerts, state.irrigationRecords);
      syncPersist({ ...state, plans });
      return { plans, dashboardStats };
    }),

  getUserNameById: (userId: string) => {
    const user = mockUsers.find((u) => u.id === userId);
    return user ? user.name : userId;
  },

  resetData: () => {
    localStorage.removeItem(STORAGE_KEY);
    const dashboardStats = computeDashboardStats(mockPlots, mockSensors, mockPlans, mockAlerts, mockIrrigationRecords);
    set({
      plots: mockPlots,
      sensors: mockSensors,
      plans: mockPlans,
      formulas: mockFormulas,
      alerts: mockAlerts,
      inspections: mockInspections,
      flowerPeriods: mockFlowerPeriods,
      irrigationRecords: mockIrrigationRecords,
      fertilizationRecords: mockFertilizationRecords,
      costData: mockCostData,
      dashboardStats,
    });
  },
}));
