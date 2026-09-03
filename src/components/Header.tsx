import React from 'react';
import { Menu, Plus, FileSpreadsheet, Sparkles, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  activeTab: 'dashboard' | 'inventory' | 'forecast' | 'cashflow';
  onOpenMobileSidebar: () => void;
  onOpenAddItem: () => void;
  onExportExcel: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenMobileSidebar,
  onOpenAddItem,
  onExportExcel
}) => {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          ar: 'نظرة عامة تنفيذية لإدارة المخزن والسيولة',
          en: 'Warehouse Executive Overview'
        };
      case 'inventory':
        return {
          ar: 'سجل الأصناف وبطاقات المخزون والبونص',
          en: 'Inventory & Items Master'
        };
      case 'forecast':
        return {
          ar: 'مصفوفة توقعات المبيعات الشهرية وتكلفة البضاعة',
          en: 'Sales & COGS Forecast Engine'
        };
      case 'cashflow':
        return {
          ar: 'بيان التدفقات النقدية والتحصيلات والمصروفات',
          en: 'Cash Flow & Liquidity Statement'
        };
    }
  };

  const title = getTabTitle();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex justify-between items-center px-4 sm:px-6 lg:px-8 shrink-0 z-10">
      {/* Title & Mobile Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 -ms-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
          aria-label="فتح القائمة"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg lg:text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <span>{title.ar}</span>
          </h1>
          <div className="text-[11px] text-slate-400 font-mono hidden sm:block">
            {title.en}
          </div>
        </div>
      </div>

      {/* Status Badges & Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Sleek Design Sync Status Pill */}
        <div className="hidden md:flex items-center gap-2">
          <span className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>حالة المزامنة: متصل (Live Sync)</span>
          </span>
          <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-medium">
            الفترة: 12 شهراً
          </span>
        </div>

        {/* Action: Add Item */}
        <button
          onClick={onOpenAddItem}
          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg text-xs sm:text-sm border border-slate-200 transition flex items-center gap-1.5 active:scale-95"
        >
          <Plus className="w-4 h-4 text-blue-600" />
          <span className="hidden sm:inline">إضافة صنف</span>
          <span className="sm:hidden">صنف</span>
        </button>

        {/* Action: Real Excel Export with Sleek High-Impact Styling */}
        <button
          onClick={onExportExcel}
          className="px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs sm:text-sm shadow-xs hover:shadow transition flex items-center gap-2 active:scale-95"
          title="تصدير شيت الإكسل التفاعلي المكون من 4 صفحات كاملة"
        >
          <FileSpreadsheet className="w-4 h-4 text-blue-100" />
          <span className="hidden sm:inline">تحميل ملف الإكسل (.xlsx)</span>
          <span className="sm:hidden">إكسل</span>
        </button>
      </div>
    </header>
  );
};
