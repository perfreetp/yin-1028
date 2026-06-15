import { useMemo } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  User,
  Footprints,
  FileCheck,
  XCircle,
  Play,
  Edit3,
  Trash2,
  Send,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { cn } from '@/utils';
import type { Alert, Inspection, WaterFertilizerPlan } from '@/types';

interface TimeRange {
  start: string;
  end: string;
}

interface TraceSummaryProps {
  plotId: string;
  timeRange: TimeRange;
}

type TimelineEventType = 'alert_created' | 'alert_processing' | 'alert_resolved' |
  'inspection_created' | 'inspection_edited' | 'inspection_deleted' |
  'plan_submitted' | 'plan_approved' | 'plan_rejected';

interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  timestamp: string;
  description: string;
  operator: string;
  plotId: string;
  plotName: string;
  category: 'alert' | 'inspection' | 'plan';
  status?: string;
}

const eventConfig: Record<TimelineEventType, {
  icon: typeof AlertTriangle;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  alert_created: {
    icon: AlertTriangle,
    label: '告警产生',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  alert_processing: {
    icon: Play,
    label: '处理中',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  alert_resolved: {
    icon: CheckCircle,
    label: '已解决',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  inspection_created: {
    icon: Footprints,
    label: '巡园打卡',
    color: 'text-primary-600',
    bgColor: 'bg-primary-50',
    borderColor: 'border-primary-200',
  },
  inspection_edited: {
    icon: Edit3,
    label: '编辑记录',
    color: 'text-primary-600',
    bgColor: 'bg-primary-50',
    borderColor: 'border-primary-200',
  },
  inspection_deleted: {
    icon: Trash2,
    label: '撤销记录',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
  },
  plan_submitted: {
    icon: Send,
    label: '提交审批',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  plan_approved: {
    icon: FileCheck,
    label: '审批通过',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  plan_rejected: {
    icon: XCircle,
    label: '审批驳回',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
};

function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${month}-${day} ${hours}:${minutes}`;
}

function isDateInRange(isoString: string, start: string, end: string): boolean {
  const date = new Date(isoString.split('T')[0]);
  const startDate = new Date(start);
  const endDate = new Date(end);
  return date >= startDate && date <= endDate;
}

function getPlotNameById(plotId: string, plots: Array<{ id: string; name: string }>): string {
  const plot = plots.find(p => p.id === plotId);
  return plot?.name || '未知地块';
}

function getUserNameById(userId: string, users: Array<{ id: string; name: string }>): string {
  const user = users.find(u => u.id === userId);
  return user?.name || userId;
}

function buildTimelineEvents(
  alerts: Alert[],
  inspections: Inspection[],
  plans: WaterFertilizerPlan[],
  plots: Array<{ id: string; name: string }>,
  users: Array<{ id: string; name: string }>
): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  alerts.forEach((alert) => {
    const sensor = plots.find(p => alert.deviceId.includes(p.id.replace('plot-', 'sensor-')));
    const alertPlotId = sensor?.id || 'plot-1';

    events.push({
      id: `${alert.id}-created`,
      type: 'alert_created',
      timestamp: alert.timestamp,
      description: alert.message,
      operator: '系统',
      plotId: alertPlotId,
      plotName: getPlotNameById(alertPlotId, plots),
      category: 'alert',
      status: 'unhandled',
    });

    if (alert.status === 'processing' || alert.status === 'resolved') {
      events.push({
        id: `${alert.id}-processing`,
        type: 'alert_processing',
        timestamp: alert.handledAt || alert.timestamp,
        description: alert.handleNotes || '开始处理告警',
        operator: alert.handler || '未知用户',
        plotId: alertPlotId,
        plotName: getPlotNameById(alertPlotId, plots),
        category: 'alert',
        status: 'processing',
      });
    }

    if (alert.status === 'resolved') {
      events.push({
        id: `${alert.id}-resolved`,
        type: 'alert_resolved',
        timestamp: alert.handledAt || alert.timestamp,
        description: alert.handleNotes || '告警已解决',
        operator: alert.handler || '未知用户',
        plotId: alertPlotId,
        plotName: getPlotNameById(alertPlotId, plots),
        category: 'alert',
        status: 'resolved',
      });
    }
  });

  inspections.forEach((inspection) => {
    events.push({
      id: `${inspection.id}-created`,
      type: 'inspection_created',
      timestamp: inspection.time,
      description: inspection.notes || '完成巡园打卡',
      operator: inspection.userName,
      plotId: inspection.plotId,
      plotName: inspection.plotName,
      category: 'inspection',
    });
  });

  plans.forEach((plan) => {
    const plotName = getPlotNameById(plan.plotId, plots);
    const creatorName = getUserNameById(plan.creatorId, users);
    const approverName = plan.approverId ? getUserNameById(plan.approverId, users) : '';

    events.push({
      id: `${plan.id}-submitted`,
      type: 'plan_submitted',
      timestamp: plan.createdAt,
      description: `${plan.type === 'irrigation' ? '灌溉' : plan.type === 'fertilization' ? '施肥' : '水肥'}计划已提交`,
      operator: creatorName,
      plotId: plan.plotId,
      plotName,
      category: 'plan',
      status: 'pending',
    });

    if (plan.approvalStatus === 'approved' && approverName) {
      events.push({
        id: `${plan.id}-approved`,
        type: 'plan_approved',
        timestamp: plan.createdAt,
        description: plan.approvalNotes || '计划已通过审批',
        operator: approverName,
        plotId: plan.plotId,
        plotName,
        category: 'plan',
        status: 'approved',
      });
    }

    if (plan.approvalStatus === 'rejected' && approverName) {
      events.push({
        id: `${plan.id}-rejected`,
        type: 'plan_rejected',
        timestamp: plan.createdAt,
        description: plan.approvalNotes || '计划被驳回',
        operator: approverName,
        plotId: plan.plotId,
        plotName,
        category: 'plan',
        status: 'rejected',
      });
    }
  });

  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export default function TraceSummary({ plotId, timeRange }: TraceSummaryProps) {
  const { alerts, inspections, plans, plots, users } = useAppStore();

  const allEvents = useMemo(() => {
    return buildTimelineEvents(alerts, inspections, plans, plots, users);
  }, [alerts, inspections, plans, plots, users]);

  const filteredEvents = useMemo(() => {
    return allEvents.filter((event) => {
      const plotMatch = plotId === 'all' || event.plotId === plotId;
      const timeMatch = isDateInRange(event.timestamp, timeRange.start, timeRange.end);
      return plotMatch && timeMatch;
    });
  }, [allEvents, plotId, timeRange]);

  const alertStats = useMemo(() => {
    const filteredAlerts = alerts.filter((alert) => {
      const sensor = plots.find(p => alert.deviceId.includes(p.id.replace('plot-', 'sensor-')));
      const alertPlotId = sensor?.id || 'plot-1';
      const plotMatch = plotId === 'all' || alertPlotId === plotId;
      const timeMatch = isDateInRange(alert.timestamp, timeRange.start, timeRange.end);
      return plotMatch && timeMatch;
    });

    return {
      total: filteredAlerts.length,
      unhandled: filteredAlerts.filter(a => a.status === 'unhandled').length,
      processing: filteredAlerts.filter(a => a.status === 'processing').length,
      resolved: filteredAlerts.filter(a => a.status === 'resolved').length,
    };
  }, [alerts, plots, plotId, timeRange]);

  const inspectionStats = useMemo(() => {
    return inspections.filter((inspection) => {
      const plotMatch = plotId === 'all' || inspection.plotId === plotId;
      const timeMatch = isDateInRange(inspection.time, timeRange.start, timeRange.end);
      return plotMatch && timeMatch;
    }).length;
  }, [inspections, plotId, timeRange]);

  const planApprovalStats = useMemo(() => {
    const filteredPlans = plans.filter((plan) => {
      const plotMatch = plotId === 'all' || plan.plotId === plotId;
      const timeMatch = isDateInRange(plan.createdAt, timeRange.start, timeRange.end);
      return plotMatch && timeMatch && plan.approvalStatus !== 'pending';
    });

    return {
      total: filteredPlans.length,
      approved: filteredPlans.filter(p => p.approvalStatus === 'approved').length,
      rejected: filteredPlans.filter(p => p.approvalStatus === 'rejected').length,
    };
  }, [plans, plotId, timeRange]);

  const operatorStats = useMemo(() => {
    const operators = new Set<string>();
    filteredEvents.forEach((event) => {
      if (event.operator && event.operator !== '系统') {
        operators.add(event.operator);
      }
    });
    return operators.size;
  }, [filteredEvents]);

  const statCards = [
    {
      label: '告警总数',
      value: alertStats.total,
      subValues: [
        { label: '未处理', value: alertStats.unhandled, color: 'text-red-600' },
        { label: '处理中', value: alertStats.processing, color: 'text-orange-600' },
        { label: '已解决', value: alertStats.resolved, color: 'text-green-600' },
      ],
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      label: '巡园打卡',
      value: inspectionStats,
      subValues: [],
      icon: Footprints,
      color: 'text-primary-600',
      bg: 'bg-primary-50',
    },
    {
      label: '计划审批',
      value: planApprovalStats.total,
      subValues: [
        { label: '通过', value: planApprovalStats.approved, color: 'text-green-600' },
        { label: '驳回', value: planApprovalStats.rejected, color: 'text-red-600' },
      ],
      icon: FileCheck,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: '操作人次',
      value: operatorStats,
      subValues: [],
      icon: User,
      color: 'text-soil-600',
      bg: 'bg-soil-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="stat-card animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={cn('p-3 rounded-xl', stat.bg)}>
                  <Icon className={cn('w-6 h-6', stat.color)} />
                </div>
              </div>
              <p className="stat-label">{stat.label}</p>
              <p className="stat-value mb-3">{stat.value}</p>
              {stat.subValues.length > 0 && (
                <div className="flex gap-3 flex-wrap">
                  {stat.subValues.map((sub, subIndex) => (
                    <div key={subIndex} className="flex items-center gap-1">
                      <span className={cn('text-sm font-medium', sub.color)}>{sub.value}</span>
                      <span className="text-xs text-gray-500">{sub.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="card p-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">留痕时间轴</h3>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-gray-600">告警</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary-500" />
              <span className="text-gray-600">巡园</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-gray-600">计划审批</span>
            </div>
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">当前筛选条件下暂无留痕记录</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-gray-200" />
            <div className="space-y-2">
              {filteredEvents.map((event, index) => {
                const config = eventConfig[event.type];
                const Icon = config.icon;
                const lineColor = event.category === 'alert'
                  ? 'bg-red-500'
                  : event.category === 'inspection'
                  ? 'bg-primary-500'
                  : 'bg-blue-500';

                return (
                  <div
                    key={event.id}
                    className="relative pl-16 py-3 group animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="absolute left-4 w-5 h-5 rounded-full border-4 border-white shadow-md z-10 flex items-center justify-center bg-white">
                      <div className={cn('w-3 h-3 rounded-full', lineColor)} />
                    </div>

                    <div className={cn(
                      'p-4 rounded-2xl border transition-all duration-300 hover:shadow-md',
                      config.bgColor,
                      config.borderColor
                    )}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={cn('p-1.5 rounded-lg', config.bgColor)}>
                            <Icon className={cn('w-4 h-4', config.color)} />
                          </div>
                          <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', config.bgColor, config.color)}>
                            {config.label}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 font-mono">
                          {formatDateTime(event.timestamp)}
                        </span>
                      </div>

                      <p className="text-sm text-gray-800 mb-2 leading-relaxed">
                        {event.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          <span>{event.operator}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{event.plotName}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
