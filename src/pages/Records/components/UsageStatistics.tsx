import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Droplets, Leaf, TrendingUp, Filter } from 'lucide-react';
import { useAppStore } from '@/store';
import { cn, formatNumber, getPlotById } from '@/utils';

type TimeRange = '7days' | '30days' | '90days';
type ChartType = 'bar' | 'line' | 'pie';

interface UsageStatisticsProps {
  className?: string;
}

const CHART_COLORS = ['#2D5A27', '#8B6914', '#4A90D9', '#E67E22', '#27AE60'];

export const UsageStatistics: React.FC<UsageStatisticsProps> = ({ className }) => {
  const { irrigationRecords, fertilizationRecords, plots } = useAppStore();
  const [timeRange, setTimeRange] = useState<TimeRange>('30days');
  const [chartType, setChartType] = useState<ChartType>('bar');

  const days = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90;

  const dailyData = useMemo(() => {
    const now = new Date();
    const data: Array<{
      date: string;
      dateLabel: string;
      waterUsage: number;
      fertilizerUsage: number;
    }> = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dateLabel = timeRange === '7days'
        ? date.toLocaleDateString('zh-CN', { weekday: 'short' })
        : `${date.getMonth() + 1}/${date.getDate()}`;

      let waterUsage = 0;
      let fertilizerUsage = 0;

      irrigationRecords.forEach(record => {
        const recordDate = record.startTime.split('T')[0];
        if (recordDate === dateStr) {
          waterUsage += record.waterUsage;
        }
      });

      fertilizationRecords.forEach(record => {
        const recordDate = record.time.split('T')[0];
        if (recordDate === dateStr) {
          fertilizerUsage += record.fertilizerUsage;
          waterUsage += record.waterUsage;
        }
      });

      data.push({
        date: dateStr,
        dateLabel,
        waterUsage: Number(waterUsage.toFixed(1)),
        fertilizerUsage: Number(fertilizerUsage.toFixed(1)),
      });
    }

    return data;
  }, [irrigationRecords, fertilizationRecords, timeRange, days]);

  const plotData = useMemo(() => {
    const plotMap = new Map<string, { water: number; fertilizer: number }>();

    irrigationRecords.forEach(record => {
      const current = plotMap.get(record.plotId) || { water: 0, fertilizer: 0 };
      plotMap.set(record.plotId, { ...current, water: current.water + record.waterUsage });
    });

    fertilizationRecords.forEach(record => {
      const current = plotMap.get(record.plotId) || { water: 0, fertilizer: 0 };
      plotMap.set(record.plotId, {
        water: current.water + record.waterUsage,
        fertilizer: current.fertilizer + record.fertilizerUsage,
      });
    });

    return Array.from(plotMap.entries()).map(([plotId, data]) => ({
      name: getPlotById(plots, plotId)?.name || '未知',
      water: Number(data.water.toFixed(1)),
      fertilizer: Number(data.fertilizer.toFixed(1)),
    }));
  }, [irrigationRecords, fertilizationRecords, plots]);

  const totalWater = useMemo(
    () => dailyData.reduce((sum, d) => sum + d.waterUsage, 0),
    [dailyData]
  );

  const totalFertilizer = useMemo(
    () => dailyData.reduce((sum, d) => sum + d.fertilizerUsage, 0),
    [dailyData]
  );

  const avgWater = useMemo(
    () => totalWater / days,
    [totalWater, days]
  );

  const avgFertilizer = useMemo(
    () => totalFertilizer / days,
    [totalFertilizer, days]
  );

  const timeRangeOptions: Array<{ value: TimeRange; label: string }> = [
    { value: '7days', label: '近7天' },
    { value: '30days', label: '近30天' },
    { value: '90days', label: '近90天' },
  ];

  const chartTypeOptions: Array<{ value: ChartType; label: string }> = [
    { value: 'bar', label: '柱状图' },
    { value: 'line', label: '折线图' },
    { value: 'pie', label: '饼图' },
  ];

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl shadow-card border border-gray-100">
          <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name === 'waterUsage' ? '用水量' : '肥料用量'}:
              <span className="font-semibold ml-1">
                {formatNumber(entry.value)} {entry.name === 'waterUsage' ? 'm³' : 'kg'}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (chartType === 'pie') {
      return (
        <div className="grid grid-cols-2 gap-8 h-80">
          <div className="flex flex-col items-center">
            <h4 className="text-sm font-medium text-gray-600 mb-2">用水量分布</h4>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={plotData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="water"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {plotData.map((_, index) => (
                    <Cell key={`cell-water-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col items-center">
            <h4 className="text-sm font-medium text-gray-600 mb-2">肥料用量分布</h4>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={plotData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="fertilizer"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {plotData.map((_, index) => (
                    <Cell key={`cell-fert-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    }

    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={dailyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="dateLabel" tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              formatter={(value) => (
                <span className="text-sm text-gray-600">
                  {value === 'waterUsage' ? '用水量 (m³)' : '肥料用量 (kg)'}
                </span>
              )}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="waterUsage"
              name="waterUsage"
              stroke="#2D5A27"
              strokeWidth={2}
              dot={{ fill: '#2D5A27', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="fertilizerUsage"
              name="fertilizerUsage"
              stroke="#8B6914"
              strokeWidth={2}
              dot={{ fill: '#8B6914', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={dailyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="dateLabel" tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            formatter={(value) => (
              <span className="text-sm text-gray-600">
                {value === 'waterUsage' ? '用水量 (m³)' : '肥料用量 (kg)'}
              </span>
            )}
          />
          <Bar dataKey="waterUsage" name="waterUsage" fill="#2D5A27" radius={[4, 4, 0, 0]} />
          <Bar dataKey="fertilizerUsage" name="fertilizerUsage" fill="#8B6914" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className={cn('space-y-6 animate-fade-in', className)}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-card p-5 hover:shadow-card-hover transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">总用水量</p>
              <p className="text-2xl font-bold text-primary-600">
                {formatNumber(totalWater)}<span className="text-sm font-normal ml-1">m³</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center">
              <Droplets className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-5 hover:shadow-card-hover transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">总肥料用量</p>
              <p className="text-2xl font-bold text-soil-600">
                {formatNumber(totalFertilizer)}<span className="text-sm font-normal ml-1">kg</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-soil-100 rounded-2xl flex items-center justify-center">
              <Leaf className="w-6 h-6 text-soil-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-5 hover:shadow-card-hover transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">日均用水量</p>
              <p className="text-2xl font-bold text-sky-600">
                {formatNumber(avgWater)}<span className="text-sm font-normal ml-1">m³</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-sky-100 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-sky-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-5 hover:shadow-card-hover transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">日均肥料用量</p>
              <p className="text-2xl font-bold text-warning-600">
                {formatNumber(avgFertilizer)}<span className="text-sm font-normal ml-1">kg</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-warning-100 rounded-2xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-warning-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary-600" />
            用量趋势
          </h3>
          <div className="flex gap-3">
            <div className="flex bg-gray-100 rounded-xl p-1">
              {timeRangeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTimeRange(option.value)}
                  className={cn(
                    'px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                    timeRange === option.value
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="flex bg-gray-100 rounded-xl p-1">
              {chartTypeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setChartType(option.value)}
                  className={cn(
                    'px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                    chartType === option.value
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {renderChart()}
      </div>
    </div>
  );
};
