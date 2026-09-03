import { PharmaItem, MonthlyForecastUnits, CollectionSettings, OperatingExpenses } from '../types';

export const MONTH_NAMES_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

export const MONTH_NAMES_EN = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const INITIAL_ITEMS: PharmaItem[] = [
  {
    id: 'item-1',
    code: 'MED-101',
    nameAr: 'بنادول إكسترا أقراص (Panadol Extra)',
    nameEn: 'Panadol Extra 500mg',
    category: 'مسكنات وخافض حرارة',
    manufacturer: 'GSK',
    costPrice: 42,
    salePrice: 55,
    bonusBuyQty: 10,
    bonusFreeQty: 1, // 10+1 -> Effective Cost = 42 * 10 / 11 = 38.18
    currentStock: 2800,
    reorderLevel: 800,
    reorderBatch: 2000,
    expiryDate: '2027-08-15',
    creditDays: 60
  },
  {
    id: 'item-2',
    code: 'MED-102',
    nameAr: 'أوجمنتين 1 جم أقراص (Augmentin 1g)',
    nameEn: 'Augmentin 1g Tablets',
    category: 'مضادات حيوية',
    manufacturer: 'GSK',
    costPrice: 105,
    salePrice: 135,
    bonusBuyQty: 10,
    bonusFreeQty: 2, // 10+2 -> Effective Cost = 105 * 10 / 12 = 87.5
    currentStock: 1100,
    reorderLevel: 400,
    reorderBatch: 1000,
    expiryDate: '2027-04-10',
    creditDays: 60
  },
  {
    id: 'item-3',
    code: 'MED-103',
    nameAr: 'كونكور 5 مجم أقراص (Concor 5mg)',
    nameEn: 'Concor 5mg Tablets',
    category: 'أدوية القلب والضغط',
    manufacturer: 'Merck',
    costPrice: 52,
    salePrice: 68,
    bonusBuyQty: 10,
    bonusFreeQty: 1,
    currentStock: 1600,
    reorderLevel: 500,
    reorderBatch: 1200,
    expiryDate: '2026-11-20', // وشيك الانتهاء قريباً
    creditDays: 60
  },
  {
    id: 'item-4',
    code: 'MED-104',
    nameAr: 'كليكسان 40 مجم حقن (Clexane 40mg)',
    nameEn: 'Clexane 40mg Syringes',
    category: 'مضادات تجلط الدم',
    manufacturer: 'Sanofi',
    costPrice: 210,
    salePrice: 260,
    bonusBuyQty: 10,
    bonusFreeQty: 0, // بدون بونص
    currentStock: 380,
    reorderLevel: 200,
    reorderBatch: 400,
    expiryDate: '2027-10-01',
    creditDays: 45
  },
  {
    id: 'item-5',
    code: 'MED-105',
    nameAr: 'نيكسيوم 40 مجم أقراص (Nexium 40mg)',
    nameEn: 'Nexium 40mg Tablets',
    category: 'الجهاز الهضمي والمعدة',
    manufacturer: 'AstraZeneca',
    costPrice: 160,
    salePrice: 205,
    bonusBuyQty: 10,
    bonusFreeQty: 1,
    currentStock: 750,
    reorderLevel: 300,
    reorderBatch: 600,
    expiryDate: '2026-12-15', // نهاية العام
    creditDays: 60
  },
  {
    id: 'item-6',
    code: 'MED-106',
    nameAr: 'بروفين 400 مجم أقراص (Brufen 400mg)',
    nameEn: 'Brufen 400mg Tablets',
    category: 'مضادات التهاب ومسكنات',
    manufacturer: 'Abbott',
    costPrice: 35,
    salePrice: 46,
    bonusBuyQty: 10,
    bonusFreeQty: 2,
    currentStock: 2400,
    reorderLevel: 700,
    reorderBatch: 1500,
    expiryDate: '2027-06-30',
    creditDays: 60
  },
  {
    id: 'item-7',
    code: 'MED-107',
    nameAr: 'جلوكوفاج 1000 مجم (Glucophage 1000mg)',
    nameEn: 'Glucophage 1000mg',
    category: 'أدوية السكري',
    manufacturer: 'Merck',
    costPrice: 48,
    salePrice: 62,
    bonusBuyQty: 10,
    bonusFreeQty: 1,
    currentStock: 1400,
    reorderLevel: 450,
    reorderBatch: 1000,
    expiryDate: '2026-10-15', // وشيك جداً (أقل من شهرين!)
    creditDays: 45
  },
  {
    id: 'item-8',
    code: 'MED-108',
    nameAr: 'كيتوفان 100 مجم كبسول (Ketophan 100mg)',
    nameEn: 'Ketophan 100mg Capsules',
    category: 'مسكنات ومضادات روماتيزم',
    manufacturer: 'Amoun',
    costPrice: 28,
    salePrice: 37,
    bonusBuyQty: 10,
    bonusFreeQty: 2,
    currentStock: 1100,
    reorderLevel: 400,
    reorderBatch: 800,
    expiryDate: '2027-09-01',
    creditDays: 30
  },
  {
    id: 'item-9',
    code: 'MED-109',
    nameAr: 'ليبيتور 20 مجم أقراص (Lipitor 20mg)',
    nameEn: 'Lipitor 20mg Tablets',
    category: 'أدوية الكوليسترول',
    manufacturer: 'Pfizer',
    costPrice: 185,
    salePrice: 235,
    bonusBuyQty: 10,
    bonusFreeQty: 1,
    currentStock: 480,
    reorderLevel: 200,
    reorderBatch: 450,
    expiryDate: '2027-11-10',
    creditDays: 60
  },
  {
    id: 'item-10',
    code: 'MED-110',
    nameAr: 'زيثروماكس 500 مجم (Zithromax 500mg)',
    nameEn: 'Zithromax 500mg Capsules',
    category: 'مضادات حيوية',
    manufacturer: 'Pfizer',
    costPrice: 85,
    salePrice: 110,
    bonusBuyQty: 10,
    bonusFreeQty: 1,
    currentStock: 600,
    reorderLevel: 250,
    reorderBatch: 500,
    expiryDate: '2027-03-25',
    creditDays: 60
  }
];

export const INITIAL_FORECAST: MonthlyForecastUnits = {
  'item-1': [450, 480, 520, 500, 530, 550, 600, 620, 580, 540, 510, 560], // Panadol
  'item-2': [180, 200, 220, 210, 190, 170, 160, 180, 230, 250, 240, 230], // Augmentin (higher in winter)
  'item-3': [240, 250, 260, 255, 270, 280, 290, 285, 280, 275, 270, 290], // Concor
  'item-4': [60, 65, 70, 65, 70, 75, 80, 75, 70, 75, 70, 80],             // Clexane
  'item-5': [110, 120, 130, 125, 140, 145, 150, 140, 135, 130, 125, 140], // Nexium
  'item-6': [380, 400, 420, 410, 430, 450, 480, 470, 450, 430, 420, 460], // Brufen
  'item-7': [210, 220, 230, 225, 240, 245, 250, 245, 240, 235, 230, 250], // Glucophage
  'item-8': [160, 170, 180, 175, 185, 190, 200, 195, 185, 180, 175, 190], // Ketophan
  'item-9': [70, 75, 80, 78, 85, 88, 90, 88, 85, 82, 80, 88],             // Lipitor
  'item-10': [90, 100, 110, 105, 95, 85, 80, 90, 115, 125, 120, 115]      // Zithromax
};

export const INITIAL_COLLECTION_SETTINGS: CollectionSettings = {
  cashPercent: 40,   // 40% كاش في نفس الشهر
  days30Percent: 40, // 40% آجل بعد 30 يوم
  days60Percent: 20  // 20% آجل بعد 60 يوم
};

export const INITIAL_OPERATING_EXPENSES: OperatingExpenses = {
  salaries: [65000, 65000, 65000, 65000, 68000, 68000, 68000, 68000, 70000, 70000, 70000, 72000],
  rentAndStorage: [25000, 25000, 25000, 25000, 25000, 25000, 25000, 25000, 25000, 25000, 25000, 25000],
  logisticsAndFuel: [18000, 18500, 19000, 19500, 20000, 20500, 21000, 21500, 22000, 22000, 22500, 23000],
  utilitiesAndAdmin: [12000, 12000, 13000, 13500, 14000, 14500, 15000, 15000, 14000, 13500, 13000, 13500],
  marketingAndDiscounts: [10000, 11000, 12000, 11500, 12500, 13000, 14000, 13500, 13000, 12500, 12000, 13000]
};

export const INITIAL_OPENING_CASH = 350000; // رصيد الخزينة والبنك الافتتاحي في 1 يناير
