export interface Category {
  id: string
  name: string
  type: 'INCOME' | 'EXPENSE'
  color?: string
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  account_id: string
  category_id: string
  amount: string
  description: string
  date: string
  type: 'INCOME' | 'EXPENSE'
  ai_category_id?: string
  ai_confidence?: number
  is_ai_categorized: boolean
  user_corrected: boolean
  created_at: string
  updated_at: string
  account?: {
    id: string
    name: string
    account_type?: {
      id: string
      name: string
      category: 'ASSET' | 'LIABILITY'
      sub_category: string
    }
  }
  category?: Category
}

export interface TransactionCreate {
  account_id: string
  category_id: string
  amount: string
  description: string
  date: string
  type: 'INCOME' | 'EXPENSE'
}

export interface TransactionUpdate {
  account_id?: string
  category_id?: string
  amount?: string
  description?: string
  date?: string
  type?: 'INCOME' | 'EXPENSE'
}