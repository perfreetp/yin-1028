import { useEffect, useMemo, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Polygon,
  Marker,
  Popup,
  Tooltip,
} from 'react-leaflet';
import L from 'leaflet';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  Droplets,
  Wind,
  CloudRain,
  Sun,
  AlertTriangle,
  Clock,
  PlayCircle,
  Layers,
  MonitorSmartphone,
  Ruler,
  TrendingUp,
} from 'lucide-react';
import { useAppStore } from '@/store';
import {
  cn,
  formatNumber,
  formatDate,
  getStatusColor,
  getStatusText,
  getWeatherIcon,
  formatTime,
} from '@/utils';

const markerIcon = L.divIcon({
  className: 'custom-marker',
  html: '<div class="w-3 h-3 bg-primary-600 rounded-full border-2 border-white shadow-lg"></div>',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

const valveIcon = L.divIcon({
  className: 'valve-marker',
  html: '<div class="w-4 h-4 bg-sky-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center"><div class="w-1.5 h-1.5 bg-white rounded-full"></div></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const sensorIcon = L.divIcon({
  className: 'sensor-marker',
  html: '<div class="w-4 h-4 bg-soil-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center"><div class="w-1.5 h-1.5 bg-white rounded-full"></div></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export default function Dashboard() {
  const {
    dashboardStats,
    plots,
    sensors,
    weatherData,
    weatherForecast,
    currentUser,
  } = useAppStore();

  const mapRef = useRef<HTMLDivElement>(null);

  const getPlotColor = (status: string) => {
    switch (status) {
      case 'normal':
        return { fillColor: '#27AE60', color: '#16a34a' };
      case 'drought':
        return { fillColor: '#E67E22', color: '#ea580c' };
      case 'diseased':
        return { fillColor: '#EF4444', color: '#dc2626' };
      default:
        return { fillColor: '#6B7280', color: '#4B5563' };
    }
  };

  const currentWeather = useMemo(() => {
    if (weatherData.length === 0) return null;
    return weatherData[weatherData.length - 1];
  }, [weatherData]);

  const chartData = useMemo(() => {
    return weatherData.slice(-12).map((d) => ({
      time: formatTime(d.timestamp),
      温度: d.temperature,
      湿度: d.humidity,
      降雨量: d.rainfall,
    }));
  }, [weatherData]);

  const forecastChartData = useMemo(() => {
    return weatherForecast.map((d) => ({
      date: d.date.slice(5),
      最高温: d.highTemp,
      最低温: d.lowTemp,
      降雨量: d.rainfall,
    }));
  }, [weatherForecast]);

  const statCards = [
    {
      title: '总面积',
      value: dashboardStats.totalArea,
      unit: '亩',
      icon: Ruler,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
    },
    {
      title: '地块数量',
      value: dashboardStats.plotCount,
      unit: '块',
      icon: Layers,
      color: 'text-soil-600',
      bgColor: 'bg-soil-50',
    },
    {
      title: '在线设备',
      value: `${dashboardStats.onlineDevices}/${dashboardStats.totalDevices}`,
      unit: '台',
      icon: MonitorSmartphone,
      color: 'text-sky-600',
      bgColor: 'bg-sky-50',
    },
    {
      title: '今日灌溉量',
      value: dashboardStats.todayIrrigation,
      unit: 'm³',
      icon: Droplets,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: '今日告警',
      value: dashboardStats.todayAlerts,
      unit: '条',
      icon: AlertTriangle,
      color: 'text-warning-600',
      bgColor: 'bg-warning-50',
    },
    {
      title: '待审批计划',
      value: dashboardStats.pendingPlans,
      unit: '个',
      icon: Clock,
      color: 'text-soil-600',
      bgColor: 'bg-soil-50',
    },
    {
      title: '执行中任务',
      value: dashboardStats.activeTasks,
      unit: '个',
      icon: PlayCircle,
      color: 'text-success-600',
      bgColor: 'bg-success-50',
    },
    {
      title: '设备在线率',
      value: formatNumber((dashboardStats.onlineDevices / dashboardStats.totalDevices) * 100),
      unit: '%',
      icon: TrendingUp,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
    },
  ];

  const mapCenter = useMemo(() => {
    if (plots.length === 0) return [34.0522, 108.9423] as [number, number];
    const allCoords = plots.flatMap((p) => p.boundary);
    const avgLat = allCoords.reduce((sum, c) => sum + c.lat, 0) / allCoords.length;
    const avgLng = allCoords.reduce((sum, c) => sum + c.lng, 0) / allCoords.length;
    return [avgLat, avgLng] as [number, number];
  }, [plots]);

  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="font-serif text-3xl font-bold text-gray-800 mb-2">园区总览</h1>
          <p className="text-gray-500">
            欢迎回来，{currentUser.name} | {formatDate(new Date())}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((card, index) => (
            <div
              key={index}
              className="stat-card animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="stat-label">{card.title}</p>
                  <p className="stat-value">
                    {card.value}
                    <span className="text-base font-normal text-gray-400 ml-1">
                      {card.unit}
                    </span>
                  </p>
                </div>
                <div className={cn('p-3 rounded-xl', card.bgColor)}>
                  <card.icon className={cn('w-6 h-6', card.color)} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-1">
            <div className="card p-5 h-full">
              <h2 className="font-serif text-xl font-semibold text-gray-800 mb-4">
                实时气象
              </h2>
              {currentWeather && (
                <div className="space-y-4">
                  <div className="text-center py-4">
                    <div className="text-6xl mb-2">☀️</div>
                    <p className="font-serif text-4xl font-bold text-gray-800">
                      {formatNumber(currentWeather.temperature)}°C
                    </p>
                    <p className="text-gray-500">晴朗</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-sky-50 p-3 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <Droplets className="w-4 h-4 text-sky-600" />
                        <span className="text-sm text-gray-600">湿度</span>
                      </div>
                      <p className="font-serif text-xl font-bold text-gray-800">
                        {formatNumber(currentWeather.humidity)}%
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <Wind className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-600">风速</span>
                      </div>
                      <p className="font-serif text-xl font-bold text-gray-800">
                        {formatNumber(currentWeather.windSpeed)} m/s
                      </p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <CloudRain className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-gray-600">降雨量</span>
                      </div>
                      <p className="font-serif text-xl font-bold text-gray-800">
                        {formatNumber(currentWeather.rainfall)} mm
                      </p>
                    </div>
                    <div className="bg-warning-50 p-3 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <Sun className="w-4 h-4 text-warning-600" />
                        <span className="text-sm text-gray-600">光照</span>
                      </div>
                      <p className="font-serif text-xl font-bold text-gray-800">
                        {formatNumber(currentWeather.solarRadiation)} W/㎡
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="card p-5 h-full">
              <h2 className="font-serif text-xl font-semibold text-gray-800 mb-4">
                7天天气预报
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecastChartData}>
                    <defs>
                      <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2D5A27" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2D5A27" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                    <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="最高温"
                      stroke="#2D5A27"
                      strokeWidth={2}
                      fill="url(#tempGradient)"
                      name="最高温(°C)"
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="最低温"
                      stroke="#8B6914"
                      strokeWidth={2}
                      dot={{ fill: '#8B6914', r: 4 }}
                      name="最低温(°C)"
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="降雨量"
                      stroke="#4A90D9"
                      strokeWidth={2}
                      fill="#4A90D9"
                      fillOpacity={0.2}
                      name="降雨量(mm)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-7 gap-2 mt-4">
                {weatherForecast.map((day, index) => (
                  <div key={index} className="text-center p-2 rounded-xl hover:bg-gray-50 transition-colors">
                    <p className="text-xs text-gray-500 mb-1">
                      {index === 0 ? '今天' : new Date(day.date).toLocaleDateString('zh-CN', { weekday: 'short' })}
                    </p>
                    <div className="text-2xl mb-1">{getWeatherIcon(day.condition)}</div>
                    <p className="text-sm font-medium text-gray-800">
                      {day.highTemp}°
                    </p>
                    <p className="text-xs text-gray-400">{day.lowTemp}°</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-xl font-semibold text-gray-800">
                  园区地图概览
                </h2>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-success-500"></div>
                    <span className="text-sm text-gray-500">正常</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-warning-500"></div>
                    <span className="text-sm text-gray-500">干旱</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm text-gray-500">病虫害</span>
                  </div>
                </div>
              </div>
              <div ref={mapRef} className="h-96 rounded-xl overflow-hidden">
                <MapContainer
                  center={mapCenter}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {plots.map((plot) => {
                    const colors = getPlotColor(plot.status);
                    return (
                      <Polygon
                        key={plot.id}
                        positions={plot.boundary.map((p) => [p.lat, p.lng])}
                        pathOptions={{
                          fillColor: colors.fillColor,
                          color: colors.color,
                          weight: 2,
                          fillOpacity: 0.4,
                          opacity: 0.8,
                        }}
                      >
                        <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                          <div className="text-sm">
                            <p className="font-semibold">{plot.name}</p>
                            <p className="text-gray-500">{plot.cropType}</p>
                            <p className="text-gray-500">{plot.area}亩</p>
                            <span
                              className={cn(
                                'inline-block mt-1 px-2 py-0.5 rounded-full text-xs',
                                getStatusColor(plot.status)
                              )}
                            >
                              {getStatusText(plot.status)}
                            </span>
                          </div>
                        </Tooltip>
                        <Popup>
                          <div className="text-sm">
                            <h3 className="font-serif font-bold text-lg mb-2">
                              {plot.name}
                            </h3>
                            <p className="text-gray-600 mb-1">
                              <span className="font-medium">作物：</span>
                              {plot.cropType}
                            </p>
                            <p className="text-gray-600 mb-1">
                              <span className="font-medium">面积：</span>
                              {plot.area}亩
                            </p>
                            <p className="text-gray-600 mb-1">
                              <span className="font-medium">土壤：</span>
                              {plot.soilType}
                            </p>
                            <p className="text-gray-600 mb-2">
                              <span className="font-medium">种植日期：</span>
                              {formatDate(plot.plantDate)}
                            </p>
                            <span
                              className={cn(
                                'inline-block px-2 py-0.5 rounded-full text-xs',
                                getStatusColor(plot.status)
                              )}
                            >
                              {getStatusText(plot.status)}
                            </span>
                          </div>
                        </Popup>
                      </Polygon>
                    );
                  })}
                  {sensors.map((sensor) => {
                    const icon =
                      sensor.type === 'valve'
                        ? valveIcon
                        : sensor.type === 'soil_moisture'
                        ? sensorIcon
                        : markerIcon;
                    return (
                      <Marker
                        key={sensor.id}
                        position={[sensor.lat, sensor.lng]}
                        icon={icon}
                      >
                        <Popup>
                          <div className="text-sm">
                            <h3 className="font-semibold mb-1">{sensor.name}</h3>
                            <p className="text-gray-500 mb-1">
                              状态：
                              <span
                                className={cn(
                                  'px-1.5 py-0.5 rounded text-xs ml-1',
                                  getStatusColor(sensor.status)
                                )}
                              >
                                {getStatusText(sensor.status)}
                              </span>
                            </p>
                            {sensor.lastData && (
                              <div className="mt-2 space-y-1">
                                {sensor.lastData.moisture !== undefined && (
                                  <p className="text-gray-600">
                                    湿度：{formatNumber(sensor.lastData.moisture)}%
                                  </p>
                                )}
                                {sensor.lastData.temperature !== undefined && (
                                  <p className="text-gray-600">
                                    温度：{formatNumber(sensor.lastData.temperature)}°C
                                  </p>
                                )}
                                {sensor.lastData.valveStatus !== undefined && (
                                  <p className="text-gray-600">
                                    阀门：{sensor.lastData.valveStatus === 'open' ? '开启' : '关闭'}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-5">
              <h2 className="font-serif text-xl font-semibold text-gray-800 mb-4">
                温湿度趋势
              </h2>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#9CA3AF" />
                    <YAxis tick={{ fontSize: 10 }} stroke="#9CA3AF" />
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="温度"
                      stroke="#E67E22"
                      strokeWidth={2}
                      dot={false}
                      name="温度(°C)"
                    />
                    <Line
                      type="monotone"
                      dataKey="湿度"
                      stroke="#4A90D9"
                      strokeWidth={2}
                      dot={false}
                      name="湿度(%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card p-5">
              <h2 className="font-serif text-xl font-semibold text-gray-800 mb-4">
                地块状态统计
              </h2>
              <div className="space-y-3">
                {plots.map((plot) => {
                  const colors = getPlotColor(plot.status);
                  return (
                    <div
                      key={plot.id}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: colors.fillColor }}
                        ></div>
                        <div>
                          <p className="font-medium text-gray-800">{plot.name}</p>
                          <p className="text-xs text-gray-500">{plot.cropType}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800">{plot.area}亩</p>
                        <span
                          className={cn(
                            'inline-block px-2 py-0.5 rounded-full text-xs',
                            getStatusColor(plot.status)
                          )}
                        >
                          {getStatusText(plot.status)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
