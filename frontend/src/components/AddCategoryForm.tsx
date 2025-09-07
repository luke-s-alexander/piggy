import { useState } from 'react'
import type { CategoryCreate } from '../types/category'

interface AddCategoryFormProps {
  onCancel: () => void
  onSuccess: () => void
}

const PREDEFINED_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#64748b', '#6b7280', '#374151'
]

// Helper function to validate hex color format
const isValidHexColor = (color: string): boolean => {
  if (!color) return true // Empty color is valid
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)
}

export default function AddCategoryForm({ onCancel, onSuccess }: AddCategoryFormProps) {
  const [form, setForm] = useState<CategoryCreate>({
    name: '',
    type: 'EXPENSE',
    color: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [colorError, setColorError] = useState<string | null>(null)

  const handleColorChange = (color: string) => {
    setForm({ ...form, color })
    if (color && !isValidHexColor(color)) {
      setColorError('Please enter a valid hex color (e.g., #ffffff or #fff)')
    } else {
      setColorError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form before submitting
    if (!form.name?.trim()) {
      setError('Category name is required')
      return
    }
    
    if (form.color && !isValidHexColor(form.color)) {
      setColorError('Please enter a valid hex color format')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('http://localhost:8000/api/v1/categories/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        let errorMessage = 'Failed to create category'
        switch (response.status) {
          case 409:
            errorMessage = 'A category with this name already exists.'
            break
          case 422:
            errorMessage = 'Invalid category data. Please check your inputs.'
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
      name: '',
      type: 'EXPENSE',
      color: ''
    })
    setError(null)
    setColorError(null)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category Name *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Groceries, Salary, Rent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type *
          </label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as 'INCOME' | 'EXPENSE' })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="EXPENSE">Expense</option>
            <option value="INCOME">Income</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Color (optional)
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {PREDEFINED_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => handleColorChange(color)}
              className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                form.color === color ? 'border-gray-800 scale-110' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
              title={`Select color ${color}`}
            />
          ))}
        </div>
        <input
          type="text"
          placeholder="Or enter custom hex color (e.g., #ffffff)"
          value={form.color}
          onChange={(e) => handleColorChange(e.target.value)}
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            colorError ? 'border-red-300' : 'border-gray-300'
          }`}
          aria-label="Custom hex color"
          aria-describedby={colorError ? 'add-color-error' : undefined}
        />
        {colorError && (
          <p id="add-color-error" className="mt-1 text-sm text-red-600">{colorError}</p>
        )}
        {form.color && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-gray-600">Preview:</span>
            <div
              className="w-6 h-6 rounded-full border border-gray-300"
              style={{ backgroundColor: form.color }}
            />
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
          {loading ? 'Creating...' : 'Create Category'}
        </button>
      </div>
    </form>
  )
}