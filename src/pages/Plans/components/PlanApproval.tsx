import { useState } from 'react';
import { useAppStore } from '@/store';
import { getStatusColor, getStatusText, getPlotById, formatDateTime } from '@/utils';
import type { WaterFertilizerPlan } from '@/types';
import { Droplets, Leaf, Droplet, Calendar, Clock, User, Check, X, FileText } from 'lucide-react';

export default function PlanApproval() {
  const plans = useAppStore((state) => state.plans);
  const plots = useAppStore((state) => state.plots);
  const currentUser = useAppStore((state) => state.currentUser);
  const approvePlan = useAppStore((state) => state.approvePlan);
  const rejectPlan = useAppStore((state) => state.rejectPlan);
  const [selectedPlan, setSelectedPlan] = useState<WaterFertilizerPlan | null>(null);
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const pendingPlans = plans.filter((p) => p.approvalStatus === 'pending');

  const getTypeIcon = (type: WaterFertilizerPlan['type']) => {
    switch (type) {
      case 'irrigation':
        return <Droplets className="w-4 h-4" />;
      case 'fertilization':
        return <Leaf className="w-4 h-4" />;
      case 'both':
        return <Droplet className="w-4 h-4" />;
    }
  };

  const getTypeText = (type: WaterFertilizerPlan['type']) => {
    switch (type) {
      case 'irrigation':
        return '灌溉';
      case 'fertilization':
        return '施肥';
      case 'both':
        return '水肥一体';
    }
  };

  const getTypeColor = (type: WaterFertilizerPlan['type']) => {
    switch (type) {
      case 'irrigation':
        return 'bg-sky-100 text-sky-700';
      case 'fertilization':
        return 'bg-success-100 text-success-700';
      case 'both':
        return 'bg-primary-100 text-primary-700';
    }
  };

  const handleApprove = (plan: WaterFertilizerPlan) => {
    if (currentUser.role === 'manager') {
      approvePlan(plan.id, currentUser.id);
    }
  };

  const handleReject = (plan: WaterFertilizerPlan) => {
    setSelectedPlan(plan);
    setRejectionNotes('');
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    if (selectedPlan && currentUser.role === 'manager') {
      rejectPlan(selectedPlan.id, currentUser.id, rejectionNotes);
      setShowRejectModal(false);
      setSelectedPlan(null);
    }
  };

  const isManager = currentUser.role === 'manager';

  return (
    <div className="animate-fade-in">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">计划审批</h3>
        <p className="text-sm text-gray-500 mt-1">
          待审批计划 <span className="text-warning-600 font-semibold">{pendingPlans.length}</span> 个
        </p>
      </div>

      {!isManager && (
        <div className="mb-4 p-4 bg-soil-50 border border-soil-200 rounded-xl">
          <p className="text-sm text-soil-700">
            <FileText className="w-4 h-4 inline mr-2" />
            您当前身份为技术员，暂无审批权限，请联系经理审批。
          </p>
        </div>
      )}

      <div className="space-y-4">
        {pendingPlans.length === 0 ? (
          <div className="card p-12 text-center">
            <Check className="w-12 h-12 text-success-400 mx-auto mb-3" />
            <p className="text-gray-500">暂无待审批计划</p>
          </div>
        ) : (
          pendingPlans.map((plan, index) => {
            const plot = getPlotById(plots, plan.plotId);
            return (
              <div
                key={plan.id}
                className="card card-hover animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${getTypeColor(plan.type).replace('text-', 'bg-').replace('700', '100')}`}>
                        {getTypeIcon(plan.type)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {plot?.name || '未知地块'} - {getTypeText(plan.type)}计划
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`badge ${getStatusColor(plan.approvalStatus)}`}>
                            {getStatusText(plan.approvalStatus)}
                          </span>
                          <span className="text-xs text-gray-400">
                            创建于 {formatDateTime(plan.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">计划时间</p>
                      <div className="flex items-center gap-1 text-sm text-gray-700">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {formatDateTime(plan.scheduleTime)}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">持续时间</p>
                      <div className="flex items-center gap-1 text-sm text-gray-700">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {plan.duration} 分钟
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">水量</p>
                      <div className="text-sm font-medium text-gray-700">{plan.waterAmount} m³</div>
                    </div>
                    {plan.fertilizerAmount > 0 && (
                      <div>
                        <p className="text-xs text-gray-400 mb-1">肥量</p>
                        <div className="text-sm font-medium text-gray-700">{plan.fertilizerAmount} kg</div>
                      </div>
                    )}
                  </div>

                  {plan.approvalNotes && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">审批备注</p>
                      <p className="text-sm text-gray-600">{plan.approvalNotes}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <User className="w-4 h-4" />
                      <span>创建人: {currentUser.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReject(plan)}
                        disabled={!isManager}
                        className="btn-danger disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X className="w-4 h-4" />
                        拒绝
                      </button>
                      <button
                        onClick={() => handleApprove(plan)}
                        disabled={!isManager}
                        className="btn-success disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Check className="w-4 h-4" />
                        批准
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setShowRejectModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slide-up">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <X className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">拒绝计划</h3>
                  <p className="text-sm text-gray-500">请填写拒绝原因</p>
                </div>
              </div>
              <div>
                <label className="input-label">拒绝原因</label>
                <textarea
                  value={rejectionNotes}
                  onChange={(e) => setRejectionNotes(e.target.value)}
                  className="input min-h-[100px]"
                  placeholder="请详细说明拒绝该计划的原因..."
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-100">
              <button onClick={() => setShowRejectModal(false)} className="btn-secondary">
                取消
              </button>
              <button
                onClick={confirmReject}
                disabled={!rejectionNotes.trim()}
                className="btn-danger disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认拒绝
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
