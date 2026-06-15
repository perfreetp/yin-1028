import React, { useState } from 'react';
import { Bell, Filter, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { cn, getAlertTypeText } from '@/utils';
import { AlertOverview } from './components/AlertOverview';
import { AlertList } from './components/AlertList';
import { AlertHandleModal } from './components/AlertHandleModal';
import type { Alert } from '@/types';

const AlertsPage: React.FC = () => {
  const [typeFilter, setTypeFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const typeOptions = [
    { value: 'all', label: '全部类型' },
    { value: 'device_offline', label: '设备离线' },
    { value: 'low_pressure', label: '水压过低' },
    { value: 'low_moisture', label: '湿度过低' },
    { value: 'high_ec', label: 'EC值过高' },
    { value: 'low_battery', label: '电量不足' },
    { value: 'valve_failure', label: '阀门故障' },
    { value: 'flow_abnormal', label: '流量异常' },
  ];

  const levelOptions = [
    { value: 'all', label: '全部等级' },
    { value: 'danger', label: '危险', color: 'text-red-600', icon: <AlertTriangle className="w-4 h-4" /> },
    { value: 'warning', label: '警告', color: 'text-orange-600', icon: <AlertTriangle className="w-4 h-4" /> },
    { value: 'info', label: '提示', color: 'text-blue-600', icon: <AlertTriangle className="w-4 h-4" /> },
  ];

  const statusOptions = [
    { value: 'all', label: '全部状态' },
    { value: 'unhandled', label: '未处理', color: 'text-red-600', icon: <AlertTriangle className="w-4 h-4" /> },
    { value: 'processing', label: '处理中', color: 'text-orange-600', icon: <Clock className="w-4 h-4" /> },
    { value: 'resolved', label: '已解决', color: 'text-green-600', icon: <CheckCircle className="w-4 h-4" /> },
  ];

  const handleAlertClick = (alert: Alert) => {
    setSelectedAlert(alert);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAlert(null);
  };

  const handleResetFilters = () => {
    setTypeFilter('all');
    setLevelFilter('all');
    setStatusFilter('all');
  };

  const hasActiveFilters = typeFilter !== 'all' || levelFilter !== 'all' || statusFilter !== 'all';

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">告警管理</h1>
          </div>
          <p className="text-gray-500 ml-13">实时监控和处理系统告警信息，确保设备正常运行</p>
        </div>

        <div className="mb-6">
          <AlertOverview />
        </div>

        <div className="bg-white rounded-2xl shadow-card p-4 mb-6 animate-fade-in">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Filter className="w-5 h-5" />
              <span className="font-medium">筛选：</span>
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              >
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              >
                {levelOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-xl hover:bg-primary-100 transition-all duration-200"
                >
                  重置筛选
                </button>
              )}
            </div>

            {hasActiveFilters && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs text-gray-500">已选筛选：</span>
                <div className="flex flex-wrap gap-2">
                  {typeFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-sky-50 text-sky-700 rounded-lg text-xs">
                      类型: {getAlertTypeText(typeFilter)}
                    </span>
                  )}
                  {levelFilter !== 'all' && (
                    <span className={cn(
                      'inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs',
                      levelFilter === 'danger' && 'bg-red-50 text-red-700',
                      levelFilter === 'warning' && 'bg-orange-50 text-orange-700',
                      levelFilter === 'info' && 'bg-blue-50 text-blue-700'
                    )}>
                      等级: {levelOptions.find(o => o.value === levelFilter)?.label}
                    </span>
                  )}
                  {statusFilter !== 'all' && (
                    <span className={cn(
                      'inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs',
                      statusFilter === 'unhandled' && 'bg-red-50 text-red-700',
                      statusFilter === 'processing' && 'bg-orange-50 text-orange-700',
                      statusFilter === 'resolved' && 'bg-green-50 text-green-700'
                    )}>
                      状态: {statusOptions.find(o => o.value === statusFilter)?.label}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <AlertList
          typeFilter={typeFilter}
          levelFilter={levelFilter}
          statusFilter={statusFilter}
          onHandle={handleAlertClick}
        />

        <AlertHandleModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          alert={selectedAlert}
        />
      </div>
    </div>
  );
};

export default AlertsPage;
