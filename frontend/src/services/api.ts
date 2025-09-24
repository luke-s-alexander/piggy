const API_BASE_URL = 'http://localhost:8000/api/v1'

export interface NetWorthCurrent {
  net_worth: number
  total_assets: number
  total_liabilities: number
  asset_accounts: Array<{
    id: string
    name: string
    type: string
    balance: number
  }>
  liability_accounts: Array<{
    id: string
    name: string
    type: string
    balance: number
  }>
  calculation_date: string
}

export interface NetWorthTrendPoint {
  date: string
  net_worth: number
  assets: number
  liabilities: number
}

export interface NetWorthTrend {
  time_range: string
  data_points: NetWorthTrendPoint[]
}

export interface AssetLiabilityBreakdownItem {
  name: string
  value: number
  color: string
  icon: string
}

export interface AssetLiabilityBreakdown {
  breakdown: AssetLiabilityBreakdownItem[]
}

export interface CategoryBreakdownItem {
  name: string
  assets: number
  liabilities: number
  net: number
  icon: string
}

export interface CategoryBreakdown {
  categories: CategoryBreakdownItem[]
}

export interface NetWorthPeriodComparison {
  net_worth: number
  total_assets: number
  total_liabilities: number
  period_days: number
}

export interface NetWorthChanges {
  net_worth: number
  net_worth_percent: number
  assets: number
  assets_percent: number
  liabilities: number
  liabilities_percent: number
}

export interface NetWorthSummary {
  current: NetWorthCurrent
  previous_period: NetWorthPeriodComparison
  changes: NetWorthChanges
}

export interface DashboardData {
  summary: NetWorthSummary
  trend: NetWorthTrend
  asset_liability_breakdown: AssetLiabilityBreakdown
  category_breakdown: CategoryBreakdown
}

class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message)
    this.name = 'ApiError'
  }
}

async function apiRequest<T>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(
        errorData.detail || `HTTP error! status: ${response.status}`,
        response.status
      )
    }
    
    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    
    // Network or parsing errors
    throw new ApiError(
      error instanceof Error ? error.message : 'An unknown error occurred'
    )
  }
}

export const dashboardApi = {
  // Get all dashboard data in a single request
  getDashboardData: async (timeRange: string = '6M', comparisonDays: number = 30): Promise<DashboardData> => {
    return apiRequest<DashboardData>(`/dashboard?time_range=${timeRange}&comparison_days=${comparisonDays}`)
  },

  // Individual dashboard endpoints (for fallback or specific use)
  getSummary: async (comparisonDays: number = 30): Promise<NetWorthSummary> => {
    return apiRequest<NetWorthSummary>(`/dashboard/summary?comparison_days=${comparisonDays}`)
  },

  getTrend: async (timeRange: string = '6M'): Promise<NetWorthTrend> => {
    return apiRequest<NetWorthTrend>(`/dashboard/trend?time_range=${timeRange}`)
  },

  getAssetLiabilityBreakdown: async (): Promise<AssetLiabilityBreakdown> => {
    return apiRequest<AssetLiabilityBreakdown>(`/dashboard/asset-liability`)
  },

  getCategoryBreakdown: async (): Promise<CategoryBreakdown> => {
    return apiRequest<CategoryBreakdown>(`/dashboard/categories`)
  }
}

export const reportsApi = {
  getCurrentNetWorth: async (): Promise<NetWorthCurrent> => {
    return apiRequest<NetWorthCurrent>(`/reports/net-worth/current`)
  },

  getNetWorthTrend: async (timeRange: string = '6M'): Promise<NetWorthTrend> => {
    return apiRequest<NetWorthTrend>(`/reports/net-worth/trend?time_range=${timeRange}`)
  },

  getNetWorthSummary: async (comparisonDays: number = 30): Promise<NetWorthSummary> => {
    return apiRequest<NetWorthSummary>(`/reports/net-worth/summary?comparison_days=${comparisonDays}`)
  },

  getAssetLiabilityBreakdown: async (): Promise<AssetLiabilityBreakdown> => {
    return apiRequest<AssetLiabilityBreakdown>(`/reports/asset-liability-breakdown`)
  },

  getCategoryBreakdown: async (): Promise<CategoryBreakdown> => {
    return apiRequest<CategoryBreakdown>(`/reports/category-breakdown`)
  }
}