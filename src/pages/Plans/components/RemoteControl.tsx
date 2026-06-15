import { useAppStore } from '@/store';
import { getPlotById, formatDateTime, getStatusColor, getStatusText } from '@/utils';
import { Settings, Power, Pause, Play, MapPin, Clock, Droplets } from 'lucide-react';

interface Props {
  onPausePlan: (planId: string) => void;
  onResumePlan: (planId: string) => void;
}

export default function RemoteControl({ onPausePlan, onResumePlan }: Props) {
  const sensors = useAppStore((state) => state.sensors);
  const plans = useAppStore((state) => state.plans);
  const plots = useAppStore((state) => state.plots);
  const controlValve = useAppStore((state) => state.controlValve);

  const valves = sensors.filter((s) => s.type === 'valve');
  const executingPlans = plans.filter((p) => p.status === 'executing' || p.status === 'paused');

  const handleValveToggle = (valveId: string, currentStatus: 'open' | 'closed') => {
    const newStatus = currentStatus === 'open' ? 'closed' : 'open';
    controlValve(valveId, newStatus);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">远程控制</h3>
        <p className="text-sm text-gray-500 mt-1">阀门开关控制与执行中任务管理</p>
      </div>

      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          阀门控制
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {valves.map((valve, index) => {
            const plot = getPlotById(plots, valve.plotId);
            const isOpen = valve.lastData?.valveStatus === 'open';
            return (
              <div
                key={valve.id}
                className="card card-hover animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-xl ${isOpen ? 'bg-success-50' : 'bg-gray-100'}`}
                      >
                        <Power
                          className={`w-5 h-5 ${isOpen ? 'text-success-600' : 'text-gray-400'}`}
                        />
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-800">{valve.name}</h5>
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {plot?.name || '未知'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">状态</span>
                      <span
                        className={`badge ${isOpen ? 'bg-success-100 text-success-700' : 'bg-gray-100 text-gray-600'}`}
                      >
                        {isOpen ? '开启' : '关闭'}
                      </span>
                    </div>
                    {isOpen && valve.lastData && (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">流量</span>
                          <span className="font-medium text-gray-700">
                            {valve.lastData.flowRate?.toFixed(1) || 0} m³/h
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">水压</span>
                          <span className="font-medium text-gray-700">
                            {valve.lastData.pressure?.toFixed(2) || 0} MPa
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => handleValveToggle(valve.id, valve.lastData?.valveStatus || 'closed')}
                    className={`w-full py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                      isOpen
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-success-50 text-success-600 hover:bg-success-100'
                    }`}
                  >
                    <Power className="w-4 h-4" />
                    {isOpen ? '关闭阀门' : '开启阀门'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
          <Droplets className="w-4 h-4" />
          执行中任务
        </h4>
        {executingPlans.length === 0 ? (
          <div className="card p-8 text-center">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">暂无执行中的任务</p>
          </div>
        ) : (
          <div className="space-y-4">
            {executingPlans.map((plan, index) => {
              const plot = getPlotById(plots, plan.plotId);
              const isPaused = plan.status === 'paused';
              return (
                <div
                  key={plan.id}
                  className="card card-hover animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h5 className="font-medium text-gray-800">
                          {plot?.name || '未知地块'} - 水肥一体化任务
                        </h5>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`badge ${getStatusColor(plan.status)}`}>
                            {getStatusText(plan.status)}
                          </span>
                          <span className="text-xs text-gray-400">
                            开始于 {formatDateTime(plan.executedAt || plan.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">计划水量</p>
                        <p className="font-medium text-gray-700">{plan.waterAmount} m³</p>
                      </div>
                      {plan.fertilizerAmount > 0 && (
                        <div>
                          <p className="text-xs text-gray-400 mb-1">计划肥量</p>
                          <p className="font-medium text-gray-700">{plan.fertilizerAmount} kg</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-gray-400 mb-1">持续时间</p>
                        <p className="font-medium text-gray-700">{plan.duration} 分钟</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>执行进度</span>
                        <span>{isPaused ? '已暂停' : '执行中...'}</span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className={`progress-fill ${isPaused ? 'bg-warning-500' : ''}`}
                          style={{ width: isPaused ? '45%' : '65%' }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isPaused ? (
                        <button
                          onClick={() => onResumePlan(plan.id)}
                          className="flex-1 py-2.5 rounded-xl bg-success-50 text-success-600 hover:bg-success-100 font-medium transition-all flex items-center justify-center gap-2"
                        >
                          <Play className="w-4 h-4" />
                          恢复执行
                        </button>
                      ) : (
                        <button
                          onClick={() => onPausePlan(plan.id)}
                          className="flex-1 py-2.5 rounded-xl bg-warning-50 text-warning-600 hover:bg-warning-100 font-medium transition-all flex items-center justify-center gap-2"
                        >
                          <Pause className="w-4 h-4" />
                          暂停任务
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
