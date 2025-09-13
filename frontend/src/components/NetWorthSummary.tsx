interface SummaryCardProps {
  title: string
  amount: number
  change: number
  changePercent: number
  icon: string
  bgColor: string
}

function SummaryCard({ title, amount, change, changePercent, icon, bgColor }: SummaryCardProps) {
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

export default function NetWorthSummary() {
  // Mock data - will be replaced with real API data
  const summaryData = [
    {
      title: 'Net Worth',
      amount: 94454.85,
      change: 4791.36,
      changePercent: 5.3,
      icon: 'trending_up',
      bgColor: 'bg-primary'
    },
    {
      title: 'Total Assets',
      amount: 97696.85,
      change: 2204.19,
      changePercent: 2.3,
      icon: 'account_balance',
      bgColor: 'bg-secondary'
    },
    {
      title: 'Total Liabilities',
      amount: 3242.00,
      change: -2587.17,
      changePercent: -44.4,
      icon: 'credit_card',
      bgColor: 'bg-accent'
    },
    {
      title: 'Monthly Change',
      amount: 4791.36,
      change: 1203.45,
      changePercent: 33.6,
      icon: 'show_chart',
      bgColor: 'bg-tertiary'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {summaryData.map((data, index) => (
        <SummaryCard key={index} {...data} />
      ))}
    </div>
  )
}