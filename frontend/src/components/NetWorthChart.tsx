import { useState, useEffect } from 'react'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

interface NetWorthDataPoint {
  date: string
  netWorth: number
  assets: number
  liabilities: number
  isInterpolated?: boolean
}

interface NetWorthChartProps {
  timeRange: '1M' | '3M' | '6M' | '1Y' | 'ALL'
  refreshTrigger?: number
}

// Mock data generator - will be replaced with API data
function generateMockData(timeRange: string): NetWorthDataPoint[] {
  const now = new Date()
  const data: NetWorthDataPoint[] = []
  const baseNetWorth = 90000
  
  // Create consistent time intervals based on time range
  const getDatePoints = (timeRange: string) => {
    const points: Date[] = []
    const endDate = new Date(now)
    let startDate: Date
    let interval: number // days
    
    switch (timeRange) {
      case '1M':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        interval = 2 // every 2 days
        break
      case '3M':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
        interval = 7 // weekly
        break
      case '6M':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
        interval = 14 // bi-weekly
        break
      case '1Y':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        interval = 30 // monthly
        break
      case 'ALL':
      default:
        startDate = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate())
        interval = 30 // monthly
        break
    }
    
    let currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      points.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + interval)
    }
    
    // Always include the end date if it's not already included
    if (points.length === 0 || points[points.length - 1].getTime() !== endDate.getTime()) {
      points.push(endDate)
    }
    
    return points
  }
  
  const datePoints = getDatePoints(timeRange)
  
  datePoints.forEach((date, index) => {
    // Simulate growth with some volatility
    const progress = index / (datePoints.length - 1)
    const trend = progress * 8000 // 8k growth over period
    const volatility = (Math.random() - 0.5) * 2000 // +/- 1k random
    
    const netWorth = baseNetWorth + trend + volatility
    const assets = netWorth + 3000 + Math.random() * 1000
    const liabilities = assets - netWorth
    
    data.push({
      date: date.toISOString().split('T')[0],
      netWorth: Math.round(netWorth),
      assets: Math.round(assets),
      liabilities: Math.round(liabilities),
    })
  })

  return data
}

// Data interpolation function for filling gaps
function interpolateData(data: NetWorthDataPoint[]): NetWorthDataPoint[] {
  if (data.length < 2) return data

  const result: NetWorthDataPoint[] = []
  
  for (let i = 0; i < data.length - 1; i++) {
    result.push(data[i])
    
    const current = new Date(data[i].date)
    const next = new Date(data[i + 1].date)
    const daysDiff = (next.getTime() - current.getTime()) / (1000 * 3600 * 24)
    
    // If gap is larger than 7 days, add interpolated points
    if (daysDiff > 7) {
      const steps = Math.min(Math.floor(daysDiff / 7), 4) // Max 4 interpolated points
      
      for (let step = 1; step < steps; step++) {
        const ratio = step / steps
        const interpolatedDate = new Date(current.getTime() + ratio * (next.getTime() - current.getTime()))
        
        result.push({
          date: interpolatedDate.toISOString().split('T')[0],
          netWorth: Math.round(data[i].netWorth + ratio * (data[i + 1].netWorth - data[i].netWorth)),
          assets: Math.round(data[i].assets + ratio * (data[i + 1].assets - data[i].assets)),
          liabilities: Math.round(data[i].liabilities + ratio * (data[i + 1].liabilities - data[i].liabilities)),
          isInterpolated: true
        })
      }
    }
  }
  
  result.push(data[data.length - 1])
  return result
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(dateStr: string, timeRange: string): string {
  const date = new Date(dateStr)
  
  switch (timeRange) {
    case '1M':
      return date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
    case '3M':
    case '6M':
      return date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
    case '1Y':
      return date.toLocaleDateString('en-CA', { month: 'short' })
    case 'ALL':
    default:
      return date.toLocaleDateString('en-CA', { year: 'numeric', month: 'short' })
  }
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    color: string
    name: string
    value: number
    payload: NetWorthDataPoint
  }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null

  const data = payload[0].payload
  const formattedDate = new Date(label || '').toLocaleDateString('en-CA', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-48">
      <p className="text-sm text-gray-600 mb-2">{formattedDate}</p>
      {data.isInterpolated && (
        <p className="text-xs text-gray-400 mb-2 italic">Estimated</p>
      )}
      <div className="space-y-1">
        <p className="text-sm">
          <span className="font-medium text-primary">Net Worth:</span> {formatCurrency(data.netWorth)}
        </p>
        <p className="text-sm">
          <span className="font-medium text-secondary">Assets:</span> {formatCurrency(data.assets)}
        </p>
        <p className="text-sm">
          <span className="font-medium text-accent">Liabilities:</span> {formatCurrency(data.liabilities)}
        </p>
      </div>
    </div>
  )
}

export default function NetWorthChart({ timeRange, refreshTrigger }: NetWorthChartProps) {
  const [chartData, setChartData] = useState<NetWorthDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchChartData()
  }, [timeRange, refreshTrigger])

  const fetchChartData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // For now, simulate API call with mock data
      // TODO: Replace with actual API call to backend
      await new Promise(resolve => setTimeout(resolve, 600)) // Simulate API delay
      
      const rawData = generateMockData(timeRange)
      const interpolatedData = interpolateData(rawData)
      setChartData(interpolatedData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chart data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="h-80 animate-pulse">
        <div className="h-full bg-gray-200 rounded-lg"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
          <div className="flex items-center gap-2 text-red-800 mb-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Error loading chart</span>
          </div>
          <p className="text-red-700 mb-3">{error}</p>
          <button
            onClick={fetchChartData}
            className="text-red-800 underline hover:no-underline text-sm"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  // Calculate appropriate tick interval for consistent spacing
  const getTickInterval = () => {
    const dataLength = chartData.length
    if (dataLength <= 40) return 0 // Show all ticks
    if (timeRange === '1M') return Math.ceil(dataLength / 40)
    if (timeRange === '3M') return Math.ceil(dataLength / 40)
    if (timeRange === '6M') return Math.ceil(dataLength / 40)
    if (timeRange === '1Y') return Math.ceil(dataLength / 40)
    return Math.ceil(dataLength / 20) // ALL
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => formatDate(value, timeRange)}
            interval={getTickInterval()}
            minTickGap={30}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickFormatter={formatCurrency}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="netWorth"
            stroke="var(--color-primary)"
            strokeWidth={3}
            fill="url(#netWorthGradient)"
            dot={{ fill: 'var(--color-primary)', strokeWidth: 0, r: 0 }}
            activeDot={{ r: 6, stroke: 'var(--color-primary)', strokeWidth: 2, fill: 'white' }}
            connectNulls={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}