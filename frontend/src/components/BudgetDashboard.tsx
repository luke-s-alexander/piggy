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
  const [monthlyData, setMonthlyData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewState, setViewState] = useState<ViewState>({ period: 'annual' })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    if (viewState.period === 'monthly' && viewState.selectedMonth && dashboardData) {
      fetchMonthlyData(viewState.selectedMonth)
    }
  }, [viewState.period, viewState.selectedMonth, dashboardData])

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

  const fetchMonthlyData = async (month: number) => {
    if (!dashboardData?.budget?.id) return
    
    try {
      const response = await fetch(`http://localhost:8000/api/v1/budgets/${dashboardData.budget.id}/monthly/${month}`)
      if (!response.ok) {
        throw new Error('Failed to fetch monthly data')
      }
      const data = await response.json()
      setMonthlyData(data)
    } catch (err) {
      console.error('Failed to load monthly data:', err)
      setMonthlyData(null)
    }
  }

  const getIncomeChartData = () => {
    if (!dashboardData) return []
    
    let budgetAmount, actualAmount
    
    if (viewState.period === 'annual') {
      budgetAmount = Math.abs(dashboardData.ytd_income_budget)
      actualAmount = Math.abs(dashboardData.ytd_income_actual)
    } else {
      // Use monthly data if available, otherwise fallback
      if (monthlyData) {
        budgetAmount = dashboardData.income_categories.reduce((sum, cat) => sum + cat.monthly_budget, 0)
        actualAmount = monthlyData.categories
          .filter((cat: any) => dashboardData.income_categories.some(inc => inc.id === cat.category_id))
          .reduce((sum: number, cat: any) => sum + Math.abs(cat.spent), 0)
      } else {
        budgetAmount = Math.abs(dashboardData.ytd_income_budget / dashboardData.current_month * (viewState.selectedMonth || dashboardData.current_month))
        actualAmount = Math.abs(dashboardData.ytd_income_actual / dashboardData.current_month * (viewState.selectedMonth || dashboardData.current_month))
      }
    }
    
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
    
    let budgetAmount, actualAmount
    
    if (viewState.period === 'annual') {
      budgetAmount = Math.abs(dashboardData.ytd_expense_budget)
      actualAmount = Math.abs(dashboardData.ytd_expense_actual)
    } else {
      // Use monthly data if available, otherwise fallback
      if (monthlyData) {
        budgetAmount = dashboardData.expense_categories.reduce((sum, cat) => sum + cat.monthly_budget, 0)
        actualAmount = monthlyData.categories
          .filter((cat: any) => dashboardData.expense_categories.some(exp => exp.id === cat.category_id))
          .reduce((sum: number, cat: any) => sum + Math.abs(cat.spent), 0)
      } else {
        budgetAmount = Math.abs(dashboardData.ytd_expense_budget / dashboardData.current_month * (viewState.selectedMonth || dashboardData.current_month))
        actualAmount = Math.abs(dashboardData.ytd_expense_actual / dashboardData.current_month * (viewState.selectedMonth || dashboardData.current_month))
      }
    }
    
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

  const getCurrentDateProgress = () => {
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentDay = now.getDate()
    const daysInMonth = new Date(now.getFullYear(), currentMonth, 0).getDate()
    
    if (viewState.period === 'annual') {
      const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))
      return dayOfYear / 365
    } else {
      return currentDay / daysInMonth
    }
  }

  const renderCategorySection = (title: string, categories: CategoryData[], isIncomeSection: boolean) => {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>

        <div className="space-y-4">
          {categories.map(category => {
            const currentDateProgress = getCurrentDateProgress()
            
            // Get monthly data if in monthly view
            let budgetAmount, actualAmount
            
            if (viewState.period === 'annual') {
              budgetAmount = category.ytd_budget
              actualAmount = Math.abs(category.ytd_actual)
            } else {
              budgetAmount = category.monthly_budget
              // Find this category's monthly actual from monthlyData
              if (monthlyData && monthlyData.categories) {
                const monthlyCategory = monthlyData.categories.find((cat: any) => cat.category_id === category.id)
                actualAmount = monthlyCategory ? Math.abs(monthlyCategory.spent) : 0
              } else {
                // Fallback calculation if monthly data not loaded
                actualAmount = Math.abs(category.ytd_actual / dashboardData.current_month * (viewState.selectedMonth || dashboardData.current_month))
              }
            }
            
            const expectedAmount = budgetAmount * currentDateProgress
            
            // Color logic for expenses vs income
            let barColor = 'bg-green-500'
            if (!isIncomeSection) { // Expense category
              if (actualAmount > expectedAmount) {
                barColor = 'bg-red-500'
              } else if (actualAmount >= expectedAmount * 0.9) {
                barColor = 'bg-yellow-500'
              } else {
                barColor = 'bg-green-500'
              }
            }
            
            const progress = budgetAmount > 0 ? (actualAmount / budgetAmount) * 100 : 0
            const tickPosition = currentDateProgress * 100
            
            return (
              <div key={category.id} className="border rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{category.name}</h3>
                  <div className="text-sm text-gray-600">
                    ${category.yearly_budget.toLocaleString()} / year
                  </div>
                </div>

                {/* Visual Indicator Bar */}
                <div className="mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 relative bg-gray-200 rounded-full h-6 overflow-hidden">
                      {/* Progress Bar */}
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                        style={{ 
                          width: `${Math.min(progress, 100)}%` 
                        }}
                      ></div>
                      
                      {/* Tick Mark for Expected Progress */}
                      <div 
                        className="absolute top-0 h-full w-0.5 bg-gray-700"
                        style={{ left: `${Math.min(tickPosition, 100)}%` }}
                      ></div>
                    </div>
                    
                    {/* Remaining Amount */}
                    <div className="text-sm font-medium">
                      {(() => {
                        const remaining = budgetAmount - actualAmount
                        const absRemaining = Math.abs(remaining)
                        
                        if (Math.round(remaining) === 0) {
                          return <span className="text-blue-600">On track</span>
                        } else if (remaining > 0) {
                          // Under budget/target
                          if (isIncomeSection) {
                            // Income: under target is bad (red)
                            return <span className="text-red-600">${Math.round(absRemaining).toLocaleString()} left</span>
                          } else {
                            // Expense: under budget is good (green)
                            return <span className="text-green-600">${Math.round(absRemaining).toLocaleString()} left</span>
                          }
                        } else {
                          // Over budget/target
                          if (isIncomeSection) {
                            // Income: over target is good (green)
                            return <span className="text-green-600">${Math.round(absRemaining).toLocaleString()} over</span>
                          } else {
                            // Expense: over budget is bad (red)
                            return <span className="text-red-600">${Math.round(absRemaining).toLocaleString()} over</span>
                          }
                        }
                      })()}
                    </div>
                  </div>
                  
                  {/* Amount Text */}
                  <div className="mt-2 text-sm">
                    <span className="font-bold text-gray-900">
                      ${Math.round(actualAmount).toLocaleString()}
                    </span>
                    <span className="text-gray-600"> of </span>
                    <span className="text-gray-600">
                      ${Math.round(budgetAmount).toLocaleString()}
                    </span>
                    <span className="text-gray-600"> {isIncomeSection ? 'earned' : 'spent'}</span>
                  </div>
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
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 pb-4 mb-6">
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
      {renderCategorySection('Income', dashboardData.income_categories, true)}

      {/* Expense Section */}
      {renderCategorySection('Expenses', dashboardData.expense_categories, false)}

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