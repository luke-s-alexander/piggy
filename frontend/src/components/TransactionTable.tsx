import { useState, useEffect, useMemo, useCallback } from 'react'
import clsx from 'clsx'
import type { Transaction } from '../types/transaction'

interface TransactionTableProps {
  onTransactionChange?: () => void
}

type SortField = 'transaction_date' | 'amount' | 'description' | 'account' | 'category' | 'type'
type SortDirection = 'asc' | 'desc'

interface Filters {
  search: string
  type: string
  accountId: string
  categoryId: string
  startDate: string
  endDate: string
  minAmount: string
  maxAmount: string
}

interface Summary {
  total_count: number
  total_income: number
  total_expense: number
  net_amount: number
}

interface Account {
  id: string
  name: string
}

interface Category {
  id: string
  name: string
  type: 'INCOME' | 'EXPENSE'
}

interface EditingCell {
  transactionId: string
  field: keyof Transaction
}

export default function TransactionTable({ onTransactionChange }: TransactionTableProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<Summary | null>(null)
  
  // Filters and sorting
  const [filters, setFilters] = useState<Filters>({
    search: '',
    type: '',
    accountId: '',
    categoryId: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: ''
  })
  const [sortField, setSortField] = useState<SortField>('transaction_date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Data for filter dropdowns and inline editing
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  
  // View state
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set())
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null)
  const [editValue, setEditValue] = useState<string>('')

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

  // Fetch reference data
  useEffect(() => {
    fetchReferenceData()
  }, [])

  // Fetch transactions when filters or sorting change
  useEffect(() => {
    fetchTransactions()
    fetchSummary()
  }, [filters, sortField, sortDirection])

  const fetchReferenceData = async () => {
    try {
      const [accountsResponse, categoriesResponse] = await Promise.all([
        fetch(`${apiBaseUrl}/api/v1/accounts/`),
        fetch(`${apiBaseUrl}/api/v1/categories/`)
      ])

      if (accountsResponse.ok) {
        const accountsData = await accountsResponse.json()
        setAccounts(accountsData)
      }

      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData)
      }
    } catch (err) {
      console.error('Failed to fetch reference data:', err)
    }
  }

  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams()
    
    if (filters.search) params.append('search', filters.search)
    if (filters.type) params.append('transaction_type', filters.type)
    if (filters.accountId) params.append('account_id', filters.accountId)
    if (filters.categoryId) params.append('category_id', filters.categoryId)
    if (filters.startDate) params.append('start_date', filters.startDate)
    if (filters.endDate) params.append('end_date', filters.endDate)
    if (filters.minAmount) params.append('min_amount', filters.minAmount)
    if (filters.maxAmount) params.append('max_amount', filters.maxAmount)
    
    params.append('sort_by', sortField)
    params.append('sort_order', sortDirection)
    params.append('limit', '1000')
    
    return params.toString()
  }, [filters, sortField, sortDirection])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const queryParams = buildQueryParams()
      const response = await fetch(`${apiBaseUrl}/api/v1/transactions/?${queryParams}`)
      
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

  const fetchSummary = async () => {
    try {
      const queryParams = buildQueryParams()
      const response = await fetch(`${apiBaseUrl}/api/v1/transactions/summary?${queryParams}`)
      
      if (response.ok) {
        const data = await response.json()
        setSummary(data)
      }
    } catch (err) {
      console.error('Failed to fetch summary:', err)
    }
  }

  const updateTransaction = async (transactionId: string, field: keyof Transaction, value: string) => {
    try {
      const updateData: any = {}
      updateData[field] = value

      const response = await fetch(`${apiBaseUrl}/api/v1/transactions/${transactionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        throw new Error(`Failed to update transaction: ${response.status}`)
      }

      // Refresh data after successful update
      await fetchTransactions()
      await fetchSummary()
      onTransactionChange?.()
    } catch (err) {
      console.error('Failed to update transaction:', err)
      setError(err instanceof Error ? err.message : 'Failed to update transaction')
    }
  }

  const startEditing = (transactionId: string, field: keyof Transaction, currentValue: string) => {
    setEditingCell({ transactionId, field })
    setEditValue(currentValue)
  }

  const saveEdit = async () => {
    if (editingCell && editValue !== '') {
      await updateTransaction(editingCell.transactionId, editingCell.field, editValue)
    }
    setEditingCell(null)
    setEditValue('')
  }

  const cancelEdit = () => {
    setEditingCell(null)
    setEditValue('')
  }

  const formatAmount = (amount: string, type: 'INCOME' | 'EXPENSE') => {
    const numAmount = parseFloat(amount)
    const formatted = Math.abs(numAmount).toFixed(2)
    return type === 'INCOME' ? `+$${formatted}` : `-$${formatted}`
  }

  const getTransactionTypeColor = (type: 'INCOME' | 'EXPENSE') => {
    return type === 'INCOME' ? 'text-green-600' : 'text-red-600'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString()
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      type: '',
      accountId: '',
      categoryId: '',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: ''
    })
  }

  const toggleTransactionSelection = (transactionId: string) => {
    setSelectedTransactions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(transactionId)) {
        newSet.delete(transactionId)
      } else {
        newSet.add(transactionId)
      }
      return newSet
    })
  }

  const toggleAllTransactions = () => {
    if (selectedTransactions.size === transactions.length) {
      setSelectedTransactions(new Set())
    } else {
      setSelectedTransactions(new Set(transactions.map(t => t.id)))
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        </svg>
      )
    }
    return (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
          d={sortDirection === 'asc' ? "m5 15 7-7 7 7" : "m19 9-7 7-7-7"} />
      </svg>
    )
  }

  // Filter and search transactions (from original TransactionList)
  const filteredAndSortedTransactions = useMemo(() => {
    return transactions // Already filtered by backend
  }, [transactions])

  // Calculate summary statistics (from original TransactionList)  
  const summaryStats = useMemo(() => {
    if (!summary) return null
    
    return {
      totalIncome: summary.total_income,
      totalExpense: summary.total_expense,
      netAmount: summary.net_amount,
      transactionCount: summary.total_count
    }
  }, [summary])

  const renderEditableCell = (transaction: Transaction, field: keyof Transaction, value: string, displayValue?: string) => {
    const isEditing = editingCell?.transactionId === transaction.id && editingCell?.field === field

    if (isEditing) {
      if (field === 'category_id') {
        return (
          <select
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit()
              if (e.key === 'Escape') cancelEdit()
            }}
            className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          >
            {categories
              .filter(cat => cat.type === transaction.type)
              .map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))
            }
          </select>
        )
      } else if (field === 'account_id') {
        return (
          <select
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit()
              if (e.key === 'Escape') cancelEdit()
            }}
            className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          >
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        )
      } else if (field === 'transaction_date') {
        return (
          <input
            type="date"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit()
              if (e.key === 'Escape') cancelEdit()
            }}
            className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        )
      } else if (field === 'amount') {
        return (
          <input
            type="number"
            step="0.01"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit()
              if (e.key === 'Escape') cancelEdit()
            }}
            className="w-full px-2 py-1 text-sm border border-blue-300 rounded text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        )
      } else {
        return (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit()
              if (e.key === 'Escape') cancelEdit()
            }}
            className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        )
      }
    }

    return (
      <span
        onClick={() => startEditing(transaction.id, field, value)}
        className="cursor-pointer hover:bg-blue-50 rounded px-1 py-0.5 -mx-1 -my-0.5 transition-colors"
        title="Click to edit"
      >
        {displayValue || value}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="bg-gray-200 h-8 rounded-lg"></div>
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Transactions</h2>
        <div className="flex items-center gap-4">
          {selectedTransactions.size > 0 && (
            <span className="text-sm text-gray-500">
              {selectedTransactions.size} selected
            </span>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>
              {summaryStats?.transactionCount || 0} transaction{(summaryStats?.transactionCount || 0) !== 1 ? 's' : ''}
            </span>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={clsx(
              'px-3 py-1 text-sm border rounded-md transition-colors',
              showFilters 
                ? 'bg-blue-50 border-blue-300 text-blue-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            )}
          >
            Filters {Object.values(filters).some(v => v) && '•'}
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">Advanced Filters</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear All
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search transactions..."
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Filter</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </select>
            </div>

            {/* Account */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Account</label>
              <select
                value={filters.accountId}
                onChange={(e) => handleFilterChange('accountId', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Accounts</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filters.categoryId}
                onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.type})
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Amount Range */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Min Amount</label>
              <input
                type="number"
                step="0.01"
                value={filters.minAmount}
                onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Max Amount</label>
              <input
                type="number"
                step="0.01"
                value={filters.maxAmount}
                onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>
      )}

      {/* Summary Statistics (from TransactionList) */}
      {summaryStats && (
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
      )}

      {/* Transaction Table */}
      {transactions.length === 0 ? (
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
          <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {Object.values(filters).some(v => v)
              ? 'Try adjusting your filters.'
              : 'Get started by adding your first transaction.'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedTransactions.size === transactions.length && transactions.length > 0}
                      onChange={toggleAllTransactions}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('transaction_date')}
                  >
                    <div className="flex items-center gap-1">
                      Date
                      {getSortIcon('transaction_date')}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('description')}
                  >
                    <div className="flex items-center gap-1">
                      Description
                      {getSortIcon('description')}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('type')}
                  >
                    <div className="flex items-center gap-1">
                      Type
                      {getSortIcon('type')}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th 
                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('amount')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Amount
                      {getSortIcon('amount')}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    AI
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className={clsx(
                      'hover:bg-gray-50',
                      selectedTransactions.has(transaction.id) && 'bg-blue-50'
                    )}
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedTransactions.has(transaction.id)}
                        onChange={() => toggleTransactionSelection(transaction.id)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {renderEditableCell(
                        transaction, 
                        'transaction_date', 
                        transaction.transaction_date,
                        formatDate(transaction.transaction_date)
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 max-w-xs">
                      {renderEditableCell(transaction, 'description', transaction.description)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={clsx(
                        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                        transaction.type === 'INCOME' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      )}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {renderEditableCell(
                        transaction,
                        'account_id',
                        transaction.account_id,
                        transaction.account?.name || 'Unknown'
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {renderEditableCell(
                        transaction,
                        'category_id',
                        transaction.category_id,
                        transaction.category?.name || 'Uncategorized'
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <span className={getTransactionTypeColor(transaction.type)}>
                        {renderEditableCell(
                          transaction,
                          'amount',
                          transaction.amount,
                          formatAmount(transaction.amount, transaction.type)
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.is_ai_categorized && (
                        <div className="flex items-center gap-1">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            AI
                          </span>
                          {transaction.ai_confidence && (
                            <span className="text-xs text-gray-400">
                              {(transaction.ai_confidence * 100).toFixed(0)}%
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}