import { useState } from 'react';
import { useAppStore } from '@/store';
import { getStatusColor, getStatusText, getPlotById, formatDateTime } from '@/utils';
import type { WaterFertilizerPlan, ApprovalHistoryItem } from '@/types';
import { Droplets, Leaf, Droplet, Calendar, Clock, User, Check, X, FileText, CheckCircle, XCircle, History, MessageSquare } from 'lucide-react';

interface ApprovalTimelineProps {
  history: ApprovalHistoryItem[];
}

function ApprovalTimeline({ history }: ApprovalTimelineProps) {
  const getActionIcon = (action: ApprovalHistoryItem['action']) => {
    switch (action) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-success-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'submitted':
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getActionBg = (action: ApprovalHistoryItem['action']) => {
    switch (action) {
      case 'approved':
        return 'bg-success-100';
      case 'rejected':
        return 'bg-red-100';
      case 'submitted':
        return 'bg-gray-100';
    }
  };

  const getActionText = (action: ApprovalHistoryItem['action']) => {
    switch (action) {
      case 'approved':
        return '已通过';
      case 'rejected':
        return '已驳回';
      case 'submitted':
        return '已提交';
    }
  };

  const getLineColor = (action: ApprovalHistoryItem['action']) => {
    switch (action) {
      case 'approved':
        return 'bg-success-300';
      case 'rejected':
        return 'bg-red-300';
      case 'submitted':
        return 'bg-gray-300';
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <div className="flex items-center gap-2 mb-3">
        <History className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-700">审批历史</span>
      </div>
      <div className="relative pl-6">
        {history.map((item, index) => (
          <div key={index} className="relative pb-4 last:pb-0">
            {index < history.length - 1 && (
              <div
                className={`absolute left-[-1.25rem] top-5 w-0.5 h-full ${getLineColor(item.action)}`}
              />
            )}
            <div
              className={`absolute left-[-1.25rem] top-0 p-1 rounded-full ${getActionBg(item.action)}`}
            >
              {getActionIcon(item.action)}
            </div>
            <div className="ml-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-800">
                  {getActionText(item.action)}
                </span>
                <span className="text-xs text-gray-500">
                  {item.userName}
                </span>
                <span className="text-xs text-gray-400">
                  {formatDateTime(item.time)}
                </span>
              </div>
              {item.notes && (
                <div className="mt-1 flex items-start gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-600">{item.notes}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ApproveModalProps {
  plan: WaterFertilizerPlan | null;
  onClose: () => void;
  onConfirm: (notes: string) => void;
}

function ApproveModal({ plan, onClose, onConfirm }: ApproveModalProps) {
  const [notes, setNotes] = useState('');

  if (!plan) return null;

  const handleConfirm = () => {
    onConfirm(notes);
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slide-up">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-success-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-success-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">通过计划</h3>
              <p className="text-sm text-gray-500">请填写审批意见（可选）</p>
            </div>
          </div>
          <div>
            <label className="input-label">审批意见</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input min-h-[100px]"
              placeholder="请填写审批意见..."
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-100">
          <button onClick={onClose} className="btn-secondary">
            取消
          </button>
          <button
            onClick={handleConfirm}
            className="btn-success"
          >
            确认通过
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PlanApproval() {
  const plans = useAppStore((state) => state.plans);
  const plots = useAppStore((state) => state.plots);
  const currentUser = useAppStore((state) => state.currentUser);
  const approvePlan = useAppStore((state) => state.approvePlan);
  const rejectPlan = useAppStore((state) => state.rejectPlan);
  const getUserNameById = useAppStore((state) => state.getUserNameById);
  const getApprovalHistory = useAppStore((state) => state.getApprovalHistory);
  const [selectedPlan, setSelectedPlan] = useState<WaterFertilizerPlan | null>(null);
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);

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
    setSelectedPlan(plan);
    setShowApproveModal(true);
  };

  const confirmApprove = (notes: string) => {
    if (selectedPlan && currentUser.role === 'manager') {
      approvePlan(selectedPlan.id, currentUser.id, notes || undefined);
      setShowApproveModal(false);
      setSelectedPlan(null);
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
            const history = getApprovalHistory(plan);
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

                  <ApprovalTimeline history={history} />

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <User className="w-4 h-4" />
                      <span>创建人: {getUserNameById(plan.creatorId)}</span>
                      {plan.approverId && (
                        <span className="ml-3">
                          审批人: {getUserNameById(plan.approverId)}
                        </span>
                      )}
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

      {showApproveModal && (
        <ApproveModal
          plan={selectedPlan}
          onClose={() => {
            setShowApproveModal(false);
            setSelectedPlan(null);
          }}
          onConfirm={confirmApprove}
        />
      )}

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
