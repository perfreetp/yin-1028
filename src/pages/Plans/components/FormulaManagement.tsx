import { useState } from 'react';
import { useAppStore } from '@/store';
import { generateId } from '@/utils';
import type { FertilizerFormula } from '@/types';
import { Leaf, Plus, Edit2, Trash2, X, Check } from 'lucide-react';

export default function FormulaManagement() {
  const formulas = useAppStore((state) => state.formulas);
  const currentUser = useAppStore((state) => state.currentUser);
  const [showForm, setShowForm] = useState(false);
  const [editingFormula, setEditingFormula] = useState<FertilizerFormula | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    nitrogen: 15,
    phosphorus: 15,
    potassium: 15,
    traceElements: {} as Record<string, number>,
    applicableCrops: [] as string[],
    description: '',
  });

  const handleEdit = (formula: FertilizerFormula) => {
    setEditingFormula(formula);
    setFormData({
      name: formula.name,
      nitrogen: formula.nitrogen,
      phosphorus: formula.phosphorus,
      potassium: formula.potassium,
      traceElements: { ...formula.traceElements },
      applicableCrops: [...formula.applicableCrops],
      description: formula.description,
    });
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingFormula(null);
    setFormData({
      name: '',
      nitrogen: 15,
      phosphorus: 15,
      potassium: 15,
      traceElements: {},
      applicableCrops: [],
      description: '',
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!formData.name) return;

    if (editingFormula) {
      // Update logic would go here
      console.log('Update formula:', editingFormula.id, formData);
    } else {
      const newFormula: FertilizerFormula = {
        id: generateId(),
        ...formData,
        createdBy: currentUser.name,
        createdAt: new Date().toISOString().split('T')[0],
      };
      console.log('Add formula:', newFormula);
    }
    setShowForm(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">施肥配方管理</h3>
          <p className="text-sm text-gray-500 mt-1">共 {formulas.length} 个施肥配方</p>
        </div>
        <button className="btn-primary" onClick={handleAdd}>
          <Plus className="w-4 h-4" />
          新建配方
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {formulas.map((formula, index) => (
          <div
            key={formula.id}
            className="card card-hover animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-success-50 rounded-xl">
                    <Leaf className="w-6 h-6 text-success-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{formula.name}</h4>
                    <p className="text-xs text-gray-400">创建于 {formula.createdAt}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={() => handleEdit(formula)}
                  >
                    <Edit2 className="w-4 h-4 text-gray-500" />
                  </button>
                  <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">{formula.nitrogen}</div>
                    <div className="text-xs text-blue-500">N 氮</div>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">{formula.phosphorus}</div>
                    <div className="text-xs text-green-500">P 磷</div>
                  </div>
                  <div className="text-center p-2 bg-orange-50 rounded-lg">
                    <div className="text-lg font-bold text-orange-600">{formula.potassium}</div>
                    <div className="text-xs text-orange-500">K 钾</div>
                  </div>
                </div>

                {Object.keys(formula.traceElements).length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(formula.traceElements).map(([element, value]) => (
                      <span
                        key={element}
                        className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        {element}: {value}%
                      </span>
                    ))}
                  </div>
                )}

                <div className="pt-3 border-t border-gray-100">
                  <p className="text-sm text-gray-600 mb-2">{formula.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {formula.applicableCrops.map((crop) => (
                      <span
                        key={crop}
                        className="px-2 py-0.5 bg-primary-50 text-primary-600 text-xs rounded-full"
                      >
                        {crop}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400 pt-2">
                  <span>创建人: {formula.createdBy}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingFormula ? '编辑配方' : '新建配方'}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-4">
                <div>
                  <label className="input-label">配方名称</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                    placeholder="请输入配方名称"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="input-label">N 氮 (%)</label>
                    <input
                      type="number"
                      value={formData.nitrogen}
                      onChange={(e) => setFormData({ ...formData, nitrogen: Number(e.target.value) })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="input-label">P 磷 (%)</label>
                    <input
                      type="number"
                      value={formData.phosphorus}
                      onChange={(e) => setFormData({ ...formData, phosphorus: Number(e.target.value) })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="input-label">K 钾 (%)</label>
                    <input
                      type="number"
                      value={formData.potassium}
                      onChange={(e) => setFormData({ ...formData, potassium: Number(e.target.value) })}
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="input-label">配方描述</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input min-h-[80px]"
                    placeholder="请输入配方描述和适用说明"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-100">
              <button onClick={() => setShowForm(false)} className="btn-secondary">
                取消
              </button>
              <button onClick={handleSubmit} className="btn-primary">
                <Check className="w-4 h-4" />
                {editingFormula ? '保存修改' : '创建配方'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
