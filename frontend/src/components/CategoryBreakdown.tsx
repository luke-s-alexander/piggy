import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

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

export default function CategoryBreakdown() {
  // Mock data - will be replaced with real API data from account types
  const data: CategoryDataPoint[] = [
    {
      name: 'Checking',
      assets: 1453.23,
      liabilities: 0,
      net: 1453.23,
      icon: 'account_balance'
    },
    {
      name: 'Savings',
      assets: 3204.38,
      liabilities: 0,
      net: 3204.38,
      icon: 'savings'
    },
    {
      name: 'Investment',
      assets: 93039.24,
      liabilities: 0,
      net: 93039.24,
      icon: 'trending_up'
    },
    {
      name: 'Credit Card',
      assets: 0,
      liabilities: 3242.00,
      net: -3242.00,
      icon: 'credit_card'
    }
  ]

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
        {sortedData.map((category, index) => (
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