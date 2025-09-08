import { useState, useEffect } from 'react'
import type { Budget } from '../types/budget'

interface BudgetListProps {
  onBudgetChange: () => void
  onSelectBudget: (budget: Budget) => void
}

export default function BudgetList({ onBudgetChange, onSelectBudget }: BudgetListProps) {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBudgets = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/budgets/')
      if (!response.ok) {
        let errorMessage = 'Failed to fetch budgets'
        switch (response.status) {
          case 404:
            errorMessage = 'Budgets endpoint not found. Please check if the server is running correctly.'
            break
          case 500:
            errorMessage = 'Server error occurred while fetching budgets. Please try again later.'
            break
          case 503:
            errorMessage = 'Service temporarily unavailable. Please try again in a moment.'
            break
          default:
            errorMessage = `Server responded with error: ${response.status} ${response.statusText}`
        }
        throw new Error(errorMessage)
      }
      const data = await response.json()
      setBudgets(data.sort((a: Budget, b: Budget) => b.year - a.year)) // Sort by year descending
      setError(null)
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Cannot connect to server. Please check if the backend is running on http://localhost:8000')
      } else {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBudgets()
  }, [])

  const handleDelete = async (budgetId: string, budgetName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${budgetName}"? This cannot be undone.`)) {
      return
    }

    setError(null)

    try {
      const response = await fetch(`http://localhost:8000/api/v1/budgets/${budgetId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        let errorMessage = 'Failed to delete budget'
        switch (response.status) {
          case 404:
            errorMessage = 'Budget not found. It may have already been deleted.'
            break
          case 500:
            errorMessage = 'Server error occurred while deleting budget. Please try again later.'
            break
          default:
            errorMessage = `Delete failed: ${response.status} ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      // Refresh budgets list
      fetchBudgets()
      onBudgetChange()
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Cannot connect to server. Please check your connection.')
      } else {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      }
    }
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
          onClick={fetchBudgets}
          className="mt-2 text-blue-600 hover:text-blue-800"
        >
          Try again
        </button>
      </div>
    )
  }

  if (budgets.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No budgets found</h3>
        <p className="text-gray-500">Create your first budget to start managing your finances.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {budgets.map((budget) => (
        <div key={budget.id} className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg
                    ${budget.is_active ? 'bg-green-500' : 'bg-gray-400'}`}>
                    {budget.year.toString().slice(-2)}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{budget.name}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Year: {budget.year}</span>
                    <span>•</span>
                    <span>Total: ${budget.total_amount.toLocaleString()}</span>
                    <span>•</span>
                    <span>Monthly: ${(budget.total_amount / 12).toLocaleString()}</span>
                  </div>
                  {!budget.is_active && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 mt-1">
                      Inactive
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onSelectBudget(budget)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleDelete(budget.id, budget.name)}
                  className="text-red-600 hover:text-red-800 p-2"
                  title="Delete budget"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-xs text-gray-400">
                Created: {new Date(budget.created_at).toLocaleDateString()}
                {budget.updated_at !== budget.created_at && (
                  <span> • Updated: {new Date(budget.updated_at).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}