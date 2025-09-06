import { useState, useEffect } from 'react'
import clsx from 'clsx'
import type { Account } from '../types/account'
import type { Category, Transaction, TransactionUpdate } from '../types/transaction'

interface EditTransactionFormProps {
  transaction: Transaction
  onCancel: () => void
  onSuccess: () => void
  onDelete: () => void
}

export default function EditTransactionForm({ transaction, onCancel, onSuccess, onDelete }: EditTransactionFormProps) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  const [formData, setFormData] = useState<TransactionUpdate>({
    account_id: transaction.account_id,
    category_id: transaction.category_id,
    amount: transaction.amount,
    description: transaction.description,
    date: transaction.date,
    type: transaction.type
  })

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchAccountsAndCategories()
  }, [])

  const fetchAccountsAndCategories = async () => {
    try {
      setLoadingData(true)
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      
      const [accountsResponse, categoriesResponse] = await Promise.all([
        fetch(`${apiBaseUrl}/api/v1/accounts/`),
        fetch(`${apiBaseUrl}/api/v1/categories/`)
      ])
      
      if (!accountsResponse.ok) {
        throw new Error(`Failed to load accounts: ${accountsResponse.status}`)
      }
      if (!categoriesResponse.ok) {
        throw new Error(`Failed to load categories: ${categoriesResponse.status}`)
      }
      
      const [accountsData, categoriesData] = await Promise.all([
        accountsResponse.json(),
        categoriesResponse.json()
      ])
      
      setAccounts(accountsData)
      setCategories(categoriesData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoadingData(false)
    }
  }

  const validateField = (name: string, value: string | undefined) => {
    const errors: Record<string, string> = {}

    switch (name) {
      case 'account_id':
        if (!value?.trim()) {
          errors.account_id = 'Please select an account'
        }
        break
      
      case 'category_id':
        if (!value?.trim()) {
          errors.category_id = 'Please select a category'
        }
        break

      case 'amount':
        if (!value?.trim()) {
          errors.amount = 'Amount is required'
        } else {
          const numValue = parseFloat(value)
          if (isNaN(numValue)) {
            errors.amount = 'Amount must be a valid number'
          } else if (numValue === 0) {
            errors.amount = 'Amount cannot be zero'
          } else if (numValue < -999999999.99 || numValue > 999999999.99) {
            errors.amount = 'Amount must be between -999,999,999.99 and 999,999,999.99'
          }
        }
        break

      case 'description':
        if (!value?.trim()) {
          errors.description = 'Description is required'
        } else if (value.trim().length < 2) {
          errors.description = 'Description must be at least 2 characters'
        } else if (value.trim().length > 500) {
          errors.description = 'Description must be less than 500 characters'
        }
        break

      case 'date':
        if (!value?.trim()) {
          errors.date = 'Date is required'
        } else {
          const dateValue = new Date(value)
          if (isNaN(dateValue.getTime())) {
            errors.date = 'Please enter a valid date'
          }
        }
        break
    }

    return errors
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Validate field if it's been touched
    if (touched[name]) {
      const fieldValidationErrors = validateField(name, value)
      setFieldErrors(prev => ({
        ...prev,
        ...fieldValidationErrors,
        ...(Object.keys(fieldValidationErrors).length === 0 ? { [name]: '' } : {})
      }))
    }
  }

  const handleFieldBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }))
    const fieldValue = formData[fieldName as keyof TransactionUpdate]

    const fieldValidationErrors = validateField(fieldName, fieldValue ?? '')
    setFieldErrors(prev => ({
      ...prev,
      ...fieldValidationErrors,
      ...(Object.keys(fieldValidationErrors).length === 0 ? { [fieldName]: '' } : {})
    }))
  }

  const validateAllFields = () => {
    const allErrors: Record<string, string> = {}
    
    // Validate all fields
    Object.keys(formData).forEach(fieldName => {
      const fieldValue = formData[fieldName as keyof TransactionUpdate]
      const fieldErrors = validateField(fieldName, fieldValue ?? '')
      Object.assign(allErrors, fieldErrors)
    })

    setFieldErrors(allErrors)
    setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}))
    
    return Object.keys(allErrors).filter(key => allErrors[key]).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all fields
    if (!validateAllFields()) {
      setError('Please fix the validation errors above')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${apiBaseUrl}/api/v1/transactions/${transaction.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount || '0').toString()
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        
        // Handle structured validation errors
        if (response.status === 422 && errorData.detail?.errors) {
          const validationErrors = errorData.detail.errors
          setError(`Validation failed: ${validationErrors.join(', ')}`)
        } else if (errorData.detail) {
          setError(typeof errorData.detail === 'string' ? errorData.detail : 'An error occurred')
        } else {
          setError(`HTTP error! status: ${response.status}`)
        }
        return
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update transaction')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    setError(null)

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${apiBaseUrl}/api/v1/transactions/${transaction.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.detail || `Failed to delete transaction: ${response.status}`)
        return
      }

      onDelete()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete transaction')
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const getTransactionTypeIcon = (type: 'INCOME' | 'EXPENSE') => {
    return type === 'INCOME' ? '💰' : '💸'
  }

  const getSelectedAccount = () => {
    return accounts.find(account => account.id === formData.account_id)
  }

  const getFilteredCategories = () => {
    return categories.filter(category => category.type === formData.type)
  }

  if (loadingData) {
    return (
      <div className="animate-pulse">
        <div className="space-y-4">
          <div className="bg-gray-200 h-4 w-1/4 rounded"></div>
          <div className="bg-gray-200 h-12 rounded-lg"></div>
          <div className="bg-gray-200 h-4 w-1/4 rounded"></div>
          <div className="bg-gray-200 h-12 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Error</span>
          </div>
          <p className="text-red-700 mt-2">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
            Transaction Type *
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="INCOME">{getTransactionTypeIcon('INCOME')} Income</option>
            <option value="EXPENSE">{getTransactionTypeIcon('EXPENSE')} Expense</option>
          </select>
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
            Date *
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            onBlur={() => handleFieldBlur('date')}
            className={clsx(
              "w-full px-3 py-2 border rounded-lg focus:ring-2 transition-colors",
              fieldErrors.date && touched.date
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            )}
            required
          />
          {fieldErrors.date && touched.date && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.date}</p>
          )}
        </div>

        <div>
          <label htmlFor="account_id" className="block text-sm font-medium text-gray-700 mb-2">
            Account *
          </label>
          <select
            id="account_id"
            name="account_id"
            value={formData.account_id}
            onChange={handleInputChange}
            onBlur={() => handleFieldBlur('account_id')}
            className={clsx(
              "w-full px-3 py-2 border rounded-lg focus:ring-2 transition-colors",
              fieldErrors.account_id && touched.account_id
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            )}
            required
          >
            <option value="">Select an account...</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name} (${account.balance})
              </option>
            ))}
          </select>
          {fieldErrors.account_id && touched.account_id && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.account_id}</p>
          )}
          {getSelectedAccount() && (
            <p className="text-xs text-gray-600 mt-1">
              Current balance: ${getSelectedAccount()?.balance}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            id="category_id"
            name="category_id"
            value={formData.category_id}
            onChange={handleInputChange}
            onBlur={() => handleFieldBlur('category_id')}
            className={clsx(
              "w-full px-3 py-2 border rounded-lg focus:ring-2 transition-colors",
              fieldErrors.category_id && touched.category_id
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            )}
            required
          >
            <option value="">Select a category...</option>
            {getFilteredCategories().map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {fieldErrors.category_id && touched.category_id && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.category_id}</p>
          )}
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
            Amount *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              onBlur={() => handleFieldBlur('amount')}
              step="0.01"
              className={clsx(
                "w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 transition-colors",
                fieldErrors.amount && touched.amount
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              )}
              placeholder="0.00"
              required
            />
          </div>
          {fieldErrors.amount && touched.amount && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.amount}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            onBlur={() => handleFieldBlur('description')}
            className={clsx(
              "w-full px-3 py-2 border rounded-lg focus:ring-2 transition-colors",
              fieldErrors.description && touched.description
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            )}
            placeholder="e.g., Grocery shopping at Metro"
            required
          />
          {fieldErrors.description && touched.description && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.description}</p>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          className="px-4 py-2 text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
        >
          Delete Transaction
        </button>
        
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={clsx(
              'px-4 py-2 text-white bg-blue-600 rounded-lg font-medium transition-colors',
              loading 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-blue-700'
            )}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Saving...
              </div>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Transaction</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this transaction? This action cannot be undone.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className={clsx(
                  'px-4 py-2 text-white bg-red-600 rounded-lg font-medium transition-colors',
                  deleting 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-red-700'
                )}
              >
                {deleting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Deleting...
                  </div>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}