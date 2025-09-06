import { useState, useEffect } from 'react'
import clsx from 'clsx'
import type { Transaction } from '../types/transaction'
import EditTransactionForm from './EditTransactionForm'

interface TransactionListProps {
  onTransactionChange?: () => void
}

export default function TransactionList({ onTransactionChange }: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${apiBaseUrl}/api/v1/transactions/`)
      
      if (!response.ok) {
        throw new Error(`Failed to load transactions: ${response.status}`)
      }
      
      const data = await response.json()
      setTransactions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  const handleEditSuccess = () => {
    setEditingTransaction(null)
    fetchTransactions()
    onTransactionChange?.()
  }

  const handleDeleteSuccess = () => {
    setEditingTransaction(null)
    fetchTransactions()
    onTransactionChange?.()
  }

  const formatAmount = (amount: string, type: 'INCOME' | 'EXPENSE') => {
    const numAmount = parseFloat(amount)
    const formatted = Math.abs(numAmount).toFixed(2)
    return type === 'INCOME' ? `+$${formatted}` : `-$${formatted}`
  }

  const getTransactionTypeColor = (type: 'INCOME' | 'EXPENSE') => {
    return type === 'INCOME' ? 'text-green-600' : 'text-red-600'
  }

  const getTransactionTypeIcon = (type: 'INCOME' | 'EXPENSE') => {
    return type === 'INCOME' ? '💰' : '💸'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toDateString()
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-gray-200 h-16 rounded-lg"></div>
        ))}
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
          <span className="font-medium">Error</span>
        </div>
        <p className="text-red-700 mt-2">{error}</p>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by adding your first transaction.</p>
      </div>
    )
  }

  if (editingTransaction) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Edit Transaction</h2>
          <button
            onClick={() => setEditingTransaction(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <EditTransactionForm
          transaction={editingTransaction}
          onCancel={() => setEditingTransaction(null)}
          onSuccess={handleEditSuccess}
          onDelete={handleDeleteSuccess}
        />
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Transactions</h2>
      
      <div className="space-y-3">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setEditingTransaction(transaction)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="text-2xl">
                  {getTransactionTypeIcon(transaction.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {transaction.description}
                    </p>
                    {transaction.category && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {transaction.category.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-500">
                      {transaction.account?.name || 'Unknown Account'}
                    </p>
                    <span className="text-gray-300">•</span>
                    <p className="text-xs text-gray-500">
                      {formatDate(transaction.transaction_date)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <p className={clsx(
                  'text-sm font-medium',
                  getTransactionTypeColor(transaction.type)
                )}>
                  {formatAmount(transaction.amount, transaction.type)}
                </p>
                {transaction.is_ai_categorized && (
                  <p className="text-xs text-blue-600">AI categorized</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}