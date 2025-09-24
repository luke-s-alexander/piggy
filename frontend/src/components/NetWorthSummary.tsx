import { useState, useEffect } from 'react'
import { dashboardApi, NetWorthSummary as NetWorthSummaryData } from '../services/api'

interface SummaryData {
  title: string
  amount: number
  change: number
  changePercent: number
  icon: string
  bgColor: string
}

interface SummaryCardProps extends SummaryData {
  loading?: boolean
}

function SummaryCard({ title, amount, change, changePercent, icon, bgColor, loading }: SummaryCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-20 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-28"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  const isPositive = change >= 0
  const formattedAmount = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
  
  const formattedChange = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(change))

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{formattedAmount}</p>
          <div className="flex items-center mt-2">
            <span className={`text-sm font-medium ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {isPositive ? '↗' : '↘'} {formattedChange} ({Math.abs(changePercent).toFixed(1)}%)
            </span>
            <span className="text-xs text-gray-500 ml-2">vs last month</span>
          </div>
        </div>
        <div 
          className={`p-3 rounded-lg ${bgColor}`}
        >
          <span className="material-icons text-white text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  )
}

interface NetWorthSummaryProps {
  refreshTrigger?: number
}

export default function NetWorthSummary({ refreshTrigger }: NetWorthSummaryProps) {
  const [summaryData, setSummaryData] = useState<SummaryData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchNetWorthSummary()
  }, [refreshTrigger])

  const fetchNetWorthSummary = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const apiData = await dashboardApi.getSummary(30)
      
      const summaryCards: SummaryData[] = [
        {
          title: 'Net Worth',
          amount: apiData.current.net_worth,
          change: apiData.changes.net_worth,
          changePercent: apiData.changes.net_worth_percent,
          icon: 'trending_up',
          bgColor: 'bg-primary'
        },
        {
          title: 'Total Assets',
          amount: apiData.current.total_assets,
          change: apiData.changes.assets,
          changePercent: apiData.changes.assets_percent,
          icon: 'account_balance',
          bgColor: 'bg-secondary'
        },
        {
          title: 'Total Liabilities',
          amount: apiData.current.total_liabilities,
          change: apiData.changes.liabilities,
          changePercent: apiData.changes.liabilities_percent,
          icon: 'credit_card',
          bgColor: 'bg-accent'
        },
        {
          title: 'Monthly Change',
          amount: apiData.changes.net_worth,
          change: apiData.changes.net_worth,
          changePercent: apiData.changes.net_worth_percent,
          icon: 'show_chart',
          bgColor: 'bg-tertiary'
        }
      ]
      
      setSummaryData(summaryCards)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load net worth summary')
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-800 mb-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">Error loading net worth summary</span>
        </div>
        <p className="text-red-700 mb-3">{error}</p>
        <button
          onClick={fetchNetWorthSummary}
          className="text-red-800 underline hover:no-underline text-sm"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {loading ? (
        // Show loading skeleton cards
        Array.from({ length: 4 }).map((_, index) => (
          <SummaryCard
            key={index}
            title=""
            amount={0}
            change={0}
            changePercent={0}
            icon=""
            bgColor=""
            loading={true}
          />
        ))
      ) : (
        summaryData.map((data, index) => (
          <SummaryCard key={index} {...data} />
        ))
      )}
    </div>
  )
}