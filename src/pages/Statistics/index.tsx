import { useState } from 'react';
import { PieChart, BarChart3, TrendingUp } from 'lucide-react';
import { cn } from '@/utils';
import CostStatistics from './components/CostStatistics';
import YieldComparison from './components/YieldComparison';
import TrendAnalysis from './components/TrendAnalysis';

type TabType = 'cost' | 'yield' | 'trend';

const tabs = [
  { key: 'cost' as TabType, label: '成本统计', icon: PieChart },
  { key: 'yield' as TabType, label: '产量对比', icon: BarChart3 },
  { key: 'trend' as TabType, label: '趋势分析', icon: TrendingUp },
];

export default function StatisticsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('cost');

  return (
    <div className="min-h-screen bg-background p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">统计分析</h1>
          <p className="text-gray-500">全面了解果园运营数据，助力科学决策</p>
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

        <div className="animate-slide-up">
          {activeTab === 'cost' && <CostStatistics />}
          {activeTab === 'yield' && <YieldComparison />}
          {activeTab === 'trend' && <TrendAnalysis />}
        </div>
      </div>
    </div>
  );
}
