import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { TrendingUp, Award, DollarSign, BarChart3 } from 'lucide-react';
import { useAppStore } from '@/store';
import { cn, formatCurrency, formatNumber } from '@/utils';

interface TimeRange {
  start: string;
  end: string;
}

interface YieldComparisonProps {
  plotId: string;
  timeRange: TimeRange;
}

export default function YieldComparison({ plotId, timeRange }: YieldComparisonProps) {
  const { yieldData, plots } = useAppStore();

  const filteredYieldData = useMemo(() => {
    return yieldData.filter((item) => {
      return plotId === 'all' || item.plotId === plotId;
    });
  }, [yieldData, plotId]);

  const years = useMemo(() => {
    const yearSet = new Set(filteredYieldData.map((item) => item.year));
    return Array.from(yearSet).sort((a, b) => a - b);
  }, [filteredYieldData]);

  const yearlyComparison = useMemo(() => {
    const grouped: Record<number, { year: number; output: number; revenue: number; quality: number; count: number }> = {};

    years.forEach((year) => {
      grouped[year] = { year, output: 0, revenue: 0, quality: 0, count: 0 };
    });

    filteredYieldData.forEach((item) => {
      if (grouped[item.year]) {
        grouped[item.year].output += item.output;
        grouped[item.year].revenue += item.totalRevenue;
        grouped[item.year].quality += item.quality;
        grouped[item.year].count += 1;
      }
    });

    return Object.values(grouped).map((item) => ({
      ...item,
      quality: item.count > 0 ? item.quality / item.count : 0,
    }));
  }, [filteredYieldData, years]);

  const plotComparison = useMemo(() => {
    const grouped: Record<string, { plotName: string; cropType: string; output: number; quality: number; revenue: number }> = {};

    const filteredPlots = plotId === 'all' ? plots : plots.filter(p => p.id === plotId);
    
    filteredPlots.forEach((plot) => {
      grouped[plot.id] = {
        plotName: plot.name,
        cropType: plot.cropType,
        output: 0,
        quality: 0,
        revenue: 0,
      };
    });

    const latestYear = Math.max(...years);
    filteredYieldData
      .filter((item) => item.year === latestYear)
      .forEach((item) => {
        if (grouped[item.plotId]) {
          grouped[item.plotId].output = item.output;
          grouped[item.plotId].quality = item.quality;
          grouped[item.plotId].revenue = item.totalRevenue;
        }
      });

    return Object.values(grouped).sort((a, b) => b.output - a.output);
  }, [filteredYieldData, plots, years, plotId]);

  const qualityRadarData = useMemo(() => {
    const latestYear = Math.max(...years);
    return filteredYieldData
      .filter((item) => item.year === latestYear)
      .map((item) => ({
        plotName: item.plotName,
        品质评分: item.quality,
        单位产量: Math.round((item.output / 1000) * 10) / 10,
        单价指数: Math.round((item.unitPrice / 15) * 100),
        年产值: Math.round((item.totalRevenue / 10000) * 10) / 10,
        fullMark: 100,
      }));
  }, [filteredYieldData, years]);

  const totalOutput = useMemo(() => {
    const latestYear = Math.max(...years);
    return filteredYieldData.filter((item) => item.year === latestYear).reduce((sum, item) => sum + item.output, 0);
  }, [filteredYieldData, years]);

  const totalRevenue = useMemo(() => {
    const latestYear = Math.max(...years);
    return filteredYieldData.filter((item) => item.year === latestYear).reduce((sum, item) => sum + item.totalRevenue, 0);
  }, [filteredYieldData, years]);

  const avgQuality = useMemo(() => {
    const latestYear = Math.max(...years);
    const latestData = filteredYieldData.filter((item) => item.year === latestYear);
    return latestData.length > 0
      ? latestData.reduce((sum, item) => sum + item.quality, 0) / latestData.length
      : 0;
  }, [filteredYieldData, years]);

  const yoyGrowth = useMemo(() => {
    if (years.length < 2) return 0;
    const latestYear = Math.max(...years);
    const prevYear = latestYear - 1;
    const latestOutput = filteredYieldData.filter((item) => item.year === latestYear).reduce((sum, item) => sum + item.output, 0);
    const prevOutput = filteredYieldData.filter((item) => item.year === prevYear).reduce((sum, item) => sum + item.output, 0);
    return prevOutput > 0 ? ((latestOutput - prevOutput) / prevOutput) * 100 : 0;
  }, [filteredYieldData, years]);

  const stats = [
    { label: '今年总产量', value: `${formatNumber(totalOutput / 1000, 1)}吨`, icon: BarChart3, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: '平均品质评分', value: `${formatNumber(avgQuality, 1)}分`, icon: Award, color: 'text-soil-600', bg: 'bg-soil-50' },
    { label: '今年总产值', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'text-success-600', bg: 'bg-success-50' },
    { label: '产量同比增长', value: `${formatNumber(yoyGrowth, 1)}%`, icon: TrendingUp, color: yoyGrowth >= 0 ? 'text-primary-600' : 'text-red-600', bg: yoyGrowth >= 0 ? 'bg-primary-50' : 'bg-red-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="stat-card animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="flex items-center justify-between mb-4">
                <div className={cn('p-3 rounded-xl', stat.bg)}>
                  <Icon className={cn('w-6 h-6', stat.color)} />
                </div>
                {stat.label === '产量同比增长' && (
                  <span className={cn('text-sm font-medium flex items-center gap-1', stat.color)}>
                    {yoyGrowth >= 0 ? <TrendingUp size={14} /> : null}
                    {yoyGrowth >= 0 ? '增长' : '下降'}
                  </span>
                )}
              </div>
              <p className="stat-label">{stat.label}</p>
              <p className="stat-value">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="card p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <h3 className="text-lg font-semibold text-gray-800 mb-6">多年度产量对比</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={yearlyComparison} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="outputGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2D5A27" stopOpacity={1} />
                  <stop offset="100%" stopColor="#2D5A27" stopOpacity={0.5} />
                </linearGradient>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#cda244" stopOpacity={1} />
                  <stop offset="100%" stopColor="#cda244" stopOpacity={0.5} />
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
                tickFormatter={(value) => `${value / 1000}t`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickFormatter={(value) => `¥${value / 10000}万`}
              />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === 'output') return [`${formatNumber(value / 1000, 1)}吨`, '产量'];
                  if (name === 'revenue') return [formatCurrency(value), '产值'];
                  return [value, name];
                }}
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Legend formatter={(value) => (value === 'output' ? '产量' : value === 'revenue' ? '产值' : value)} />
              <Bar yAxisId="left" dataKey="output" name="产量" fill="url(#outputGradient)" radius={[4, 4, 0, 0]} animationDuration={1000} />
              <Bar yAxisId="right" dataKey="revenue" name="产值" fill="url(#revenueGradient)" radius={[4, 4, 0, 0]} animationDuration={1000} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <h3 className="text-lg font-semibold text-gray-800 mb-6">各地块产量对比</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={plotComparison} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                <defs>
                  <linearGradient id="plotOutputGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#2D5A27" stopOpacity={1} />
                    <stop offset="100%" stopColor="#5fad54" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickFormatter={(value) => `${value / 1000}t`}
                />
                <YAxis
                  dataKey="plotName"
                  type="category"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  width={90}
                />
                <Tooltip
                  formatter={(value: number) => [`${formatNumber(value / 1000, 1)}吨`, '产量']}
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Bar dataKey="output" name="产量" fill="url(#plotOutputGradient)" radius={[0, 4, 4, 0]} animationDuration={1000} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
          <h3 className="text-lg font-semibold text-gray-800 mb-6">品质评分对比</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={qualityRadarData}>
                <defs>
                  <linearGradient id="radarGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#2D5A27" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#5fad54" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="plotName" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <Radar
                  name="品质评分"
                  dataKey="品质评分"
                  stroke="#2D5A27"
                  fill="url(#radarGradient)"
                  fillOpacity={0.6}
                  animationDuration={1000}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card p-6 animate-slide-up" style={{ animationDelay: '500ms' }}>
        <h3 className="text-lg font-semibold text-gray-800 mb-6">各地块产量明细</h3>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>地块名称</th>
                <th>作物类型</th>
                <th>产量</th>
                <th>品质评分</th>
                <th>单价</th>
                <th>总产值</th>
              </tr>
            </thead>
            <tbody>
              {plotComparison.map((item, index) => (
                <tr key={index}>
                  <td className="font-medium text-gray-800">{item.plotName}</td>
                  <td className="text-gray-600">{item.cropType}</td>
                  <td className="text-primary-600">{formatNumber(item.output / 1000, 1)}吨</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="progress-bar w-20">
                        <div className="progress-fill" style={{ width: `${item.quality}%` }} />
                      </div>
                      <span className="text-sm text-gray-700">{formatNumber(item.quality, 1)}分</span>
                    </div>
                  </td>
                  <td className="text-soil-600">{formatCurrency(item.revenue / (item.output || 1))}/kg</td>
                  <td className="font-semibold text-gray-800">{formatCurrency(item.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
