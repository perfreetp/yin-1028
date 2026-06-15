import { useAppStore } from '@/store';
import { getStatusColor, getStatusText, getSensorTypeText, getPlotById } from '@/utils';
import { Battery, Wifi, MoreHorizontal } from 'lucide-react';

export default function SensorTable() {
  const sensors = useAppStore((state) => state.sensors);
  const plots = useAppStore((state) => state.plots);

  const getBatteryColor = (battery: number) => {
    if (battery === 0) return 'text-gray-400';
    if (battery < 20) return 'text-red-500';
    if (battery < 50) return 'text-warning-500';
    return 'text-success-500';
  };

  const getSignalColor = (signal: number) => {
    if (signal === 0) return 'text-gray-400';
    if (signal < 40) return 'text-red-500';
    if (signal < 70) return 'text-warning-500';
    return 'text-success-500';
  };

  return (
    <div className="card mb-6 animate-fade-in">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800">设备列表</h3>
        <p className="text-sm text-gray-500 mt-1">共 {sensors.length} 个传感器设备</p>
      </div>
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>设备名称</th>
              <th>类型</th>
              <th>所属地块</th>
              <th>状态</th>
              <th>电量</th>
              <th>信号强度</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {sensors.map((sensor, index) => {
              const plot = getPlotById(plots, sensor.plotId);
              return (
                <tr key={sensor.id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                  <td>
                    <div className="font-medium text-gray-800">{sensor.name}</div>
                    <div className="text-xs text-gray-400">{sensor.id}</div>
                  </td>
                  <td>
                    <span className="text-sm text-gray-600">{getSensorTypeText(sensor.type)}</span>
                  </td>
                  <td>
                    <span className="text-sm text-gray-600">{plot?.name || '未知'}</span>
                  </td>
                  <td>
                    <span className={`badge ${getStatusColor(sensor.status)}`}>
                      {getStatusText(sensor.status)}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Battery className={`w-4 h-4 ${getBatteryColor(sensor.battery)}`} />
                      <div className="flex-1 max-w-20">
                        <div className="flex justify-between text-xs mb-1">
                          <span className={getBatteryColor(sensor.battery)}>{sensor.battery}%</span>
                        </div>
                        <div className="progress-bar h-1.5">
                          <div
                            className={`progress-fill ${getBatteryColor(sensor.battery).replace('text-', 'bg-')}`}
                            style={{ width: `${sensor.battery}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Wifi className={`w-4 h-4 ${getSignalColor(sensor.signal)}`} />
                      <div className="flex-1 max-w-20">
                        <div className="flex justify-between text-xs mb-1">
                          <span className={getSignalColor(sensor.signal)}>{sensor.signal}%</span>
                        </div>
                        <div className="progress-bar h-1.5">
                          <div
                            className={`progress-fill ${getSignalColor(sensor.signal).replace('text-', 'bg-')}`}
                            style={{ width: `${sensor.signal}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreHorizontal className="w-4 h-4 text-gray-500" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
