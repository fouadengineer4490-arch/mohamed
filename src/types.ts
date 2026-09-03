export interface PharmaItem {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  category: string;
  manufacturer: string;
  costPrice: number; // سعر الشراء الرسمي
  salePrice: number; // سعر البيع للصيدليات
  bonusBuyQty: number; // مثلا 10 في نظام 10+1
  bonusFreeQty: number; // مثلا 1 في نظام 10+1 (0 لو مفيش بونص)
  currentStock: number; // الرصيد الحالي بالعبوة
  reorderLevel: number; // حد الطلب
  reorderBatch: number; // كمية الشراء المقترحة عند وصول حد الطلب
  expiryDate: string; // YYYY-MM-DD
  creditDays: number; // فترة ائتمان المورد بالأيام (مثلا 60 يوم)
}

export interface MonthlyForecastUnits {
  [itemId: string]: number[]; // 12 numbers for 12 months (0 = Jan, 11 = Dec)
}

export interface CollectionSettings {
  cashPercent: number; // e.g. 40%
  days30Percent: number; // e.g. 40%
  days60Percent: number; // e.g. 20%
}

export interface OperatingExpenses {
  salaries: number[]; // 12 months
  rentAndStorage: number[]; // المخازن وسلسلة التبريد
  logisticsAndFuel: number[]; // الشحن والسيارات
  utilitiesAndAdmin: number[]; // كهرباء وإنترنت ومصاريف عمومية
  marketingAndDiscounts: number[]; // خصومات ترويجية
}

export interface MonthSummary {
  monthNameAr: string;
  monthNameEn: string;
  forecastUnits: number;
  salesRevenue: number;
  cogs: number;
  grossProfit: number;
  cashInflow: number;
  supplierPayments: number;
  operatingExpenses: number;
  totalOutflow: number;
  netCashFlow: number;
  openingCash: number;
  closingCash: number;
  reorderOrdersValue: number;
}
