import { useState, useEffect } from 'react'
import type { Account } from '../types/account'

interface AccountSummaryProps {
  refreshTrigger?: number
}

interface SummaryData {
  totalAssets: number
  totalLiabilities: number
  netWorth: number
  accountCount: number
  assetCount: number
  liabilityCount: number
}

export default function AccountSummary({ refreshTrigger }: AccountSummaryProps) {
  const [summary, setSummary] = useState<SummaryData>({
    totalAssets: 0,
    totalLiabilities: 0,
    netWorth: 0,
    accountCount: 0,
    assetCount: 0,
    liabilityCount: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAccountSummary()
  }, [refreshTrigger])

  const fetchAccountSummary = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${apiBaseUrl}/api/v1/accounts/`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const accounts: Account[] = await response.json()
      
      let totalAssets = 0
      let totalLiabilities = 0
      let assetCount = 0
      let liabilityCount = 0
      
      accounts.forEach(account => {
        if (!account.is_active) return // Skip inactive accounts
        
        const balance = parseFloat(account.balance)
        
        if (account.account_type?.category === 'ASSET') {
          totalAssets += balance
          assetCount++
        } else if (account.account_type?.category === 'LIABILITY') {
          totalLiabilities += Math.abs(balance) // Liabilities are stored as negative, but we want positive for total
          liabilityCount++
        }
      })
      
      setSummary({
        totalAssets,
        totalLiabilities,
        netWorth: totalAssets - totalLiabilities,
        accountCount: accounts.filter(a => a.is_active).length,
        assetCount,
        liabilityCount
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load account summary')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number, currency: string = 'CAD') => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
          ))}
        </div>
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
          <span className="font-medium">Error loading summary</span>
        </div>
        <p className="text-red-700 mt-2">{error}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Net Worth */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium">Net Worth</p>
            <p className="text-2xl font-bold">{formatCurrency(summary.netWorth)}</p>
          </div>
          <div className="text-blue-200">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
        <p className="text-blue-100 text-xs mt-2">
          {summary.accountCount} active accounts
        </p>
      </div>

      {/* Total Assets */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm font-medium">Total Assets</p>
            <p className="text-2xl font-bold">{formatCurrency(summary.totalAssets)}</p>
          </div>
          <div className="text-green-200">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
        </div>
        <p className="text-green-100 text-xs mt-2">
          {summary.assetCount} asset accounts
        </p>
      </div>

      {/* Total Liabilities */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-red-100 text-sm font-medium">Total Liabilities</p>
            <p className="text-2xl font-bold">{formatCurrency(summary.totalLiabilities)}</p>
          </div>
          <div className="text-red-200">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
        </div>
        <p className="text-red-100 text-xs mt-2">
          {summary.liabilityCount} liability accounts
        </p>
      </div>
    </div>
  )
}