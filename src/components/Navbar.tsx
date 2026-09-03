import React from 'react';
import {
  FileSpreadsheet,
  Download,
  PlusCircle,
  RotateCcw,
  LayoutDashboard,
  Package,
  TrendingUp,
  Coins,
  ShieldAlert
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'inventory' | 'forecast' | 'cashflow';
  setActiveTab: (tab: 'dashboard' | 'inventory' | 'forecast' | 'cashflow') => void;
  onExportExcel: () => void;
  onOpenAddItem: () => void;
  onResetData: () => void;
  reorderCount: number;
  criticalExpiryCount: number;
  hasCashGap: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onExportExcel,
  onOpenAddItem,
  onResetData,
  reorderCount,
  criticalExpiryCount,
  hasCashGap
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top Banner with Brand & Direct Download */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-sm">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  نظام إدارة مخازن الأدوية والتدفق النقدي
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-semibold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                  Pharma ERP Model
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                ربط المخزون بتوقعات المبيعات والسيولة النقدية مع توليد الإكسل الحقيقي
              </p>
            </div>
          </div>

          {/* Actions: Direct Excel Download & Add Item */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onResetData}
              title="استعادة البيانات الافتراضية"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition text-xs flex items-center gap-1"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden md:inline">استعادة النموذج</span>
            </button>

            <button
              onClick={onOpenAddItem}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg text-xs sm:text-sm flex items-center gap-1.5 transition"
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span>إضافة صنف</span>
            </button>

            {/* REAL EXCEL DOWNLOAD BUTTON */}
            <button
              id="download-excel-btn"
              onClick={onExportExcel}
              className="px-3.5 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs sm:text-sm shadow-sm hover:shadow-md flex items-center gap-2 transition cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4 animate-bounce" />
              <span>تحميل ملف الإكسل (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-t border-slate-100 py-1 overflow-x-auto no-scrollbar">
          <nav className="flex space-x-reverse space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2 transition ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-50 text-emerald-800 font-bold border-b-2 border-emerald-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>لوحة التحكم التنفيذية</span>
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2 transition ${
                activeTab === 'inventory'
                  ? 'bg-emerald-50 text-emerald-800 font-bold border-b-2 border-emerald-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>المخزون والأصناف (Master Data)</span>
              {reorderCount > 0 && (
                <span className="px-1.5 py-0.2 bg-red-100 text-red-700 text-[10px] font-bold rounded-full">
                  {reorderCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('forecast')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2 transition ${
                activeTab === 'forecast'
                  ? 'bg-emerald-50 text-emerald-800 font-bold border-b-2 border-emerald-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>توقعات المبيعات (Sales Forecast)</span>
            </button>

            <button
              onClick={() => setActiveTab('cashflow')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2 transition ${
                activeTab === 'cashflow'
                  ? 'bg-emerald-50 text-emerald-800 font-bold border-b-2 border-emerald-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Coins className="w-4 h-4" />
              <span>التدفق النقدي (Cash Flow)</span>
              {hasCashGap && (
                <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full flex items-center gap-0.5">
                  <ShieldAlert className="w-3 h-3" />
                  عجز
                </span>
              )}
            </button>
          </nav>

          {/* Quick Alert Chips */}
          <div className="hidden lg:flex items-center gap-2 text-xs">
            {criticalExpiryCount > 0 && (
              <span className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full font-medium">
                ⚠️ {criticalExpiryCount} صنف وشيك الانتهاء
              </span>
            )}
            {reorderCount > 0 && (
              <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full font-medium">
                📦 {reorderCount} صنف وصل لحد الطلب
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
