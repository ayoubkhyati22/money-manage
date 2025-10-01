export interface Bank {
  id: string
  user_id: string
  name: string
  logo: string | null
  balance: number
  created_at: string
}

export interface BankFormData {
  name: string
  logo: string
  balance: number
}

export interface BankManagerProps {
  banks: Bank[]
  onUpdate: (banks: Bank[]) => void
}
