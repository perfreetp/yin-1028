import { useAppStore } from '@/store';
import { getStatusColor, getStatusText, formatNumber } from '@/utils';
import { Gauge, Waves, Settings, AlertTriangle } from 'lucide-react';

export default function PipelineStatus() {
  const pipelines = useAppStore((state) => state.pipelines);

  const mainPipelines = pipelines.filter((p) => p.type === 'main');
  const branchPipelines = pipelines.filter((p) => p.type === 'branch');

  const renderPipelineCard = (pipeline: typeof pipelines[0], index: number) => (
    <div
      key={pipeline.id}
      className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 card-hover animate-slide-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-semibold text-gray-800">{pipeline.name}</h4>
          <span className={`badge ${getStatusColor(pipeline.status)} mt-1 inline-block`}>
            {getStatusText(pipeline.status)}
          </span>
        </div>
        <div className={`p-2 rounded-xl ${pipeline.type === 'main' ? 'bg-primary-50' : 'bg-sky-50'}`}>
          <Settings className={`w-5 h-5 ${pipeline.type === 'main' ? 'text-primary-600' : 'text-sky-600'}`} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50">
            <Gauge className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-500">水压</span>
              <span className="text-sm font-semibold text-gray-800">
                {formatNumber(pipeline.pressure)} MPa
              </span>
            </div>
            <div className="progress-bar h-1.5">
              <div
                className={`progress-fill ${pipeline.pressure < 0.25 ? 'bg-warning-500' : 'bg-blue-500'}`}
                style={{ width: `${Math.min(100, (pipeline.pressure / 0.5) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0</span>
              <span className={pipeline.pressure < 0.25 ? 'text-warning-500' : 'text-success-500'}>
                {pipeline.pressure < 0.25 ? '偏低' : '正常'}
              </span>
              <span>0.5</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-50">
            <Waves className="w-4 h-4 text-sky-500" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-500">流量</span>
              <span className="text-sm font-semibold text-gray-800">
                {formatNumber(pipeline.flowRate)} m³/h
              </span>
            </div>
            <div className="progress-bar h-1.5">
              <div
                className={`progress-fill ${pipeline.flowRate === 0 ? 'bg-gray-400' : 'bg-sky-500'}`}
                style={{ width: `${Math.min(100, (pipeline.flowRate / 20) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0</span>
              <span className={pipeline.flowRate === 0 ? 'text-gray-500' : 'text-success-500'}>
                {pipeline.flowRate === 0 ? '停止' : '运行中'}
              </span>
              <span>20</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Settings className="w-3.5 h-3.5" />
          <span>阀门数量: {pipeline.valveCount} 个</span>
        </div>
        {pipeline.status !== 'normal' && (
          <div className="flex items-center gap-1 text-xs text-warning-500">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>需要关注</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="card mb-6">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">管路状态</h3>
          <p className="text-sm text-gray-500 mt-1">实时监测主管路和支管路运行状态</p>
        </div>

        <div className="p-4">
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary-500" />
              主管路
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mainPipelines.map((pipeline, index) => renderPipelineCard(pipeline, index))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-sky-500" />
              支管路
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {branchPipelines.map((pipeline, index) => renderPipelineCard(pipeline, index))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
