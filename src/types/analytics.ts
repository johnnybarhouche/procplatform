export interface KPISummary {
  totalPRs: number;
  totalPOs: number;
  totalValue: number;
  avgResponseTime: number;
  topSupplier: string;
  monthlyTrends: MonthlyTrend[];
}

export interface MonthlyTrend {
  month: string;
  prs: number;
  pos: number;
  value: number;
  responseRate: number;
}

export interface PRAnalytics {
  totalPRs: number;
  pendingPRs: number;
  approvedPRs: number;
  rejectedPRs: number;
  monthlyTrends: MonthlyTrend[];
  avgProcessingTime: number;
  topRequesters: RequesterStats[];
}

export interface RequesterStats {
  name: string;
  count: number;
  totalValue: number;
}

export interface POAnalytics {
  totalPOs: number;
  totalValue: number;
  pendingPOs: number;
  sentPOs: number;
  acknowledgedPOs: number;
  monthlySpending: MonthlySpending[];
  topSuppliers: SupplierSpend[];
}

export interface MonthlySpending {
  month: string;
  value: number;
  count: number;
}

export interface SupplierSpend {
  supplierId: string;
  supplierName: string;
  totalSpend: number;
  poCount: number;
  avgResponseTime: number;
}

export interface RFQAnalytics {
  totalRFQs: number;
  avgResponseRate: number;
  avgResponseTime: number;
  supplierEngagement: SupplierEngagement[];
  monthlyPerformance: MonthlyRFQPerformance[];
}

export interface SupplierEngagement {
  supplierId: string;
  supplierName: string;
  responseRate: number;
  avgResponseTime: number;
  quoteCount: number;
}

export interface MonthlyRFQPerformance {
  month: string;
  rfqCount: number;
  responseRate: number;
  avgResponseTime: number;
}

export interface SupplierAnalytics {
  totalSuppliers: number;
  activeSuppliers: number;
  shareOfSpend: SupplierShare[];
  performanceRankings: SupplierPerformance[];
}

export interface SupplierShare {
  supplierId: string;
  supplierName: string;
  spend: number;
  percentage: number;
}

export interface SupplierPerformance {
  supplierId: string;
  supplierName: string;
  rating: number;
  totalSpend: number;
  responseRate: number;
  onTimeDelivery: number;
}

export interface ItemPriceTrends {
  itemId: string;
  itemCode: string;
  itemName: string;
  priceHistory: PriceHistoryPoint[];
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
}

export interface PriceHistoryPoint {
  date: string;
  price: number;
  supplier: string;
}

export interface AnalyticsFilters {
  dateRange: {
    start: string;
    end: string;
  };
  projectId?: string;
  supplierId?: string;
  category?: string;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'area';
  title: string;
  xAxis?: string;
  yAxis?: string;
  colors?: string[];
  height?: number;
  width?: number;
}

export interface ExportOptions {
  format: 'csv' | 'xlsx';
  dateRange: {
    start: string;
    end: string;
  };
  includeCharts: boolean;
  filters?: AnalyticsFilters;
}

