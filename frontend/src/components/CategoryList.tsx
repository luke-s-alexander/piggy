import { useState, useEffect } from 'react'
import type { Category } from '../types/category'
import CategoryItem from './CategoryItem'

interface CategoryListProps {
  onCategoryChange: () => void
}

export default function CategoryList({ onCategoryChange }: CategoryListProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/categories/')
      if (!response.ok) {
        let errorMessage = 'Failed to fetch categories'
        switch (response.status) {
          case 404:
            errorMessage = 'Categories endpoint not found. Please check if the server is running correctly.'
            break
          case 500:
            errorMessage = 'Server error occurred while fetching categories. Please try again later.'
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
      setCategories(data)
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
    fetchCategories()
  }, [])

  const handleCategoryUpdate = () => {
    fetchCategories()
    onCategoryChange()
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
          onClick={fetchCategories}
          className="mt-2 text-blue-600 hover:text-blue-800"
        >
          Try again
        </button>
      </div>
    )
  }

  const incomeCategories = categories.filter(cat => cat.type === 'INCOME')
  const expenseCategories = categories.filter(cat => cat.type === 'EXPENSE')

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-3 h-3 bg-green-500 rounded-full"></span>
          Income Categories ({incomeCategories.length})
        </h3>
        {incomeCategories.length === 0 ? (
          <p className="text-gray-500 italic">No income categories found</p>
        ) : (
          <div className="space-y-2">
            {incomeCategories.map((category) => (
              <CategoryItem
                key={category.id}
                category={category}
                onUpdate={handleCategoryUpdate}
                onDelete={handleCategoryUpdate}
              />
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-3 h-3 bg-red-500 rounded-full"></span>
          Expense Categories ({expenseCategories.length})
        </h3>
        {expenseCategories.length === 0 ? (
          <p className="text-gray-500 italic">No expense categories found</p>
        ) : (
          <div className="space-y-2">
            {expenseCategories.map((category) => (
              <CategoryItem
                key={category.id}
                category={category}
                onUpdate={handleCategoryUpdate}
                onDelete={handleCategoryUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}