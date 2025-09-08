import { useState, useEffect } from 'react'
import type { BudgetCreate, BudgetLineItemCreate } from '../types/budget'
import type { Category } from '../types/category'

interface AddBudgetFormProps {
  onCancel: () => void
  onSuccess: () => void
}

export default function AddBudgetForm({ onCancel, onSuccess }: AddBudgetFormProps) {
  const [form, setForm] = useState<BudgetCreate>({
    year: new Date().getFullYear(),
    name: '',
    line_items: []
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/categories/')
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }
      const data = await response.json()
      setCategories(data.filter((cat: Category) => cat.type === 'EXPENSE'))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories')
    } finally {
      setCategoriesLoading(false)
    }
  }

  const addLineItem = () => {
    setForm({
      ...form,
      line_items: [...form.line_items, { category_id: '', yearly_amount: 0 }]
    })
  }

  const updateLineItem = (index: number, updates: Partial<BudgetLineItemCreate>) => {
    const newLineItems = [...form.line_items]
    newLineItems[index] = { ...newLineItems[index], ...updates }
    setForm({ ...form, line_items: newLineItems })
  }

  const removeLineItem = (index: number) => {
    const newLineItems = form.line_items.filter((_, i) => i !== index)
    setForm({ ...form, line_items: newLineItems })
  }

  const calculateTotal = () => {
    return form.line_items.reduce((sum, item) => sum + (item.yearly_amount || 0), 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.name.trim()) {
      setError('Budget name is required')
      return
    }

    if (form.line_items.length === 0) {
      setError('At least one budget category is required')
      return
    }

    // Validate line items
    for (const item of form.line_items) {
      if (!item.category_id) {
        setError('All budget categories must be selected')
        return
      }
      if (!item.yearly_amount || item.yearly_amount <= 0) {
        setError('All budget amounts must be greater than zero')
        return
      }
    }

    // Check for duplicate categories
    const categoryIds = form.line_items.map(item => item.category_id)
    const uniqueCategories = new Set(categoryIds)
    if (categoryIds.length !== uniqueCategories.size) {
      setError('Each category can only be budgeted once')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('http://localhost:8000/api/v1/budgets/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        let errorMessage = 'Failed to create budget'
        switch (response.status) {
          case 409:
            errorMessage = `A budget for year ${form.year} already exists.`
            break
          case 422:
            errorMessage = 'Invalid budget data. Please check your inputs.'
            break
          case 500:
            errorMessage = 'Server error occurred. Please try again later.'
            break
          default:
            errorMessage = `Creation failed: ${response.status} ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      onSuccess()
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Cannot connect to server. Please check your connection.')
      } else {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setForm({
      year: new Date().getFullYear(),
      name: '',
      line_items: []
    })
    setError(null)
  }

  if (categoriesLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Budget Year *
          </label>
          <input
            type="number"
            value={form.year}
            onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min={new Date().getFullYear() - 5}
            max={new Date().getFullYear() + 5}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Budget Name *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., 2024 Annual Budget"
            required
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Budget Categories</h3>
          <button
            type="button"
            onClick={addLineItem}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm transition-colors"
          >
            + Add Category
          </button>
        </div>

        {form.line_items.length === 0 ? (
          <p className="text-gray-500 text-center py-4 italic">
            No budget categories added yet. Click "Add Category" to get started.
          </p>
        ) : (
          <div className="space-y-3">
            {form.line_items.map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <select
                    value={item.category_id}
                    onChange={(e) => updateLineItem(index, { category_id: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories
                      .filter(cat => !form.line_items.some((li, i) => i !== index && li.category_id === cat.id))
                      .map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    value={item.yearly_amount || ''}
                    onChange={(e) => updateLineItem(index, { yearly_amount: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Yearly Amount"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="text-sm text-gray-600 w-20 text-center">
                  ${(item.yearly_amount / 12 || 0).toFixed(0)}/mo
                </div>
                <button
                  type="button"
                  onClick={() => removeLineItem(index)}
                  className="text-red-600 hover:text-red-800 p-1"
                  title="Remove category"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}

            <div className="border-t pt-3 mt-4">
              <div className="text-right">
                <span className="text-lg font-medium text-gray-900">
                  Total Annual Budget: ${calculateTotal().toFixed(2)}
                </span>
                <div className="text-sm text-gray-600">
                  Monthly: ${(calculateTotal() / 12).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Creating...' : 'Create Budget'}
        </button>
      </div>
    </form>
  )
}