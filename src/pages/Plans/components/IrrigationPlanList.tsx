import { useAppStore } from '@/store';
import { getStatusColor, getStatusText, getPlotById, formatDateTime } from '@/utils';
import type { WaterFertilizerPlan } from '@/types';
import { Droplets, Leaf, Droplet, Calendar, Clock, User, MoreHorizontal, Eye, Pause, Play, Plus } from 'lucide-react';

interface Props {
  onCreateClick: () => void;
  onPausePlan: (planId: string) => void;
  onResumePlan: (planId: string) => void;
}

export default function IrrigationPlanList({ onCreateClick, onPausePlan, onResumePlan }: Props) {
  const plans = useAppStore((state) => state.plans);
  const plots = useAppStore((state) => state.plots);
  const currentUser = useAppStore((state) => state.currentUser);

  const getTypeIcon = (type: WaterFertilizerPlan['type']) => {
    switch (type) {
      case 'irrigation':
        return <Droplets className="w-4 h-4" />;
      case 'fertilization':
        return <Leaf className="w-4 h-4" />;
      case 'both':
        return <Droplet className="w-4 h-4" />;
    }
  };

  const getTypeText = (type: WaterFertilizerPlan['type']) => {
    switch (type) {
      case 'irrigation':
        return '灌溉';
      case 'fertilization':
        return '施肥';
      case 'both':
        return '水肥一体';
    }
  };

  const getTypeColor = (type: WaterFertilizerPlan['type']) => {
    switch (type) {
      case 'irrigation':
        return 'bg-sky-100 text-sky-700';
      case 'fertilization':
        return 'bg-success-100 text-success-700';
      case 'both':
        return 'bg-primary-100 text-primary-700';
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">灌溉计划列表</h3>
          <p className="text-sm text-gray-500 mt-1">共 {plans.length} 个水肥计划</p>
        </div>
        <button className="btn-primary" onClick={onCreateClick}>
          <Plus className="w-4 h-4" />
          新建计划
        </button>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>地块</th>
                <th>类型</th>
                <th>计划时间</th>
                <th>水量</th>
                <th>状态</th>
                <th>创建人</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan, index) => {
                const plot = getPlotById(plots, plan.plotId);
                return (
                  <tr key={plan.id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                    <td>
                      <div className="font-medium text-gray-800">{plot?.name || '未知'}</div>
                      <div className="text-xs text-gray-400">{plot?.cropType || ''}</div>
                    </td>
                    <td>
                      <span className={`badge flex items-center gap-1 ${getTypeColor(plan.type)}`}>
                        {getTypeIcon(plan.type)}
                        {getTypeText(plan.type)}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {formatDateTime(plan.scheduleTime)}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                        <Clock className="w-3 h-3" />
                        持续 {plan.duration} 分钟
                      </div>
                    </td>
                    <td>
                      <div className="text-sm text-gray-800">{plan.waterAmount} m³</div>
                      {plan.fertilizerAmount > 0 && (
                        <div className="text-xs text-gray-400">肥 {plan.fertilizerAmount} kg</div>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${getStatusColor(plan.status)}`}>
                        {getStatusText(plan.status)}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        {currentUser.name}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <Eye className="w-4 h-4 text-gray-500" />
                        </button>
                        {plan.status === 'executing' && (
                          <button
                            className="p-2 hover:bg-warning-50 rounded-lg transition-colors"
                            onClick={() => onPausePlan(plan.id)}
                          >
                            <Pause className="w-4 h-4 text-warning-500" />
                          </button>
                        )}
                        {plan.status === 'paused' && (
                          <button
                            className="p-2 hover:bg-success-50 rounded-lg transition-colors"
                            onClick={() => onResumePlan(plan.id)}
                          >
                            <Play className="w-4 h-4 text-success-500" />
                          </button>
                        )}
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreHorizontal className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


