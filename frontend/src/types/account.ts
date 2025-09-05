export interface AccountType {
  id: string
  name: string
  category: 'ASSET' | 'LIABILITY'
  sub_category: 'cash' | 'investment' | 'debt' | 'real_estate'
  created_at: string
  updated_at: string
}

export interface Account {
  id: string
  name: string
  account_type_id: string
  balance: string
  institution?: string
  account_number?: string
  currency: string
  is_active: boolean
  created_at: string
  updated_at: string
  account_type?: AccountType
}

export interface AccountCreate {
  name: string
  account_type_id: string
  balance?: string
  institution?: string
  account_number?: string
  currency?: string
  is_active?: boolean
}

export interface AccountUpdate {
  name?: string
  account_type_id?: string
  balance?: string
  institution?: string
  account_number?: string
  currency?: string
  is_active?: boolean
}