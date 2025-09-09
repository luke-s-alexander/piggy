import { useState } from 'react'
import AddTransactionForm from '../components/AddTransactionForm'
import TransactionList from '../components/TransactionList'
import TransactionTable from '../components/TransactionTable'

export default function Transactions() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'table'>('table')

  const handleAddSuccess = () => {
    setShowAddForm(false)
    // Transaction list will automatically refresh
  }

  const handleTransactionChange = () => {
    // Called when transactions are edited/deleted to trigger any necessary updates
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
        <div className="flex items-center gap-4">
          {!showAddForm && (
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Table
              </button>
            </div>
          )}
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Transaction
          </button>
        </div>
      </div>

      {showAddForm ? (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Transaction</h2>
          <AddTransactionForm
            onCancel={() => setShowAddForm(false)}
            onSuccess={handleAddSuccess}
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          {viewMode === 'list' ? (
            <TransactionList onTransactionChange={handleTransactionChange} />
          ) : (
            <TransactionTable onTransactionChange={handleTransactionChange} />
          )}
        </div>
      )}
    </div>
  )
}