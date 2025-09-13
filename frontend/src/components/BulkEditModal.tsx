import { useState, useMemo } from 'react'
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
  const [accountSearchTerm, setAccountSearchTerm] = useState('')
  const [categorySearchTerm, setCategorySearchTerm] = useState('')

  const handleFieldChange = (field: string) => {
    setSelectedField(field)
    setEditValue('')
    setFieldSearchTerm('')
    setAccountSearchTerm('')
    setCategorySearchTerm('')
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
      account.name.toLowerCase().includes(accountSearchTerm.toLowerCase())
    )
  }, [accounts, accountSearchTerm])

  const filteredCategories = useMemo(() => {
    return categories.filter(category =>
      category.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
    )
  }, [categories, categorySearchTerm])

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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
            autoFocus
          />
        )
      
      case 'select':
        if (selectedField === 'account_id') {
          return (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Search accounts..."
                value={accountSearchTerm}
                onChange={(e) => setAccountSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                size={Math.min(filteredAccounts.length + 1, 6)}
              >
                <option value="">Select an account</option>
                {filteredAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>
          )
        } else if (selectedField === 'category_id') {
          return (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Search categories..."
                value={categorySearchTerm}
                onChange={(e) => setCategorySearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                size={Math.min(filteredCategories.length + 1, 6)}
              >
                <option value="">Select a category</option>
                {filteredCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.type})
                  </option>
                ))}
              </select>
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
              Field to Edit
            </label>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Search fields..."
                value={fieldSearchTerm}
                onChange={(e) => setFieldSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={selectedField}
                onChange={(e) => handleFieldChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                size={Math.min(filteredFields.length + 1, 6)}
              >
                <option value="">Select a field</option>
                {filteredFields.map((field) => (
                  <option key={field.key} value={field.key}>
                    {field.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedField && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Value
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