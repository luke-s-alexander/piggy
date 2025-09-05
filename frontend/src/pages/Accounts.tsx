import { useState } from 'react'
import AccountList from '../components/AccountList'

type AccountView = 'list' | 'add' | 'edit'

export default function Accounts() {
  const [currentView, setCurrentView] = useState<AccountView>('list')
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)

  const handleAddAccount = () => {
    setCurrentView('add')
    setSelectedAccountId(null)
  }

  const handleEditAccount = (accountId: string) => {
    setCurrentView('edit')
    setSelectedAccountId(accountId)
  }

  const handleBackToList = () => {
    setCurrentView('list')
    setSelectedAccountId(null)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {currentView !== 'list' && (
            <button
              onClick={handleBackToList}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Accounts
            </button>
          )}
          <h1 className="text-3xl font-bold text-gray-900">
            {currentView === 'list' && 'Accounts'}
            {currentView === 'add' && 'Add Account'}
            {currentView === 'edit' && 'Edit Account'}
          </h1>
        </div>
        
        {currentView === 'list' && (
          <button
            onClick={handleAddAccount}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Account
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow">
        {currentView === 'list' && (
          <div className="p-6">
            <AccountList onEditAccount={handleEditAccount} />
          </div>
        )}

        {currentView === 'add' && (
          <div className="p-6">
            <p className="text-gray-600 mb-4">Add a new financial account.</p>
            <div className="text-sm text-gray-500">
              Add account form will be implemented next.
            </div>
          </div>
        )}

        {currentView === 'edit' && (
          <div className="p-6">
            <p className="text-gray-600 mb-4">Edit account details.</p>
            <div className="text-sm text-gray-500">
              Edit account form will be implemented next. Selected ID: {selectedAccountId}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}