import { useState } from 'react'
import CategoryList from '../components/CategoryList'
import AddCategoryForm from '../components/AddCategoryForm'

export default function Categories() {
  const [showAddForm, setShowAddForm] = useState(false)

  const handleAddSuccess = () => {
    setShowAddForm(false)
    // Category list will automatically refresh
  }

  const handleCategoryChange = () => {
    // Called when categories are edited/deleted to trigger any necessary updates
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Category
        </button>
      </div>

      {showAddForm ? (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Category</h2>
          <AddCategoryForm
            onCancel={() => setShowAddForm(false)}
            onSuccess={handleAddSuccess}
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <CategoryList onCategoryChange={handleCategoryChange} />
        </div>
      )}
    </div>
  )
}