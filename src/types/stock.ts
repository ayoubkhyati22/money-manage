export interface MoroccanCompany {
  id: string
  name: string
  symbol: string
  sector?: string
  description?: string
  created_at: string
  updated_at: string
}

export interface StockTransaction {
  id: string
  user_id: string
  bank_id: string
  company_name: string
  symbol: string
  transaction_type: 'BUY' | 'SELL'
  quantity: number
  price_per_share: number
  total_amount: number
  fees?: number
  notes?: string
  transaction_date: string
  created_at: string
  updated_at: string
}

export interface StockTransactionWithDetails extends StockTransaction {
  bank_name: string
}

export interface StockPortfolio {
  user_id: string
  bank_id: string
  company_name: string
  symbol: string
  total_quantity: number
  total_invested: number
  total_sold: number
  avg_buy_price: number
  last_sell_price?: number
}

export interface StockProfitLoss {
  user_id: string
  company_name: string
  symbol: string
  total_invested: number
  total_revenue: number
  net_profit_loss: number
  buy_count: number
  sell_count: number
}

export interface StockFormData {
  bank_id: string
  company_name: string
  symbol: string
  transaction_type: 'BUY' | 'SELL'
  quantity: string
  price_per_share: string
  fees: string
  notes: string
  transaction_date: string
}
