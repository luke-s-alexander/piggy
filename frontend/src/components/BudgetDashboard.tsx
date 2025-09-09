import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface DashboardData {
  budget: {
    id: string
    name: string
    year: number
    total_amount: number
    is_active: boolean
  }
  current_month: number
  current_year: number
  ytd_income_budget: number
  ytd_income_actual: number
  ytd_expense_budget: number
  ytd_expense_actual: number
  income_categories: CategoryData[]
  expense_categories: CategoryData[]
}

interface CategoryData {
  id: string
  name: string
  yearly_budget: number
  monthly_budget: number
  ytd_budget: number
  ytd_actual: number
  ytd_difference: number
}

interface ViewState {
  period: 'annual' | 'monthly'
  selectedMonth?: number
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

interface BudgetDashboardProps {
  onViewBudgets?: () => void
}

export default function BudgetDashboard({ onViewBudgets }: BudgetDashboardProps = {}) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewState, setViewState] = useState<ViewState>({ period: 'annual' })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/budgets/dashboard')
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }
      const data = await response.json()
      setDashboardData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const getIncomeChartData = () => {
    if (!dashboardData) return []
    
    const budgetAmount = viewState.period === 'annual' 
      ? Math.abs(dashboardData.ytd_income_budget)
      : Math.abs(dashboardData.ytd_income_budget / dashboardData.current_month * (viewState.selectedMonth || dashboardData.current_month))
    
    const actualAmount = viewState.period === 'annual'
      ? Math.abs(dashboardData.ytd_income_actual)
      : Math.abs(dashboardData.ytd_income_actual / dashboardData.current_month * (viewState.selectedMonth || dashboardData.current_month))
    
    return [
      {
        name: 'Budget',
        amount: budgetAmount
      },
      {
        name: 'Actual',
        amount: actualAmount
      }
    ]
  }

  const getExpenseChartData = () => {
    if (!dashboardData) return []
    
    const budgetAmount = viewState.period === 'annual' 
      ? Math.abs(dashboardData.ytd_expense_budget)
      : Math.abs(dashboardData.ytd_expense_budget / dashboardData.current_month * (viewState.selectedMonth || dashboardData.current_month))
    
    const actualAmount = viewState.period === 'annual'
      ? Math.abs(dashboardData.ytd_expense_actual)
      : Math.abs(dashboardData.ytd_expense_actual / dashboardData.current_month * (viewState.selectedMonth || dashboardData.current_month))
    
    return [
      {
        name: 'Budget',
        amount: budgetAmount
      },
      {
        name: 'Actual',
        amount: actualAmount
      }
    ]
  }

  const getAvailableMonths = () => {
    if (!dashboardData) return []
    const currentMonth = dashboardData.current_month
    return Array.from({ length: currentMonth }, (_, i) => i + 1)
  }

  const renderCategorySection = (title: string, categories: CategoryData[], color: string) => {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>

        <div className="space-y-4">
          {categories.map(category => {
            const progress = category.ytd_budget > 0 ? (Math.abs(category.ytd_actual) / category.ytd_budget) * 100 : 0
            const isOnTarget = progress >= 80 && progress <= 100 // Green: 80-100%
            const isNearTarget = progress >= 60 && progress < 80 || (progress > 100 && progress <= 120) // Yellow: 60-80% or 100-120%
            const isOffTarget = progress < 60 || progress > 120 // Red: <60% or >120%
            
            const rowColorClass = isOnTarget 
              ? 'border-green-200 bg-green-50' 
              : isNearTarget 
                ? 'border-yellow-200 bg-yellow-50'
                : 'border-red-200 bg-red-50'
            
            return (
              <div key={category.id} className={`border rounded-lg p-4 ${rowColorClass}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{category.name}</h3>
                  <div className="text-sm text-gray-600">
                    ${category.yearly_budget.toLocaleString()} / year
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                  <div>
                    <div className="text-gray-500">Budget</div>
                    <div className="font-medium">
                      ${viewState.period === 'annual' 
                        ? category.ytd_budget.toFixed(0)
                        : category.monthly_budget.toFixed(0)
                      }
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Actual</div>
                    <div className="font-medium">
                      ${Math.abs(category.ytd_actual).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Difference</div>
                    <div className={`font-medium ${category.ytd_difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${Math.abs(category.ytd_difference).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isOnTarget 
                        ? 'bg-green-500' 
                        : isNearTarget 
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                    style={{ 
                      width: `${Math.min(progress, 100)}%` 
                    }}
                  ></div>
                </div>
                
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className={`font-medium ${
                    isOnTarget 
                      ? 'text-green-700' 
                      : isNearTarget 
                        ? 'text-yellow-700'
                        : 'text-red-700'
                  }`}>
                    {progress.toFixed(1)}% used
                  </span>
                  <span className={`font-medium ${
                    isOnTarget 
                      ? 'text-green-700' 
                      : isNearTarget 
                        ? 'text-yellow-700'
                        : 'text-red-700'
                  }`}>
                    {isOnTarget ? 'On Target' : isNearTarget ? 'Near Target' : 'Off Target'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-2 text-blue-600 hover:text-blue-800"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No active budget found</p>
        <p className="text-sm text-gray-500 mt-1">Create a budget and set it as active to see your dashboard</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{dashboardData.budget.name}</h1>
          <p className="text-gray-600">
            Year {dashboardData.budget.year} • 
            YTD through {MONTHS[dashboardData.current_month - 1]}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewState({ period: 'annual' })}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewState.period === 'annual'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Annual
            </button>
            <button
              onClick={() => setViewState({ 
                period: 'monthly', 
                selectedMonth: dashboardData?.current_month || 1 
              })}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewState.period === 'monthly'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
          </div>
          
          {viewState.period === 'monthly' && (
            <select
              value={viewState.selectedMonth || dashboardData?.current_month || 1}
              onChange={(e) => setViewState({ 
                period: 'monthly', 
                selectedMonth: parseInt(e.target.value) 
              })}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              {getAvailableMonths().map(month => (
                <option key={month} value={month}>
                  {MONTHS[month - 1]}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Bar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Income ({viewState.period === 'annual' ? 'YTD' : MONTHS[viewState.selectedMonth ? viewState.selectedMonth - 1 : dashboardData.current_month - 1]})
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getIncomeChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `$${(value / 1000)}k`} />
                <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']} />
                <Bar dataKey="amount" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Expenses ({viewState.period === 'annual' ? 'YTD' : MONTHS[viewState.selectedMonth ? viewState.selectedMonth - 1 : dashboardData.current_month - 1]})
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getExpenseChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `$${(value / 1000)}k`} />
                <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']} />
                <Bar dataKey="amount" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Income Section */}
      {renderCategorySection('Income', dashboardData.income_categories, '#10B981')}

      {/* Expense Section */}
      {renderCategorySection('Expenses', dashboardData.expense_categories, '#EF4444')}

      {/* View Budgets Button */}
      <div className="text-center pt-4">
        <button 
          onClick={() => onViewBudgets?.()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          View Budgets
        </button>
      </div>
    </div>
  )
}