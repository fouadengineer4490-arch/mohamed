import React from 'react';
import {
  FullSimulationResult,
  formatCurrency,
  formatNumber
} from '../utils/pharmaCalculations';
import { CollectionSettings, OperatingExpenses } from '../types';
import { MONTH_NAMES_AR } from '../data/initialData';
import {
  Coins,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldAlert,
  Settings2,
  Calendar,
  Wallet,
  Building2,
  CheckCircle2
} from 'lucide-react';

interface CashFlowViewProps {
  simulation: FullSimulationResult;
  collection: CollectionSettings;
  expenses: OperatingExpenses;
  openingCash: number;
  onUpdateCollection: (newSettings: CollectionSettings) => void;
  onUpdateOpeningCash: (val: number) => void;
  onUpdateExpenseMonth: (
    category: keyof OperatingExpenses,
    monthIdx: number,
    val: number
  ) => void;
}

export const CashFlowView: React.FC<CashFlowViewProps> = ({
  simulation,
  collection,
  expenses,
  openingCash,
  onUpdateCollection,
  onUpdateOpeningCash,
  onUpdateExpenseMonth
}) => {
  const totalInflows = simulation.monthSummaries.reduce((a, b) => a + b.cashInflow, 0);
  const totalOutflows = simulation.monthSummaries.reduce((a, b) => a + b.totalOutflow, 0);
  const netYearCash = totalInflows - totalOutflows;

  const handleCashChange = (val: number) => {
    const remaining = 100 - val;
    onUpdateCollection({
      cashPercent: val,
      days30Percent: Math.round(remaining * 0.65),
      days60Percent: remaining - Math.round(remaining * 0.65)
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Coins className="w-5 h-5 text-blue-600" />
            <span>بيان التدفقات النقدية والسيولة (Cash Flow Statement - 12M)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ربط مبيعات الأدوية بدورة التحصيل الآجل (Credit Cycle) وسداد الموردين ومصروفات سلسلة التبريد والتشغيل
          </p>
        </div>

        {/* Total Inflow vs Outflow */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-3 py-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1.5">
            <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
            <span>إجمالي الداخل: {formatCurrency(totalInflows)}</span>
          </div>
          <div className="px-3 py-1.5 bg-rose-50 text-rose-900 border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1.5">
            <ArrowUpRight className="w-4 h-4 text-rose-600" />
            <span>إجمالي الخارج: {formatCurrency(totalOutflows)}</span>
          </div>
        </div>
      </div>

      {/* Credit & Collection Settings Panel */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-blue-600" />
            <span>إعدادات سياسة الائتمان والتحصيل (Collection Terms & Lag)</span>
          </h3>
          <span className="text-xs text-slate-400">
            تتحكم في تاريخ دخول السيولة الفعلي للخزينة
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          {/* Cash Sales % */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>تحصيل كاش فوري (نفس الشهر)</span>
              <span className="font-bold text-emerald-700">{collection.cashPercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={collection.cashPercent}
              onChange={e => handleCashChange(parseInt(e.target.value) || 0)}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          {/* 30 Days % */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>آجل 30 يوماً (الشهر التالي)</span>
              <span className="font-bold text-blue-700">{collection.days30Percent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max={100 - collection.cashPercent}
              value={collection.days30Percent}
              onChange={e => {
                const val = parseInt(e.target.value) || 0;
                onUpdateCollection({
                  ...collection,
                  days30Percent: val,
                  days60Percent: 100 - collection.cashPercent - val
                });
              }}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          {/* 60 Days % */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>آجل 60 يوماً (بعد شهرين)</span>
              <span className="font-bold text-indigo-700">{collection.days60Percent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max={100 - collection.cashPercent}
              value={collection.days60Percent}
              onChange={e => {
                const val = parseInt(e.target.value) || 0;
                onUpdateCollection({
                  ...collection,
                  days60Percent: val,
                  days30Percent: 100 - collection.cashPercent - val
                });
              }}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          {/* Opening Cash Input */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              رصيد أول المدة (1 يناير)
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                step="1000"
                value={openingCash}
                onChange={e => onUpdateOpeningCash(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="text-xs text-slate-500 font-bold whitespace-nowrap">ج.م</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cash Flow Statement Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200 select-none">
              <tr>
                <th className="px-4 py-3 sticky right-0 bg-slate-50 z-10 min-w-56">
                  بند التدفق النقدي / الشهور
                </th>
                {MONTH_NAMES_AR.map((m, idx) => (
                  <th key={idx} className="px-2 py-3 text-center min-w-20">
                    {m}
                  </th>
                ))}
                <th className="px-3 py-3 text-center bg-slate-100 font-bold min-w-28 text-slate-800">
                  إجمالي العام
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {/* SECTION 1: SALES & INFLOWS */}
              <tr className="bg-blue-50/50 font-sans font-bold text-blue-950">
                <td colSpan={14} className="px-4 py-2 text-xs">
                  أولاً: المقبوضات النقدية والتحصيلات (Cash Inflows)
                </td>
              </tr>

              <tr className="hover:bg-slate-50 text-slate-600">
                <td className="px-4 py-2 font-sans sticky right-0 bg-white z-10">
                  مبيعات الأدوية الإجمالية (Gross Sales)
                </td>
                {simulation.monthSummaries.map((m, idx) => (
                  <td key={idx} className="px-2 py-2 text-center font-medium">
                    {m.salesRevenue.toLocaleString()}
                  </td>
                ))}
                <td className="px-3 py-2 text-center font-bold bg-slate-50 text-slate-800">
                  {simulation.totalAnnualSales.toLocaleString()}
                </td>
              </tr>

              <tr className="hover:bg-slate-50 text-[11px] text-slate-500">
                <td className="px-4 py-2 font-sans sticky right-0 bg-white z-10 pr-6">
                  تحصيل المبيعات النقدية ({collection.cashPercent}%)
                </td>
                {simulation.monthSummaries.map((m, idx) => (
                  <td key={idx} className="px-2 py-2 text-center">
                    {m.cashSalesCollected.toLocaleString()}
                  </td>
                ))}
                <td className="px-3 py-2 text-center font-semibold bg-slate-50">
                  {simulation.monthSummaries.reduce((a, b) => a + b.cashSalesCollected, 0).toLocaleString()}
                </td>
              </tr>

              <tr className="hover:bg-slate-50 text-[11px] text-slate-500">
                <td className="px-4 py-2 font-sans sticky right-0 bg-white z-10 pr-6">
                  تحصيل المبيعات الآجلة (30 يوماً - {collection.days30Percent}%)
                </td>
                {simulation.monthSummaries.map((m, idx) => (
                  <td key={idx} className="px-2 py-2 text-center">
                    {m.credit30Collected.toLocaleString()}
                  </td>
                ))}
                <td className="px-3 py-2 text-center font-semibold bg-slate-50">
                  {simulation.monthSummaries.reduce((a, b) => a + b.credit30Collected, 0).toLocaleString()}
                </td>
              </tr>

              <tr className="hover:bg-slate-50 text-[11px] text-slate-500">
                <td className="px-4 py-2 font-sans sticky right-0 bg-white z-10 pr-6">
                  تحصيل المبيعات الآجلة (60 يوماً - {collection.days60Percent}%)
                </td>
                {simulation.monthSummaries.map((m, idx) => (
                  <td key={idx} className="px-2 py-2 text-center">
                    {m.credit60Collected.toLocaleString()}
                  </td>
                ))}
                <td className="px-3 py-2 text-center font-semibold bg-slate-50">
                  {simulation.monthSummaries.reduce((a, b) => a + b.credit60Collected, 0).toLocaleString()}
                </td>
              </tr>

              <tr className="bg-emerald-100/60 font-bold text-emerald-950">
                <td className="px-4 py-2.5 font-sans sticky right-0 bg-emerald-100/90 z-10">
                  إجمالي المقبوضات النقدية الداخلة (Total Inflows)
                </td>
                {simulation.monthSummaries.map((m, idx) => (
                  <td key={idx} className="px-2 py-2.5 text-center font-bold">
                    {m.cashInflow.toLocaleString()}
                  </td>
                ))}
                <td className="px-3 py-2.5 text-center font-bold bg-emerald-200/80">
                  {totalInflows.toLocaleString()}
                </td>
              </tr>

              {/* SECTION 2: OUTFLOWS */}
              <tr className="bg-rose-50/50 font-sans font-bold text-rose-950">
                <td colSpan={14} className="px-4 py-2 text-xs">
                  ثانياً: المدفوعات النقدية التشغيلية وسداد الموردين (Cash Outflows)
                </td>
              </tr>

              <tr className="hover:bg-slate-50 text-slate-700">
                <td className="px-4 py-2 font-sans sticky right-0 bg-white z-10">
                  سداد فواتير شركات وموردي الأدوية (حسب فترات الائتمان)
                </td>
                {simulation.monthSummaries.map((m, idx) => (
                  <td key={idx} className="px-2 py-2 text-center font-medium">
                    {m.supplierPayments.toLocaleString()}
                  </td>
                ))}
                <td className="px-3 py-2 text-center font-bold bg-slate-50 text-rose-900">
                  {simulation.monthSummaries.reduce((a, b) => a + b.supplierPayments, 0).toLocaleString()}
                </td>
              </tr>

              <tr className="hover:bg-slate-50 text-[11px] text-slate-600">
                <td className="px-4 py-2 font-sans sticky right-0 bg-white z-10">
                  رواتب الصيادلة والإداريين ومسؤولي التخزين
                </td>
                {expenses.salaries.map((val, idx) => (
                  <td key={idx} className="px-2 py-2 text-center">
                    <input
                      type="number"
                      value={val}
                      onChange={e => onUpdateExpenseMonth('salaries', idx, parseInt(e.target.value) || 0)}
                      className="w-16 px-1 py-0.5 text-center border border-slate-200 rounded text-slate-700 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
                    />
                  </td>
                ))}
                <td className="px-3 py-2 text-center font-semibold bg-slate-50">
                  {expenses.salaries.reduce((a, b) => a + b, 0).toLocaleString()}
                </td>
              </tr>

              <tr className="hover:bg-slate-50 text-[11px] text-slate-600">
                <td className="px-4 py-2 font-sans sticky right-0 bg-white z-10">
                  إيجار المخازن وسلسلة التبريد (Cold Chain)
                </td>
                {expenses.rentAndStorage.map((val, idx) => (
                  <td key={idx} className="px-2 py-2 text-center">
                    <input
                      type="number"
                      value={val}
                      onChange={e => onUpdateExpenseMonth('rentAndStorage', idx, parseInt(e.target.value) || 0)}
                      className="w-16 px-1 py-0.5 text-center border border-slate-200 rounded text-slate-700 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
                    />
                  </td>
                ))}
                <td className="px-3 py-2 text-center font-semibold bg-slate-50">
                  {expenses.rentAndStorage.reduce((a, b) => a + b, 0).toLocaleString()}
                </td>
              </tr>

              <tr className="hover:bg-slate-50 text-[11px] text-slate-600">
                <td className="px-4 py-2 font-sans sticky right-0 bg-white z-10">
                  الشحن والتوزيع والسيارات والوقود
                </td>
                {expenses.logisticsAndFuel.map((val, idx) => (
                  <td key={idx} className="px-2 py-2 text-center">
                    <input
                      type="number"
                      value={val}
                      onChange={e => onUpdateExpenseMonth('logisticsAndFuel', idx, parseInt(e.target.value) || 0)}
                      className="w-16 px-1 py-0.5 text-center border border-slate-200 rounded text-slate-700 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
                    />
                  </td>
                ))}
                <td className="px-3 py-2 text-center font-semibold bg-slate-50">
                  {expenses.logisticsAndFuel.reduce((a, b) => a + b, 0).toLocaleString()}
                </td>
              </tr>

              <tr className="hover:bg-slate-50 text-[11px] text-slate-600">
                <td className="px-4 py-2 font-sans sticky right-0 bg-white z-10">
                  المرافق، الكهرباء، إنترنت، ومصروفات إدارية
                </td>
                {expenses.utilitiesAndAdmin.map((val, idx) => (
                  <td key={idx} className="px-2 py-2 text-center">
                    <input
                      type="number"
                      value={val}
                      onChange={e => onUpdateExpenseMonth('utilitiesAndAdmin', idx, parseInt(e.target.value) || 0)}
                      className="w-16 px-1 py-0.5 text-center border border-slate-200 rounded text-slate-700 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
                    />
                  </td>
                ))}
                <td className="px-3 py-2 text-center font-semibold bg-slate-50">
                  {expenses.utilitiesAndAdmin.reduce((a, b) => a + b, 0).toLocaleString()}
                </td>
              </tr>

              <tr className="bg-rose-100/60 font-bold text-rose-950">
                <td className="px-4 py-2.5 font-sans sticky right-0 bg-rose-100/90 z-10">
                  إجمالي المدفوعات النقدية الخارجة (Total Outflows)
                </td>
                {simulation.monthSummaries.map((m, idx) => (
                  <td key={idx} className="px-2 py-2.5 text-center font-bold">
                    {m.totalOutflow.toLocaleString()}
                  </td>
                ))}
                <td className="px-3 py-2.5 text-center font-bold bg-rose-200/80">
                  {totalOutflows.toLocaleString()}
                </td>
              </tr>

              {/* SECTION 3: NET POSITION & BALANCES */}
              <tr className="bg-slate-100 font-sans font-bold text-slate-900 border-t border-slate-200">
                <td colSpan={14} className="px-4 py-2 text-xs">
                  ثالثاً: صافي التدفق والمركز النقدي التراكمي
                </td>
              </tr>

              <tr className="hover:bg-slate-50 font-bold">
                <td className="px-4 py-2.5 font-sans text-slate-900 sticky right-0 bg-white z-10">
                  صافي التدفق النقدي الشهري (Net Flow)
                </td>
                {simulation.monthSummaries.map((m, idx) => (
                  <td
                    key={idx}
                    className={`px-2 py-2.5 text-center font-mono ${
                      m.netCashFlow >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {m.netCashFlow >= 0 ? `+${m.netCashFlow.toLocaleString()}` : m.netCashFlow.toLocaleString()}
                  </td>
                ))}
                <td
                  className={`px-3 py-2.5 text-center font-bold font-mono bg-slate-50 ${
                    netYearCash >= 0 ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {netYearCash >= 0 ? `+${netYearCash.toLocaleString()}` : netYearCash.toLocaleString()}
                </td>
              </tr>

              <tr className="hover:bg-slate-50 text-slate-600">
                <td className="px-4 py-2 font-sans sticky right-0 bg-white z-10">
                  رصيد النقدية أول الشهر (Opening Cash)
                </td>
                {simulation.monthSummaries.map((m, idx) => (
                  <td key={idx} className="px-2 py-2 text-center">
                    {m.openingCash.toLocaleString()}
                  </td>
                ))}
                <td className="px-3 py-2 text-center font-semibold bg-slate-50">
                  {openingCash.toLocaleString()}
                </td>
              </tr>

              <tr className="bg-slate-900 text-white font-bold">
                <td className="px-4 py-3 font-sans sticky right-0 bg-slate-900 z-10">
                  رصيد النقدية آخر الشهر (Closing Cash)
                </td>
                {simulation.monthSummaries.map((m, idx) => (
                  <td
                    key={idx}
                    className={`px-2 py-3 text-center font-mono ${
                      m.closingCash < 0 ? 'text-red-400 bg-red-950/60 font-black' : 'text-blue-300'
                    }`}
                  >
                    {m.closingCash.toLocaleString()}
                  </td>
                ))}
                <td className="px-3 py-3 text-center font-mono bg-slate-800 text-blue-400 font-black">
                  {simulation.monthSummaries[11]?.closingCash.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
