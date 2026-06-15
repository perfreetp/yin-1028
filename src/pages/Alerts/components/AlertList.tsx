import React from 'react';
import { AlertTriangle, Clock, Cpu, Calendar, Wrench, ChevronRight, UserCheck } from 'lucide-react';
import { useAppStore } from '@/store';
import { formatDateTime, getStatusColor, getStatusText, getAlertTypeText, cn } from '@/utils';
import type { Alert } from '@/types';

interface AlertListProps {
  className?: string;
  typeFilter: string;
  levelFilter: string;
  statusFilter: string;
  onHandle: (alert: Alert) => void;
}

export const AlertList: React.FC<AlertListProps> = ({
  className,
  typeFilter,
  levelFilter,
  statusFilter,
  onHandle,
}) => {
  const { alerts, getUserNameById } = useAppStore();

  const formatFriendlyTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return formatDateTime(dateStr);
  };

  const filteredAlerts = alerts.filter((alert) => {
    const matchType = typeFilter === 'all' || alert.type === typeFilter;
    const matchLevel = levelFilter === 'all' || alert.level === levelFilter;
    const matchStatus = statusFilter === 'all' || alert.status === statusFilter;
    return matchType && matchLevel && matchStatus;
  });

  const getLevelColor = (level: string) => {
    const colorMap: Record<string, string> = {
      danger: 'bg-red-100 text-red-700 border-red-200',
      warning: 'bg-orange-100 text-orange-700 border-orange-200',
      info: 'bg-blue-100 text-blue-700 border-blue-200',
    };
    return colorMap[level] || 'bg-gray-100 text-gray-700';
  };

  const getLevelText = (level: string) => {
    const textMap: Record<string, string> = {
      danger: '危险',
      warning: '警告',
      info: '提示',
    };
    return textMap[level] || level;
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'danger':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'info':
        return <AlertTriangle className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      device_offline: <Cpu className="w-4 h-4" />,
      low_pressure: <Clock className="w-4 h-4" />,
      low_moisture: <AlertTriangle className="w-4 h-4" />,
      high_ec: <AlertTriangle className="w-4 h-4" />,
      low_battery: <AlertTriangle className="w-4 h-4" />,
      valve_failure: <Wrench className="w-4 h-4" />,
      flow_abnormal: <AlertTriangle className="w-4 h-4" />,
    };
    return iconMap[type] || <AlertTriangle className="w-4 h-4" />;
  };

  return (
    <div className={cn('bg-white rounded-2xl shadow-card overflow-hidden animate-fade-in', className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-primary-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary-700">
                告警等级
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary-700">
                告警类型
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary-700">
                告警信息
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary-700">
                关联设备
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary-700">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  时间
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary-700">
                状态
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary-700">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  处理人
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary-700">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  处理时间
                </div>
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-primary-700">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredAlerts.map((alert, index) => (
              <tr
                key={alert.id}
                className="hover:bg-gray-50 transition-colors duration-200 animate-slide-up group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getLevelIcon(alert.level)}
                    <span className={cn(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                      getLevelColor(alert.level)
                    )}>
                      {getLevelText(alert.level)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    {getTypeIcon(alert.type)}
                    {getAlertTypeText(alert.type)}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                  {alert.message}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <div className="font-medium">{alert.deviceName}</div>
                  <div className="text-xs text-gray-400">ID: {alert.deviceId}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {formatDateTime(alert.timestamp)}
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
                    getStatusColor(alert.status)
                  )}>
                    {getStatusText(alert.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  {alert.handler ? (
                    <div>
                      <span className="text-gray-700 font-medium">
                        {getUserNameById(alert.handler)}
                      </span>
                      {alert.handledAt && (
                        <span className="text-gray-400 text-xs ml-2">
                          · {formatFriendlyTime(alert.handledAt)}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {alert.handledAt ? formatFriendlyTime(alert.handledAt) : '-'}
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => onHandle(alert)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors duration-200 group-hover:gap-2"
                  >
                    {alert.status === 'resolved' ? '查看详情' : '处理'}
                    <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filteredAlerts.length === 0 && (
        <div className="py-12 text-center text-gray-500">
          <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>暂无符合条件的告警记录</p>
        </div>
      )}
    </div>
  );
};
