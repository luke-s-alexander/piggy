import { useState } from 'react'
import type { Category, CategoryUpdate } from '../types/category'

interface CategoryItemProps {
  category: Category
  onUpdate: () => void
  onDelete: () => void
}

const PREDEFINED_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#64748b', '#6b7280', '#374151'
]

export default function CategoryItem({ category, onUpdate, onDelete }: CategoryItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<CategoryUpdate>({
    name: category.name,
    type: category.type,
    color: category.color || ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`http://localhost:8000/api/v1/categories/${category.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      })

      if (!response.ok) {
        throw new Error('Failed to update category')
      }

      setIsEditing(false)
      onUpdate()
    } catch (err) {
      console.error('Error updating category:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${category.name}"? This cannot be undone.`)) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`http://localhost:8000/api/v1/categories/${category.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete category')
      }

      onDelete()
    } catch (err) {
      console.error('Error deleting category:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setEditForm({
      name: category.name,
      type: category.type,
      color: category.color || ''
    })
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 border-2 border-blue-200">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={editForm.type}
              onChange={(e) => setEditForm({ ...editForm, type: e.target.value as 'INCOME' | 'EXPENSE' })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color (optional)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {PREDEFINED_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setEditForm({ ...editForm, color })}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    editForm.color === color ? 'border-gray-800 scale-110' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <input
              type="text"
              placeholder="#ffffff"
              value={editForm.color}
              onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-1.5 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
          className="w-4 h-4 rounded-full border border-gray-300"
          style={{ backgroundColor: category.color || '#6b7280' }}
        />
        <div>
          <h4 className="font-medium text-gray-900">{category.name}</h4>
          <p className="text-sm text-gray-500 capitalize">
            {category.type.toLowerCase()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsEditing(true)}
          className="text-blue-600 hover:text-blue-800 p-1"
          title="Edit category"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-red-600 hover:text-red-800 p-1 disabled:opacity-50"
          title="Delete category"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}