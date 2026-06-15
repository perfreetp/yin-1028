import React from 'react';
import { Droplets, User, Clock, MapPin, Activity } from 'lucide-react';
import { useAppStore } from '@/store';
import { formatDateTime, getStatusColor, getStatusText, getPlotById, cn } from '@/utils';
import type { IrrigationRecord } from '@/types';

interface IrrigationTableProps {
  className?: string;
}

export const IrrigationTable: React.FC<IrrigationTableProps> = ({ className }) => {
  const { irrigationRecords, plots } = useAppStore();

  const getPlotName = (plotId: string) => {
    const plot = getPlotById(plots, plotId);
    return plot?.name || '未知地块';
  };

  const getDuration = (record: IrrigationRecord) => {
    if (!record.endTime) return '进行中';
    const start = new Date(record.startTime).getTime();
    const end = new Date(record.endTime).getTime();
    const minutes = Math.round((end - start) / (1000 * 60));
    if (minutes < 60) return `${minutes}分钟`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
  };

  return (
    <div className={cn('bg-white rounded-2xl shadow-card overflow-hidden animate-fade-in', className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-primary-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary-700">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  执行时间
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary-700">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  地块
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary-700">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4" />
                  用水量
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary-700">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  时长
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary-700">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  执行人
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary-700">
                状态
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary-700">
                备注
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {irrigationRecords.map((record, index) => (
              <tr
                key={record.id}
                className="hover:bg-gray-50 transition-colors duration-200 animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <td className="px-6 py-4 text-sm text-gray-700">
                  {formatDateTime(record.startTime)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                  {getPlotName(record.plotId)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  <span className="text-primary-600 font-semibold">{record.waterUsage}</span>
                  <span className="text-gray-500 ml-1">m³</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {getDuration(record)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {record.operator}
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
                    getStatusColor(record.status)
                  )}>
                    {getStatusText(record.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {record.notes || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {irrigationRecords.length === 0 && (
        <div className="py-12 text-center text-gray-500">
          <Droplets className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>暂无灌溉记录</p>
        </div>
      )}
    </div>
  );
};
