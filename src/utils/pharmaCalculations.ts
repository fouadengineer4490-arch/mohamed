import { PharmaItem, MonthlyForecastUnits, CollectionSettings, OperatingExpenses, MonthSummary } from '../types';
import { MONTH_NAMES_AR, MONTH_NAMES_EN } from '../data/initialData';

export function calculateEffectiveCost(item: PharmaItem): number {
  if (item.bonusFreeQty > 0 && item.bonusBuyQty > 0) {
    return Number((item.costPrice * (item.bonusBuyQty / (item.bonusBuyQty + item.bonusFreeQty))).toFixed(2));
  }
  return item.costPrice;
}

export function calculateGrossMargin(salePrice: number, effectiveCost: number): number {
  if (salePrice <= 0) return 0;
  return Number((((salePrice - effectiveCost) / salePrice) * 100).toFixed(1));
}

export interface ExpiryStatus {
  status: 'expired' | 'critical' | 'near_expiry' | 'warning' | 'safe';
  monthsRemaining: number;
  labelAr: string;
  badgeClass: string;
}

export function getExpiryStatus(expiryDateStr: string): ExpiryStatus {
  const expiry = new Date(expiryDateStr);
  const now = new Date(); // In production, compares against current date
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const months = Math.round(diffDays / 30);

  if (months <= 0) {
    return {
      status: 'expired',
      monthsRemaining: months,
      labelAr: 'منتهي الصلاحية!',
      badgeClass: 'bg-red-100 text-red-800 border-red-300'
    };
  }
  if (months <= 3) {
    return {
      status: 'critical',
      monthsRemaining: months,
      labelAr: `حرج (${months} شهر)`,
      badgeClass: 'bg-red-50 text-red-700 border-red-200'
    };
  }
  if (months <= 6) {
    return {
      status: 'near_expiry',
      monthsRemaining: months,
      labelAr: `وشيك الانتهاء (${months} شهر)`,
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-300'
    };
  }
  if (months <= 12) {
    return {
      status: 'warning',
      monthsRemaining: months,
      labelAr: `أقل من سنة (${months} شهر)`,
      badgeClass: 'bg-yellow-50 text-yellow-800 border-yellow-200'
    };
  }
  return {
    status: 'safe',
    monthsRemaining: months,
    labelAr: `آمن (${months} شهر)`,
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200'
  };
}

export interface ItemStockSimulation {
  item: PharmaItem;
  effectiveCost: number;
  monthlyStocks: number[]; // 12 months ending stock
  reorderTriggeredMonths: number[]; // which months triggered reorder
  totalOrderedUnits: number;
  totalOrderCost: number;
}

export interface FullSimulationResult {
  monthSummaries: MonthSummary[];
  itemSimulations: { [itemId: string]: ItemStockSimulation };
  totalAnnualSales: number;
  totalAnnualCOGS: number;
  totalAnnualGrossProfit: number;
  averageGrossMargin: number;
  totalInventoryCostValue: number;
  totalInventorySaleValue: number;
  nearExpiryValue: number;
  criticalExpiryCount: number;
  reorderAlertsCount: number;
  minClosingCash: number;
  hasCashGap: boolean;
  cashGapMonths: string[];
}

export function runPharmaSimulation(
  items: PharmaItem[],
  forecast: MonthlyForecastUnits,
  collection: CollectionSettings,
  expenses: OperatingExpenses,
  initialOpeningCash: number
): FullSimulationResult {
  const itemSimulations: { [itemId: string]: ItemStockSimulation } = {};
  
  // Track planned purchase orders: month -> total cost to pay suppliers in that month
  // Supplier payments lag by creditDays (approx 30 days = 1 month, 60 days = 2 months, 90 days = 3 months)
  const scheduledSupplierPayments: number[] = new Array(12).fill(0);
  
  // Baseline initial supplier obligations from previous months (realistic pharma warehouse cash flow)
  scheduledSupplierPayments[0] = 180000; // دفعات مستحقة لمشتريات سابقة في يناير
  scheduledSupplierPayments[1] = 160000; // دفعات مستحقة في فبراير

  const monthlyReorderValue: number[] = new Array(12).fill(0);

  // 1. Simulate stock movement and reorders per item
  items.forEach(item => {
    const effCost = calculateEffectiveCost(item);
    const itemForecast = forecast[item.id] || new Array(12).fill(0);
    const monthlyStocks: number[] = [];
    const reorderTriggeredMonths: number[] = [];
    let currentSimStock = item.currentStock;
    let totalOrderedUnits = 0;
    let totalOrderCost = 0;

    for (let m = 0; m < 12; m++) {
      const demand = itemForecast[m] || 0;
      let endStock = currentSimStock - demand;

      // Check if stock fell below or reached reorder level
      if (endStock <= item.reorderLevel) {
        reorderTriggeredMonths.push(m);
        const orderUnits = item.reorderBatch;
        totalOrderedUnits += orderUnits;
        const orderCost = orderUnits * effCost;
        totalOrderCost += orderCost;
        monthlyReorderValue[m] += orderCost;

        // Determine when this order is paid based on creditDays
        const lagMonths = Math.max(1, Math.round(item.creditDays / 30));
        const paymentMonth = m + lagMonths;
        if (paymentMonth < 12) {
          scheduledSupplierPayments[paymentMonth] += orderCost;
        }

        // Replenishment arrives: assume lead time is within same month for delivery
        endStock += orderUnits;
      }

      monthlyStocks.push(endStock);
      currentSimStock = endStock;
    }

    itemSimulations[item.id] = {
      item,
      effectiveCost: effCost,
      monthlyStocks,
      reorderTriggeredMonths,
      totalOrderedUnits,
      totalOrderCost
    };
  });

  // 2. Calculate monthly sales & collections
  const monthlySalesRevenue: number[] = new Array(12).fill(0);
  const monthlyCOGS: number[] = new Array(12).fill(0);
  const monthlyUnits: number[] = new Array(12).fill(0);

  for (let m = 0; m < 12; m++) {
    items.forEach(item => {
      const units = (forecast[item.id] && forecast[item.id][m]) || 0;
      monthlyUnits[m] += units;
      monthlySalesRevenue[m] += units * item.salePrice;
      const effCost = itemSimulations[item.id]?.effectiveCost || item.costPrice;
      monthlyCOGS[m] += units * effCost;
    });
  }

  // 3. Compute Monthly Cash Flow (Inflows, Outflows, Balances)
  const monthSummaries: MonthSummary[] = [];
  let rollingCash = initialOpeningCash;
  const cashGapMonths: string[] = [];
  let minClosingCash = Infinity;

  // Assume previous year Q4 baseline for smooth collections in Jan/Feb
  const baselineNovSales = monthlySalesRevenue[0] * 0.95;
  const baselineDecSales = monthlySalesRevenue[0] * 0.98;

  for (let m = 0; m < 12; m++) {
    const currentSales = monthlySalesRevenue[m];
    const cogs = monthlyCOGS[m];
    const grossProfit = currentSales - cogs;

    // Collections calculation:
    // Cash sales (same month)
    const cashInCurrent = currentSales * (collection.cashPercent / 100);

    // 30-day credit collections (from previous month)
    const prevSales30 = m === 0 ? baselineDecSales : monthlySalesRevenue[m - 1];
    const collection30 = prevSales30 * (collection.days30Percent / 100);

    // 60-day credit collections (from 2 months prior)
    const prevSales60 = m === 0 ? baselineNovSales : (m === 1 ? baselineDecSales : monthlySalesRevenue[m - 2]);
    const collection60 = prevSales60 * (collection.days60Percent / 100);

    const totalInflow = Math.round(cashInCurrent + collection30 + collection60);

    // Outflows:
    const suppPayment = Math.round(scheduledSupplierPayments[m]);
    const opex =
      (expenses.salaries[m] || 0) +
      (expenses.rentAndStorage[m] || 0) +
      (expenses.logisticsAndFuel[m] || 0) +
      (expenses.utilitiesAndAdmin[m] || 0) +
      (expenses.marketingAndDiscounts[m] || 0);

    const totalOutflow = Math.round(suppPayment + opex);
    const netCash = totalInflow - totalOutflow;

    const openingCash = rollingCash;
    const closingCash = openingCash + netCash;
    rollingCash = closingCash;

    if (closingCash < minClosingCash) {
      minClosingCash = closingCash;
    }
    if (closingCash < 0) {
      cashGapMonths.push(MONTH_NAMES_AR[m]);
    }

    monthSummaries.push({
      monthNameAr: MONTH_NAMES_AR[m],
      monthNameEn: MONTH_NAMES_EN[m],
      forecastUnits: monthlyUnits[m],
      salesRevenue: Math.round(currentSales),
      cogs: Math.round(cogs),
      grossProfit: Math.round(grossProfit),
      cashInflow: totalInflow,
      supplierPayments: suppPayment,
      operatingExpenses: opex,
      totalOutflow,
      netCashFlow: netCash,
      openingCash,
      closingCash,
      reorderOrdersValue: Math.round(monthlyReorderValue[m])
    });
  }

  // 4. Warehouse KPI Totals
  let totalInventoryCostValue = 0;
  let totalInventorySaleValue = 0;
  let nearExpiryValue = 0;
  let criticalExpiryCount = 0;
  let reorderAlertsCount = 0;

  items.forEach(item => {
    const effCost = calculateEffectiveCost(item);
    totalInventoryCostValue += item.currentStock * effCost;
    totalInventorySaleValue += item.currentStock * item.salePrice;

    if (item.currentStock <= item.reorderLevel) {
      reorderAlertsCount++;
    }

    const expiry = getExpiryStatus(item.expiryDate);
    if (expiry.status === 'expired' || expiry.status === 'critical') {
      criticalExpiryCount++;
      nearExpiryValue += item.currentStock * effCost;
    } else if (expiry.status === 'near_expiry') {
      nearExpiryValue += item.currentStock * effCost;
    }
  });

  const totalAnnualSales = monthlySalesRevenue.reduce((a, b) => a + b, 0);
  const totalAnnualCOGS = monthlyCOGS.reduce((a, b) => a + b, 0);
  const totalAnnualGrossProfit = totalAnnualSales - totalAnnualCOGS;
  const averageGrossMargin = totalAnnualSales > 0 ? (totalAnnualGrossProfit / totalAnnualSales) * 100 : 0;

  return {
    monthSummaries,
    itemSimulations,
    totalAnnualSales: Math.round(totalAnnualSales),
    totalAnnualCOGS: Math.round(totalAnnualCOGS),
    totalAnnualGrossProfit: Math.round(totalAnnualGrossProfit),
    averageGrossMargin: Number(averageGrossMargin.toFixed(1)),
    totalInventoryCostValue: Math.round(totalInventoryCostValue),
    totalInventorySaleValue: Math.round(totalInventorySaleValue),
    nearExpiryValue: Math.round(nearExpiryValue),
    criticalExpiryCount,
    reorderAlertsCount,
    minClosingCash,
    hasCashGap: cashGapMonths.length > 0,
    cashGapMonths
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ar-EG', {
    style: 'decimal',
    maximumFractionDigits: 0
  }).format(value) + ' ج.م';
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('ar-EG').format(value);
}
