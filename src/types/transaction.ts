export interface ObjectiveTransaction {
  id: string
  objective_id: string
  bank_id: string
  amount: number
  description: string
  created_at: string
  bank_name: string
  objective_name: string
}

export interface TransactionHistoryProps {
  onUpdate?: () => void
}
