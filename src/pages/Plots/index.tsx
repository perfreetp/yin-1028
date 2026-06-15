import { useState, useEffect, useMemo, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Polygon,
  Marker,
  Popup,
  Tooltip,
  useMapEvents,
} from 'react-leaflet';
import L, { LatLng } from 'leaflet';
import {
  MapPin,
  Edit3,
  Save,
  X,
  Clock,
  User,
  Map,
  Droplets,
  Leaf,
  Sprout,
  Flower2,
  Apple,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Plus,
  Search,
  Move,
} from 'lucide-react';
import { useAppStore } from '@/store';
import {
  cn,
  formatDate,
  formatDateTime,
  formatNumber,
  getStatusColor,
  getStatusText,
  getFlowerStageText,
  calculatePolygonArea,
  generateId,
  getSensorsByPlotId,
} from '@/utils';
import type { Plot, FlowerPeriod, Inspection } from '@/types';

interface EditablePolygonProps {
  plot: Plot;
  isEditing: boolean;
  onUpdate: (coords: Array<{ lat: number; lng: number }>) => void;
}

function EditablePolygon({ plot, isEditing, onUpdate }: EditablePolygonProps) {
  const [vertices, setVertices] = useState(
    plot.boundary.map((p) => new LatLng(p.lat, p.lng))
  );
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  useEffect(() => {
    setVertices(plot.boundary.map((p) => new LatLng(p.lat, p.lng)));
  }, [plot.id, plot.boundary]);

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

  const colors = getPlotColor(plot.status);

  const handleVertexDrag = (index: number, latlng: LatLng) => {
    const newVertices = [...vertices];
    newVertices[index] = latlng;
    setVertices(newVertices);
    onUpdate(
      newVertices.map((v) => ({ lat: v.lat, lng: v.lng }))
    );
  };

  const markerIcon = L.divIcon({
    className: 'vertex-marker',
    html: '<div class="w-4 h-4 bg-white border-2 border-primary-600 rounded-full shadow-lg cursor-move hover:scale-125 transition-transform"></div>',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  return (
    <>
      <Polygon
        positions={vertices}
        pathOptions={{
          fillColor: colors.fillColor,
          color: isEditing ? '#2D5A27' : colors.color,
          weight: isEditing ? 3 : 2,
          fillOpacity: isEditing ? 0.3 : 0.4,
          opacity: isEditing ? 1 : 0.8,
          dashArray: isEditing ? '10, 5' : undefined,
        }}
      >
        <Tooltip direction="top" offset={[0, -10]} opacity={1}>
          <div className="text-sm">
            <p className="font-semibold">{plot.name}</p>
            <p className="text-gray-500">{plot.cropType}</p>
            <p className="text-gray-500">{plot.area}亩</p>
            {isEditing && (
              <p className="text-primary-600 mt-1 text-xs">拖拽顶点编辑边界</p>
            )}
          </div>
        </Tooltip>
        <Popup>
          <div className="text-sm">
            <h3 className="font-serif font-bold text-lg mb-2">{plot.name}</h3>
            <p className="text-gray-600 mb-1">
              <span className="font-medium">作物：</span>{plot.cropType}
            </p>
            <p className="text-gray-600 mb-1">
              <span className="font-medium">面积：</span>{plot.area}亩
            </p>
            <p className="text-gray-600 mb-1">
              <span className="font-medium">土壤：</span>{plot.soilType}
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
      {isEditing &&
        vertices.map((vertex, index) => (
          <Marker
            key={`vertex-${index}`}
            position={[vertex.lat, vertex.lng]}
            icon={markerIcon}
            draggable={true}
            eventHandlers={{
              dragstart: () => setDraggingIndex(index),
              drag: (e) => {
                if (draggingIndex === index) {
                  const event = e as unknown as { latlng: LatLng };
                  handleVertexDrag(index, event.latlng);
                }
              },
              dragend: () => setDraggingIndex(null),
            }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1}>
              <span className="text-xs">顶点 {index + 1}</span>
            </Tooltip>
          </Marker>
        ))}
    </>
  );
}

function MapClickHandler({
  isAddingVertex,
  onAddVertex,
}: {
  isAddingVertex: boolean;
  onAddVertex: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click: (e) => {
      if (isAddingVertex) {
        onAddVertex(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

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

export default function Plots() {
  const {
    plots,
    sensors,
    flowerPeriods,
    inspections,
    currentUser,
    setSelectedPlot,
    addInspection,
    updatePlot,
    selectedPlot,
  } = useAppStore();

  const [localSelectedPlot, setLocalSelectedPlot] = useState<Plot | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingBoundary, setEditingBoundary] = useState<
    Array<{ lat: number; lng: number }> | null
  >(null);
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [checkinNotes, setCheckinNotes] = useState('');
  const [checkinPlotId, setCheckinPlotId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddingVertex, setIsAddingVertex] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);

  const filteredPlots = useMemo(() => {
    return plots.filter((plot) => {
      const matchesSearch =
        plot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plot.cropType.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' || plot.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [plots, searchTerm, statusFilter]);

  const plotFlowerPeriods = useMemo(() => {
    if (!localSelectedPlot) return [];
    return flowerPeriods
      .filter((fp) => fp.plotId === localSelectedPlot.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [localSelectedPlot, flowerPeriods]);

  const plotInspections = useMemo(() => {
    if (!localSelectedPlot) return [];
    return inspections
      .filter((i) => i.plotId === localSelectedPlot.id)
      .sort(
        (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
      );
  }, [localSelectedPlot, inspections]);

  const plotSensors = useMemo(() => {
    if (!localSelectedPlot) return [];
    return getSensorsByPlotId(sensors, localSelectedPlot.id);
  }, [localSelectedPlot, sensors]);

  const soilMoistureData = useMemo(() => {
    if (!localSelectedPlot) return [];
    const soilSensor = plotSensors.find((s) => s.type === 'soil_moisture');
    if (!soilSensor || !soilSensor.lastData) return [];
    return [
      { name: '湿度', value: soilSensor.lastData.moisture || 0, max: 50 },
      { name: '温度', value: soilSensor.lastData.temperature || 0, max: 40 },
      { name: 'EC值', value: soilSensor.lastData.ecValue || 0, max: 4 },
    ];
  }, [localSelectedPlot, plotSensors]);

  const calculatedArea = useMemo(() => {
    if (!editingBoundary || editingBoundary.length < 3) return 0;
    return calculatePolygonArea(editingBoundary);
  }, [editingBoundary]);

  const mapCenter = useMemo(() => {
    if (localSelectedPlot) {
      const coords = localSelectedPlot.boundary;
      const avgLat = coords.reduce((sum, c) => sum + c.lat, 0) / coords.length;
      const avgLng = coords.reduce((sum, c) => sum + c.lng, 0) / coords.length;
      return [avgLat, avgLng] as [number, number];
    }
    if (plots.length === 0) return [34.0522, 108.9423] as [number, number];
    const allCoords = plots.flatMap((p) => p.boundary);
    const avgLat = allCoords.reduce((sum, c) => sum + c.lat, 0) / allCoords.length;
    const avgLng = allCoords.reduce((sum, c) => sum + c.lng, 0) / allCoords.length;
    return [avgLat, avgLng] as [number, number];
  }, [localSelectedPlot, plots]);

  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    }
  }, [localSelectedPlot, isEditing]);

  useEffect(() => {
    setSelectedPlot(localSelectedPlot);
  }, [localSelectedPlot, setSelectedPlot]);

  const handleRowClick = (plot: Plot) => {
    setLocalSelectedPlot(plot);
    setIsEditing(false);
    setEditingBoundary(null);
    setIsAddingVertex(false);
  };

  const handleStartEdit = () => {
    if (!localSelectedPlot) return;
    setIsEditing(true);
    setEditingBoundary([...localSelectedPlot.boundary]);
  };

  const handleSaveEdit = () => {
    if (!localSelectedPlot || !editingBoundary) return;
    const updatedPlot = {
      ...localSelectedPlot,
      boundary: editingBoundary,
      area: calculatedArea,
    };
    updatePlot(localSelectedPlot.id, {
      boundary: editingBoundary,
      area: calculatedArea,
    });
    setLocalSelectedPlot(updatedPlot);
    setIsEditing(false);
    setEditingBoundary(null);
    setIsAddingVertex(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingBoundary(null);
    setIsAddingVertex(false);
  };

  const handleBoundaryUpdate = (coords: Array<{ lat: number; lng: number }>) => {
    setEditingBoundary(coords);
  };

  const handleAddVertex = (lat: number, lng: number) => {
    if (!editingBoundary) return;
    setEditingBoundary([...editingBoundary, { lat, lng }]);
    setIsAddingVertex(false);
  };

  const handleCheckin = () => {
    if (!checkinPlotId) return;
    const plot = plots.find((p) => p.id === checkinPlotId);
    if (!plot) return;

    const centerLat = plot.boundary.reduce((sum, c) => sum + c.lat, 0) / plot.boundary.length;
    const centerLng = plot.boundary.reduce((sum, c) => sum + c.lng, 0) / plot.boundary.length;

    const newInspection: Inspection = {
      id: generateId(),
      userId: currentUser.id,
      userName: currentUser.name,
      plotId: checkinPlotId,
      plotName: plot.name,
      time: new Date().toISOString(),
      lat: centerLat,
      lng: centerLng,
      notes: checkinNotes,
      photos: [],
      issues: [],
    };

    addInspection(newInspection);
    setShowCheckinModal(false);
    setCheckinNotes('');
    setCheckinPlotId('');
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'germination':
        return Sprout;
      case 'vegetative':
        return Leaf;
      case 'flowering':
        return Flower2;
      case 'fruit_setting':
        return Apple;
      case 'maturation':
        return Apple;
      case 'harvest':
        return CheckCircle2;
      default:
        return Sprout;
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'germination':
        return 'text-green-600 bg-green-100';
      case 'vegetative':
        return 'text-emerald-600 bg-emerald-100';
      case 'flowering':
        return 'text-pink-600 bg-pink-100';
      case 'fruit_setting':
        return 'text-amber-600 bg-amber-100';
      case 'maturation':
        return 'text-orange-600 bg-orange-100';
      case 'harvest':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-serif text-3xl font-bold text-gray-800 mb-2">
              地块管理
            </h1>
            <p className="text-gray-500">
              管理园区内所有地块信息，支持边界编辑和巡园打卡
            </p>
          </div>
          <button
            onClick={() => {
              setShowCheckinModal(true);
              if (localSelectedPlot) {
                setCheckinPlotId(localSelectedPlot.id);
              }
            }}
            className="btn-primary"
          >
            <MapPin className="w-4 h-4" />
            巡园打卡
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-xl font-semibold text-gray-800">
                  地块列表
                </h2>
                <span className="text-sm text-gray-500">
                  共 {filteredPlots.length} 块
                </span>
              </div>

              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索地块名称或作物..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-9"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input w-28"
                >
                  <option value="all">全部</option>
                  <option value="normal">正常</option>
                  <option value="drought">干旱</option>
                  <option value="diseased">病虫害</option>
                </select>
              </div>

              <div className="overflow-x-auto -mx-5 px-5">
                <table className="table">
                  <thead>
                    <tr>
                      <th>名称</th>
                      <th>面积</th>
                      <th>作物</th>
                      <th>土壤</th>
                      <th>种植日期</th>
                      <th>状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPlots.map((plot) => (
                      <tr
                        key={plot.id}
                        onClick={() => handleRowClick(plot)}
                        className={cn(
                          'cursor-pointer transition-colors',
                          localSelectedPlot?.id === plot.id &&
                            'bg-primary-50/50'
                        )}
                      >
                        <td className="font-medium text-gray-800">
                          {plot.name}
                        </td>
                        <td className="text-gray-600">{plot.area}亩</td>
                        <td className="text-gray-600">{plot.cropType}</td>
                        <td className="text-gray-600">{plot.soilType}</td>
                        <td className="text-gray-600">
                          {formatDate(plot.plantDate)}
                        </td>
                        <td>
                          <span
                            className={cn(
                              'badge',
                              getStatusColor(plot.status)
                            )}
                          >
                            {getStatusText(plot.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {localSelectedPlot ? (
              <>
                <div className="card p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="font-serif text-xl font-semibold text-gray-800 mb-1">
                        {localSelectedPlot.name}
                      </h2>
                      <p className="text-gray-500">
                        {localSelectedPlot.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => setIsAddingVertex(!isAddingVertex)}
                            className={cn(
                              'btn-secondary text-sm',
                              isAddingVertex && 'bg-primary-100 text-primary-700'
                            )}
                          >
                            <Plus className="w-4 h-4" />
                            {isAddingVertex ? '取消添加' : '添加顶点'}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="btn-secondary text-sm"
                          >
                            <X className="w-4 h-4" />
                            取消
                          </button>
                          <button
                            onClick={handleSaveEdit}
                            className="btn-primary text-sm"
                          >
                            <Save className="w-4 h-4" />
                            保存
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={handleStartEdit}
                          className="btn-outline text-sm"
                        >
                          <Edit3 className="w-4 h-4" />
                          编辑边界
                        </button>
                      )}
                    </div>
                  </div>

                  {isEditing && editingBoundary && (
                    <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Move className="w-5 h-5 text-primary-600" />
                        <div>
                          <p className="font-medium text-primary-800">
                            编辑模式
                          </p>
                          <p className="text-sm text-primary-600">
                            拖拽顶点调整边界，点击地图添加新顶点
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">计算面积</p>
                        <p className="font-serif text-2xl font-bold text-primary-700">
                          {formatNumber(calculatedArea)} 亩
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-gray-50 p-3 rounded-xl">
                      <p className="text-sm text-gray-500 mb-1">面积</p>
                      <p className="font-serif text-xl font-bold text-gray-800">
                        {formatNumber(
                          isEditing && editingBoundary
                            ? calculatedArea
                            : localSelectedPlot.area
                        )}{' '}
                        亩
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl">
                      <p className="text-sm text-gray-500 mb-1">作物类型</p>
                      <p className="font-serif text-xl font-bold text-gray-800">
                        {localSelectedPlot.cropType}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl">
                      <p className="text-sm text-gray-500 mb-1">土壤类型</p>
                      <p className="font-serif text-xl font-bold text-gray-800">
                        {localSelectedPlot.soilType}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl">
                      <p className="text-sm text-gray-500 mb-1">种植日期</p>
                      <p className="font-serif text-xl font-bold text-gray-800">
                        {formatDate(localSelectedPlot.plantDate)}
                      </p>
                    </div>
                  </div>

                  <div className="h-80 rounded-xl overflow-hidden">
                    <MapContainer
                      center={mapCenter}
                      zoom={isEditing ? 16 : 15}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <MapClickHandler
                        isAddingVertex={isAddingVertex}
                        onAddVertex={handleAddVertex}
                      />
                      <EditablePolygon
                        plot={
                          isEditing && editingBoundary
                            ? { ...localSelectedPlot, boundary: editingBoundary }
                            : localSelectedPlot
                        }
                        isEditing={isEditing}
                        onUpdate={handleBoundaryUpdate}
                      />
                      {plotSensors.map((sensor) => {
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
                                <h3 className="font-semibold mb-1">
                                  {sensor.name}
                                </h3>
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="card p-5">
                    <h3 className="font-serif text-lg font-semibold text-gray-800 mb-4">
                      土壤信息
                    </h3>
                    {soilMoistureData.length > 0 ? (
                      <div className="space-y-4">
                        {soilMoistureData.map((item, index) => (
                          <div key={index}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-gray-600">
                                {item.name}
                              </span>
                              <span className="text-sm font-medium text-gray-800">
                                {formatNumber(item.value)}
                              </span>
                            </div>
                            <div className="progress-bar">
                              <div
                                className="progress-fill"
                                style={{
                                  width: `${Math.min(
                                    (item.value / item.max) * 100,
                                    100
                                  )}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <Droplets className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>暂无土壤数据</p>
                      </div>
                    )}

                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        关联设备
                      </h4>
                      <div className="space-y-2">
                        {plotSensors.map((sensor) => (
                          <div
                            key={sensor.id}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={cn(
                                  'w-2 h-2 rounded-full',
                                  sensor.status === 'online'
                                    ? 'bg-success-500'
                                    : sensor.status === 'offline'
                                    ? 'bg-red-500'
                                    : 'bg-warning-500'
                                )}
                              ></div>
                              <span className="text-sm text-gray-600">
                                {sensor.name}
                              </span>
                            </div>
                            <span
                              className={cn(
                                'text-xs',
                                getStatusColor(sensor.status)
                              )}
                            >
                              {getStatusText(sensor.status)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="card p-5">
                    <h3 className="font-serif text-lg font-semibold text-gray-800 mb-4">
                      花果期记录
                    </h3>
                    {plotFlowerPeriods.length > 0 ? (
                      <div className="relative">
                        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                        <div className="space-y-4 max-h-64 overflow-y-auto scrollbar-thin pr-2">
                          {plotFlowerPeriods.map((period) => {
                            const StageIcon = getStageIcon(period.stage);
                            return (
                              <div
                                key={period.id}
                                className="relative pl-8"
                              >
                                <div
                                  className={cn(
                                    'absolute left-1 top-0 w-5 h-5 rounded-full flex items-center justify-center',
                                    getStageColor(period.stage)
                                  )}
                                >
                                  <StageIcon className="w-3 h-3" />
                                </div>
                                <div className="bg-gray-50 p-3 rounded-xl">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-gray-800">
                                      {getFlowerStageText(period.stage)}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {formatDate(period.date)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    {period.notes}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    记录人：{period.recordedBy}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <Flower2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>暂无花果期记录</p>
                      </div>
                    )}
                  </div>

                  <div className="card p-5">
                    <h3 className="font-serif text-lg font-semibold text-gray-800 mb-4">
                      巡园打卡记录
                    </h3>
                    {plotInspections.length > 0 ? (
                      <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin">
                        {plotInspections.map((inspection) => (
                          <div
                            key={inspection.id}
                            className="bg-gray-50 p-3 rounded-xl"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                  <User className="w-4 h-4 text-primary-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-800">
                                    {inspection.userName}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {formatDateTime(inspection.time)}
                                  </p>
                                </div>
                              </div>
                            </div>
                            {inspection.notes && (
                              <p className="text-sm text-gray-600 mb-2">
                                {inspection.notes}
                              </p>
                            )}
                            {inspection.issues.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {inspection.issues.map((issue, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs"
                                  >
                                    <AlertTriangle className="w-3 h-3" />
                                    {issue}
                                  </span>
                                ))}
                              </div>
                            )}
                            <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                              <MapPin className="w-3 h-3" />
                              <span>
                                {formatNumber(inspection.lat, 4)},{' '}
                                {formatNumber(inspection.lng, 4)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>暂无巡园记录</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="card p-12 flex flex-col items-center justify-center text-center">
                <Map className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="font-serif text-xl font-semibold text-gray-600 mb-2">
                  请选择一个地块
                </h3>
                <p className="text-gray-400">
                  从左侧列表中选择地块查看详细信息
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showCheckinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 animate-slide-up">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl font-semibold text-gray-800">
                  巡园打卡
                </h3>
                <button
                  onClick={() => setShowCheckinModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="input-label">选择地块</label>
                <select
                  value={checkinPlotId}
                  onChange={(e) => setCheckinPlotId(e.target.value)}
                  className="input"
                >
                  <option value="">请选择地块</option>
                  {plots.map((plot) => (
                    <option key={plot.id} value={plot.id}>
                      {plot.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="input-label">打卡备注</label>
                <textarea
                  value={checkinNotes}
                  onChange={(e) => setCheckinNotes(e.target.value)}
                  placeholder="请输入巡园记录..."
                  rows={4}
                  className="input resize-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <button className="btn-secondary flex-1">
                  <Camera className="w-4 h-4" />
                  添加照片
                </button>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>打卡时间：{formatDateTime(new Date())}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <User className="w-4 h-4" />
                  <span>打卡人：{currentUser.name}</span>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowCheckinModal(false)}
                className="btn-secondary flex-1"
              >
                取消
              </button>
              <button
                onClick={handleCheckin}
                disabled={!checkinPlotId}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MapPin className="w-4 h-4" />
                确认打卡
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
