export interface Allocation {
  id: string
  goal_id: string
  bank_id: string
  amount: number
  bank_name: string
}

export const categories = [
  'Personal',
  'Family',
  'Investment',
  'Emergency',
  'Travel',
  'Education',
  'Health',
  'Other'
]
