import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Droplets, Users, Wrench, Sprout, TrendingUp } from 'lucide-react';
import { useAppStore } from '@/store';
import { cn, formatCurrency } from '@/utils';

const COLORS = ['#2D5A27', '#5fad54', '#8ec985', '#cda244', '#4A90D9'];

const categoryMap: Record<string, { name: string; icon: typeof Droplets; color: string }> = {
  water: { name: '灌溉用水', icon: Droplets, color: '#4A90D9' },
  fertilizer: { name: '肥料', icon: Sprout, color: '#2D5A27' },
  labor: { name: '人工', icon: Users, color: '#8B6914' },
  equipment: { name: '设备', icon: Wrench, color: '#E67E22' },
  other: { name: '其他', icon: TrendingUp, color: '#9ca3af' },
};

export default function CostStatistics() {
  const { costData, plots } = useAppStore();

  const costByCategory = useMemo(() => {
    const grouped: Record<string, number> = {
      water: 0,
      fertilizer: 0,
      labor: 0,
      equipment: 0,
      other: 0,
    };

    costData.forEach((item) => {
      grouped[item.category] = (grouped[item.category] || 0) + item.amount;
    });

    return Object.entries(grouped).map(([key, value]) => ({
      name: categoryMap[key]?.name || key,
      value,
      icon: categoryMap[key]?.icon,
      color: categoryMap[key]?.color,
    }));
  }, [costData]);

  const costByPlot = useMemo(() => {
    const grouped: Record<string, { plotName: string; water: number; fertilizer: number; labor: number; equipment: number; other: number; total: number }> = {};

    plots.forEach((plot) => {
      grouped[plot.id] = {
        plotName: plot.name,
        water: 0,
        fertilizer: 0,
        labor: 0,
        equipment: 0,
        other: 0,
        total: 0,
      };
    });

    costData.forEach((item) => {
      if (grouped[item.plotId]) {
        grouped[item.plotId][item.category as keyof Omit<typeof grouped[string], 'plotName'>] += item.amount;
        grouped[item.plotId].total += item.amount;
      }
    });

    return Object.values(grouped).sort((a, b) => b.total - a.total);
  }, [costData, plots]);

  const totalCost = useMemo(() => {
    return costData.reduce((sum, item) => sum + item.amount, 0);
  }, [costData]);

  const waterFertilizerCost = useMemo(() => {
    return costData
      .filter((item) => item.category === 'water' || item.category === 'fertilizer')
      .reduce((sum, item) => sum + item.amount, 0);
  }, [costData]);

  const laborCost = useMemo(() => {
    return costData
      .filter((item) => item.category === 'labor')
      .reduce((sum, item) => sum + item.amount, 0);
  }, [costData]);

  const equipmentCost = useMemo(() => {
    return costData
      .filter((item) => item.category === 'equipment')
      .reduce((sum, item) => sum + item.amount, 0);
  }, [costData]);

  const stats = [
    { label: '总成本', value: totalCost, icon: TrendingUp, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: '水肥成本', value: waterFertilizerCost, icon: Droplets, color: 'text-sky-600', bg: 'bg-sky-50' },
    { label: '人工成本', value: laborCost, icon: Users, color: 'text-soil-600', bg: 'bg-soil-50' },
    { label: '设备成本', value: equipmentCost, icon: Wrench, color: 'text-warning-600', bg: 'bg-warning-50' },
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
              </div>
              <p className="stat-label">{stat.label}</p>
              <p className="stat-value">{formatCurrency(stat.value)}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <h3 className="text-lg font-semibold text-gray-800 mb-6">成本构成占比</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  {COLORS.map((color, index) => (
                    <linearGradient key={`gradient-${index}`} id={`pieGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={1} />
                      <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={costByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                  outerRadius={100}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1000}
                >
                  {costByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`url(#pieGradient${index % COLORS.length})`} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {costByCategory.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-gray-600">{item.name}</span>
                <span className="text-sm font-medium text-gray-800 ml-auto">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <h3 className="text-lg font-semibold text-gray-800 mb-6">各地块成本对比</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costByPlot} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <defs>
                  <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4A90D9" stopOpacity={1} />
                    <stop offset="100%" stopColor="#4A90D9" stopOpacity={0.6} />
                  </linearGradient>
                  <linearGradient id="fertilizerGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2D5A27" stopOpacity={1} />
                    <stop offset="100%" stopColor="#2D5A27" stopOpacity={0.6} />
                  </linearGradient>
                  <linearGradient id="laborGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B6914" stopOpacity={1} />
                    <stop offset="100%" stopColor="#8B6914" stopOpacity={0.6} />
                  </linearGradient>
                  <linearGradient id="equipmentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E67E22" stopOpacity={1} />
                    <stop offset="100%" stopColor="#E67E22" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="plotName"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickFormatter={(value) => `¥${value / 1000}k`}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Legend />
                <Bar dataKey="water" name="灌溉用水" fill="url(#waterGradient)" radius={[4, 4, 0, 0]} animationDuration={1000} />
                <Bar dataKey="fertilizer" name="肥料" fill="url(#fertilizerGradient)" radius={[4, 4, 0, 0]} animationDuration={1000} />
                <Bar dataKey="labor" name="人工" fill="url(#laborGradient)" radius={[4, 4, 0, 0]} animationDuration={1000} />
                <Bar dataKey="equipment" name="设备" fill="url(#equipmentGradient)" radius={[4, 4, 0, 0]} animationDuration={1000} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card p-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
        <h3 className="text-lg font-semibold text-gray-800 mb-6">各地块成本明细</h3>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>地块名称</th>
                <th>灌溉用水</th>
                <th>肥料</th>
                <th>人工</th>
                <th>设备</th>
                <th>合计</th>
              </tr>
            </thead>
            <tbody>
              {costByPlot.map((item, index) => (
                <tr key={index}>
                  <td className="font-medium text-gray-800">{item.plotName}</td>
                  <td className="text-sky-600">{formatCurrency(item.water)}</td>
                  <td className="text-primary-600">{formatCurrency(item.fertilizer)}</td>
                  <td className="text-soil-600">{formatCurrency(item.labor)}</td>
                  <td className="text-warning-600">{formatCurrency(item.equipment)}</td>
                  <td className="font-semibold text-gray-800">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


