import { useState, useEffect } from 'react'
import clsx from 'clsx'
import type { AccountType, AccountCreate } from '../types/account'

interface AddAccountFormProps {
  onCancel: () => void
  onSuccess: () => void
}

export default function AddAccountForm({ onCancel, onSuccess }: AddAccountFormProps) {
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingTypes, setLoadingTypes] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<AccountCreate>({
    name: '',
    account_type_id: '',
    balance: '0.00',
    institution: '',
    account_number: '',
    currency: 'CAD',
    is_active: true
  })

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchAccountTypes()
  }, [])

  const fetchAccountTypes = async () => {
    try {
      setLoadingTypes(true)
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${apiBaseUrl}/api/v1/account-types/`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setAccountTypes(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load account types')
    } finally {
      setLoadingTypes(false)
    }
  }

  const validateField = (name: string, value: string | boolean) => {
    const errors: Record<string, string> = {}

    switch (name) {
      case 'name':
        if (typeof value === 'string') {
          if (!value.trim()) {
            errors.name = 'Account name is required'
          } else if (value.trim().length < 2) {
            errors.name = 'Account name must be at least 2 characters'
          } else if (value.trim().length > 100) {
            errors.name = 'Account name must be less than 100 characters'
          }
        }
        break
      
      case 'account_type_id':
        if (typeof value === 'string' && !value.trim()) {
          errors.account_type_id = 'Please select an account type'
        }
        break

      case 'balance':
        if (typeof value === 'string' && value.trim()) {
          const numValue = parseFloat(value)
          if (isNaN(numValue)) {
            errors.balance = 'Balance must be a valid number'
          } else if (numValue < -999999999.99 || numValue > 999999999.99) {
            errors.balance = 'Balance must be between -999,999,999.99 and 999,999,999.99'
          }
        }
        break

      case 'institution':
        if (typeof value === 'string' && value.trim() && value.trim().length > 100) {
          errors.institution = 'Institution name must be less than 100 characters'
        }
        break

      case 'account_number':
        if (typeof value === 'string' && value.trim()) {
          if (!/^\d{0,4}$/.test(value.trim())) {
            errors.account_number = 'Account number must be up to 4 digits only'
          }
        }
        break
    }

    return errors
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const fieldValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    
    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }))

    // Validate field if it's been touched
    if (touched[name]) {
      const fieldValidationErrors = validateField(name, fieldValue)
      setFieldErrors(prev => ({
        ...prev,
        ...fieldValidationErrors,
        ...(Object.keys(fieldValidationErrors).length === 0 ? { [name]: '' } : {})
      }))
    }
  }

  const handleFieldBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }))
    const fieldValue = formData[fieldName as keyof AccountCreate]
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
      const fieldValue = formData[fieldName as keyof AccountCreate]
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
      const response = await fetch(`${apiBaseUrl}/api/v1/accounts/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          balance: parseFloat(formData.balance || '0').toString()
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
        name: '',
        account_type_id: '',
        balance: '0.00',
        institution: '',
        account_number: '',
        currency: 'CAD',
        is_active: true
      })

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account')
    } finally {
      setLoading(false)
    }
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

  const getSelectedAccountType = () => {
    return accountTypes.find(type => type.id === formData.account_type_id)
  }

  const getBalancePlaceholder = () => {
    const selectedType = getSelectedAccountType()
    if (selectedType?.category === 'LIABILITY') {
      return '-1000.00' // Show negative example for liabilities
    }
    return '1000.00' // Show positive example for assets
  }

  const getBalanceHelpText = () => {
    const selectedType = getSelectedAccountType()
    if (selectedType?.category === 'LIABILITY') {
      return 'Enter negative amount for money owed (e.g., -1500.00 for credit card debt)'
    } else if (selectedType?.category === 'ASSET') {
      return 'Enter positive amount for money owned (e.g., 2500.00 for checking balance)'
    }
    return null
  }

  if (loadingTypes) {
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
        <div className="md:col-span-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Account Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            onBlur={() => handleFieldBlur('name')}
            className={clsx(
              "w-full px-3 py-2 border rounded-lg focus:ring-2 transition-colors",
              fieldErrors.name && touched.name
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            )}
            placeholder="e.g., My Primary Checking"
            required
          />
          {fieldErrors.name && touched.name && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="account_type_id" className="block text-sm font-medium text-gray-700 mb-2">
            Account Type *
          </label>
          <select
            id="account_type_id"
            name="account_type_id"
            value={formData.account_type_id}
            onChange={handleInputChange}
            onBlur={() => handleFieldBlur('account_type_id')}
            className={clsx(
              "w-full px-3 py-2 border rounded-lg focus:ring-2 transition-colors",
              fieldErrors.account_type_id && touched.account_type_id
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            )}
            required
          >
            <option value="">Select an account type...</option>
            {accountTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {getAccountTypeIcon(type.category, type.sub_category)} {type.name} ({type.category})
              </option>
            ))}
          </select>
          {fieldErrors.account_type_id && touched.account_type_id && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.account_type_id}</p>
          )}
        </div>

        <div>
          <label htmlFor="balance" className="block text-sm font-medium text-gray-700 mb-2">
            Initial Balance
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              id="balance"
              name="balance"
              value={formData.balance}
              onChange={handleInputChange}
              onBlur={() => handleFieldBlur('balance')}
              step="0.01"
              className={clsx(
                "w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 transition-colors",
                fieldErrors.balance && touched.balance
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              )}
              placeholder={getBalancePlaceholder()}
            />
          </div>
          {fieldErrors.balance && touched.balance && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.balance}</p>
          )}
          {getBalanceHelpText() && (
            <p className="text-xs text-gray-600 mt-1">
              {getBalanceHelpText()}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
            Currency
          </label>
          <select
            id="currency"
            name="currency"
            value={formData.currency}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="CAD">🇨🇦 CAD</option>
            <option value="USD">🇺🇸 USD</option>
            <option value="EUR">🇪🇺 EUR</option>
            <option value="GBP">🇬🇧 GBP</option>
          </select>
        </div>

        <div>
          <label htmlFor="institution" className="block text-sm font-medium text-gray-700 mb-2">
            Institution
          </label>
          <input
            type="text"
            id="institution"
            name="institution"
            value={formData.institution}
            onChange={handleInputChange}
            onBlur={() => handleFieldBlur('institution')}
            className={clsx(
              "w-full px-3 py-2 border rounded-lg focus:ring-2 transition-colors",
              fieldErrors.institution && touched.institution
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            )}
            placeholder="e.g., TD Bank, RBC"
          />
          {fieldErrors.institution && touched.institution && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.institution}</p>
          )}
        </div>

        <div>
          <label htmlFor="account_number" className="block text-sm font-medium text-gray-700 mb-2">
            Account Number (Last 4 digits)
          </label>
          <input
            type="text"
            id="account_number"
            name="account_number"
            value={formData.account_number}
            onChange={handleInputChange}
            onBlur={() => handleFieldBlur('account_number')}
            maxLength={4}
            pattern="[0-9]*"
            className={clsx(
              "w-full px-3 py-2 border rounded-lg focus:ring-2 transition-colors",
              fieldErrors.account_number && touched.account_number
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            )}
            placeholder="1234"
          />
          {fieldErrors.account_number && touched.account_number && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.account_number}</p>
          )}
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_active"
          name="is_active"
          checked={formData.is_active}
          onChange={handleInputChange}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
          Account is active
        </label>
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
            'Create Account'
          )}
        </button>
      </div>
    </form>
  )
}