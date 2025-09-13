import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface BreakdownDataPoint {
  name: string
  value: number
  color: string
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
    name: string
    value: number
    payload: BreakdownDataPoint
  }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null

  const data = payload[0].payload
  const total = 97696.85 + 3242.00 // Mock total - will come from API
  const percentage = ((data.value / total) * 100).toFixed(1)

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
      <div className="flex items-center gap-2 mb-1">
        <div 
          className="w-3 h-3 rounded-full" 
          style={{ backgroundColor: data.color }}
        />
        <span className="font-medium text-gray-900">{data.name}</span>
      </div>
      <p className="text-sm text-gray-600">
        {formatCurrency(data.value)} ({percentage}%)
      </p>
    </div>
  )
}

interface LegendItemProps {
  data: BreakdownDataPoint
  total: number
}

function LegendItem({ data, total }: LegendItemProps) {
  const percentage = ((data.value / total) * 100).toFixed(1)
  
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg" style={{ backgroundColor: data.color }}>
          <span className="material-icons text-white text-lg">{data.icon}</span>
        </div>
        <div>
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">{percentage}% of total</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-gray-900">{formatCurrency(data.value)}</p>
      </div>
    </div>
  )
}

export default function AssetLiabilityBreakdown() {
  // Mock data - will be replaced with real API data
  const data: BreakdownDataPoint[] = [
    {
      name: 'Assets',
      value: 97696.85,
      color: 'var(--color-secondary)',
      icon: 'account_balance'
    },
    {
      name: 'Liabilities',
      value: 3242.00,
      color: 'var(--color-accent)',
      icon: 'credit_card'
    }
  ]

  const total = data.reduce((sum, item) => sum + item.value, 0)
  const netWorth = data[0].value - data[1].value

  return (
    <div className="space-y-6">
      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Net Worth Display */}
      <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
        <p className="text-sm font-medium text-gray-600 mb-1">Net Worth</p>
        <p className="text-2xl font-bold text-gray-900">{formatCurrency(netWorth)}</p>
        <p className="text-xs text-gray-500">Assets - Liabilities</p>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {data.map((item, index) => (
          <LegendItem key={index} data={item} total={total} />
        ))}
      </div>
    </div>
  )
}