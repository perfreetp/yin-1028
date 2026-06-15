import { useState, useMemo } from 'react';
import { PieChart, BarChart3, TrendingUp, ListChecks, MapPin, Calendar, ChevronDown } from 'lucide-react';
import { cn } from '@/utils';
import { useAppStore } from '@/store';
import CostStatistics from './components/CostStatistics';
import YieldComparison from './components/YieldComparison';
import TrendAnalysis from './components/TrendAnalysis';
import TraceSummary from './components/TraceSummary';

type TabType = 'cost' | 'yield' | 'trend' | 'trace';
type TimeRangeKey = '7d' | '30d' | '90d' | 'custom';

const TIME_RANGE_OPTIONS = [
  { key: '7d' as TimeRangeKey, label: '近7天', days: 7 },
  { key: '30d' as TimeRangeKey, label: '近30天', days: 30 },
  { key: '90d' as TimeRangeKey, label: '近90天', days: 90 },
  { key: 'custom' as TimeRangeKey, label: '自定义', days: 0 },
];

const tabs = [
  { key: 'cost' as TabType, label: '成本统计', icon: PieChart },
  { key: 'yield' as TabType, label: '产量对比', icon: BarChart3 },
  { key: 'trend' as TabType, label: '趋势分析', icon: TrendingUp },
  { key: 'trace' as TabType, label: '留痕汇总', icon: ListChecks },
];

interface TimeRange {
  start: string;
  end: string;
}

export default function StatisticsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('cost');
  const [selectedPlotId, setSelectedPlotId] = useState<string>('all');
  const [timeRangeKey, setTimeRangeKey] = useState<TimeRangeKey>('30d');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [plotDropdownOpen, setPlotDropdownOpen] = useState(false);
  const [timeDropdownOpen, setTimeDropdownOpen] = useState(false);

  const { plots } = useAppStore();

  const plotOptions = useMemo(() => [
    { id: 'all', name: '全部地块' },
    ...plots.map(p => ({ id: p.id, name: p.name })),
  ], [plots]);

  const selectedPlotName = useMemo(() => {
    const plot = plotOptions.find(p => p.id === selectedPlotId);
    return plot?.name || '全部地块';
  }, [selectedPlotId, plotOptions]);

  const selectedTimeRangeLabel = useMemo(() => {
    const option = TIME_RANGE_OPTIONS.find(o => o.key === timeRangeKey);
    if (timeRangeKey === 'custom' && customStartDate && customEndDate) {
      return `${customStartDate} 至 ${customEndDate}`;
    }
    return option?.label || '近30天';
  }, [timeRangeKey, customStartDate, customEndDate]);

  const timeRange = useMemo((): TimeRange => {
    const now = new Date();
    const end = now.toISOString().split('T')[0];

    if (timeRangeKey === 'custom') {
      return {
        start: customStartDate || end,
        end: customEndDate || end,
      };
    }

    const option = TIME_RANGE_OPTIONS.find(o => o.key === timeRangeKey);
    const days = option?.days || 30;
    const startDate = new Date(now.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
    return {
      start: startDate.toISOString().split('T')[0],
      end,
    };
  }, [timeRangeKey, customStartDate, customEndDate]);

  return (
    <div className="min-h-screen bg-background p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">统计分析</h1>
          <p className="text-gray-500">全面了解果园运营数据，助力科学决策</p>
        </div>

        <div className="card p-6 mb-8 animate-slide-up">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary-50">
                <MapPin className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">地块选择</p>
                <div className="relative">
                  <button
                    onClick={() => {
                      setPlotDropdownOpen(!plotDropdownOpen);
                      setTimeDropdownOpen(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm font-medium text-gray-700 transition-colors min-w-[140px]"
                  >
                    <span>{selectedPlotName}</span>
                    <ChevronDown className={cn('w-4 h-4 transition-transform', plotDropdownOpen && 'rotate-180')} />
                  </button>
                  {plotDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-fade-in">
                      {plotOptions.map((plot) => (
                        <button
                          key={plot.id}
                          onClick={() => {
                            setSelectedPlotId(plot.id);
                            setPlotDropdownOpen(false);
                          }}
                          className={cn(
                            'w-full px-4 py-2.5 text-left text-sm transition-colors',
                            selectedPlotId === plot.id
                              ? 'bg-primary-50 text-primary-600 font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                          )}
                        >
                          {plot.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="w-px h-12 bg-gray-200" />

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary-50">
                <Calendar className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">时间范围</p>
                <div className="relative">
                  <button
                    onClick={() => {
                      setTimeDropdownOpen(!timeDropdownOpen);
                      setPlotDropdownOpen(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm font-medium text-gray-700 transition-colors min-w-[200px]"
                  >
                    <span className="truncate">{selectedTimeRangeLabel}</span>
                    <ChevronDown className={cn('w-4 h-4 transition-transform flex-shrink-0', timeDropdownOpen && 'rotate-180')} />
                  </button>
                  {timeDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-fade-in">
                      {TIME_RANGE_OPTIONS.map((option) => (
                        <div key={option.key}>
                          <button
                            onClick={() => {
                              setTimeRangeKey(option.key);
                              if (option.key !== 'custom') {
                                setTimeDropdownOpen(false);
                              }
                            }}
                            className={cn(
                              'w-full px-4 py-2.5 text-left text-sm transition-colors',
                              timeRangeKey === option.key
                                ? 'bg-primary-50 text-primary-600 font-medium'
                                : 'text-gray-700 hover:bg-gray-50'
                            )}
                          >
                            {option.label}
                          </button>
                          {option.key === 'custom' && timeRangeKey === 'custom' && (
                            <div className="px-4 py-3 border-t border-gray-100 space-y-3">
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">开始日期</label>
                                <input
                                  type="date"
                                  value={customStartDate}
                                  onChange={(e) => setCustomStartDate(e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">结束日期</label>
                                <input
                                  type="date"
                                  value={customEndDate}
                                  onChange={(e) => setCustomEndDate(e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                              </div>
                              <button
                                onClick={() => setTimeDropdownOpen(false)}
                                className="w-full py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                              >
                                确定
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1" />

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>当前筛选：</span>
              <span className="px-3 py-1 bg-primary-50 text-primary-600 rounded-full font-medium">
                {selectedPlotName}
              </span>
              <span className="px-3 py-1 bg-primary-50 text-primary-600 rounded-full font-medium">
                {selectedTimeRangeLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-1.5 mb-8 inline-flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300',
                  isActive
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                )}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="animate-slide-up" key={`${selectedPlotId}-${timeRange.start}-${timeRange.end}`}>
          {activeTab === 'cost' && <CostStatistics plotId={selectedPlotId} timeRange={timeRange} />}
          {activeTab === 'yield' && <YieldComparison plotId={selectedPlotId} timeRange={timeRange} />}
          {activeTab === 'trend' && <TrendAnalysis plotId={selectedPlotId} timeRange={timeRange} />}
          {activeTab === 'trace' && <TraceSummary plotId={selectedPlotId} timeRange={timeRange} />}
        </div>
      </div>
    </div>
  );
}
