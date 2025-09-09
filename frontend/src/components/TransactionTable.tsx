import { useState, useEffect, useMemo, useCallback } from 'react'
import clsx from 'clsx'
import type { Transaction } from '../types/transaction'
import EditTransactionForm from './EditTransactionForm'

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

export default function TransactionTable({ onTransactionChange }: TransactionTableProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
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

  // Data for filter dropdowns
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  
  // View state
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set())

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

  const handleEditSuccess = () => {
    setEditingTransaction(null)
    fetchTransactions()
    fetchSummary()
    onTransactionChange?.()
  }

  const handleDeleteSuccess = () => {
    setEditingTransaction(null)
    fetchTransactions()
    fetchSummary()
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
        <div className="flex items-center gap-4">
          {selectedTransactions.size > 0 && (
            <span className="text-sm text-gray-500">
              {selectedTransactions.size} selected
            </span>
          )}
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
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Search Description</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search..."
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
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

      {/* Summary Statistics */}
      {summary && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">Total Transactions</p>
              <p className="text-lg font-semibold text-gray-900">{summary.total_count}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Total Income</p>
              <p className="text-lg font-semibold text-green-600">+${summary.total_income.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Total Expenses</p>
              <p className="text-lg font-semibold text-red-600">-${summary.total_expense.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Net Amount</p>
              <p className={clsx(
                'text-lg font-semibold',
                summary.net_amount >= 0 ? 'text-blue-600' : 'text-orange-600'
              )}>
                {summary.net_amount >= 0 ? '+' : ''}${summary.net_amount.toFixed(2)}
              </p>
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
                      'hover:bg-gray-50 cursor-pointer',
                      selectedTransactions.has(transaction.id) && 'bg-blue-50'
                    )}
                    onClick={() => setEditingTransaction(transaction)}
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedTransactions.has(transaction.id)}
                        onChange={(e) => {
                          e.stopPropagation()
                          toggleTransactionSelection(transaction.id)
                        }}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(transaction.transaction_date)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {transaction.description}
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
                      {transaction.account?.name || 'Unknown'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.category?.name || 'Uncategorized'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <span className={getTransactionTypeColor(transaction.type)}>
                        {formatAmount(transaction.amount, transaction.type)}
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