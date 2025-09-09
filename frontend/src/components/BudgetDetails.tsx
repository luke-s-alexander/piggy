import { useState, useEffect } from 'react'
import type { Budget, BudgetWithLineItems, BudgetSummary, Category } from '../types/budget'

interface BudgetDetailsProps {
  budget: Budget
  onBack: () => void
}

interface EditingLineItem {
  id?: string
  category_id: string
  yearly_amount: number
  isNew?: boolean
}

export default function BudgetDetails({ budget, onBack }: BudgetDetailsProps) {
  const [budgetDetails, setBudgetDetails] = useState<BudgetWithLineItems | null>(null)
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [isEditing, setIsEditing] = useState(false)
  const [editingBudget, setEditingBudget] = useState<{ name: string; year: number; is_active: boolean }>({ 
    name: budget.name, 
    year: budget.year, 
    is_active: budget.is_active 
  })
  const [editingLineItems, setEditingLineItems] = useState<EditingLineItem[]>([])
  const [availableCategories, setAvailableCategories] = useState<Category[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchBudgetDetails()
    fetchBudgetSummary()
    fetchCategories()
  }, [budget.id])

  useEffect(() => {
    setEditingBudget({ 
      name: budget.name, 
      year: budget.year, 
      is_active: budget.is_active 
    })
  }, [budget.name, budget.year, budget.is_active])

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

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/categories/')
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }
      const data = await response.json()
      setAvailableCategories(data)
    } catch (err) {
      console.error('Failed to load categories:', err)
    }
  }

  const startEditing = () => {
    setIsEditing(true)
    if (budgetDetails) {
      setEditingLineItems(budgetDetails.line_items.map(item => ({
        id: item.id,
        category_id: item.category_id,
        yearly_amount: item.yearly_amount
      })))
    }
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setEditingBudget({ name: budget.name, year: budget.year, is_active: budget.is_active })
    setEditingLineItems([])
    setError(null)
  }

  const addNewLineItem = () => {
    const usedCategoryIds = editingLineItems.map(item => item.category_id)
    const unusedCategory = availableCategories.find(cat => !usedCategoryIds.includes(cat.id))
    
    if (unusedCategory) {
      setEditingLineItems([...editingLineItems, {
        category_id: unusedCategory.id,
        yearly_amount: 0,
        isNew: true
      }])
    }
  }

  const removeLineItem = (index: number) => {
    setEditingLineItems(editingLineItems.filter((_, i) => i !== index))
  }

  const updateLineItem = (index: number, field: 'category_id' | 'yearly_amount', value: string | number) => {
    const updated = [...editingLineItems]
    if (field === 'yearly_amount') {
      updated[index].yearly_amount = Number(value)
    } else {
      updated[index].category_id = String(value)
    }
    setEditingLineItems(updated)
  }

  const saveChanges = async () => {
    setSaving(true)
    setError(null)
    
    try {
      // Update budget basic info
      if (editingBudget.name !== budget.name || editingBudget.year !== budget.year) {
        const budgetUpdateResponse = await fetch(`http://localhost:8000/api/v1/budgets/${budget.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: editingBudget.name,
            year: editingBudget.year
          })
        })
        
        if (!budgetUpdateResponse.ok) {
          throw new Error('Failed to update budget')
        }
      }

      // Handle active/inactive status separately
      if (editingBudget.is_active !== budget.is_active) {
        if (editingBudget.is_active) {
          const activeResponse = await fetch(`http://localhost:8000/api/v1/budgets/${budget.id}/set-active`, {
            method: 'PUT'
          })
          
          if (!activeResponse.ok) {
            throw new Error('Failed to set budget as active')
          }
        }
      }

      // Handle line items
      const currentIds = budgetDetails?.line_items.map(item => item.id) || []
      const newIds = editingLineItems.filter(item => item.id).map(item => item.id!)
      
      // Delete removed items
      for (const id of currentIds) {
        if (!newIds.includes(id)) {
          const deleteResponse = await fetch(`http://localhost:8000/api/v1/budgets/line-items/${id}`, {
            method: 'DELETE'
          })
          if (!deleteResponse.ok) {
            throw new Error(`Failed to delete line item ${id}`)
          }
        }
      }

      // Update existing items
      for (const item of editingLineItems) {
        if (item.id && !item.isNew) {
          const updateResponse = await fetch(`http://localhost:8000/api/v1/budgets/line-items/${item.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              yearly_amount: item.yearly_amount
            })
          })
          
          if (!updateResponse.ok) {
            throw new Error(`Failed to update line item ${item.id}`)
          }
        }
      }

      // Add new items
      for (const item of editingLineItems) {
        if (item.isNew) {
          const createResponse = await fetch(`http://localhost:8000/api/v1/budgets/${budget.id}/line-items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              category_id: item.category_id,
              yearly_amount: item.yearly_amount
            })
          })
          
          if (!createResponse.ok) {
            throw new Error(`Failed to add new line item`)
          }
        }
      }

      // Refresh data
      await fetchBudgetDetails()
      await fetchBudgetSummary()
      setIsEditing(false)
      setEditingLineItems([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes')
    } finally {
      setSaving(false)
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
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editingBudget.name}
                  onChange={(e) => setEditingBudget({ ...editingBudget, name: e.target.value })}
                  className="text-2xl font-bold text-gray-900 border border-gray-300 rounded px-2 py-1"
                />
                <div className="flex items-center space-x-4">
                  <input
                    type="number"
                    value={editingBudget.year}
                    onChange={(e) => setEditingBudget({ ...editingBudget, year: parseInt(e.target.value) })}
                    className="border border-gray-300 rounded px-2 py-1 w-20"
                  />
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={editingBudget.is_active}
                      onChange={(e) => setEditingBudget({ ...editingBudget, is_active: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-600">Active Budget</span>
                  </label>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold text-gray-900">{budget.name}</h1>
                  {budget.is_active && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✓ Active
                    </span>
                  )}
                </div>
                <p className="text-gray-600">Year {budget.year} • ${budget.total_amount.toLocaleString()} annual budget</p>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={cancelEditing}
                disabled={saving}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={saveChanges}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {saving && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </>
          ) : (
            <button
              onClick={startEditing}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Edit Budget</span>
            </button>
          )}
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
      {(budgetDetails || isEditing) && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Category Breakdown</h2>
            {isEditing && (
              <button
                onClick={addNewLineItem}
                disabled={availableCategories.length === editingLineItems.length}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Category</span>
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            {isEditing ? (
              editingLineItems.map((editItem, index) => {
                const category = availableCategories.find(cat => cat.id === editItem.category_id)
                const categorySummary = budgetSummary?.categories_summary.find(
                  cat => cat.category_id === editItem.category_id
                )
                const spent = categorySummary?.spent || 0
                const remaining = editItem.yearly_amount - spent
                const progress = editItem.yearly_amount > 0 ? (spent / editItem.yearly_amount) * 100 : 0

                return (
                  <div key={editItem.id || `new-${index}`} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3 flex-1">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category?.color || '#6b7280' }}
                        />
                        <select
                          value={editItem.category_id}
                          onChange={(e) => updateLineItem(index, 'category_id', e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 flex-1 max-w-xs"
                        >
                          {availableCategories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={editItem.yearly_amount}
                          onChange={(e) => updateLineItem(index, 'yearly_amount', e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 w-32 text-right"
                          placeholder="Annual amount"
                        />
                        <button
                          onClick={() => removeLineItem(index)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Remove category"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {!editItem.isNew && (
                      <>
                        <div className="grid grid-cols-4 gap-4 mb-3 text-sm">
                          <div>
                            <div className="text-gray-500">Monthly Budget</div>
                            <div className="font-medium">${(editItem.yearly_amount / 12).toFixed(0)}</div>
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
                      </>
                    )}
                  </div>
                )
              })
            ) : (
              budgetDetails?.line_items.map((lineItem) => {
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
              })
            )}
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