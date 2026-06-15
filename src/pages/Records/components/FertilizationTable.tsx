import React from 'react';
import { Leaf, User, Clock, MapPin, Scale, Droplets } from 'lucide-react';
import { useAppStore } from '@/store';
import { formatDateTime, getPlotById, cn } from '@/utils';

interface FertilizationTableProps {
  className?: string;
}

export const FertilizationTable: React.FC<FertilizationTableProps> = ({ className }) => {
  const { fertilizationRecords, plots } = useAppStore();

  const getPlotName = (plotId: string) => {
    const plot = getPlotById(plots, plotId);
    return plot?.name || '未知地块';
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
                  <Leaf className="w-4 h-4" />
                  施肥配方
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary-700">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4" />
                  肥料用量
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
                  <User className="w-4 h-4" />
                  执行人
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary-700">
                备注
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {fertilizationRecords.map((record, index) => (
              <tr
                key={record.id}
                className="hover:bg-gray-50 transition-colors duration-200 animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <td className="px-6 py-4 text-sm text-gray-700">
                  {formatDateTime(record.time)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                  {getPlotName(record.plotId)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                  <span className="text-soil-600 font-medium">{record.formula}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  <span className="text-warning-600 font-semibold">{record.fertilizerUsage}</span>
                  <span className="text-gray-500 ml-1">kg</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  <span className="text-primary-600 font-semibold">{record.waterUsage}</span>
                  <span className="text-gray-500 ml-1">m³</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {record.operator}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {record.notes || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {fertilizationRecords.length === 0 && (
        <div className="py-12 text-center text-gray-500">
          <Leaf className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>暂无施肥记录</p>
        </div>
      )}
    </div>
  );
};
