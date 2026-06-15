import { useState } from 'react';
import { useAppStore } from '@/store';
import { Droplets, Leaf, CheckCircle, Settings, CalendarDays } from 'lucide-react';
import IrrigationPlanList from './components/IrrigationPlanList';
import CreatePlanModal from './components/CreatePlanModal';
import FormulaManagement from './components/FormulaManagement';
import PlanApproval from './components/PlanApproval';
import RemoteControl from './components/RemoteControl';

type TabType = 'plans' | 'formulas' | 'approval' | 'control';

export default function Plans() {
  const [activeTab, setActiveTab] = useState<TabType>('plans');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const pausePlan = useAppStore((state) => state.pausePlan);
  const resumePlan = useAppStore((state) => state.resumePlan);

  const tabs = [
    { id: 'plans' as TabType, label: '灌溉计划', icon: CalendarDays },
    { id: 'formulas' as TabType, label: '施肥配方', icon: Leaf },
    { id: 'approval' as TabType, label: '计划审批', icon: CheckCircle },
    { id: 'control' as TabType, label: '远程控制', icon: Settings },
  ];

  const handlePausePlan = (planId: string) => {
    pausePlan(planId);
  };

  const handleResumePlan = (planId: string) => {
    resumePlan(planId);
  };

  return (
    <div className="p-6">
      <div className="mb-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary-100 rounded-xl">
            <Droplets className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">水肥计划</h1>
            <p className="text-sm text-gray-500 mt-1">管理灌溉施肥计划与远程设备控制</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 p-1 bg-gray-100 rounded-xl">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="transition-all duration-300">
        {activeTab === 'plans' && (
          <IrrigationPlanList
            onCreateClick={() => setShowCreateModal(true)}
            onPausePlan={handlePausePlan}
            onResumePlan={handleResumePlan}
          />
        )}
        {activeTab === 'formulas' && <FormulaManagement />}
        {activeTab === 'approval' && <PlanApproval />}
        {activeTab === 'control' && (
          <RemoteControl onPausePlan={handlePausePlan} onResumePlan={handleResumePlan} />
        )}
      </div>

      <CreatePlanModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </div>
  );
}
