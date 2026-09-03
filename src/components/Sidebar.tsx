import React from 'react';
import {
  LayoutDashboard,
  Package,
  TrendingUp,
  Coins,
  ShieldAlert,
  RotateCcw,
  User,
  Activity,
  FileSpreadsheet,
  X
} from 'lucide-react';

interface SidebarProps {
  activeTab: 'dashboard' | 'inventory' | 'forecast' | 'cashflow';
  setActiveTab: (tab: 'dashboard' | 'inventory' | 'forecast' | 'cashflow') => void;
  onResetData: () => void;
  reorderCount: number;
  criticalExpiryCount: number;
  hasCashGap: boolean;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onResetData,
  reorderCount,
  criticalExpiryCount,
  hasCashGap,
  isOpenMobile,
  onCloseMobile
}) => {
  const navItems = [
    {
      id: 'dashboard' as const,
      nameAr: 'لوحة التحكم التنفيذية',
      nameEn: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'inventory' as const,
      nameAr: 'المخزون والأصناف',
      nameEn: 'Inventory Master',
      icon: Package,
      badge: reorderCount > 0 ? { count: reorderCount, color: 'bg-amber-500/20 text-amber-300' } : null
    },
    {
      id: 'forecast' as const,
      nameAr: 'توقعات المبيعات (12 شهر)',
      nameEn: 'Sales Forecast',
      icon: TrendingUp,
      badge: null
    },
    {
      id: 'cashflow' as const,
      nameAr: 'محرك التدفق النقدي والسيولة',
      nameEn: 'Cash Flow Engine',
      icon: Coins,
      badge: hasCashGap ? { text: 'عجز نقدي', color: 'bg-rose-500/20 text-rose-300' } : null
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 right-0 z-50 w-64 bg-slate-900 flex flex-col border-s lg:border-s-0 lg:border-e border-slate-800 transition-transform duration-300 ease-in-out shrink-0 ${
          isOpenMobile ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white shadow-xs">
              P
            </div>
            <div>
              <div className="text-white font-bold text-lg tracking-tight leading-none">
                PharmaFlow <span className="text-blue-400">ERP</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">نظام إدارة مخازن الأدوية</div>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 text-slate-400 overflow-y-auto">
          <div className="text-[10px] uppercase font-bold text-slate-500 px-3 pt-2 pb-1 tracking-wider">
            الوحدات الرئيسية / Modules
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full p-3 rounded-lg flex items-center justify-between gap-3 text-sm font-medium transition cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  <div className="text-right">
                    <div>{item.nameAr}</div>
                    <div className="text-[10px] text-slate-400 font-mono tracking-tight">{item.nameEn}</div>
                  </div>
                </div>

                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.badge.color}`}
                  >
                    {item.badge.count ?? item.badge.text}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Account Manager & Reset Footer */}
        <div className="p-4 bg-slate-950/60 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 text-xs font-bold">
                AM
              </div>
              <div>
                <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                  Account Manager
                </div>
                <div className="text-xs font-semibold text-slate-200">Ahmed Mansour</div>
              </div>
            </div>

            <button
              onClick={onResetData}
              title="استعادة النموذج الافتراضي"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
