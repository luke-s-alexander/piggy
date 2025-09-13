import { useState, useMemo, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

interface Account {
  id: string
  name: string
}

interface Category {
  id: string
  name: string
  type: 'INCOME' | 'EXPENSE'
}

interface BulkEditModalProps {
  selectedCount: number
  accounts: Account[]
  categories: Category[]
  onClose: () => void
  onApplyEdit: (field: string, value: string) => void
}

const EDITABLE_FIELDS = [
  { key: 'description', label: 'Description', type: 'text' },
  { key: 'transaction_date', label: 'Date', type: 'date' },
  { key: 'amount', label: 'Amount', type: 'number' },
  { key: 'account_id', label: 'Account', type: 'select' },
  { key: 'category_id', label: 'Category', type: 'select' },
]

export default function BulkEditModal({
  selectedCount,
  accounts,
  categories,
  onClose,
  onApplyEdit,
}: BulkEditModalProps) {
  const [selectedField, setSelectedField] = useState('')
  const [editValue, setEditValue] = useState('')
  const [fieldSearchTerm, setFieldSearchTerm] = useState('')
  const [valueSearchTerm, setValueSearchTerm] = useState('')
  const [showFieldDropdown, setShowFieldDropdown] = useState(false)
  const [showValueDropdown, setShowValueDropdown] = useState(false)
  
  const fieldDropdownRef = useRef<HTMLDivElement>(null)
  const valueDropdownRef = useRef<HTMLDivElement>(null)

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fieldDropdownRef.current && !fieldDropdownRef.current.contains(event.target as Node)) {
        setShowFieldDropdown(false)
      }
      if (valueDropdownRef.current && !valueDropdownRef.current.contains(event.target as Node)) {
        setShowValueDropdown(false)
      }
    }

    if (showFieldDropdown || showValueDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showFieldDropdown, showValueDropdown])

  const handleFieldChange = (field: string) => {
    setSelectedField(field)
    setEditValue('')
    setFieldSearchTerm('')
    setValueSearchTerm('')
    setShowFieldDropdown(false)
    setShowValueDropdown(false)
  }

  const handleValueChange = (value: string) => {
    setEditValue(value)
    setValueSearchTerm('')
    setShowValueDropdown(false)
  }

  const handleApply = () => {
    if (selectedField && editValue) {
      onApplyEdit(selectedField, editValue)
    }
  }

  // Filtered lists for search functionality
  const filteredFields = useMemo(() => {
    return EDITABLE_FIELDS.filter(field =>
      field.label.toLowerCase().includes(fieldSearchTerm.toLowerCase())
    )
  }, [fieldSearchTerm])

  const filteredAccounts = useMemo(() => {
    return accounts.filter(account =>
      account.name.toLowerCase().includes(valueSearchTerm.toLowerCase())
    )
  }, [accounts, valueSearchTerm])

  const filteredCategories = useMemo(() => {
    return categories.filter(category =>
      category.name.toLowerCase().includes(valueSearchTerm.toLowerCase())
    )
  }, [categories, valueSearchTerm])

  const getFieldDisplayName = () => {
    const field = EDITABLE_FIELDS.find(f => f.key === selectedField)
    return field ? field.label : 'Choose a field to edit'
  }

  const getValueDisplayName = () => {
    const field = EDITABLE_FIELDS.find(f => f.key === selectedField)
    if (!field) return ''
    
    if (field.key === 'account_id') {
      const account = accounts.find(a => a.id === editValue)
      return account ? account.name : 'Choose an account'
    } else if (field.key === 'category_id') {
      const category = categories.find(c => c.id === editValue)
      return category ? category.name : 'Choose a category'
    }
    return editValue || `Enter ${field.label.toLowerCase()}`
  }

  const renderValueInput = () => {
    const field = EDITABLE_FIELDS.find(f => f.key === selectedField)
    if (!field) return null

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={`Enter new ${field.label.toLowerCase()}`}
            autoFocus
          />
        )
      
      case 'date':
        return (
          <input
            type="date"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        )
      
      case 'number':
        return (
          <input
            type="number"
            step="0.01"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
            autoFocus
          />
        )
      
      case 'select':
        if (selectedField === 'account_id') {
          return (
            <div className="relative" ref={valueDropdownRef}>
              <div
                onClick={() => setShowValueDropdown(!showValueDropdown)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
              >
                <span className={editValue ? 'text-gray-900' : 'text-gray-500'}>
                  {getValueDisplayName()}
                </span>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {showValueDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                  <div className="p-2 border-b border-gray-200">
                    <input
                      type="text"
                      placeholder="Search accounts..."
                      value={valueSearchTerm}
                      onChange={(e) => setValueSearchTerm(e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredAccounts.map((account) => (
                      <div
                        key={account.id}
                        onClick={() => handleValueChange(account.id)}
                        className="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 hover:text-blue-900"
                      >
                        {account.name}
                      </div>
                    ))}
                    {filteredAccounts.length === 0 && (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        No accounts found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        } else if (selectedField === 'category_id') {
          return (
            <div className="relative" ref={valueDropdownRef}>
              <input
                type="text"
                value={editValue ? getValueDisplayName() : valueSearchTerm}
                onChange={(e) => {
                  setValueSearchTerm(e.target.value)
                  setEditValue('')
                  setShowValueDropdown(true)
                }}
                onFocus={() => setShowValueDropdown(true)}
                placeholder="Choose a category"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {showValueDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                  <div className="max-h-48 overflow-y-auto">
                    {filteredCategories.map((category) => (
                      <div
                        key={category.id}
                        onClick={() => handleValueChange(category.id)}
                        className="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 hover:text-blue-900"
                      >
                        {category.name}
                      </div>
                    ))}
                    {filteredCategories.length === 0 && valueSearchTerm && (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        No categories found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        }
        return null
      
      default:
        return null
    }
  }

  return createPortal(
    <div 
      className="fixed inset-0 flex items-center justify-center z-[9999]"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(2px)'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setShowFieldDropdown(false)
          setShowValueDropdown(false)
        }
      }}
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Bulk Edit {selectedCount} Transactions
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Field
            </label>
            <div className="relative" ref={fieldDropdownRef}>
              <input
                type="text"
                value={selectedField ? getFieldDisplayName() : fieldSearchTerm}
                onChange={(e) => {
                  setFieldSearchTerm(e.target.value)
                  setSelectedField('')
                  setEditValue('')
                  setShowFieldDropdown(true)
                }}
                onFocus={() => setShowFieldDropdown(true)}
                placeholder="Choose a field to edit"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {showFieldDropdown && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                  <div className="max-h-48 overflow-y-auto">
                    {filteredFields.map((field) => (
                      <div
                        key={field.key}
                        onClick={() => handleFieldChange(field.key)}
                        className="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 hover:text-blue-900"
                      >
                        {field.label}
                      </div>
                    ))}
                    {filteredFields.length === 0 && fieldSearchTerm && (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        No fields found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {selectedField && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Value
              </label>
              {renderValueInput()}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={!selectedField || !editValue}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Apply to {selectedCount} Transactions
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}