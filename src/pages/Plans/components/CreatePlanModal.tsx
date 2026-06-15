import { useState } from 'react';
import { useAppStore } from '@/store';
import { generateId } from '@/utils';
import type { WaterFertilizerPlan } from '@/types';
import { X, Calendar, Clock, Droplets, Leaf, Droplet } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatePlanModal({ isOpen, onClose }: Props) {
  const plots = useAppStore((state) => state.plots);
  const formulas = useAppStore((state) => state.formulas);
  const currentUser = useAppStore((state) => state.currentUser);
  const addPlan = useAppStore((state) => state.addPlan);
  const valves = useAppStore((state) => state.sensors).filter((s) => s.type === 'valve');

  const [formData, setFormData] = useState({
    plotId: '',
    type: 'irrigation' as WaterFertilizerPlan['type'],
    formulaId: '',
    scheduleDate: new Date().toISOString().split('T')[0],
    scheduleTime: '08:00',
    waterAmount: 30,
    fertilizerAmount: 0,
    duration: 60,
    valveIds: [] as string[],
  });

  const handleSubmit = () => {
    const scheduleDateTime = new Date(`${formData.scheduleDate}T${formData.scheduleTime}:00`);
    const selectedFormula = formulas.find((f) => f.id === formData.formulaId);

    const newPlan: WaterFertilizerPlan = {
      id: generateId(),
      plotId: formData.plotId,
      creatorId: currentUser.id,
      type: formData.type,
      formulaId: formData.type !== 'irrigation' ? formData.formulaId || undefined : undefined,
      formula: selectedFormula
        ? {
            nitrogen: selectedFormula.nitrogen,
            phosphorus: selectedFormula.phosphorus,
            potassium: selectedFormula.potassium,
            traceElements: selectedFormula.traceElements,
          }
        : undefined,
      scheduleTime: scheduleDateTime.toISOString(),
      waterAmount: formData.waterAmount,
      fertilizerAmount: formData.fertilizerAmount,
      valveIds: formData.valveIds,
      duration: formData.duration,
      status: 'pending',
      approvalStatus: 'pending',
      createdAt: new Date().toISOString(),
    };

    addPlan(newPlan);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">新建水肥计划</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-5">
            <div>
              <label className="input-label">选择地块</label>
              <select
                value={formData.plotId}
                onChange={(e) => setFormData({ ...formData, plotId: e.target.value })}
                className="input"
              >
                <option value="">请选择地块</option>
                {plots.map((plot) => (
                  <option key={plot.id} value={plot.id}>
                    {plot.name} - {plot.cropType}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="input-label">计划类型</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { type: 'irrigation' as const, icon: Droplets, label: '灌溉' },
                  { type: 'fertilization' as const, icon: Leaf, label: '施肥' },
                  { type: 'both' as const, icon: Droplet, label: '水肥一体' },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = formData.type === item.type;
                  return (
                    <button
                      key={item.type}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          type: item.type,
                          fertilizerAmount: item.type === 'irrigation' ? 0 : 15,
                        })
                      }
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                        isActive
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {formData.type !== 'irrigation' && (
              <div>
                <label className="input-label">施肥配方</label>
                <select
                  value={formData.formulaId}
                  onChange={(e) => setFormData({ ...formData, formulaId: e.target.value })}
                  className="input"
                >
                  <option value="">请选择配方</option>
                  {formulas.map((formula) => (
                    <option key={formula.id} value={formula.id}>
                      {formula.name} (N:{formula.nitrogen} P:{formula.phosphorus} K:{formula.potassium})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  计划日期
                </label>
                <input
                  type="date"
                  value={formData.scheduleDate}
                  onChange={(e) => setFormData({ ...formData, scheduleDate: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="input-label">
                  <Clock className="w-4 h-4 inline mr-1" />
                  计划时间
                </label>
                <input
                  type="time"
                  value={formData.scheduleTime}
                  onChange={(e) => setFormData({ ...formData, scheduleTime: e.target.value })}
                  className="input"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="input-label">水量 (m³)</label>
                <input
                  type="number"
                  value={formData.waterAmount}
                  onChange={(e) => setFormData({ ...formData, waterAmount: Number(e.target.value) })}
                  className="input"
                  min="0"
                />
              </div>
              {formData.type !== 'irrigation' && (
                <div>
                  <label className="input-label">肥量 (kg)</label>
                  <input
                    type="number"
                    value={formData.fertilizerAmount}
                    onChange={(e) => setFormData({ ...formData, fertilizerAmount: Number(e.target.value) })}
                    className="input"
                    min="0"
                  />
                </div>
              )}
              <div>
                <label className="input-label">持续时间 (分钟)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                  className="input"
                  min="1"
                />
              </div>
            </div>

            <div>
              <label className="input-label">选择阀门</label>
              <div className="grid grid-cols-2 gap-2">
                {valves.map((valve) => (
                  <label
                    key={valve.id}
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                      formData.valveIds.includes(valve.id)
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.valveIds.includes(valve.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            valveIds: [...formData.valveIds, valve.id],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            valveIds: formData.valveIds.filter((id) => id !== valve.id),
                          });
                        }
                      }}
                      className="rounded text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">{valve.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-100">
          <button onClick={onClose} className="btn-secondary">
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!formData.plotId || formData.valveIds.length === 0}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            创建计划
          </button>
        </div>
      </div>
    </div>
  );
}
