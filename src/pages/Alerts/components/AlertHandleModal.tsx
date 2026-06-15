import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Clock, CheckCircle, User, Calendar, FileText, Save } from 'lucide-react';
import { useAppStore } from '@/store';
import {
  formatDateTime,
  getAlertTypeText,
  getStatusColor,
  getStatusText,
  cn,
} from '@/utils';
import type { Alert } from '@/types';

interface AlertHandleModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert: Alert | null;
}

export const AlertHandleModal: React.FC<AlertHandleModalProps> = ({
  isOpen,
  onClose,
  alert,
}) => {
  const { handleAlert, resolveAlert, currentUser } = useAppStore();
  const [handleNotes, setHandleNotes] = useState('');
  const [newStatus, setNewStatus] = useState<'processing' | 'resolved'>('processing');

  useEffect(() => {
    if (alert) {
      setHandleNotes(alert.handleNotes || '');
      setNewStatus(alert.status === 'unhandled' ? 'processing' : 'resolved');
    }
  }, [alert]);

  const getLevelColor = (level: string) => {
    const colorMap: Record<string, string> = {
      danger: 'bg-red-100 text-red-700 border-red-200',
      warning: 'bg-orange-100 text-orange-700 border-orange-200',
      info: 'bg-blue-100 text-blue-700 border-blue-200',
    };
    return colorMap[level] || 'bg-gray-100 text-gray-700';
  };

  const getLevelText = (level: string) => {
    const textMap: Record<string, string> = {
      danger: '危险',
      warning: '警告',
      info: '提示',
    };
    return textMap[level] || level;
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'danger':
        return <AlertTriangle className="w-6 h-6 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-orange-500" />;
      case 'info':
        return <AlertTriangle className="w-6 h-6 text-blue-500" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-gray-500" />;
    }
  };

  const handleSubmit = () => {
    if (!alert) return;

    if (newStatus === 'processing') {
      handleAlert(alert.id, currentUser.name, handleNotes);
    } else {
      resolveAlert(alert.id, handleNotes);
    }

    onClose();
  };

  if (!isOpen || !alert) return null;

  const isResolved = alert.status === 'resolved';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slide-up">
        <div
          className={cn(
            'px-6 py-5 border-b',
            alert.level === 'danger' && 'bg-red-50 border-red-100',
            alert.level === 'warning' && 'bg-orange-50 border-orange-100',
            alert.level === 'info' && 'bg-blue-50 border-blue-100'
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getLevelIcon(alert.level)}
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {isResolved ? '查看告警' : '处理告警'}
                </h2>
                <p className="text-sm text-gray-500">
                  {getAlertTypeText(alert.type)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-white transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3">
              <span
                className={cn(
                  'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border',
                  getLevelColor(alert.level)
                )}
              >
                {getLevelText(alert.level)}
              </span>
              <span
                className={cn(
                  'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
                  getStatusColor(alert.status)
                )}
              >
                {getStatusText(alert.status)}
              </span>
            </div>

            <div className="bg-gray-50 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">告警信息</h3>
              <p className="text-gray-600">{alert.message}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <Calendar className="w-4 h-4" />
                  告警时间
                </div>
                <p className="font-medium text-gray-700">
                  {formatDateTime(alert.timestamp)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  告警类型
                </div>
                <p className="font-medium text-gray-700">
                  {getAlertTypeText(alert.type)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <FileText className="w-4 h-4" />
                  关联设备
                </div>
                <p className="font-medium text-gray-700">{alert.deviceName}</p>
                <p className="text-xs text-gray-400">ID: {alert.deviceId}</p>
              </div>
              {alert.handler && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <User className="w-4 h-4" />
                    处理人
                  </div>
                  <p className="font-medium text-gray-700">{alert.handler}</p>
                  {alert.handledAt && (
                    <p className="text-xs text-gray-400">
                      {formatDateTime(alert.handledAt)}
                    </p>
                  )}
                </div>
              )}
            </div>

            {alert.handleNotes && (
              <div className="bg-primary-50 rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-primary-700 mb-2">
                  处理备注
                </h3>
                <p className="text-primary-600">{alert.handleNotes}</p>
              </div>
            )}

            {!isResolved && (
              <div className="space-y-4 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-2" />
                    处理状态
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setNewStatus('processing')}
                      className={cn(
                        'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-200',
                        newStatus === 'processing'
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      )}
                    >
                      <Clock className="w-5 h-5" />
                      处理中
                    </button>
                    <button
                      onClick={() => setNewStatus('resolved')}
                      className={cn(
                        'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-200',
                        newStatus === 'resolved'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      )}
                    >
                      <CheckCircle className="w-5 h-5" />
                      已解决
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4 inline mr-2" />
                    处理备注
                  </label>
                  <textarea
                    value={handleNotes}
                    onChange={(e) => setHandleNotes(e.target.value)}
                    placeholder="请填写处理备注说明..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 resize-none"
                    rows={4}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {!isResolved && (
          <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={!handleNotes.trim()}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-primary-600/25"
            >
              <Save className="w-4 h-4" />
              确认提交
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
