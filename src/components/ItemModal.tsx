import React, { useState, useEffect } from 'react';
import { PharmaItem } from '../types';
import { X, Calculator, AlertCircle, Save } from 'lucide-react';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: PharmaItem) => void;
  initialItem?: PharmaItem | null;
}

export const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialItem
}) => {
  const [formData, setFormData] = useState<Omit<PharmaItem, 'id'>>({
    code: '',
    nameAr: '',
    nameEn: '',
    category: 'أدوية عامة',
    manufacturer: '',
    costPrice: 50,
    salePrice: 65,
    bonusBuyQty: 10,
    bonusFreeQty: 1,
    currentStock: 500,
    reorderLevel: 200,
    reorderBatch: 500,
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    creditDays: 60
  });

  useEffect(() => {
    if (initialItem) {
      setFormData({
        code: initialItem.code,
        nameAr: initialItem.nameAr,
        nameEn: initialItem.nameEn,
        category: initialItem.category,
        manufacturer: initialItem.manufacturer,
        costPrice: initialItem.costPrice,
        salePrice: initialItem.salePrice,
        bonusBuyQty: initialItem.bonusBuyQty,
        bonusFreeQty: initialItem.bonusFreeQty,
        currentStock: initialItem.currentStock,
        reorderLevel: initialItem.reorderLevel,
        reorderBatch: initialItem.reorderBatch,
        expiryDate: initialItem.expiryDate,
        creditDays: initialItem.creditDays
      });
    } else {
      setFormData({
        code: `MED-${Math.floor(100 + Math.random() * 900)}`,
        nameAr: '',
        nameEn: '',
        category: 'مضادات حيوية',
        manufacturer: 'شركة الأدوية',
        costPrice: 50,
        salePrice: 70,
        bonusBuyQty: 10,
        bonusFreeQty: 1,
        currentStock: 500,
        reorderLevel: 200,
        reorderBatch: 500,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        creditDays: 60
      });
    }
  }, [initialItem, isOpen]);

  if (!isOpen) return null;

  // Real-time calculation of effective cost
  const totalQtyPerBonusDeal = formData.bonusBuyQty + formData.bonusFreeQty;
  const effectiveCost =
    totalQtyPerBonusDeal > 0 && formData.bonusBuyQty > 0
      ? Number(((formData.bonusBuyQty * formData.costPrice) / totalQtyPerBonusDeal).toFixed(2))
      : formData.costPrice;

  const grossMargin =
    formData.salePrice > 0
      ? Number((((formData.salePrice - effectiveCost) / formData.salePrice) * 100).toFixed(1))
      : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameAr.trim()) {
      alert('يرجى إدخال اسم الدواء');
      return;
    }
    onSave({
      id: initialItem ? initialItem.id : `item-${Date.now()}`,
      ...formData
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200">
        {/* Header - Sleek Dark Palette */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white shadow-xs">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                {initialItem ? 'تعديل بيانات الصنف' : 'إضافة دواء / صنف جديد للمخزن'}
              </h3>
              <p className="text-[11px] text-slate-400">
                ربط تكلفة الشراء، البونص، حد الطلب وتاريخ الصلاحية
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Row 1: Code & Arabic Name */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                كود الصنف (Item Code)
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-hidden font-mono"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                اسم الدواء التجاري (بالعربي)
              </label>
              <input
                type="text"
                required
                placeholder="مثال: أوجمانتين 1 جم أقراص"
                value={formData.nameAr}
                onChange={e => setFormData({ ...formData, nameAr: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Row 2: English Name & Category & Manufacturer */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                الاسم بالإنجليزية
              </label>
              <input
                type="text"
                placeholder="Augmentin 1g Tab"
                value={formData.nameEn}
                onChange={e => setFormData({ ...formData, nameEn: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                التصنيف الدوائي
              </label>
              <input
                type="text"
                placeholder="مضادات حيوية"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                الشركة المصنعة / المورد
              </label>
              <input
                type="text"
                placeholder="GSK / إيفا فارما"
                value={formData.manufacturer}
                onChange={e => setFormData({ ...formData, manufacturer: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Row 3: Financial & Bonus Engine Box */}
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-blue-950">
              <span className="flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-blue-600" />
                محرك احتساب التكلفة الفعلية والبونص (Bonus & Cost Calculation)
              </span>
              <span className="text-[11px] text-blue-600 font-normal">
                يحسب فورياً أثر البونص المجاني على خفض التكلفة
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  سعر الشراء بالفاتورة (ج.م)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  required
                  value={formData.costPrice}
                  onChange={e => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-center font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  سعر البيع المقترح (ج.م)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  required
                  value={formData.salePrice}
                  onChange={e => setFormData({ ...formData, salePrice: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-center font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  شراء كمية أساسية (Buy)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.bonusBuyQty}
                  onChange={e => setFormData({ ...formData, bonusBuyQty: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-center"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  + بونص مجاني (Free)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.bonusFreeQty}
                  onChange={e => setFormData({ ...formData, bonusFreeQty: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-center"
                />
              </div>
            </div>

            {/* Calculated Preview */}
            <div className="mt-2 pt-2 border-t border-blue-200/60 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-600">نظام البونص:</span>
                <span className="font-bold text-blue-900 bg-white px-2 py-0.5 rounded-md border border-blue-200">
                  {formData.bonusFreeQty > 0 ? `${formData.bonusBuyQty} + ${formData.bonusFreeQty}` : 'لا يوجد بونص'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-600">التكلفة الفعلية بعد البونص:</span>
                <span className="font-bold text-blue-900 bg-blue-100 px-2.5 py-1 rounded-md">
                  {effectiveCost} ج.م
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-600">هامش الربح الإجمالي:</span>
                <span className={`font-bold px-2 py-1 rounded-md ${grossMargin >= 20 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {grossMargin}%
                </span>
              </div>
            </div>
          </div>

          {/* Row 4: Stock, Reorder Point, Expiry & Credit Days */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                الرصيد الحالي بالمخزن
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.currentStock}
                onChange={e => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                حد الطلب (Reorder Point)
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.reorderLevel}
                onChange={e => setFormData({ ...formData, reorderLevel: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                حجم دفعة الشراء (Batch)
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.reorderBatch}
                onChange={e => setFormData({ ...formData, reorderBatch: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                فترة ائتمان المورد (أيام)
              </label>
              <select
                value={formData.creditDays}
                onChange={e => setFormData({ ...formData, creditDays: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value={0}>كاش فوراً</option>
                <option value={30}>30 يوماً</option>
                <option value={45}>45 يوماً</option>
                <option value={60}>60 يوماً</option>
                <option value={90}>90 يوماً</option>
              </select>
            </div>
          </div>

          {/* Row 5: Expiry Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>تاريخ انتهاء الصلاحية (Batch Expiry Date)</span>
              <span className="text-slate-400 font-normal text-[11px]">يحدد تنبيهات الركود والإرجاع</span>
            </label>
            <input
              type="date"
              required
              value={formData.expiryDate}
              onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-2 transition active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>حفظ الصنف في المخزن</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
