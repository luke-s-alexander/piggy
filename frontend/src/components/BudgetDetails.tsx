import { useState, useEffect } from 'react'
import type { Budget, BudgetWithLineItems, BudgetSummary } from '../types/budget'

interface BudgetDetailsProps {
  budget: Budget
  onBack: () => void
}

export default function BudgetDetails({ budget, onBack }: BudgetDetailsProps) {
  const [budgetDetails, setBudgetDetails] = useState<BudgetWithLineItems | null>(null)
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)

  useEffect(() => {
    fetchBudgetDetails()
    fetchBudgetSummary()
  }, [budget.id])

  const fetchBudgetDetails = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/budgets/${budget.id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch budget details')
      }
      const data = await response.json()
      setBudgetDetails(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load budget details')
    }
  }

  const fetchBudgetSummary = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/budgets/${budget.id}/summary`)
      if (!response.ok) {
        throw new Error('Failed to fetch budget summary')
      }
      const data = await response.json()
      setBudgetSummary(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load budget summary')
    } finally {
      setLoading(false)
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage < 50) return 'bg-green-500'
    if (percentage < 80) return 'bg-yellow-500'
    if (percentage < 100) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getProgressTextColor = (percentage: number) => {
    if (percentage < 50) return 'text-green-700'
    if (percentage < 80) return 'text-yellow-700'
    if (percentage < 100) return 'text-orange-700'
    return 'text-red-700'
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
          onClick={onBack}
          className="mt-2 text-blue-600 hover:text-blue-800"
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 p-2"
            title="Back to budgets"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{budget.name}</h1>
            <p className="text-gray-600">Year {budget.year} • ${budget.total_amount.toLocaleString()} annual budget</p>
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      {budgetSummary && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Overall Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">${budgetSummary.budget.total_amount.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Budgeted</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">${budgetSummary.total_spent.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Spent</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${budgetSummary.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${Math.abs(budgetSummary.remaining).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">{budgetSummary.remaining >= 0 ? 'Remaining' : 'Over Budget'}</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getProgressTextColor(budgetSummary.progress_percentage)}`}>
                {budgetSummary.progress_percentage.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">Used</div>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(budgetSummary.progress_percentage)}`}
              style={{ width: `${Math.min(budgetSummary.progress_percentage, 100)}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      {budgetDetails && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h2>
          <div className="space-y-4">
            {budgetDetails.line_items.map((lineItem) => {
              const categorySummary = budgetSummary?.categories_summary.find(
                cat => cat.category_id === lineItem.category_id
              )
              const spent = categorySummary?.spent || 0
              const remaining = lineItem.yearly_amount - spent
              const progress = lineItem.yearly_amount > 0 ? (spent / lineItem.yearly_amount) * 100 : 0

              return (
                <div key={lineItem.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: lineItem.category?.color || '#6b7280' }}
                      />
                      <h3 className="font-medium text-gray-900">{lineItem.category?.name || 'Unknown Category'}</h3>
                    </div>
                    <div className="text-sm text-gray-600">
                      ${lineItem.yearly_amount.toLocaleString()} / year
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-3 text-sm">
                    <div>
                      <div className="text-gray-500">Monthly Budget</div>
                      <div className="font-medium">${Number(lineItem.monthly_amount).toFixed(0)}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Spent</div>
                      <div className="font-medium">${spent.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Remaining</div>
                      <div className={`font-medium ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${Math.abs(remaining).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Progress</div>
                      <div className={`font-medium ${getProgressTextColor(progress)}`}>
                        {progress.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progress)}`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Monthly View Placeholder */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Monthly View</h2>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>
        <div className="text-center py-8 text-gray-500">
          <p>Monthly budget tracking coming soon...</p>
          <p className="text-sm">Selected: {new Date(0, selectedMonth - 1).toLocaleString('default', { month: 'long' })} {budget.year}</p>
        </div>
      </div>
    </div>
  )
}