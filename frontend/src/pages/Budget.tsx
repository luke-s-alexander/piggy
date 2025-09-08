import { useState } from 'react'
import BudgetList from '../components/BudgetList'
import AddBudgetForm from '../components/AddBudgetForm'
import BudgetDetails from '../components/BudgetDetails'
import type { Budget } from '../types/budget'

type ViewMode = 'list' | 'add' | 'details'

export default function Budget() {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)

  const handleAddSuccess = () => {
    setViewMode('list')
    // Budget list will automatically refresh
  }

  const handleBudgetChange = () => {
    // Called when budgets are updated/deleted to trigger any necessary updates
  }

  const handleSelectBudget = (budget: Budget) => {
    setSelectedBudget(budget)
    setViewMode('details')
  }

  const handleBackToList = () => {
    setSelectedBudget(null)
    setViewMode('list')
  }

  return (
    <div className="p-6">
      {viewMode === 'list' && (
        <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Budgets</h1>
              <p className="text-gray-600 mt-1">Manage your annual budgets and track spending progress</p>
            </div>
            <button
              onClick={() => setViewMode('add')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Create Budget
            </button>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <BudgetList 
                onBudgetChange={handleBudgetChange}
                onSelectBudget={handleSelectBudget}
              />
            </div>
          </div>
        </>
      )}

      {viewMode === 'add' && (
        <>
          <div className="flex items-center mb-6">
            <button
              onClick={handleBackToList}
              className="text-gray-600 hover:text-gray-800 p-2 mr-2"
              title="Back to budgets"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Budget</h1>
              <p className="text-gray-600 mt-1">Set up your annual budget by category</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <AddBudgetForm
              onCancel={handleBackToList}
              onSuccess={handleAddSuccess}
            />
          </div>
        </>
      )}

      {viewMode === 'details' && selectedBudget && (
        <BudgetDetails
          budget={selectedBudget}
          onBack={handleBackToList}
        />
      )}
    </div>
  )
}