import { useState } from 'react'
import NetWorthChart from '../components/NetWorthChart'
import AssetLiabilityBreakdown from '../components/AssetLiabilityBreakdown'
import CategoryBreakdown from '../components/CategoryBreakdown'
import NetWorthSummary from '../components/NetWorthSummary'

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('6M')
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0)

  const timeRangeOptions = [
    { value: '1M', label: '1M' },
    { value: '3M', label: '3M' },
    { value: '6M', label: '6M' },
    { value: '1Y', label: '1Y' },
    { value: 'ALL', label: 'All' },
  ] as const

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Net Worth Dashboard</h1>
        
        {/* Time Range Selector */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {timeRangeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setTimeRange(option.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeRange === option.value
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Net Worth Summary Cards */}
      <NetWorthSummary refreshTrigger={refreshTrigger} />

      {/* Main Chart */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Net Worth Trend</h2>
          <p className="text-sm text-gray-600">Track your net worth over time</p>
        </div>
        <div className="p-6">
          <NetWorthChart timeRange={timeRange} refreshTrigger={refreshTrigger} />
        </div>
      </div>

      {/* Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset vs Liability Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Asset vs Liability</h2>
            <p className="text-sm text-gray-600">Current balance breakdown</p>
          </div>
          <div className="p-6">
            <AssetLiabilityBreakdown refreshTrigger={refreshTrigger} />
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">By Category</h2>
            <p className="text-sm text-gray-600">Breakdown by account type</p>
          </div>
          <div className="p-6">
            <CategoryBreakdown refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </div>
    </div>
  )
}