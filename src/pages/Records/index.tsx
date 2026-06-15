import React, { useState } from 'react';
import { Droplets, Leaf, BarChart3, FileText } from 'lucide-react';
import { cn } from '@/utils';
import { IrrigationTable } from './components/IrrigationTable';
import { FertilizationTable } from './components/FertilizationTable';
import { UsageStatistics } from './components/UsageStatistics';

type TabType = 'irrigation' | 'fertilization' | 'statistics';

const RecordsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('irrigation');

  const tabs: Array<{
    id: TabType;
    label: string;
    icon: React.ReactNode;
  }> = [
    { id: 'irrigation', label: '灌溉记录', icon: <Droplets className="w-4 h-4" /> },
    { id: 'fertilization', label: '施肥记录', icon: <Leaf className="w-4 h-4" /> },
    { id: 'statistics', label: '用量统计', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'irrigation':
        return <IrrigationTable />;
      case 'fertilization':
        return <FertilizationTable />;
      case 'statistics':
        return <UsageStatistics />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">执行记录</h1>
          </div>
          <p className="text-gray-500 ml-13">查看和管理所有灌溉、施肥任务的执行记录与用量统计</p>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-2 mb-6 animate-fade-in">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium rounded-xl transition-all duration-300',
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default RecordsPage;
