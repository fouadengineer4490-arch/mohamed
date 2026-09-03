import React, { useState, useEffect, useMemo } from 'react';
import { PharmaItem, MonthlyForecastUnits, CollectionSettings, OperatingExpenses } from './types';
import {
  INITIAL_ITEMS,
  INITIAL_FORECAST,
  INITIAL_COLLECTION_SETTINGS,
  INITIAL_OPERATING_EXPENSES,
  INITIAL_OPENING_CASH
} from './data/initialData';
import { runPharmaSimulation } from './utils/pharmaCalculations';
import { exportPharmaExcelWorkbook } from './utils/excelExport';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { InventoryView } from './components/InventoryView';
import { ForecastView } from './components/ForecastView';
import { CashFlowView } from './components/CashFlowView';
import { ItemModal } from './components/ItemModal';
import { CheckCircle } from 'lucide-react';

export default function App() {
  // 1. Persistent State
  const [items, setItems] = useState<PharmaItem[]>(() => {
    try {
      const saved = localStorage.getItem('pharma_items');
      return saved ? JSON.parse(saved) : INITIAL_ITEMS;
    } catch {
      return INITIAL_ITEMS;
    }
  });

  const [forecast, setForecast] = useState<MonthlyForecastUnits>(() => {
    try {
      const saved = localStorage.getItem('pharma_forecast');
      return saved ? JSON.parse(saved) : INITIAL_FORECAST;
    } catch {
      return INITIAL_FORECAST;
    }
  });

  const [collection, setCollection] = useState<CollectionSettings>(() => {
    try {
      const saved = localStorage.getItem('pharma_collection');
      return saved ? JSON.parse(saved) : INITIAL_COLLECTION_SETTINGS;
    } catch {
      return INITIAL_COLLECTION_SETTINGS;
    }
  });

  const [expenses, setExpenses] = useState<OperatingExpenses>(() => {
    try {
      const saved = localStorage.getItem('pharma_expenses');
      return saved ? JSON.parse(saved) : INITIAL_OPERATING_EXPENSES;
    } catch {
      return INITIAL_OPERATING_EXPENSES;
    }
  });

  const [openingCash, setOpeningCash] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('pharma_opening_cash');
      return saved ? JSON.parse(saved) : INITIAL_OPENING_CASH;
    } catch {
      return INITIAL_OPENING_CASH;
    }
  });

  // 2. Active Tab & Navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'forecast' | 'cashflow'>('dashboard');

  // 3. Modal State for Items CRUD
  const [isItemModalOpen, setIsItemModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<PharmaItem | null>(null);

  // 4. Download Notification Toast
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<boolean>(false);

  // 5. Mobile Sidebar Drawer State
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('pharma_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('pharma_forecast', JSON.stringify(forecast));
  }, [forecast]);

  useEffect(() => {
    localStorage.setItem('pharma_collection', JSON.stringify(collection));
  }, [collection]);

  useEffect(() => {
    localStorage.setItem('pharma_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('pharma_opening_cash', JSON.stringify(openingCash));
  }, [openingCash]);

  // 6. Pharma Financial & Inventory Simulation
  const simulation = useMemo(() => {
    return runPharmaSimulation(items, forecast, collection, expenses, openingCash);
  }, [items, forecast, collection, expenses, openingCash]);

  // Handlers for Items
  const handleSaveItem = (itemToSave: PharmaItem) => {
    if (editingItem) {
      setItems(prev => prev.map(i => (i.id === itemToSave.id ? itemToSave : i)));
    } else {
      setItems(prev => [itemToSave, ...prev]);
      // Initialize 12-month forecast for the new item based on current stock
      setForecast(prev => ({
        ...prev,
        [itemToSave.id]: new Array(12).fill(Math.round(itemToSave.currentStock * 0.75))
      }));
    }
    setIsItemModalOpen(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (itemId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الصنف من سجل المخزون وقوائم التوقعات؟')) {
      setItems(prev => prev.filter(i => i.id !== itemId));
      setForecast(prev => {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      });
    }
  };

  const handleUpdateStock = (itemId: string, newStock: number) => {
    setItems(prev =>
      prev.map(i => (i.id === itemId ? { ...i, currentStock: Math.max(0, newStock) } : i))
    );
  };

  // Handlers for Forecast
  const handleUpdateForecastUnit = (itemId: string, monthIndex: number, units: number) => {
    setForecast(prev => {
      const itemRow = [...(prev[itemId] || new Array(12).fill(0))];
      itemRow[monthIndex] = Math.max(0, units);
      return {
        ...prev,
        [itemId]: itemRow
      };
    });
  };

  const handleBulkAdjustForecast = (percentage: number) => {
    setForecast(prev => {
      const updated: MonthlyForecastUnits = {};
      const factor = 1 + percentage / 100;
      Object.keys(prev).forEach(itemId => {
        updated[itemId] = prev[itemId].map(u => Math.max(0, Math.round(u * factor)));
      });
      return updated;
    });
  };

  const handleUpdateExpenseMonth = (
    category: keyof OperatingExpenses,
    monthIdx: number,
    val: number
  ) => {
    setExpenses(prev => {
      const updatedCat = [...prev[category]];
      updatedCat[monthIdx] = Math.max(0, val);
      return {
        ...prev,
        [category]: updatedCat
      };
    });
  };

  const handleResetData = () => {
    if (confirm('هل ترغب في استعادة بيانات النظام والنموذج التجريبي الافتراضي؟ سيتم إعادة ضبط التعديلات.')) {
      setItems(INITIAL_ITEMS);
      setForecast(INITIAL_FORECAST);
      setCollection(INITIAL_COLLECTION_SETTINGS);
      setExpenses(INITIAL_OPERATING_EXPENSES);
      setOpeningCash(INITIAL_OPENING_CASH);
      localStorage.clear();
    }
  };

  // Real Excel Export Download Trigger
  const handleExportExcel = () => {
    exportPharmaExcelWorkbook(items, forecast, collection, expenses, openingCash);
    setDownloadSuccessToast(true);
    setTimeout(() => {
      setDownloadSuccessToast(false);
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Toast Notification upon Excel Download */}
      {downloadSuccessToast && (
        <div className="fixed bottom-5 left-5 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-5">
          <div className="p-1.5 bg-blue-600 rounded-lg text-white">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold">تم تنزيل ملف الإكسل بنجاح!</h4>
            <p className="text-xs text-slate-300">
              تم تحميل ملف (Pharma_Warehouse_Forecast_CashFlow_System.xlsx) متضمناً 4 شيتات كاملة ومترابطة.
            </p>
          </div>
        </div>
      )}

      {/* Sleek Dark Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onResetData={handleResetData}
        reorderCount={simulation.reorderAlertsCount}
        criticalExpiryCount={simulation.criticalExpiryCount}
        hasCashGap={simulation.hasCashGap}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Sleek Top Header */}
        <Header
          activeTab={activeTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenAddItem={() => {
            setEditingItem(null);
            setIsItemModalOpen(true);
          }}
          onExportExcel={handleExportExcel}
        />

        {/* Dynamic View Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          {activeTab === 'dashboard' && (
            <DashboardView
              simulation={simulation}
              items={items}
              onGoToInventory={() => setActiveTab('inventory')}
              onGoToCashFlow={() => setActiveTab('cashflow')}
              onGoToForecast={() => setActiveTab('forecast')}
              onOpenAddItem={() => {
                setEditingItem(null);
                setIsItemModalOpen(true);
              }}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryView
              items={items}
              onAddItem={() => {
                setEditingItem(null);
                setIsItemModalOpen(true);
              }}
              onEditItem={item => {
                setEditingItem(item);
                setIsItemModalOpen(true);
              }}
              onDeleteItem={handleDeleteItem}
              onUpdateStock={handleUpdateStock}
            />
          )}

          {activeTab === 'forecast' && (
            <ForecastView
              items={items}
              forecast={forecast}
              onUpdateForecastUnit={handleUpdateForecastUnit}
              onBulkAdjustForecast={handleBulkAdjustForecast}
            />
          )}

          {activeTab === 'cashflow' && (
            <CashFlowView
              simulation={simulation}
              collection={collection}
              expenses={expenses}
              openingCash={openingCash}
              onUpdateCollection={setCollection}
              onUpdateOpeningCash={setOpeningCash}
              onUpdateExpenseMonth={handleUpdateExpenseMonth}
            />
          )}
        </main>
      </div>

      {/* Add / Edit Item Modal */}
      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => {
          setIsItemModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
        initialItem={editingItem}
      />
    </div>
  );
}
