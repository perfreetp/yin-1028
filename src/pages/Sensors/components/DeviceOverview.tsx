import { useAppStore } from '@/store';
import { Cpu, WifiOff, BatteryLow, TrendingUp, TrendingDown } from 'lucide-react';

export default function DeviceOverview() {
  const sensors = useAppStore((state) => state.sensors);

  const onlineCount = sensors.filter((s) => s.status === 'online').length;
  const offlineCount = sensors.filter((s) => s.status === 'offline').length;
  const lowBatteryCount = sensors.filter((s) => s.battery > 0 && s.battery < 30).length;
  const totalCount = sensors.length;

  const stats = [
    {
      label: '在线设备',
      value: onlineCount,
      total: totalCount,
      icon: Cpu,
      color: 'text-success-600',
      bgColor: 'bg-success-50',
      trend: 'up',
      description: '运行正常',
    },
    {
      label: '离线设备',
      value: offlineCount,
      total: totalCount,
      icon: WifiOff,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      trend: 'down',
      description: '需要检查',
    },
    {
      label: '低电量设备',
      value: lowBatteryCount,
      total: totalCount,
      icon: BatteryLow,
      color: 'text-warning-600',
      bgColor: 'bg-warning-50',
      trend: 'down',
      description: '低于30%',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const percentage = totalCount > 0 ? Math.round((stat.value / totalCount) * 100) : 0;
        return (
          <div key={index} className="stat-card animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="stat-label">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <span className="stat-value">{stat.value}</span>
                  <span className="text-sm text-gray-400">/ {stat.total} 台</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  {stat.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-success-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm text-gray-500">{stat.description}</span>
                </div>
              </div>
              <div className={`p-3 rounded-2xl ${stat.bgColor}`}>
                <Icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>占比</span>
                <span>{percentage}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className={`progress-fill ${stat.color.replace('text-', 'bg-')}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
