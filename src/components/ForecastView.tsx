import React, { useState } from 'react';
import { PharmaItem, MonthlyForecastUnits } from '../types';
import { MONTH_NAMES_AR } from '../data/initialData';
import { calculateEffectiveCost, formatCurrency, formatNumber } from '../utils/pharmaCalculations';
import { TrendingUp, DollarSign, Layers, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

interface ForecastViewProps {
  items: PharmaItem[];
  forecast: MonthlyForecastUnits;
  onUpdateForecastUnit: (itemId: string, monthIndex: number, units: number) => void;
  onBulkAdjustForecast: (percentage: number) => void;
}

export const ForecastView: React.FC<ForecastViewProps> = ({
  items,
  forecast,
  onUpdateForecastUnit,
  onBulkAdjustForecast
}) => {
  const [viewMode, setViewMode] = useState<'units' | 'value'>('units');

  // Compute monthly totals
  const monthlyUnitsTotal: number[] = new Array(12).fill(0);
  const monthlySalesTotal: number[] = new Array(12).fill(0);
  const monthlyCogsTotal: number[] = new Array(12).fill(0);

  for (let m = 0; m < 12; m++) {
    items.forEach(item => {
      const units = (forecast[item.id] && forecast[item.id][m]) || 0;
      const effCost = calculateEffectiveCost(item);
      monthlyUnitsTotal[m] += units;
      monthlySalesTotal[m] += units * item.salePrice;
      monthlyCogsTotal[m] += units * effCost;
    });
  }

  const grandUnits = monthlyUnitsTotal.reduce((a, b) => a + b, 0);
  const grandSales = monthlySalesTotal.reduce((a, b) => a + b, 0);
  const grandCogs = monthlyCogsTotal.reduce((a, b) => a + b, 0);
  const grandProfit = grandSales - grandCogs;
  const overallMargin = grandSales > 0 ? ((grandProfit / grandSales) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span>مصفوفة توقعات المبيعات الشهرية (Sales Forecast Engine - 12M)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            تخطيط كميات وأسعار البيع الشهرية لكل صنف، والربط المباشر مع المخزون والتكلفة الفعلية
          </p>
        </div>

        {/* View Mode & Bulk adjustments */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle View Mode */}
          <div className="bg-slate-100 p-1 rounded-lg flex items-center gap-1 border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('units')}
              className={`px-3 py-1.5 rounded-md font-semibold transition cursor-pointer ${
                viewMode === 'units' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              بالوحدات (عبوة)
            </button>
            <button
              onClick={() => setViewMode('value')}
              className={`px-3 py-1.5 rounded-md font-semibold transition cursor-pointer ${
                viewMode === 'value' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              بالقيمة (ج.م)
            </button>
          </div>

          {/* Quick Adjust Buttons */}
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => onBulkAdjustForecast(10)}
              className="px-2.5 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-lg font-semibold border border-emerald-200 transition active:scale-95"
              title="زيادة جميع التوقعات بنسبة 10%"
            >
              +10% نمو
            </button>
            <button
              onClick={() => onBulkAdjustForecast(-10)}
              className="px-2.5 py-1.5 bg-rose-50 text-rose-800 hover:bg-rose-100 rounded-lg font-semibold border border-rose-200 transition active:scale-95"
              title="خفض التوقعات بنسبة 10%"
            >
              -10% خفض
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1">
            Total Forecast Units
          </span>
          <span className="text-2xl font-bold text-slate-900">{formatNumber(grandUnits)} عبوة</span>
          <span className="text-xs text-slate-400 mt-1 block">متوسط شهري: {formatNumber(Math.round(grandUnits / 12))}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1">
            Projected Revenue
          </span>
          <span className="text-2xl font-bold text-blue-600">{formatCurrency(grandSales)}</span>
          <span className="text-xs text-slate-400 mt-1 block">إجمالي مبيعات العام</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1">
            Projected COGS
          </span>
          <span className="text-2xl font-bold text-slate-700">{formatCurrency(grandCogs)}</span>
          <span className="text-xs text-slate-400 mt-1 block">تكلفة البضاعة المباعة بعد البونص</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1">
            Expected Gross Margin
          </span>
          <span className="text-2xl font-bold text-emerald-600">{formatCurrency(grandProfit)}</span>
          <span className="text-xs text-emerald-700 mt-1 block font-medium">
            هامش ربح إجمالي: {overallMargin}%
          </span>
        </div>
      </div>

      {/* Forecast Matrix Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200 select-none">
              <tr>
                <th className="px-3 py-3 sticky right-0 bg-slate-50 z-10 min-w-44">
                  الصنف / السعر
                </th>
                <th className="px-2 py-3 text-center min-w-16">الرصيد</th>
                {MONTH_NAMES_AR.map((month, idx) => (
                  <th key={idx} className="px-1.5 py-3 text-center min-w-16">
                    {month}
                  </th>
                ))}
                <th className="px-3 py-3 text-center bg-blue-50/70 text-blue-950 font-bold min-w-24">
                  إجمالي الوحدات
                </th>
                <th className="px-3 py-3 text-center bg-emerald-50/70 text-emerald-950 font-bold min-w-28">
                  إجمالي المبيعات
                </th>
                <th className="px-3 py-3 text-center bg-slate-100 min-w-24">
                  الربح المتوقع
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map(item => {
                const effCost = calculateEffectiveCost(item);
                const itemForecast = forecast[item.id] || new Array(12).fill(0);
                const totalUnits = itemForecast.reduce((a, b) => a + b, 0);
                const totalSales = totalUnits * item.salePrice;
                const totalCogs = totalUnits * effCost;
                const totalProfit = totalSales - totalCogs;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    {/* Item Name & Prices */}
                    <td className="px-3 py-2.5 sticky right-0 bg-white z-10 font-medium">
                      <div className="font-bold text-slate-900 truncate max-w-44">{item.nameAr}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5 font-mono">
                        <span>بيع: {item.salePrice}ج</span>
                        <span>•</span>
                        <span className="text-slate-600">تكلفة: {effCost}ج</span>
                      </div>
                    </td>

                    {/* Current Stock */}
                    <td className="px-2 py-2.5 text-center font-bold text-slate-700">
                      {item.currentStock}
                    </td>

                    {/* 12 Months Cells */}
                    {itemForecast.map((units, mIdx) => {
                      const displayVal =
                        viewMode === 'units'
                          ? units
                          : Math.round(units * item.salePrice).toLocaleString();

                      return (
                        <td key={mIdx} className="px-1 py-1 text-center">
                          {viewMode === 'units' ? (
                            <input
                              type="number"
                              min="0"
                              value={units}
                              onChange={e =>
                                onUpdateForecastUnit(item.id, mIdx, parseInt(e.target.value) || 0)
                              }
                              className="w-14 px-1 py-1 text-center font-semibold rounded border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-400 text-xs bg-slate-50/50 hover:bg-white transition"
                            />
                          ) : (
                            <div className="w-16 px-1 py-1 text-center font-mono font-semibold text-[11px] text-slate-700">
                              {displayVal}
                            </div>
                          )}
                        </td>
                      );
                    })}

                    {/* Total Units */}
                    <td className="px-3 py-2.5 text-center font-mono font-bold text-blue-900 bg-blue-50/30">
                      {formatNumber(totalUnits)}
                    </td>

                    {/* Total Sales */}
                    <td className="px-3 py-2.5 text-center font-mono font-bold text-emerald-900 bg-emerald-50/30">
                      {formatCurrency(totalSales)}
                    </td>

                    {/* Gross Profit */}
                    <td className="px-3 py-2.5 text-center font-mono font-semibold text-slate-800">
                      {formatCurrency(totalProfit)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Total Row */}
            <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-200 text-slate-900">
              <tr>
                <td className="px-3 py-3 sticky right-0 bg-slate-50 z-10">
                  الإجمالي الشهري العام
                </td>
                <td className="px-2 py-3 text-center text-slate-600">
                  {formatNumber(items.reduce((s, i) => s + i.currentStock, 0))}
                </td>
                {monthlyUnitsTotal.map((u, idx) => (
                  <td key={idx} className="px-1 py-3 text-center font-mono text-[11px]">
                    {viewMode === 'units' ? formatNumber(u) : formatCurrency(monthlySalesTotal[idx])}
                  </td>
                ))}
                <td className="px-3 py-3 text-center font-mono text-blue-900 bg-blue-100/50">
                  {formatNumber(grandUnits)}
                </td>
                <td className="px-3 py-3 text-center font-mono text-emerald-900 bg-emerald-100/50">
                  {formatCurrency(grandSales)}
                </td>
                <td className="px-3 py-3 text-center font-mono text-slate-900 bg-slate-100">
                  {formatCurrency(grandProfit)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
