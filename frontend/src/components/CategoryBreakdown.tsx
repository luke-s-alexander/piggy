import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { dashboardApi, CategoryBreakdownItem } from '../services/api'

interface CategoryDataPoint {
  name: string
  assets: number
  liabilities: number
  net: number
  icon: string
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    color: string
    name: string
    value: number
    payload: CategoryDataPoint
  }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null

  const data = payload[0].payload

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
      <p className="font-medium text-gray-900 mb-2">{label}</p>
      <div className="space-y-1">
        <p className="text-sm">
          <span className="font-medium text-secondary">Assets:</span> {formatCurrency(data.assets)}
        </p>
        <p className="text-sm">
          <span className="font-medium text-accent">Liabilities:</span> {formatCurrency(data.liabilities)}
        </p>
        <p className="text-sm border-t pt-1">
          <span className="font-medium text-primary">Net:</span> {formatCurrency(data.net)}
        </p>
      </div>
    </div>
  )
}

interface CategoryBreakdownProps {
  refreshTrigger?: number
}

export default function CategoryBreakdown({ refreshTrigger }: CategoryBreakdownProps) {
  const [data, setData] = useState<CategoryDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCategoryData()
  }, [refreshTrigger])

  const fetchCategoryData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const categoryData = await dashboardApi.getCategoryBreakdown()
      
      // Transform API data to match component interface
      const transformedData: CategoryDataPoint[] = categoryData.categories.map((item: CategoryBreakdownItem) => ({
        name: item.name,
        assets: item.assets,
        liabilities: item.liabilities,
        net: item.net,
        icon: item.icon
      }))
      
      setData(transformedData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load category breakdown')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Chart skeleton */}
        <div className="h-64 bg-gray-200 rounded-lg"></div>

        {/* Category list skeleton */}
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="flex gap-4">
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-800 mb-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">Error loading category breakdown</span>
        </div>
        <p className="text-red-700 mb-3">{error}</p>
        <button
          onClick={fetchCategoryData}
          className="text-red-800 underline hover:no-underline text-sm"
        >
          Try again
        </button>
      </div>
    )
  }

  // Sort by net value descending
  const sortedData = [...data].sort((a, b) => b.net - a.net)

  return (
    <div className="space-y-6">
      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sortedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => value.length > 8 ? value.substring(0, 8) + '...' : value}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={formatCurrency}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="net" 
              fill="var(--color-primary)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category List */}
      <div className="space-y-2">
        {sortedData.map((category) => (
          <div 
            key={category.name}
            className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <span className="material-icons text-white text-lg">{category.icon}</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{category.name}</p>
                <div className="flex gap-4 text-sm text-gray-600">
                  <span>Assets: {formatCurrency(category.assets)}</span>
                  <span>Liabilities: {formatCurrency(category.liabilities)}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-semibold ${
                category.net >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(category.net)}
              </p>
              <p className="text-xs text-gray-500">Net Worth</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}