import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Bank {
  id: string
  user_id: string
  name: string
  logo?: string
  balance: number
  created_at: string
  updated_at: string
}

export interface Goal {
  id: string
  user_id: string
  name: string
  category?: string
  target_amount?: number
  target_date?: string
  notes: string
  created_at: string
  updated_at: string
}

export interface ObjectiveTransaction {
  id: string
  objective_id: string
  bank_id: string
  amount: number
  description: string
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  bank_id: string
  total_amount: number
  description: string
  created_at: string
}

export interface TransactionGoal {
  id: string
  transaction_id: string
  goal_id: string
  amount: number
  created_at: string
}

// Extended types for joins
export interface ObjectiveWithAmount extends Goal {
  total_amount: number
  transactions: Array<{
    bank_name: string
    amount: number
    description: string
    created_at: string
  }>
}

export interface TransactionWithDetails extends Transaction {
  bank_name: string
  transaction_goals: Array<{
    goal_name: string
    amount: number
  }>
}
