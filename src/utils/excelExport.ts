import * as XLSX from 'xlsx';
import { PharmaItem, MonthlyForecastUnits, CollectionSettings, OperatingExpenses } from '../types';
import { MONTH_NAMES_AR } from '../data/initialData';
import {
  calculateEffectiveCost,
  calculateGrossMargin,
  getExpiryStatus,
  runPharmaSimulation
} from './pharmaCalculations';

export function exportPharmaExcelWorkbook(
  items: PharmaItem[],
  forecast: MonthlyForecastUnits,
  collection: CollectionSettings,
  expenses: OperatingExpenses,
  openingCash: number
): void {
  const simulation = runPharmaSimulation(items, forecast, collection, expenses, openingCash);
  const wb = XLSX.utils.book_new();

  // ==========================================
  // SHEET 1: Master_Inventory (بيانات المخزن والأصناف)
  // ==========================================
  const inventoryHeaders = [
    'كود الصنف',
    'اسم الدواء التجاري',
    'الاسم العلمي',
    'التصنيف العلاجي',
    'الشركة / المورد',
    'سعر الشراء الرسمي',
    'نظام البونص الوارد',
    'التكلفة الفعلية بعد البونص',
    'سعر البيع للصيدليات',
    'هامش الربح الإجمالي (%)',
    'الرصيد الحالي بالمخزن',
    'قيمة المخزون (بالتكلفة الفعلية)',
    'حد الطلب (Reorder Level)',
    'كمية الشراء المقترحة',
    'تاريخ انتهاء الصلاحية',
    'حالة الصلاحية',
    'فترة ائتمان المورد (يوم)',
    'تنبيه إعادة الشراء'
  ];

  const inventoryRows = items.map(item => {
    const effCost = calculateEffectiveCost(item);
    const margin = calculateGrossMargin(item.salePrice, effCost);
    const expiry = getExpiryStatus(item.expiryDate);
    const bonusStr = item.bonusFreeQty > 0 ? `${item.bonusBuyQty}+${item.bonusFreeQty}` : 'بدون بونص';
    const inventoryVal = item.currentStock * effCost;
    const reorderStatus = item.currentStock <= item.reorderLevel ? 'مطلوب الشراء فوراً!' : 'مخزون كافٍ';

    return [
      item.code,
      item.nameAr,
      item.nameEn,
      item.category,
      item.manufacturer,
      item.costPrice,
      bonusStr,
      effCost,
      item.salePrice,
      `${margin}%`,
      item.currentStock,
      inventoryVal,
      item.reorderLevel,
      item.reorderBatch,
      item.expiryDate,
      expiry.labelAr,
      `${item.creditDays} يوم`,
      reorderStatus
    ];
  });

  // Summary row for inventory
  const totalStockUnits = items.reduce((s, i) => s + i.currentStock, 0);
  const totalStockVal = items.reduce((s, i) => s + i.currentStock * calculateEffectiveCost(i), 0);
  const inventorySummaryRow = [
    'الإجمالي',
    `عدد الأصناف: ${items.length}`,
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    totalStockUnits,
    totalStockVal,
    '',
    '',
    '',
    '',
    '',
    ''
  ];

  const wsInventory = XLSX.utils.aoa_to_sheet([
    ['نظام إدارة مخازن الأدوية - قاعدة بيانات الأصناف والمخزون (Master Inventory)'],
    ['تاريخ التقرير:', new Date().toLocaleDateString('ar-EG')],
    [],
    inventoryHeaders,
    ...inventoryRows,
    [],
    inventorySummaryRow
  ]);

  // Set column widths for Sheet 1
  wsInventory['!cols'] = [
    { wch: 12 }, // Code
    { wch: 32 }, // Name Ar
    { wch: 25 }, // Name En
    { wch: 22 }, // Category
    { wch: 16 }, // Manufacturer
    { wch: 16 }, // Official Cost
    { wch: 18 }, // Bonus
    { wch: 22 }, // Effective Cost
    { wch: 18 }, // Sale Price
    { wch: 18 }, // Margin
    { wch: 18 }, // Current Stock
    { wch: 24 }, // Stock Value
    { wch: 18 }, // Reorder Level
    { wch: 18 }, // Batch
    { wch: 16 }, // Expiry
    { wch: 20 }, // Expiry alert
    { wch: 16 }, // Credit days
    { wch: 18 }  // Reorder alert
  ];

  XLSX.utils.book_append_sheet(wb, wsInventory, 'Master_Inventory');

  // ==========================================
  // SHEET 2: Sales_Forecast (توقعات المبيعات 12 شهر)
  // ==========================================
  const forecastHeaders = [
    'كود الصنف',
    'اسم الدواء',
    'سعر البيع',
    'التكلفة الفعلية',
    ...MONTH_NAMES_AR,
    'إجمالي الوحدات المتوقعة',
    'إجمالي المبيعات المتوقعة (ج.م)',
    'إجمالي تكلفة المبيعات COGS (ج.م)',
    'إجمالي الربح المتوقع (ج.م)'
  ];

  const forecastRows = items.map(item => {
    const effCost = calculateEffectiveCost(item);
    const itemForecast = forecast[item.id] || new Array(12).fill(0);
    const totalUnits = itemForecast.reduce((a, b) => a + b, 0);
    const totalSales = totalUnits * item.salePrice;
    const totalCogs = totalUnits * effCost;
    const grossProfit = totalSales - totalCogs;

    return [
      item.code,
      item.nameAr,
      item.salePrice,
      effCost,
      ...itemForecast,
      totalUnits,
      totalSales,
      totalCogs,
      grossProfit
    ];
  });

  // Totals for Forecast sheet
  const monthlyTotalUnits: number[] = new Array(12).fill(0);
  const monthlyTotalSales: number[] = new Array(12).fill(0);
  for (let m = 0; m < 12; m++) {
    items.forEach(item => {
      const u = (forecast[item.id] && forecast[item.id][m]) || 0;
      monthlyTotalUnits[m] += u;
      monthlyTotalSales[m] += u * item.salePrice;
    });
  }

  const grandTotalUnits = monthlyTotalUnits.reduce((a, b) => a + b, 0);
  const grandTotalSales = simulation.totalAnnualSales;
  const grandTotalCogs = simulation.totalAnnualCOGS;
  const grandTotalProfit = simulation.totalAnnualGrossProfit;

  const forecastTotalsRow = [
    'الإجمالي العام',
    '',
    '',
    '',
    ...monthlyTotalUnits,
    grandTotalUnits,
    grandTotalSales,
    grandTotalCogs,
    grandTotalProfit
  ];

  const wsForecast = XLSX.utils.aoa_to_sheet([
    ['توقعات المبيعات السنوية لمخزن الأدوية (Sales Forecast - 12 Months)'],
    ['محسوبة بأسعار البيع والتكلفة الفعلية بعد البونص'],
    [],
    forecastHeaders,
    ...forecastRows,
    [],
    forecastTotalsRow
  ]);

  wsForecast['!cols'] = [
    { wch: 12 }, // Code
    { wch: 32 }, // Name
    { wch: 12 }, // Price
    { wch: 14 }, // Cost
    ...new Array(12).fill({ wch: 10 }), // 12 months
    { wch: 18 }, // Total units
    { wch: 22 }, // Total sales
    { wch: 22 }, // Total COGS
    { wch: 22 }  // Profit
  ];

  XLSX.utils.book_append_sheet(wb, wsForecast, 'Sales_Forecast');

  // ==========================================
  // SHEET 3: Cash_Flow_Statement (التدفق النقدي 12 شهر)
  // ==========================================
  const cashFlowHeaders = [
    'بند التدفق النقدي',
    'النسبة / السياسة',
    ...MONTH_NAMES_AR,
    'إجمالي العام'
  ];

  const cashFlowRows: any[][] = [
    // Inflows
    [
      'المبيعات المتوقعة (قيمة الفواتير)',
      '100%',
      ...simulation.monthSummaries.map(m => m.salesRevenue),
      simulation.totalAnnualSales
    ],
    [
      '1. المقبوضات النقدية (تحصيل كاش فوري)',
      `${collection.cashPercent}%`,
      ...simulation.monthSummaries.map(m => Math.round(m.salesRevenue * (collection.cashPercent / 100))),
      Math.round(simulation.totalAnnualSales * (collection.cashPercent / 100))
    ],
    [
      '2. تحصيلات آجلة بعد 30 يوم',
      `${collection.days30Percent}%`,
      ...simulation.monthSummaries.map(m => {
        // actual calculated inflow minus cash portion
        return Math.round(m.salesRevenue * (collection.days30Percent / 100));
      }),
      Math.round(simulation.totalAnnualSales * (collection.days30Percent / 100))
    ],
    [
      '3. تحصيلات آجلة بعد 60 يوم',
      `${collection.days60Percent}%`,
      ...simulation.monthSummaries.map(m => {
        return Math.round(m.salesRevenue * (collection.days60Percent / 100));
      }),
      Math.round(simulation.totalAnnualSales * (collection.days60Percent / 100))
    ],
    [
      'إجمالي المقبوضات النقدية الداخلة (Total Inflows)',
      'داخل الخزينة والبنك',
      ...simulation.monthSummaries.map(m => m.cashInflow),
      simulation.monthSummaries.reduce((a, b) => a + b.cashInflow, 0)
    ],
    [],
    // Outflows
    [
      '4. سداد مشتريات الموردين والأدوية',
      'بفترة ائتمان 30-60 يوم',
      ...simulation.monthSummaries.map(m => m.supplierPayments),
      simulation.monthSummaries.reduce((a, b) => a + b.supplierPayments, 0)
    ],
    [
      '5. رواتب الصيادلة والإداريين والعمال',
      'شهري ثابت',
      ...expenses.salaries,
      expenses.salaries.reduce((a, b) => a + b, 0)
    ],
    [
      '6. إيجار المخازن وسلسلة التبريد (Cold Chain)',
      'شهري ثابت',
      ...expenses.rentAndStorage,
      expenses.rentAndStorage.reduce((a, b) => a + b, 0)
    ],
    [
      '7. الشحن والتوزيع والسيارات والوقود',
      'تشغيلي',
      ...expenses.logisticsAndFuel,
      expenses.logisticsAndFuel.reduce((a, b) => a + b, 0)
    ],
    [
      '8. المرافق والكهرباء ومصاريف عمومية',
      'تشغيلي',
      ...expenses.utilitiesAndAdmin,
      expenses.utilitiesAndAdmin.reduce((a, b) => a + b, 0)
    ],
    [
      '9. خصومات ترويجية ومصروفات تسويق',
      'متغير',
      ...expenses.marketingAndDiscounts,
      expenses.marketingAndDiscounts.reduce((a, b) => a + b, 0)
    ],
    [
      'إجمالي المدفوعات النقدية الخارجة (Total Outflows)',
      'سداد والتزامات',
      ...simulation.monthSummaries.map(m => m.totalOutflow),
      simulation.monthSummaries.reduce((a, b) => a + b.totalOutflow, 0)
    ],
    [],
    // Net Position
    [
      'صافي التدفق النقدي الشهري (Net Cash Flow)',
      'داخل - خارج',
      ...simulation.monthSummaries.map(m => m.netCashFlow),
      simulation.monthSummaries.reduce((a, b) => a + b.netCashFlow, 0)
    ],
    [
      'رصيد أول المدة (Opening Cash)',
      'بداية الشهر',
      ...simulation.monthSummaries.map(m => m.openingCash),
      openingCash
    ],
    [
      'رصيد آخر المدة (Closing Cash Balance)',
      'نهاية الشهر',
      ...simulation.monthSummaries.map(m => m.closingCash),
      simulation.monthSummaries[11].closingCash
    ],
    [
      'حالة السيولة (Cash Status)',
      'تقييم الإدارة',
      ...simulation.monthSummaries.map(m => (m.closingCash >= 0 ? 'آمن / فائض' : 'عجز سيولة (تنبيه!)')),
      simulation.hasCashGap ? 'توجد فجوة تمويلية تحتاج تدخل' : 'سيولة نقدية مستقرة'
    ]
  ];

  const wsCashFlow = XLSX.utils.aoa_to_sheet([
    ['بيان التدفقات النقدية والسيولة لمخزن الأدوية (Cash Flow Statement - 12 Months)'],
    [
      `سياسة التحصيل: كاش ${collection.cashPercent}% | آجل 30 يوم ${collection.days30Percent}% | آجل 60 يوم ${collection.days60Percent}%`,
      `الرصيد الافتتاحي: ${openingCash.toLocaleString()} ج.م`
    ],
    [],
    cashFlowHeaders,
    ...cashFlowRows
  ]);

  wsCashFlow['!cols'] = [
    { wch: 36 },
    { wch: 20 },
    ...new Array(12).fill({ wch: 14 }),
    { wch: 18 }
  ];

  XLSX.utils.book_append_sheet(wb, wsCashFlow, 'Cash_Flow');

  // ==========================================
  // SHEET 4: Executive_Dashboard (لوحة التحكم)
  // ==========================================
  const dashboardRows = [
    ['لوحة المؤشرات التنفيذية لمخزن الأدوية - Executive Pharma KPIs'],
    ['تقرير شامل يربط المخزون بالمبيعات والسيولة النقدية'],
    [],
    ['المؤشر التنفيذي (KPI)', 'القيمة', 'ملاحظات الإدارة التنفيذية'],
    ['إجمالي قيمة المخزون الحالي (بسعر التكلفة الفعلية)', `${simulation.totalInventoryCostValue.toLocaleString()} ج.م`, 'محسوبة بعد خصم البونص'],
    ['إجمالي قيمة المخزون بسعر البيع للصيدليات', `${simulation.totalInventorySaleValue.toLocaleString()} ج.م`, 'القيمة البيعية المتوقعة'],
    ['إجمالي المبيعات السنوية المتوقعة', `${simulation.totalAnnualSales.toLocaleString()} ج.م`, 'مجموع توقعات 12 شهر'],
    ['إجمالي تكلفة البضاعة المباعة (COGS)', `${simulation.totalAnnualCOGS.toLocaleString()} ج.م`, 'التكلفة الإجمالية للبضاعة'],
    ['إجمالي الربح الإجمالي المتوقع', `${simulation.totalAnnualGrossProfit.toLocaleString()} ج.م`, 'الربح قبل المصاريف التشغيلية'],
    ['متوسط هامش الربح الإجمالي', `${simulation.averageGrossMargin}%`, 'نسبة ممتازة لقطاع توزيع الأدوية'],
    ['قيمة المخزون المعرض لمخاطر الصلاحية (أقل من 6 شهور)', `${simulation.nearExpiryValue.toLocaleString()} ج.م`, 'يتطلب ترويج فوري أو إرجاع للشركة'],
    ['عدد الأصناف الواصلة لحد الطلب (Reorder Alert)', `${simulation.reorderAlertsCount} أصناف`, 'أوامر شراء مطلوبة لمنع توقف الصرف'],
    ['أدنى رصيد نقدي مسجل خلال العام', `${simulation.minClosingCash.toLocaleString()} ج.م`, simulation.hasCashGap ? 'يوجد عجز سيولة في بعض الأشهر!' : 'رصيد آمن طوال العام'],
    ['رصيد النقدية المتوقع بنهاية العام', `${simulation.monthSummaries[11]?.closingCash.toLocaleString()} ج.م`, 'المركز المالي المتوقع في 31 ديسمبر'],
    [],
    ['أوامر الشراء الفورية المقترحة (Purchase Action Plan):'],
    ['كود الصنف', 'اسم الدواء', 'الرصيد الحالي', 'حد الطلب', 'الكمية المقترحة للشراء', 'التكلفة التقديرية (ج.م)'],
    ...items
      .filter(item => item.currentStock <= item.reorderLevel)
      .map(item => {
        const effCost = calculateEffectiveCost(item);
        return [
          item.code,
          item.nameAr,
          item.currentStock,
          item.reorderLevel,
          item.reorderBatch,
          item.reorderBatch * effCost
        ];
      })
  ];

  const wsDashboard = XLSX.utils.aoa_to_sheet(dashboardRows);
  wsDashboard['!cols'] = [
    { wch: 45 },
    { wch: 25 },
    { wch: 40 },
    { wch: 15 },
    { wch: 22 },
    { wch: 22 }
  ];

  XLSX.utils.book_append_sheet(wb, wsDashboard, 'Executive_Dashboard');

  // Trigger browser download of the real .xlsx file!
  XLSX.writeFile(wb, 'Pharma_Warehouse_Forecast_CashFlow_System.xlsx');
}
