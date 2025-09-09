export interface Category {
  id: string
  name: string
  type: 'INCOME' | 'EXPENSE'
  color?: string
  created_at?: string
  updated_at?: string
}

export interface BudgetLineItem {
  id: string
  budget_id: string
  category_id: string
  yearly_amount: number
  monthly_amount: number
  created_at: string
  updated_at: string
  category?: Category
}

export interface Budget {
  id: string
  year: number
  name: string
  total_amount: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface BudgetWithLineItems extends Budget {
  line_items: BudgetLineItem[]
}

export interface BudgetLineItemCreate {
  category_id: string
  yearly_amount: number
}

export interface BudgetCreate {
  year: number
  name: string
  line_items: BudgetLineItemCreate[]
}

export interface BudgetUpdate {
  year?: number
  name?: string
  is_active?: boolean
}

export interface BudgetLineItemUpdate {
  category_id?: string
  yearly_amount?: number
}

export interface BudgetSummary {
  budget: Budget
  total_spent: number
  remaining: number
  progress_percentage: number
  categories_summary: Array<{
    category_id: string
    category_name: string
    budgeted: number
    spent: number
    remaining: number
    progress_percentage: number
  }>
}

export interface MonthlyBudgetProgress {
  month: number
  year: number
  budgeted_amount: number
  spent_amount: number
  remaining_amount: number
  progress_percentage: number
  categories: Array<{
    category_id: string
    category_name: string
    monthly_budget: number
    spent: number
    remaining: number
    progress_percentage: number
  }>
}