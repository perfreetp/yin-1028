import { Gauge } from 'lucide-react';
import DeviceOverview from './components/DeviceOverview';
import SensorTable from './components/SensorTable';
import SoilMonitorChart from './components/SoilMonitorChart';
import PipelineStatus from './components/PipelineStatus';

export default function Sensors() {
  return (
    <div className="p-6">
      <div className="mb-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 rounded-xl">
            <Gauge className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">传感器监测</h1>
            <p className="text-sm text-gray-500 mt-1">实时监控所有传感器设备状态和数据</p>
          </div>
        </div>
      </div>

      <DeviceOverview />
      <SensorTable />
      <SoilMonitorChart />
      <PipelineStatus />
    </div>
  );
}
