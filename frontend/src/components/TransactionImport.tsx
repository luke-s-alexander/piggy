import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'

interface ImportResult {
  imported_count: number
  total_rows: number
  errors: string[]
}

interface PreviewResult {
  valid_count: number
  total_rows: number
  errors: string[]
  preview_transactions: Array<{
    transaction_date: string
    description: string
    amount: number
    type: string
    account_name: string
    category_name: string
  }>
}

interface TransactionImportProps {
  onImportComplete: () => void
}

export default function TransactionImport({ onImportComplete }: TransactionImportProps) {
  const [showModal, setShowModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [previewResult, setPreviewResult] = useState<PreviewResult | null>(null)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const downloadTemplate = async () => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${apiBaseUrl}/api/v1/transactions/import/template`)
      
      if (!response.ok) {
        throw new Error('Failed to download template')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = 'transaction_import_template.csv'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading template:', error)
      alert('Failed to download template. Please try again.')
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const validExtensions = ['csv', 'xls', 'xlsx']
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    
    if (!fileExtension || !validExtensions.includes(fileExtension)) {
      alert('Please select a CSV, XLS, or XLSX file.')
      return
    }

    setSelectedFile(file)
    setUploading(true)
    setPreviewResult(null)

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${apiBaseUrl}/api/v1/transactions/import/preview`, {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.detail || 'Preview failed')
      }

      setPreviewResult(result)
    } catch (error) {
      console.error('Error previewing file:', error)
      alert(`Preview failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setSelectedFile(null)
    } finally {
      setUploading(false)
    }
  }

  const confirmImport = async () => {
    if (!selectedFile) return

    setImporting(true)
    
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch(`${apiBaseUrl}/api/v1/transactions/import`, {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.detail || 'Import failed')
      }

      setImportResult(result)
      setPreviewResult(null)
      
      if (result.imported_count > 0) {
        onImportComplete()
      }
    } catch (error) {
      console.error('Error importing file:', error)
      alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setImporting(false)
    }
  }

  const cancelImport = () => {
    setPreviewResult(null)
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const resetModal = () => {
    setImportResult(null)
    setPreviewResult(null)
    setSelectedFile(null)
    setShowModal(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
      >
        Import
      </button>

      {showModal && createPortal(
        <div 
          className="fixed inset-0 flex items-center justify-center z-[9999]"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(2px)'
          }}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Import Transactions</h3>
              <button
                onClick={resetModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {!importResult && !previewResult ? (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Required Format</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    Your file must include these columns: transaction_date, description, amount, account_name, category_name
                  </p>
                  <button
                    onClick={downloadTemplate}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Download Template
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Select File (CSV, XLS, XLSX)
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xls,.xlsx"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                  />
                </div>

                {uploading && (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-sm text-gray-600">Processing file...</span>
                  </div>
                )}
              </div>
            ) : previewResult ? (
              <div className="space-y-4">
                <div className={`border rounded-lg p-4 ${
                  previewResult.valid_count > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <h4 className={`text-sm font-medium mb-2 ${
                    previewResult.valid_count > 0 ? 'text-green-800' : 'text-red-800'
                  }`}>
                    File Analysis Complete
                  </h4>
                  <div className="text-sm space-y-1">
                    <p className={previewResult.valid_count > 0 ? 'text-green-700' : 'text-red-700'}>
                      Found {previewResult.valid_count} valid transactions out of {previewResult.total_rows} total rows
                    </p>
                    {previewResult.errors.length > 0 && (
                      <div className="mt-3">
                        <p className="text-red-700 font-medium">Issues found:</p>
                        <div className="max-h-24 overflow-y-auto">
                          {previewResult.errors.slice(0, 5).map((error, index) => (
                            <p key={index} className="text-red-600 text-xs mt-1">{error}</p>
                          ))}
                          {previewResult.errors.length > 5 && (
                            <p className="text-red-600 text-xs mt-1">... and {previewResult.errors.length - 5} more issues</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {previewResult.valid_count > 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-800 mb-3">Sample Transactions</h4>
                    <div className="max-h-32 overflow-y-auto">
                      <div className="space-y-1">
                        {previewResult.preview_transactions.slice(0, 5).map((transaction, index) => (
                          <div key={index} className="bg-white rounded px-3 py-2 border text-xs">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{transaction.transaction_date}</span>
                              <span className="font-semibold">${transaction.amount.toFixed(2)}</span>
                            </div>
                            <div className="text-gray-600 mt-1">
                              {transaction.description} • {transaction.account_name} • {transaction.category_name}
                            </div>
                          </div>
                        ))}
                        {previewResult.preview_transactions.length > 5 && (
                          <p className="text-xs text-gray-500 text-center pt-1">... and {previewResult.preview_transactions.length - 5} more transactions</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <button
                    onClick={cancelImport}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  {previewResult.valid_count > 0 && (
                    <button
                      onClick={confirmImport}
                      disabled={importing}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {importing ? 'Importing...' : `Import ${previewResult.valid_count} Transactions`}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`border rounded-lg p-4 ${
                  importResult.imported_count > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <h4 className={`text-sm font-medium mb-2 ${
                    importResult.imported_count > 0 ? 'text-green-800' : 'text-red-800'
                  }`}>
                    Import Results
                  </h4>
                  <div className="text-sm space-y-1">
                    <p className={importResult.imported_count > 0 ? 'text-green-700' : 'text-red-700'}>
                      Successfully imported: {importResult.imported_count} out of {importResult.total_rows} transactions
                    </p>
                    {importResult.errors.length > 0 && (
                      <div className="mt-3">
                        <p className="text-red-700 font-medium">Errors:</p>
                        <div className="max-h-32 overflow-y-auto">
                          {importResult.errors.map((error, index) => (
                            <p key={index} className="text-red-600 text-xs mt-1">{error}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={resetModal}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}