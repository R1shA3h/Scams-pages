export interface SummaryStats {
  totalAmount: number
  totalCases: number
  scamsByType: {
    investment: number
    trading: number
    forex: number
    other: number
  }
  dateRange: {
    start: string
    end: string
    weekNumber?: number
    month?: string
    year?: number
  }
}

export interface SummaryResponse {
  daily: SummaryStats
  weekly: SummaryStats
  monthly: SummaryStats
  yearly: SummaryStats
}

export interface DateRangeResponse {
  totalScams: number;
  totalAmount: number;
  startDate: string;
  endDate: string;
  message: string;
}

interface ScamsByType {
  investment: number
  trading: number
  forex: number
  other: number
}

interface MonthlyTrend {
  month: string
  totalAmount: number
  totalScams: number
  scamsByType: ScamsByType
}

export interface TrendsResponse {
  year: number
  data: MonthlyTrend[]
}

export interface SourceItem {
  title: string;
  description: string;
  scamAmount: number;
  scamType: string;
  url: string;
  source: string;
  location: string;
  publishedAt: string;
}

export interface SourcesResponse {
  count: number;
  timeframe: {
    from: string;
    to: string;
  };
  sources: SourceItem[];
}

export interface GeoDistributionItem {
  location: string;
  count: number;
  totalAmount: number;
}

export type GeoDistributionResponse = GeoDistributionItem[];

export interface ScamTypesResponse {
  timeframe: string;
  year: number;
  month: string;
  types: {
    investment: number;
    trading: number;
    forex: number;
    other: number;
  };
  total: number;
  percentages: {
    investment: string;
    trading: string;
    forex: string;
    other: string;
  };
} 