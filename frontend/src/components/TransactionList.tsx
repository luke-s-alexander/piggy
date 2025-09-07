import { useState, useEffect, useMemo } from 'react'
import clsx from 'clsx'
import type { Transaction } from '../types/transaction'
import EditTransactionForm from './EditTransactionForm'

interface TransactionListProps {
  onTransactionChange?: () => void
}

type SortField = 'date' | 'amount' | 'description' | 'account' | 'category'
type SortDirection = 'asc' | 'desc'
type FilterType = 'all' | 'income' | 'expense'

export default function TransactionList({ onTransactionChange }: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [filterType, setFilterType] = useState<FilterType>('all')

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

  // Filter, search, and sort transactions
  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(query) ||
        transaction.account?.name.toLowerCase().includes(query) ||
        transaction.category?.name.toLowerCase().includes(query) ||
        transaction.amount.includes(query)
      )
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(transaction => 
        transaction.type === filterType.toUpperCase()
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number = ''
      let bValue: string | number = ''

      switch (sortField) {
        case 'date':
          aValue = new Date(a.transaction_date).getTime()
          bValue = new Date(b.transaction_date).getTime()
          break
        case 'amount':
          aValue = Math.abs(parseFloat(a.amount))
          bValue = Math.abs(parseFloat(b.amount))
          break
        case 'description':
          aValue = a.description.toLowerCase()
          bValue = b.description.toLowerCase()
          break
        case 'account':
          aValue = a.account?.name.toLowerCase() || ''
          bValue = b.account?.name.toLowerCase() || ''
          break
        case 'category':
          aValue = a.category?.name.toLowerCase() || ''
          bValue = b.category?.name.toLowerCase() || ''
          break
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [transactions, searchQuery, sortField, sortDirection, filterType])

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const stats = filteredAndSortedTransactions.reduce(
      (acc, transaction) => {
        const amount = parseFloat(transaction.amount)
        if (transaction.type === 'INCOME') {
          acc.totalIncome += amount
        } else {
          acc.totalExpense += amount
        }
        return acc
      },
      { totalIncome: 0, totalExpense: 0 }
    )
    
    return {
      ...stats,
      netAmount: stats.totalIncome - stats.totalExpense,
      transactionCount: filteredAndSortedTransactions.length
    }
  }, [filteredAndSortedTransactions])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
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

  if (transactions.length === 0 && !loading) {
    return (
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Transactions</h2>
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Transactions</h2>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>
            {summaryStats.transactionCount} transaction{summaryStats.transactionCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter and Sort Controls */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Filter:</label>
            <select
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FilterType)}
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <button
              onClick={() => handleSort('date')}
              className={clsx(
                'px-3 py-1 text-sm border rounded-md transition-colors flex items-center gap-1',
                sortField === 'date' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              )}
            >
              Date
              {sortField === 'date' && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d={sortDirection === 'asc' ? "m5 15 7-7 7 7" : "m19 9-7 7-7-7"} />
                </svg>
              )}
            </button>
            <button
              onClick={() => handleSort('amount')}
              className={clsx(
                'px-3 py-1 text-sm border rounded-md transition-colors flex items-center gap-1',
                sortField === 'amount' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              )}
            >
              Amount
              {sortField === 'amount' && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d={sortDirection === 'asc' ? "m5 15 7-7 7 7" : "m19 9-7 7-7-7"} />
                </svg>
              )}
            </button>
            <button
              onClick={() => handleSort('description')}
              className={clsx(
                'px-3 py-1 text-sm border rounded-md transition-colors flex items-center gap-1',
                sortField === 'description' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              )}
            >
              Description
              {sortField === 'description' && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d={sortDirection === 'asc' ? "m5 15 7-7 7 7" : "m19 9-7 7-7-7"} />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Transaction Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-800 uppercase tracking-wide">Total Income</p>
                <p className="text-lg font-semibold text-green-900">
                  ${summaryStats.totalIncome.toFixed(2)}
                </p>
              </div>
              <div className="text-green-600 text-xl">💰</div>
            </div>
          </div>
          <div className="bg-red-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-red-800 uppercase tracking-wide">Total Expenses</p>
                <p className="text-lg font-semibold text-red-900">
                  ${summaryStats.totalExpense.toFixed(2)}
                </p>
              </div>
              <div className="text-red-600 text-xl">💸</div>
            </div>
          </div>
          <div className={clsx(
            'rounded-lg p-3',
            summaryStats.netAmount >= 0 ? 'bg-blue-50' : 'bg-orange-50'
          )}>
            <div className="flex items-center justify-between">
              <div>
                <p className={clsx(
                  'text-xs font-medium uppercase tracking-wide',
                  summaryStats.netAmount >= 0 ? 'text-blue-800' : 'text-orange-800'
                )}>Net Amount</p>
                <p className={clsx(
                  'text-lg font-semibold',
                  summaryStats.netAmount >= 0 ? 'text-blue-900' : 'text-orange-900'
                )}>
                  ${summaryStats.netAmount >= 0 ? '+' : ''}${summaryStats.netAmount.toFixed(2)}
                </p>
              </div>
              <div className={clsx(
                'text-xl',
                summaryStats.netAmount >= 0 ? 'text-blue-600' : 'text-orange-600'
              )}>
                {summaryStats.netAmount >= 0 ? '📈' : '📉'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      {filteredAndSortedTransactions.length === 0 ? (
        <div className="text-center py-8">
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
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery || filterType !== 'all' 
              ? 'Try adjusting your search or filters.' 
              : 'Get started by adding your first transaction.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAndSortedTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setEditingTransaction(transaction)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Enhanced Transaction Type Indicator */}
                  <div className={clsx(
                    'w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white',
                    transaction.type === 'INCOME' 
                      ? 'bg-gradient-to-br from-green-400 to-green-600' 
                      : 'bg-gradient-to-br from-red-400 to-red-600'
                  )}>
                    {getTransactionTypeIcon(transaction.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {transaction.description}
                      </p>
                      {transaction.category && (
                        <span className={clsx(
                          'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                          transaction.type === 'INCOME' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        )}>
                          {transaction.category.name}
                        </span>
                      )}
                      {transaction.is_ai_categorized && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          AI
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
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
                    'text-lg font-bold',
                    getTransactionTypeColor(transaction.type)
                  )}>
                    {formatAmount(transaction.amount, transaction.type)}
                  </p>
                  {transaction.ai_confidence && (
                    <p className="text-xs text-gray-400">
                      {(transaction.ai_confidence * 100).toFixed(0)}% confidence
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}