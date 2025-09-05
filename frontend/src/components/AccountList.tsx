import { useState, useEffect } from 'react'
import clsx from 'clsx'
import type { Account } from '../types/account'

interface AccountListProps {
  onEditAccount: (accountId: string) => void
}

export default function AccountList({ onEditAccount }: AccountListProps) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('http://localhost:8000/api/v1/accounts/')
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

              <button
                onClick={() => onEditAccount(account.id)}
                className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Edit account"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}