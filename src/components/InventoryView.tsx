import React, { useState } from 'react';
import { PharmaItem } from '../types';
import {
  calculateEffectiveCost,
  calculateGrossMargin,
  getExpiryStatus,
  formatCurrency,
  formatNumber
} from '../utils/pharmaCalculations';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowUpDown,
  TrendingUp,
  Tag
} from 'lucide-react';

interface InventoryViewProps {
  items: PharmaItem[];
  onAddItem: () => void;
  onEditItem: (item: PharmaItem) => void;
  onDeleteItem: (itemId: string) => void;
  onUpdateStock: (itemId: string, newStock: number) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  items,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onUpdateStock
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'reorder' | 'nearExpiry' | 'bonus'>('all');
  const [sortField, setSortField] = useState<'code' | 'name' | 'stock' | 'value' | 'expiry'>('stock');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch =
      item.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'reorder') {
      return item.currentStock <= item.reorderLevel;
    }
    if (activeFilter === 'nearExpiry') {
      const exp = getExpiryStatus(item.expiryDate);
      return exp.status === 'critical' || exp.status === 'near_expiry' || exp.status === 'expired';
    }
    if (activeFilter === 'bonus') {
      return item.bonusFreeQty > 0;
    }
    return true;
  });

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    let comp = 0;
    if (sortField === 'code') comp = a.code.localeCompare(b.code);
    else if (sortField === 'name') comp = a.nameAr.localeCompare(b.nameAr);
    else if (sortField === 'stock') comp = a.currentStock - b.currentStock;
    else if (sortField === 'value') {
      const valA = a.currentStock * calculateEffectiveCost(a);
      const valB = b.currentStock * calculateEffectiveCost(b);
      comp = valA - valB;
    } else if (sortField === 'expiry') {
      comp = new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
    }
    return sortAsc ? comp : -comp;
  });

  const toggleSort = (field: 'code' | 'name' | 'stock' | 'value' | 'expiry') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // Stats
  const totalStockUnits = items.reduce((s, i) => s + i.currentStock, 0);
  const totalStockCostVal = items.reduce((s, i) => s + i.currentStock * calculateEffectiveCost(i), 0);
  const totalStockSaleVal = items.reduce((s, i) => s + i.currentStock * i.salePrice, 0);
  const reorderCount = items.filter(i => i.currentStock <= i.reorderLevel).length;
  const nearExpiryCount = items.filter(i => {
    const exp = getExpiryStatus(i.expiryDate);
    return exp.status === 'critical' || exp.status === 'near_expiry';
  }).length;

  return (
    <div className="space-y-5 pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            <span>بيانات المخزون والأصناف (Inventory Master Data)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            إدارة أدوية المخزن، معادلات البونص، التكلفة الفعلية، تنبيهات الصلاحية وحد إعادة الطلب
          </p>
        </div>

        <button
          onClick={onAddItem}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-lg shadow-xs flex items-center gap-2 transition self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة دواء جديد</span>
        </button>
      </div>

      {/* Quick Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1">
            Total SKUs (الأصناف)
          </span>
          <span className="text-2xl font-bold text-slate-900">{items.length} صنف</span>
          <span className="text-xs text-slate-400 mt-1 block">نشطة في المنظومة</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1">
            Total Units (العبوات)
          </span>
          <span className="text-2xl font-bold text-slate-900">{formatNumber(totalStockUnits)}</span>
          <span className="text-xs text-slate-400 mt-1 block">في غرف ومستودعات التخزين</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1">
            Inventory Value (التكلفة)
          </span>
          <span className="text-2xl font-bold text-slate-900">{formatCurrency(totalStockCostVal)}</span>
          <span className="text-xs text-emerald-600 mt-1 block font-medium">
            سعر البيع: {formatCurrency(totalStockSaleVal)}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1">
            Operational Alerts (تنبيهات)
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-[10px] font-bold uppercase tracking-tight">
              {reorderCount} حد الطلب
            </span>
            <span className="px-2 py-1 bg-rose-100 text-rose-700 rounded-md text-[10px] font-bold uppercase tracking-tight">
              {nearExpiryCount} وشيك الصلاحية
            </span>
          </div>
          <span className="text-xs text-slate-400 mt-1.5 block">تتطلب إجراءات توريد وتصريف</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          <input
            type="text"
            placeholder="ابحث باسم الدواء، الكود، الشركة، أو التصنيف..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-3 pr-9 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-hidden transition"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            الكل ({items.length})
          </button>
          <button
            onClick={() => setActiveFilter('reorder')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
              activeFilter === 'reorder'
                ? 'bg-amber-500 text-white'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            حد الطلب ({reorderCount})
          </button>
          <button
            onClick={() => setActiveFilter('nearExpiry')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
              activeFilter === 'nearExpiry'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
            }`}
          >
            وشيك الصلاحية ({nearExpiryCount})
          </button>
          <button
            onClick={() => setActiveFilter('bonus')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
              activeFilter === 'bonus'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            أصناف بونص
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200 select-none">
              <tr>
                <th
                  onClick={() => toggleSort('code')}
                  className="px-3 py-3 cursor-pointer hover:bg-slate-100 transition"
                >
                  <div className="flex items-center gap-1">
                    <span>الكود</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('name')}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition"
                >
                  <div className="flex items-center gap-1">
                    <span>اسم الصنف والشركة</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-3 py-3 text-center">سعر الشراء</th>
                <th className="px-3 py-3 text-center">معادلة البونص</th>
                <th className="px-3 py-3 text-center bg-blue-50/60 text-blue-950 font-bold">التكلفة الفعلية</th>
                <th className="px-3 py-3 text-center">سعر البيع</th>
                <th className="px-3 py-3 text-center">الهامش %</th>
                <th
                  onClick={() => toggleSort('stock')}
                  className="px-3 py-3 text-center cursor-pointer hover:bg-slate-100 transition"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>الرصيد الحالي</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('value')}
                  className="px-3 py-3 text-center cursor-pointer hover:bg-slate-100 transition"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>قيمة المخزون</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-3 py-3 text-center">حد الطلب</th>
                <th
                  onClick={() => toggleSort('expiry')}
                  className="px-3 py-3 text-center cursor-pointer hover:bg-slate-100 transition"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>الصلاحية</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-3 py-3 text-center">الحالة</th>
                <th className="px-3 py-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {sortedItems.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-12 text-center text-slate-400 text-xs">
                    لا توجد أصناف تطابق شروط البحث الحالية.
                  </td>
                </tr>
              ) : (
                sortedItems.map(item => {
                  const effCost = calculateEffectiveCost(item);
                  const margin = calculateGrossMargin(item.salePrice, effCost);
                  const expiry = getExpiryStatus(item.expiryDate);
                  const isLowStock = item.currentStock <= item.reorderLevel;
                  const itemValue = item.currentStock * effCost;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/80 transition ${isLowStock ? 'bg-amber-50/20' : ''}`}
                    >
                      {/* Code */}
                      <td className="px-3 py-3 font-mono font-bold text-slate-700 whitespace-nowrap text-xs">
                        {item.code}
                      </td>

                      {/* Name */}
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">{item.nameAr}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2">
                          <span className="font-mono">{item.nameEn}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-600">{item.manufacturer}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-400">{item.category}</span>
                        </div>
                      </td>

                      {/* Cost */}
                      <td className="px-3 py-3 text-center font-mono font-medium text-slate-600 text-xs">
                        {item.costPrice} ج.م
                      </td>

                      {/* Bonus */}
                      <td className="px-3 py-3 text-center">
                        {item.bonusFreeQty > 0 ? (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded-md text-xs font-mono">
                            {item.bonusBuyQty}+{item.bonusFreeQty}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">بدون</span>
                        )}
                      </td>

                      {/* Effective Cost */}
                      <td className="px-3 py-3 text-center font-mono font-bold text-slate-900 bg-blue-50/30 text-xs">
                        {formatCurrency(effCost)}
                      </td>

                      {/* Sale Price */}
                      <td className="px-3 py-3 text-center font-mono font-bold text-slate-900 text-xs">
                        {item.salePrice} ج.م
                      </td>

                      {/* Margin */}
                      <td className="px-3 py-3 text-center text-xs">
                        <span className={`font-bold font-mono ${margin >= 20 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {margin}%
                        </span>
                      </td>

                      {/* Current Stock with Quick Adjust */}
                      <td className="px-3 py-3 text-center">
                        <input
                          type="number"
                          min="0"
                          value={item.currentStock}
                          onChange={e => onUpdateStock(item.id, parseInt(e.target.value) || 0)}
                          className="w-16 px-1.5 py-1 text-center font-bold text-slate-800 rounded border border-slate-200 text-xs hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-400 transition"
                        />
                      </td>

                      {/* Stock Value */}
                      <td className="px-3 py-3 text-center font-mono font-semibold text-slate-800 text-xs">
                        {formatCurrency(itemValue)}
                      </td>

                      {/* Reorder Level */}
                      <td className="px-3 py-3 text-center text-slate-500 font-mono text-xs">
                        {item.reorderLevel}
                      </td>

                      {/* Expiry */}
                      <td className="px-3 py-3 text-center font-mono text-xs">
                        <span className={`px-2 py-0.5 rounded-md border ${expiry.badgeClass}`}>{item.expiryDate}</span>
                      </td>

                      {/* Sleek Status Badge */}
                      <td className="px-3 py-3 text-center">
                        {isLowStock ? (
                          <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-[10px] font-bold uppercase tracking-tight">
                            Low Stock
                          </span>
                        ) : expiry.status === 'critical' || expiry.status === 'near_expiry' ? (
                          <span className="px-2 py-1 bg-rose-100 text-rose-700 rounded-md text-[10px] font-bold uppercase tracking-tight">
                            Near Expiry
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold uppercase tracking-tight">
                            Stable
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onEditItem(item)}
                            title="تعديل الصنف"
                            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteItem(item.id)}
                            title="حذف من المخزن"
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
