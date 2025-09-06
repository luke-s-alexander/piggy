import { useState, useEffect } from 'react'
import clsx from 'clsx'
import type { Account } from '../types/account'
import ConfirmationDialog from './ConfirmationDialog'

interface AccountListProps {
  onEditAccount: (accountId: string) => void
  refreshTrigger?: number
}

export default function AccountList({ onEditAccount, refreshTrigger }: AccountListProps) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [accountToAction, setAccountToAction] = useState<{ id: string; name: string; action: 'deactivate' | 'reactivate' } | null>(null)

  useEffect(() => {
    fetchAccounts()
  }, [refreshTrigger])

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${apiBaseUrl}/api/v1/accounts/?include_inactive=true`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setAccounts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load accounts')
    } finally {
      setLoading(false)
    }
  }

  const handleDeactivateAccount = async (accountId: string) => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${apiBaseUrl}/api/v1/accounts/${accountId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }
      
      await fetchAccounts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deactivate account')
    }
  }

  const handleReactivateAccount = async (accountId: string) => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${apiBaseUrl}/api/v1/accounts/${accountId}/reactivate`, {
        method: 'POST'
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }
      
      await fetchAccounts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reactivate account')
    }
  }

  const initiateAccountAction = (account: Account, action: 'deactivate' | 'reactivate') => {
    setAccountToAction({ id: account.id, name: account.name, action })
    setShowConfirmDialog(true)
  }

  const confirmAccountAction = async () => {
    if (!accountToAction) return

    if (accountToAction.action === 'deactivate') {
      await handleDeactivateAccount(accountToAction.id)
    } else {
      await handleReactivateAccount(accountToAction.id)
    }

    setShowConfirmDialog(false)
    setAccountToAction(null)
  }

  const cancelAccountAction = () => {
    setShowConfirmDialog(false)
    setAccountToAction(null)
  }

  const formatCurrency = (amount: string, currency: string = 'CAD') => {
    const num = parseFloat(amount)
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: currency,
    }).format(num)
  }

  const getAccountTypeIcon = (category: string, subCategory: string) => {
    if (category === 'ASSET') {
      switch (subCategory) {
        case 'cash': return '💰'
        case 'investment': return '📈'
        case 'real_estate': return '🏠'
        default: return '🏦'
      }
    } else { // LIABILITY
      switch (subCategory) {
        case 'debt': return '💳'
        default: return '📋'
      }
    }
  }

  const getBalanceColor = (balance: string, category: string) => {
    const amount = parseFloat(balance)
    if (category === 'ASSET') {
      return amount >= 0 ? 'text-green-600' : 'text-red-600'
    } else { // LIABILITY
      return amount > 0 ? 'text-red-600' : 'text-green-600'
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 h-20 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-800">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">Error loading accounts</span>
        </div>
        <p className="text-red-700 mt-2">{error}</p>
        <button
          onClick={fetchAccounts}
          className="mt-3 text-red-800 underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    )
  }

  if (accounts.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">🏦</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No accounts yet</h3>
        <p className="text-gray-600">Get started by adding your first financial account.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {accounts.map((account) => (
        <div
          key={account.id}
          className={clsx(
            'bg-white border rounded-lg p-4 hover:shadow-md transition-shadow',
            !account.is_active && 'opacity-60 border-gray-300'
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 text-2xl">
                {getAccountTypeIcon(
                  account.account_type?.category || 'ASSET',
                  account.account_type?.sub_category || 'cash'
                )}
              </div>
              
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {account.name}
                  </h3>
                  {!account.is_active && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                      Inactive
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{account.account_type?.name || 'Unknown Type'}</span>
                  {account.institution && (
                    <>
                      <span>•</span>
                      <span>{account.institution}</span>
                    </>
                  )}
                  {account.account_number && (
                    <>
                      <span>•</span>
                      <span>****{account.account_number.slice(-4)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className={clsx(
                  'text-xl font-semibold',
                  getBalanceColor(account.balance, account.account_type?.category || 'ASSET')
                )}>
                  {formatCurrency(account.balance, account.currency)}
                </div>
                <div className="text-xs text-gray-500">
                  {account.currency}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEditAccount(account.id)}
                  className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Edit account"
                  aria-label={`Edit ${account.name} account`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>

                {account.is_active ? (
                  <button
                    onClick={() => initiateAccountAction(account, 'deactivate')}
                    className="flex-shrink-0 p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Deactivate account"
                    aria-label={`Deactivate ${account.name} account`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                ) : (
                  <button
                    onClick={() => initiateAccountAction(account, 'reactivate')}
                    className="flex-shrink-0 p-2 text-gray-400 hover:text-green-600 transition-colors"
                    title="Reactivate account"
                    aria-label={`Reactivate ${account.name} account`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
      
      <ConfirmationDialog
        isOpen={showConfirmDialog}
        onClose={cancelAccountAction}
        onConfirm={confirmAccountAction}
        title={accountToAction?.action === 'deactivate' ? 'Deactivate Account' : 'Reactivate Account'}
        message={
          accountToAction?.action === 'deactivate'
            ? `Are you sure you want to deactivate "${accountToAction?.name}"? The account will be hidden from your main view but can be reactivated later.`
            : `Are you sure you want to reactivate "${accountToAction?.name}"? The account will be visible in your main view again.`
        }
        confirmText={accountToAction?.action === 'deactivate' ? 'Deactivate' : 'Reactivate'}
        variant={accountToAction?.action === 'deactivate' ? 'warning' : 'info'}
      />
    </div>
  )
}