import React from 'react';
import {
  FullSimulationResult,
  calculateEffectiveCost,
  getExpiryStatus,
  formatCurrency,
  formatNumber
} from '../utils/pharmaCalculations';
import { PharmaItem } from '../types';
import {
  Wallet,
  TrendingUp,
  Package,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Calendar,
  Layers,
  ChevronLeft,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DashboardViewProps {
  simulation: FullSimulationResult;
  items: PharmaItem[];
  onGoToInventory: () => void;
  onGoToCashFlow: () => void;
  onGoToForecast: () => void;
  onOpenAddItem: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  simulation,
  items,
  onGoToInventory,
  onGoToCashFlow,
  onGoToForecast,
  onOpenAddItem
}) => {
  // Cash Chart Data
  const cashChartData = simulation.monthSummaries.map(m => ({
    name: m.monthNameAr,
    'التدفقات الداخلة': m.cashInflow,
    'التدفقات الخارجة': m.totalOutflow,
    'رصيد النقدية': m.closingCash
  }));

  // Sales vs COGS Data
  const salesChartData = simulation.monthSummaries.map(m => ({
    name: m.monthNameAr,
    'المبيعات المتوقعة': m.salesRevenue,
    'تكلفة البضاعة COGS': m.cogs,
    'الربح الإجمالي': m.grossProfit
  }));

  // Expiry Breakdown
  const expiryCategories = {
    safe: 0,
    warning: 0,
    nearExpiry: 0,
    critical: 0
  };

  items.forEach(item => {
    const effCost = calculateEffectiveCost(item);
    const val = item.currentStock * effCost;
    const exp = getExpiryStatus(item.expiryDate);
    if (exp.status === 'safe') expiryCategories.safe += val;
    else if (exp.status === 'warning') expiryCategories.warning += val;
    else if (exp.status === 'near_expiry') expiryCategories.nearExpiry += val;
    else expiryCategories.critical += val;
  });

  const expiryPieData = [
    { name: 'آمن (> سنة)', value: expiryCategories.safe, color: '#10b981' },
    { name: 'متابعة (6-12 شهر)', value: expiryCategories.warning, color: '#f59e0b' },
    { name: 'وشيك الانتهاء (3-6 شهور)', value: expiryCategories.nearExpiry, color: '#f97316' },
    { name: 'حرج جداً (< 3 شهور)', value: expiryCategories.critical, color: '#ef4444' }
  ].filter(d => d.value > 0);

  // Items currently below or at reorder point
  const itemsNeedingReorder = items.filter(i => i.currentStock <= i.reorderLevel);

  // Expiry risk items (under 6 months)
  const highRiskExpiryItems = items.filter(i => {
    const s = getExpiryStatus(i.expiryDate);
    return s.status === 'critical' || s.status === 'near_expiry';
  });

  // Calculate average credit DSO vs DPO
  const avgDSO = 42; // standard average days sales outstanding in pharma collection
  const avgDPO = items.length > 0
    ? Math.round(items.reduce((sum, i) => sum + i.creditDays, 0) / items.length)
    : 60;
  const cashGapDays = avgDPO - avgDSO;

  return (
    <div className="space-y-6 pb-12">
      {/* Cash Gap Alert Banner if liquidity shortage occurs */}
      {simulation.hasCashGap && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-amber-900 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-sm">
            <h3 className="font-bold text-amber-950">تنبيه تنفيذي: فجوة سيولة نقدية متوقعة (Cash Gap)</h3>
            <p className="mt-0.5 text-amber-800 text-xs sm:text-sm">
              تظهر الحسابات احتمال حدوث عجز نقدي في الأشهر التالية:{' '}
              <span className="font-bold">{simulation.cashGapMonths.join(' ، ')}</span>.
              يُنصح بمراجعة فترات ائتمان الموردين، أو تسريع وتيرة تحصيل المبيعات الآجلة، أو تأمين تسهيل ائتماني بنكي مؤقت.
            </p>
          </div>
        </div>
      )}

      {/* Top 4 Metric Cards - Styled exactly like Sleek Interface */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Inventory Value */}
        <div
          onClick={onGoToInventory}
          className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-sm transition cursor-pointer"
        >
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
            Inventory Value (قيمة المخزون)
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {formatCurrency(simulation.totalInventoryCostValue)}
          </div>
          <div className="text-emerald-500 text-xs mt-1.5 font-medium flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>بسعر البيع: {formatCurrency(simulation.totalInventorySaleValue)}</span>
          </div>
        </div>

        {/* Card 2: Cash Position */}
        <div
          onClick={onGoToCashFlow}
          className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-sm transition cursor-pointer"
        >
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
            Cash Position (رصيد النقدية)
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {formatCurrency(simulation.monthSummaries[11]?.closingCash || 0)}
          </div>
          <div className={`text-xs mt-1.5 font-medium flex items-center gap-1 ${
            simulation.minClosingCash < 0 ? 'text-rose-500' : 'text-emerald-500'
          }`}>
            {simulation.minClosingCash < 0 ? (
              <>
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>أدنى رصيد: {formatCurrency(simulation.minClosingCash)} (عجز محتمل)</span>
              </>
            ) : (
              <>
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>أدنى رصيد مسجل: {formatCurrency(simulation.minClosingCash)}</span>
              </>
            )}
          </div>
        </div>

        {/* Card 3: Reorder Alerts */}
        <div
          onClick={onGoToInventory}
          className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-sm transition cursor-pointer"
        >
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
            Reorder Alerts (حد الطلب)
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-500 tracking-tight">
            {simulation.reorderAlertsCount} Items
          </div>
          <div className="text-slate-400 text-xs mt-1.5 font-medium">
            {simulation.reorderAlertsCount > 0 ? 'مخاطر نفاد المخزون (Stockout Risk)' : 'المخزون عند مستويات آمنة'}
          </div>
        </div>

        {/* Card 4: Expiry Risk */}
        <div
          onClick={onGoToInventory}
          className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-sm transition cursor-pointer"
        >
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
            Expiry Risk (الصلاحية 6M)
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-rose-600 tracking-tight">
            {highRiskExpiryItems.length} SKU
          </div>
          <div className="text-rose-500 text-xs mt-1.5 font-medium flex items-center gap-1">
            {highRiskExpiryItems.length > 0 ? 'تتطلب تصريفاً سريعاً (Action Required)' : 'لا توجد تواريخ حرجة'}
          </div>
        </div>
      </div>

      {/* Mid Row: Sales Forecast vs Actuals / Cash Inflow vs Outflow + Cash Cycle */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Forecast vs Inflows Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
            <div>
              <h2 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <span>توقعات المبيعات والتدفق النقدي (Sales vs Cash Flow)</span>
              </h2>
              <div className="text-xs text-slate-500 mt-0.5">
                مقارنة المبيعات المتوقعة والتحصيل الفعلي لكل شهر
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                <span className="text-slate-600">المبيعات (Forecast)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
                <span className="text-slate-600">التحصيل النقدي</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-rose-400 rounded-full"></span>
                <span className="text-slate-600">المدفوعات</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={cashChartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis
                  tickFormatter={val => `${Math.round(val / 1000)}k`}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <Tooltip
                  formatter={(val: number) => [`${val.toLocaleString()} ج.م`]}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', direction: 'rtl' }}
                />
                <Bar dataKey="التدفقات الداخلة" fill="#10b981" radius={[4, 4, 0, 0]} barSize={16} />
                <Bar dataKey="التدفقات الخارجة" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={16} />
                <Line
                  type="monotone"
                  dataKey="رصيد النقدية"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#3b82f6' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cash Cycle Widget - Matched to Sleek Interface */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-800 text-base">دورة النقدية (Cash Cycle)</h2>
              <span className="text-[11px] font-mono text-slate-400">DSO vs DPO</span>
            </div>

            <div className="space-y-4">
              {/* DSO */}
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-500 font-medium">DSO (متوسط فترة التحصيل)</span>
                  <span className="font-bold text-slate-900">{avgDSO} يوماً</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: '45%' }}></div>
                </div>
              </div>

              {/* DPO */}
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-500 font-medium">DPO (فترة ائتمان الموردين)</span>
                  <span className="font-bold text-slate-900">{avgDPO} يوماً</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-teal-500 h-full rounded-full transition-all duration-500" style={{ width: '70%' }}></div>
                </div>
              </div>

              {/* Cash Gap Indicator Box */}
              <div className={`p-3.5 rounded-xl mt-4 border ${
                cashGapDays >= 0 ? 'bg-blue-50/80 border-blue-100' : 'bg-rose-50 border-rose-100'
              }`}>
                <div className={`text-xs font-semibold mb-1 ${
                  cashGapDays >= 0 ? 'text-blue-700' : 'text-rose-700'
                }`}>
                  {cashGapDays >= 0 ? 'فارق زمني إيجابي (Positive Cash Gap)' : 'فجوة نقدية سلبية (Negative Cash Gap)'}
                </div>
                <div className={`text-xl font-bold ${
                  cashGapDays >= 0 ? 'text-blue-900' : 'text-rose-900'
                }`}>
                  {cashGapDays >= 0 ? `+${cashGapDays} يوماً لصالح المخزن` : `${cashGapDays} يوماً عجز ائتماني`}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  {cashGapDays >= 0
                    ? 'فترة ائتمان الموردين تتجاوز فترة تحصيل الصيدليات، مما يوفر تمويلاً ذاتياً مستقراً للمخزن.'
                    : 'تحصيل الصيدليات أبطأ من سداد الموردين، مما يضغط على رصيد الخزينة ويتطلب سيولة احتياطية.'}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-3">
            <button
              onClick={onGoToCashFlow}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1"
            >
              <span>تفاصيل ميزان المقبوضات والمدفوعات</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* High-Risk SKU & Inventory Integration Table - Exactly styled to Sleek Interface */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-bold text-slate-800 text-base">
              ربط المخزون وتوقعات المبيعات (High-Risk SKU & Inventory Integration)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              متابعة الأصناف التي وصلت لحد الطلب أو تواريخ الصلاحية الحرجة مع حساب التكلفة الفعلية بعد البونص
            </p>
          </div>
          <button
            onClick={onGoToInventory}
            className="text-blue-600 hover:text-blue-700 text-xs font-bold flex items-center gap-1 self-start sm:self-auto"
          >
            <span>عرض سجل الأصناف بالكامل ←</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3 text-right">اسم الصنف (Item Name)</th>
                <th className="px-5 py-3 text-center">معادلة البونص (Bonus Logic)</th>
                <th className="px-5 py-3 text-center">الرصيد الحالي</th>
                <th className="px-5 py-3 text-center">حد الطلب</th>
                <th className="px-5 py-3 text-center">التكلفة الفعلية (Effective Cost)</th>
                <th className="px-5 py-3 text-center">الصلاحية (Expiry)</th>
                <th className="px-5 py-3 text-center">الحالة التشغيلية (Status)</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {items.slice(0, 6).map(item => {
                const effCost = calculateEffectiveCost(item);
                const exp = getExpiryStatus(item.expiryDate);
                const isLowStock = item.currentStock <= item.reorderLevel;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900">{item.nameAr}</div>
                      <div className="text-xs text-slate-500 font-mono">{item.nameEn} ({item.code})</div>
                    </td>
                    <td className="px-5 py-3.5 text-center text-slate-600 text-xs font-mono">
                      {item.bonusBuyQty > 0 && item.bonusFreeQty > 0 ? (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-bold">
                          {item.bonusBuyQty} + {item.bonusFreeQty}
                        </span>
                      ) : (
                        <span className="text-slate-400">بدون بونص</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center font-bold text-slate-800">
                      {formatNumber(item.currentStock)}
                    </td>
                    <td className="px-5 py-3.5 text-center text-slate-500 font-mono text-xs">
                      {formatNumber(item.reorderLevel)}
                    </td>
                    <td className="px-5 py-3.5 text-center font-mono font-bold text-slate-900">
                      {formatCurrency(effCost)}
                      {item.bonusFreeQty > 0 && (
                        <span className="block text-[10px] text-emerald-600 font-normal">
                          (وفر {(100 - (effCost / item.costPrice) * 100).toFixed(1)}%)
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center font-mono text-xs">
                      <span className={`px-2 py-0.5 rounded-md border ${exp.badgeClass}`}>{item.expiryDate}</span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {isLowStock ? (
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-[10px] font-bold uppercase tracking-tight">
                          Low Stock / حد الطلب
                        </span>
                      ) : exp.status === 'critical' || exp.status === 'near_expiry' ? (
                        <span className="px-2 py-1 bg-rose-100 text-rose-700 rounded-md text-[10px] font-bold uppercase tracking-tight">
                          Near Expiry / وشيك الانتهاء
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold uppercase tracking-tight">
                          Stable / آمن
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
