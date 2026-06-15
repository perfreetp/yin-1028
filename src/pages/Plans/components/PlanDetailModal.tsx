import { useState } from 'react';
import { useAppStore } from '@/store';
import { getStatusColor, getStatusText, getPlotById, formatDateTime } from '@/utils';
import type { WaterFertilizerPlan, ApprovalHistoryItem } from '@/types';
import { X, Droplets, Leaf, Droplet, Calendar, Clock, User, CheckCircle, XCircle, History, MessageSquare, Check } from 'lucide-react';

interface PlanDetailModalProps {
  plan: WaterFertilizerPlan | null;
  onClose: () => void;
}

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
    <div className="mt-2">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-700">审批历史</span>
      </div>
      <div className="relative pl-6">
        {history.map((item, index) => (
          <div key={index} className="relative pb-5 last:pb-0">
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
                <div className="mt-1.5 flex items-start gap-1.5">
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

interface RejectModalProps {
  plan: WaterFertilizerPlan | null;
  onClose: () => void;
  onConfirm: (notes: string) => void;
}

function RejectModal({ plan, onClose, onConfirm }: RejectModalProps) {
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
            <div className="p-3 bg-red-100 rounded-full">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">拒绝计划</h3>
              <p className="text-sm text-gray-500">请填写拒绝原因</p>
            </div>
          </div>
          <div>
            <label className="input-label">拒绝原因</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input min-h-[100px]"
              placeholder="请详细说明拒绝该计划的原因..."
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-100">
          <button onClick={onClose} className="btn-secondary">
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={!notes.trim()}
            className="btn-danger disabled:opacity-50 disabled:cursor-not-allowed"
          >
            确认拒绝
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PlanDetailModal({ plan, onClose }: PlanDetailModalProps) {
  const plots = useAppStore((state) => state.plots);
  const currentUser = useAppStore((state) => state.currentUser);
  const approvePlan = useAppStore((state) => state.approvePlan);
  const rejectPlan = useAppStore((state) => state.rejectPlan);
  const getUserNameById = useAppStore((state) => state.getUserNameById);
  const getApprovalHistory = useAppStore((state) => state.getApprovalHistory);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  if (!plan) return null;

  const plot = getPlotById(plots, plan.plotId);
  const history = getApprovalHistory(plan);
  const isManager = currentUser.role === 'manager';
  const canApprove = plan.approvalStatus === 'pending' && isManager;

  const getTypeIcon = (type: WaterFertilizerPlan['type']) => {
    switch (type) {
      case 'irrigation':
        return <Droplets className="w-5 h-5" />;
      case 'fertilization':
        return <Leaf className="w-5 h-5" />;
      case 'both':
        return <Droplet className="w-5 h-5" />;
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

  const handleApprove = () => {
    setShowApproveModal(true);
  };

  const confirmApprove = (notes: string) => {
    approvePlan(plan.id, currentUser.id, notes || undefined);
    setShowApproveModal(false);
  };

  const handleReject = () => {
    setShowRejectModal(true);
  };

  const confirmReject = (notes: string) => {
    rejectPlan(plan.id, currentUser.id, notes);
    setShowRejectModal(false);
  };

  const lastApproval = history.length > 1 ? history[history.length - 1] : null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slide-up">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${getTypeColor(plan.type).replace('text-', 'bg-').replace('700', '100')}`}>
                {getTypeIcon(plan.type)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {plot?.name || '未知地块'} - {getTypeText(plan.type)}计划详情
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`badge ${getStatusColor(plan.approvalStatus)}`}>
                    {getStatusText(plan.approvalStatus)}
                  </span>
                  <span className={`badge ${getStatusColor(plan.status)}`}>
                    {getStatusText(plan.status)}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-400 mb-2">计划时间</p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    {formatDateTime(plan.scheduleTime)}
                  </span>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-400 mb-2">持续时间</p>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    {plan.duration} 分钟
                  </span>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-400 mb-2">水量</p>
                <div className="text-lg font-semibold text-gray-800">
                  {plan.waterAmount} <span className="text-sm font-normal text-gray-500">m³</span>
                </div>
              </div>
              {plan.fertilizerAmount > 0 && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-400 mb-2">肥量</p>
                  <div className="text-lg font-semibold text-gray-800">
                    {plan.fertilizerAmount} <span className="text-sm font-normal text-gray-500">kg</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-6">
              <p className="text-xs text-gray-400 mb-2">创建信息</p>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700">
                  创建人: <span className="font-medium">{getUserNameById(plan.creatorId)}</span>
                </span>
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-gray-500">
                  {formatDateTime(plan.createdAt)}
                </span>
              </div>
              {lastApproval && lastApproval.action !== 'submitted' && (
                <div className="flex items-center gap-2 mt-2">
                  <Check className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">
                    审批人: <span className="font-medium">{lastApproval.userName}</span>
                  </span>
                  <span className="text-xs text-gray-400">·</span>
                  <span className="text-xs text-gray-500">
                    {formatDateTime(lastApproval.time)}
                  </span>
                </div>
              )}
            </div>

            {plan.formula && (
              <div className="mb-6 p-4 bg-primary-50 rounded-xl">
                <p className="text-xs text-primary-600 mb-2">配方信息</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">氮</p>
                    <p className="text-sm font-medium text-gray-800">{plan.formula.nitrogen}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">磷</p>
                    <p className="text-sm font-medium text-gray-800">{plan.formula.phosphorus}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">钾</p>
                    <p className="text-sm font-medium text-gray-800">{plan.formula.potassium}%</p>
                  </div>
                </div>
              </div>
            )}

            <ApprovalTimeline history={history} />
          </div>

          {canApprove && (
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <button onClick={onClose} className="btn-secondary">
                关闭
              </button>
              <button onClick={handleReject} className="btn-danger">
                <XCircle className="w-4 h-4" />
                拒绝
              </button>
              <button onClick={handleApprove} className="btn-success">
                <CheckCircle className="w-4 h-4" />
                通过
              </button>
            </div>
          )}

          {!canApprove && (
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <button onClick={onClose} className="btn-primary">
                关闭
              </button>
            </div>
          )}
        </div>
      </div>

      {showApproveModal && (
        <ApproveModal
          plan={plan}
          onClose={() => setShowApproveModal(false)}
          onConfirm={confirmApprove}
        />
      )}

      {showRejectModal && (
        <RejectModal
          plan={plan}
          onClose={() => setShowRejectModal(false)}
          onConfirm={confirmReject}
        />
      )}
    </>
  );
}
