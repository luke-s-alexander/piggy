import { useState, useEffect } from 'react'
import clsx from 'clsx'
import type { Account } from '../types/account'
import type { Category, TransactionCreate } from '../types/transaction'

interface AddTransactionFormProps {
  onCancel: () => void
  onSuccess: () => void
}

export default function AddTransactionForm({ onCancel, onSuccess }: AddTransactionFormProps) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<TransactionCreate>({
    account_id: '',
    category_id: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0], // Today's date
    type: 'EXPENSE'
  })

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
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
      
      const accountsData = await accountsResponse.json()
      const categoriesData = await categoriesResponse.json()
      
      setAccounts(accountsData)
      setCategories(categoriesData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoadingData(false)
    }
  }

  const validateField = (name: string, value: string) => {
    const errors: Record<string, string> = {}

    switch (name) {
      case 'account_id':
        if (!value.trim()) {
          errors.account_id = 'Please select an account'
        }
        break
      
      case 'category_id':
        if (!value.trim()) {
          errors.category_id = 'Please select a category'
        }
        break

      case 'amount':
        if (!value.trim()) {
          errors.amount = 'Amount is required'
        } else {
          const numValue = parseFloat(value)
          if (isNaN(numValue)) {
            errors.amount = 'Amount must be a valid number'
          } else if (numValue <= 0) {
            errors.amount = 'Amount must be greater than zero'
          } else if (numValue > 999999999.99) {
            errors.amount = 'Amount must be less than 1,000,000,000'
          }
        }
        break

      case 'description':
        if (!value.trim()) {
          errors.description = 'Description is required'
        } else if (value.trim().length < 2) {
          errors.description = 'Description must be at least 2 characters'
        } else if (value.trim().length > 255) {
          errors.description = 'Description must be less than 255 characters'
        }
        break

      case 'date':
        if (!value) {
          errors.date = 'Date is required'
        } else {
          const selectedDate = new Date(value)
          const today = new Date()
          const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())
          const oneYearForward = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate())
          
          if (selectedDate < oneYearAgo) {
            errors.date = 'Date cannot be more than a year ago'
          } else if (selectedDate > oneYearForward) {
            errors.date = 'Date cannot be more than a year in the future'
          }
        }
        break

      case 'type':
        if (!value || !['INCOME', 'EXPENSE'].includes(value)) {
          errors.type = 'Please select a valid transaction type'
        }
        break
    }

    return errors
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

    // Auto-filter categories by type when type changes
    if (name === 'type') {
      setFormData(prev => ({
        ...prev,
        category_id: '' // Reset category selection when type changes
      }))
    }
  }

  const handleFieldBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }))
    const fieldValue = formData[fieldName as keyof TransactionCreate]
    const fieldValidationErrors = validateField(fieldName, fieldValue)
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
      const fieldValue = formData[fieldName as keyof TransactionCreate]
      const fieldErrors = validateField(fieldName, fieldValue)
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
      const response = await fetch(`${apiBaseUrl}/api/v1/transactions/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount).toString()
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

      // Reset form on success
      setFormData({
        account_id: '',
        category_id: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        type: 'EXPENSE'
      })

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create transaction')
    } finally {
      setLoading(false)
    }
  }

  const getTransactionTypeIcon = (type: string) => {
    return type === 'INCOME' ? '💰' : '💸'
  }

  const getCategoryIcon = (type: string) => {
    return type === 'INCOME' ? '📈' : '🏷️'
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
            onBlur={() => handleFieldBlur('type')}
            className={clsx(
              "w-full px-3 py-2 border rounded-lg focus:ring-2 transition-colors",
              fieldErrors.type && touched.type
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            )}
            required
          >
            <option value="EXPENSE">{getTransactionTypeIcon('EXPENSE')} Expense</option>
            <option value="INCOME">{getTransactionTypeIcon('INCOME')} Income</option>
          </select>
          {fieldErrors.type && touched.type && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.type}</p>
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
              min="0.01"
              className={clsx(
                "w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 transition-colors",
                fieldErrors.amount && touched.amount
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              )}
              placeholder="25.00"
              required
            />
          </div>
          {fieldErrors.amount && touched.amount && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.amount}</p>
          )}
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
            {accounts.filter(account => account.is_active).map((account) => (
              <option key={account.id} value={account.id}>
                {account.name} ({account.account_type?.name}) - ${account.balance}
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

        <div className="md:col-span-2">
          <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
            Category * {formData.type && `(${formData.type.toLowerCase()} categories)`}
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
                {getCategoryIcon(category.type)} {category.name}
              </option>
            ))}
          </select>
          {fieldErrors.category_id && touched.category_id && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.category_id}</p>
          )}
          {getFilteredCategories().length === 0 && formData.type && (
            <p className="text-xs text-amber-600 mt-1">
              No {formData.type.toLowerCase()} categories found. You may need to create one first.
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            onBlur={() => handleFieldBlur('description')}
            rows={3}
            className={clsx(
              "w-full px-3 py-2 border rounded-lg focus:ring-2 transition-colors resize-none",
              fieldErrors.description && touched.description
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            )}
            placeholder="e.g., Lunch at Pizza Place, Salary deposit, Gas for car"
            required
          />
          {fieldErrors.description && touched.description && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.description}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
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
              Creating...
            </div>
          ) : (
            `Add ${formData.type === 'INCOME' ? 'Income' : 'Expense'}`
          )}
        </button>
      </div>
    </form>
  )
}