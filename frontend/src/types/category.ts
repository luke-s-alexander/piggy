export interface Category {
  id: string
  name: string
  type: 'INCOME' | 'EXPENSE'
  color?: string
  created_at: string
  updated_at: string
}

export interface CategoryCreate {
  name: string
  type: 'INCOME' | 'EXPENSE'
  color?: string
}

export interface CategoryUpdate {
  name?: string
  type?: 'INCOME' | 'EXPENSE'
  color?: string
}