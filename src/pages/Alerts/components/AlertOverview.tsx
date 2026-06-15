import React from 'react';
import { AlertTriangle, Clock, CheckCircle, Bell } from 'lucide-react';
import { useAppStore } from '@/store';
import { cn } from '@/utils';

interface AlertOverviewProps {
  className?: string;
}

export const AlertOverview: React.FC<AlertOverviewProps> = ({ className }) => {
  const { alerts } = useAppStore();

  const unhandledCount = alerts.filter(a => a.status === 'unhandled').length;
  const processingCount = alerts.filter(a => a.status === 'processing').length;
  const resolvedCount = alerts.filter(a => a.status === 'resolved').length;
  const totalCount = alerts.length;

  const stats = [
    {
      label: '未处理',
      value: unhandledCount,
      icon: <AlertTriangle className="w-6 h-6" />,
      bgColor: 'bg-red-50',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      valueColor: 'text-red-600',
      borderColor: 'border-l-red-500',
      pulse: unhandledCount > 0,
    },
    {
      label: '处理中',
      value: processingCount,
      icon: <Clock className="w-6 h-6" />,
      bgColor: 'bg-orange-50',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      valueColor: 'text-orange-600',
      borderColor: 'border-l-orange-500',
      pulse: processingCount > 0,
    },
    {
      label: '已解决',
      value: resolvedCount,
      icon: <CheckCircle className="w-6 h-6" />,
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      valueColor: 'text-green-600',
      borderColor: 'border-l-green-500',
      pulse: false,
    },
    {
      label: '总计',
      value: totalCount,
      icon: <Bell className="w-6 h-6" />,
      bgColor: 'bg-primary-50',
      iconBg: 'bg-primary-100',
      iconColor: 'text-primary-600',
      valueColor: 'text-primary-600',
      borderColor: 'border-l-primary-500',
      pulse: false,
    },
  ];

  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in', className)}>
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className={cn(
            'bg-white rounded-2xl shadow-card p-5 border-l-4 hover:shadow-card-hover transition-all duration-300',
            stat.borderColor,
            stat.bgColor
          )}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
              <p className={cn('text-3xl font-bold', stat.valueColor)}>
                {stat.value}
              </p>
            </div>
            <div className={cn(
              'w-14 h-14 rounded-2xl flex items-center justify-center',
              stat.iconBg,
              stat.pulse && 'animate-pulse-slow'
            )}>
              <div className={stat.iconColor}>{stat.icon}</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={cn(
                  'h-2 rounded-full transition-all duration-500',
                  stat.label === '未处理' && 'bg-red-500',
                  stat.label === '处理中' && 'bg-orange-500',
                  stat.label === '已解决' && 'bg-green-500',
                  stat.label === '总计' && 'bg-primary-500'
                )}
                style={{ width: `${totalCount > 0 ? (stat.value / totalCount) * 100 : 0}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              占比 {totalCount > 0 ? ((stat.value / totalCount) * 100).toFixed(0) : 0}%
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
