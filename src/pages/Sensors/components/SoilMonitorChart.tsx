import { useState } from 'react';
import { useAppStore } from '@/store';
import { formatTime, formatNumber } from '@/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Droplets, Thermometer, Activity } from 'lucide-react';

export default function SoilMonitorChart() {
  const sensorHistoryData = useAppStore((state) => state.sensorHistoryData);
  const [selectedSensor, setSelectedSensor] = useState('sensor-1');

  const sensorIds = Object.keys(sensorHistoryData);

  const chartData = sensorHistoryData[selectedSensor]?.map((data) => ({
    time: formatTime(data.timestamp),
    湿度: data.moisture ? Number(formatNumber(data.moisture)) : 0,
    温度: data.temperature ? Number(formatNumber(data.temperature)) : 0,
    EC值: data.ecValue ? Number(formatNumber(data.ecValue)) : 0,
  })) || [];

  const latestData = sensorHistoryData[selectedSensor]?.[sensorHistoryData[selectedSensor].length - 1];

  const metrics = [
    {
      label: '土壤湿度',
      value: latestData?.moisture ? formatNumber(latestData.moisture) : '--',
      unit: '%',
      icon: Droplets,
      color: '#4A90D9',
      normalRange: '20-40%',
    },
    {
      label: '土壤温度',
      value: latestData?.temperature ? formatNumber(latestData.temperature) : '--',
      unit: '°C',
      icon: Thermometer,
      color: '#E67E22',
      normalRange: '15-28°C',
    },
    {
      label: 'EC值',
      value: latestData?.ecValue ? formatNumber(latestData.ecValue) : '--',
      unit: 'mS/cm',
      icon: Activity,
      color: '#2D5A27',
      normalRange: '1.0-2.5',
    },
  ];

  return (
    <div className="card mb-6 animate-fade-in">
      <div className="p-4 border-b border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">土壤监测曲线</h3>
            <p className="text-sm text-gray-500 mt-1">24小时土壤环境数据变化</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">选择传感器：</span>
            <select
              value={selectedSensor}
              onChange={(e) => setSelectedSensor(e.target.value)}
              className="input w-auto"
            >
              {sensorIds.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-4 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${metric.color}15` }}>
                    <Icon className="w-5 h-5" style={{ color: metric.color }} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{metric.label}</p>
                    <p className="text-2xl font-bold" style={{ color: metric.color }}>
                      {metric.value}
                      <span className="text-sm font-normal text-gray-500 ml-1">{metric.unit}</span>
                    </p>
                    <p className="text-xs text-gray-400">正常范围：{metric.normalRange}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="time"
                stroke="#9CA3AF"
                fontSize={12}
                tick={{ fill: '#9CA3AF' }}
                tickLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis
                stroke="#9CA3AF"
                fontSize={12}
                tick={{ fill: '#9CA3AF' }}
                tickLine={{ stroke: '#E5E7EB' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                labelStyle={{ color: '#374151', fontWeight: 600 }}
              />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
              <Line
                type="monotone"
                dataKey="湿度"
                stroke="#4A90D9"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="温度"
                stroke="#E67E22"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="EC值"
                stroke="#2D5A27"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
