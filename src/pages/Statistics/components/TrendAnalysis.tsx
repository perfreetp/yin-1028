import { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from 'recharts';
import { Droplets, Sprout, Thermometer, Leaf, TrendingUp, BarChart3 } from 'lucide-react';
import { useAppStore } from '@/store';
import { cn, formatNumber, formatDate } from '@/utils';

const TIME_RANGES = [
  { key: '7d', label: '近7天' },
  { key: '30d', label: '近30天' },
  { key: '90d', label: '近90天' },
  { key: '1y', label: '近1年' },
];

export default function TrendAnalysis() {
  const [timeRange, setTimeRange] = useState('30d');
  const { irrigationRecords, fertilizationRecords, sensorHistoryData, yieldData, sensors } = useAppStore();

  const moistureSensors = useMemo(() => {
    return sensors.filter((s) => s.type === 'soil_moisture' && s.status === 'online');
  }, [sensors]);

  const moistureTrendData = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const data: Array<{ date: string; timestamp: number; [key: string]: string | number }> = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = formatDate(date);
      const dayData: { date: string; timestamp: number; [key: string]: string | number } = {
        date: dateStr,
        timestamp: date.getTime(),
      };

      moistureSensors.forEach((sensor) => {
        const history = sensorHistoryData[sensor.id];
        if (history && history.length > 0) {
          const dayHistory = history.filter((h) => {
            const hDate = new Date(h.timestamp);
            return hDate.toDateString() === date.toDateString();
          });
          if (dayHistory.length > 0) {
            const avgMoisture = dayHistory.reduce((sum, h) => sum + (h.moisture || 0), 0) / dayHistory.length;
            dayData[sensor.plotId] = Math.round(avgMoisture * 10) / 10;
          }
        }
      });

      Object.keys(dayData).forEach((key) => {
        if (key !== 'date' && key !== 'timestamp' && dayData[key] === undefined) {
          dayData[key] = 15 + Math.random() * 20;
        }
      });

      data.push(dayData);
    }

    return data;
  }, [timeRange, moistureSensors, sensorHistoryData]);

  const irrigationTrendData = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const data: Array<{ date: string; waterUsage: number; fertilizerUsage: number }> = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = formatDate(date);

      const dayIrrigation = irrigationRecords.filter((record) => {
        const recordDate = new Date(record.startTime);
        return recordDate.toDateString() === date.toDateString();
      });

      const dayFertilization = fertilizationRecords.filter((record) => {
        const recordDate = new Date(record.time);
        return recordDate.toDateString() === date.toDateString();
      });

      const waterUsage = dayIrrigation.reduce((sum, r) => sum + r.waterUsage, 0);
      const fertilizerUsage = dayFertilization.reduce((sum, r) => sum + r.fertilizerUsage, 0);

      data.push({
        date: dateStr,
        waterUsage: Math.round(waterUsage * 10) / 10,
        fertilizerUsage: Math.round(fertilizerUsage * 10) / 10,
      });
    }

    return data;
  }, [timeRange, irrigationRecords, fertilizationRecords]);

  const yieldTrendData = useMemo(() => {
    const years = Array.from(new Set(yieldData.map((item) => item.year))).sort((a, b) => a - b);

    return years.map((year) => {
      const yearData = yieldData.filter((item) => item.year === year);
      return {
        year: `${year}年`,
        产量: Math.round(yearData.reduce((sum, item) => sum + item.output, 0) / 1000 * 10) / 10,
        品质: Math.round(yearData.reduce((sum, item) => sum + item.quality, 0) / yearData.length * 10) / 10,
        产值: Math.round(yearData.reduce((sum, item) => sum + item.totalRevenue, 0) / 10000 * 10) / 10,
      };
    });
  }, [yieldData]);

  const sensorLineColors = ['#2D5A27', '#5fad54', '#8B6914', '#4A90D9', '#E67E22'];

  const avgMoisture = useMemo(() => {
    if (moistureTrendData.length === 0) return 0;
    const allValues = moistureTrendData.flatMap((d) =>
      Object.entries(d)
        .filter(([key]) => key !== 'date' && key !== 'timestamp')
        .map(([, value]) => value as number)
    );
    return allValues.length > 0 ? allValues.reduce((a, b) => a + b, 0) / allValues.length : 0;
  }, [moistureTrendData]);

  const totalWaterUsage = useMemo(() => {
    return irrigationTrendData.reduce((sum, item) => sum + item.waterUsage, 0);
  }, [irrigationTrendData]);

  const totalFertilizerUsage = useMemo(() => {
    return irrigationTrendData.reduce((sum, item) => sum + item.fertilizerUsage, 0);
  }, [irrigationTrendData]);

  const latestYield = useMemo(() => {
    if (yieldTrendData.length === 0) return { 产量: 0, 品质: 0, 产值: 0 };
    return yieldTrendData[yieldTrendData.length - 1];
  }, [yieldTrendData]);

  const stats = [
    { label: '平均土壤湿度', value: `${formatNumber(avgMoisture, 1)}%`, icon: Leaf, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: '累计灌溉水量', value: `${formatNumber(totalWaterUsage, 1)}m³`, icon: Droplets, color: 'text-sky-600', bg: 'bg-sky-50' },
    { label: '累计施肥量', value: `${formatNumber(totalFertilizerUsage, 1)}kg`, icon: Sprout, color: 'text-soil-600', bg: 'bg-soil-50' },
    { label: '近年平均产量', value: `${formatNumber(latestYield.产量, 1)}吨`, icon: BarChart3, color: 'text-success-600', bg: 'bg-success-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 bg-white rounded-2xl shadow-card border border-gray-100 p-1.5">
          {TIME_RANGES.map((range) => (
            <button
              key={range.key}
              onClick={() => setTimeRange(range.key)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300',
                timeRange === range.key
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="stat-card animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="flex items-center justify-between mb-4">
                <div className={cn('p-3 rounded-xl', stat.bg)}>
                  <Icon className={cn('w-6 h-6', stat.color)} />
                </div>
              </div>
              <p className="stat-label">{stat.label}</p>
              <p className="stat-value">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="card p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">水肥用量趋势</h3>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Droplets size={14} className="text-sky-500" />
              灌溉用水量 (m³)
            </span>
            <span className="flex items-center gap-1">
              <Sprout size={14} className="text-primary-500" />
              施肥量 (kg)
            </span>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={irrigationTrendData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <defs>
                <linearGradient id="waterTrendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4A90D9" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#4A90D9" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fertilizerTrendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2D5A27" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#2D5A27" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                angle={-45}
                textAnchor="end"
                height={60}
                tick={{ fontSize: 11, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                interval={timeRange === '7d' ? 0 : timeRange === '30d' ? 4 : timeRange === '90d' ? 14 : 30}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'waterUsage') return [`${formatNumber(value, 1)} m³`, '灌溉水量'];
                  if (name === 'fertilizerUsage') return [`${formatNumber(value, 1)} kg`, '施肥量'];
                  return [value, name];
                }}
              />
              <Legend formatter={(value) => (value === 'waterUsage' ? '灌溉水量' : value === 'fertilizerUsage' ? '施肥量' : value)} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="waterUsage"
                name="灌溉水量"
                stroke="#4A90D9"
                strokeWidth={2}
                fill="url(#waterTrendGradient)"
                animationDuration={1000}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="fertilizerUsage"
                name="施肥量"
                stroke="#2D5A27"
                strokeWidth={2}
                fill="url(#fertilizerTrendGradient)"
                animationDuration={1000}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">土壤墒情趋势</h3>
          <div className="flex items-center gap-2">
            <Thermometer size={16} className="text-warning-500" />
            <span className="text-sm text-gray-500">各地块土壤湿度变化 (%)</span>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={moistureTrendData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <defs>
                <linearGradient id="moistureGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2D5A27" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#2D5A27" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                angle={-45}
                textAnchor="end"
                height={60}
                tick={{ fontSize: 11, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                interval={timeRange === '7d' ? 0 : timeRange === '30d' ? 4 : timeRange === '90d' ? 14 : 30}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                domain={[0, 50]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(value: number, name: string) => {
                  const sensor = moistureSensors.find((s) => s.plotId === name);
                  return [`${formatNumber(value, 1)}%`, sensor?.name || name];
                }}
              />
              <Legend
                formatter={(value) => {
                  const sensor = moistureSensors.find((s) => s.plotId === value);
                  return sensor?.name || value;
                }}
              />
              {moistureSensors.map((sensor, index) => (
                <Line
                  key={sensor.id}
                  type="monotone"
                  dataKey={sensor.plotId}
                  name={sensor.plotId}
                  stroke={sensorLineColors[index % sensorLineColors.length]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                  animationDuration={1000}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">产量趋势</h3>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <BarChart3 size={14} className="text-primary-500" />
              产量 (吨)
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp size={14} className="text-soil-500" />
              品质 (分)
            </span>
            <span className="flex items-center gap-1">
              <Sprout size={14} className="text-success-500" />
              产值 (万元)
            </span>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={yieldTrendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="yieldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2D5A27" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#2D5A27" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(value: number, name: string) => {
                  if (name === '产量') return [`${formatNumber(value, 1)} 吨`, '产量'];
                  if (name === '品质') return [`${formatNumber(value, 1)} 分`, '品质'];
                  if (name === '产值') return [`${formatNumber(value, 1)} 万元`, '产值'];
                  return [value, name];
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="产量"
                name="产量"
                stroke="#2D5A27"
                strokeWidth={3}
                dot={{ r: 6, fill: '#2D5A27' }}
                activeDot={{ r: 8 }}
                animationDuration={1000}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="品质"
                name="品质"
                stroke="#8B6914"
                strokeWidth={2}
                dot={{ r: 5, fill: '#8B6914' }}
                activeDot={{ r: 7 }}
                animationDuration={1000}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="产值"
                name="产值"
                stroke="#27AE60"
                strokeWidth={2}
                dot={{ r: 5, fill: '#27AE60' }}
                activeDot={{ r: 7 }}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
