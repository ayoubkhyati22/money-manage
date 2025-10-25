import { supabase } from '../lib/supabase'
import {
  StockTransaction,
  StockTransactionWithDetails,
  StockPortfolio,
  StockProfitLoss,
  MoroccanCompany,
  StockFormData
} from '../types/stock'

export const stockService = {
  // Fetch all companies
  async fetchCompanies(): Promise<MoroccanCompany[]> {
    const { data, error } = await supabase
      .from('moroccan_companies')
      .select('*')
      .order('name')

    if (error) throw error
    return data || []
  },

  // Fetch user's stock transactions
  async fetchTransactions(userId: string): Promise<StockTransactionWithDetails[]> {
    const { data, error } = await supabase
      .from('stock_transactions')
      .select(`
        *,
        banks:bank_id(name)
      `)
      .eq('user_id', userId)
      .order('transaction_date', { ascending: false })

    if (error) throw error

    return data?.map((t) => ({
      ...t,
      bank_name: (t.banks as any)?.name || 'Unknown Bank'
    })) || []
  },

  // Fetch portfolio holdings
  async fetchPortfolio(userId: string): Promise<StockPortfolio[]> {
    const { data, error } = await supabase
      .from('stock_portfolio')
      .select('*')
      .eq('user_id', userId)

    if (error) throw error
    return data || []
  },

  // Fetch profit/loss summary
  async fetchProfitLoss(userId: string): Promise<StockProfitLoss[]> {
    const { data, error } = await supabase
      .from('stock_profit_loss')
      .select('*')
      .eq('user_id', userId)

    if (error) throw error
    return data || []
  },

  // Create a stock transaction
  async createTransaction(
    userId: string,
    formData: StockFormData
  ): Promise<void> {
    const { error } = await supabase
      .from('stock_transactions')
      .insert([{
        user_id: userId,
        bank_id: formData.bank_id,
        company_name: formData.company_name,
        symbol: formData.symbol.toUpperCase(),
        transaction_type: formData.transaction_type,
        quantity: parseFloat(formData.quantity),
        price_per_share: parseFloat(formData.price_per_share),
        fees: parseFloat(formData.fees) || 0,
        notes: formData.notes,
        transaction_date: formData.transaction_date
      }])

    if (error) throw error
  },

  // Update a stock transaction
  async updateTransaction(
    transactionId: string,
    formData: Partial<StockFormData>
  ): Promise<void> {
    const updateData: any = {}
    
    if (formData.bank_id) updateData.bank_id = formData.bank_id
    if (formData.company_name) updateData.company_name = formData.company_name
    if (formData.symbol) updateData.symbol = formData.symbol.toUpperCase()
    if (formData.transaction_type) updateData.transaction_type = formData.transaction_type
    if (formData.quantity) updateData.quantity = parseFloat(formData.quantity)
    if (formData.price_per_share) updateData.price_per_share = parseFloat(formData.price_per_share)
    if (formData.fees !== undefined) updateData.fees = parseFloat(formData.fees) || 0
    if (formData.notes !== undefined) updateData.notes = formData.notes
    if (formData.transaction_date) updateData.transaction_date = formData.transaction_date

    const { error } = await supabase
      .from('stock_transactions')
      .update(updateData)
      .eq('id', transactionId)

    if (error) throw error
  },

  // Delete a stock transaction
  async deleteTransaction(transactionId: string): Promise<void> {
    const { error } = await supabase
      .from('stock_transactions')
      .delete()
      .eq('id', transactionId)

    if (error) throw error
  },

  // Calculate total gains/losses
  async calculateTotalGains(userId: string): Promise<{
    totalInvested: number
    totalRevenue: number
    totalGains: number
    totalGainsPercent: number
  }> {
    const profitLoss = await this.fetchProfitLoss(userId)
    
    const totalInvested = profitLoss.reduce((sum, pl) => sum + pl.total_invested, 0)
    const totalRevenue = profitLoss.reduce((sum, pl) => sum + pl.total_revenue, 0)
    const totalGains = profitLoss.reduce((sum, pl) => sum + pl.net_profit_loss, 0)
    const totalGainsPercent = totalInvested > 0 ? (totalGains / totalInvested) * 100 : 0

    return {
      totalInvested,
      totalRevenue,
      totalGains,
      totalGainsPercent
    }
  }
}
