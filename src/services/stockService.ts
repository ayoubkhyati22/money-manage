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

  // Create a stock transaction with automatic balance updates
  async createTransaction(
    userId: string,
    formData: StockFormData
  ): Promise<void> {
    const quantity = parseFloat(formData.quantity)
    const pricePerShare = parseFloat(formData.price_per_share)
    const fees = parseFloat(formData.fees) || 0
    const totalAmount = (quantity * pricePerShare) + fees

    // Start a Supabase transaction to ensure data consistency
    try {
      // 1. Get current bank balance
      const { data: bank, error: bankError } = await supabase
        .from('banks')
        .select('balance')
        .eq('id', formData.bank_id)
        .single()

      if (bankError) throw bankError
      if (!bank) throw new Error('Bank not found')

      // 2. Validate balance for BUY transactions
      if (formData.transaction_type === 'BUY' && bank.balance < totalAmount) {
        throw new Error(`Insufficient funds. You need ${totalAmount.toFixed(2)} MAD but only have ${bank.balance.toFixed(2)} MAD`)
      }

      // 3. Insert the stock transaction
      const { error: insertError } = await supabase
        .from('stock_transactions')
        .insert([{
          user_id: userId,
          bank_id: formData.bank_id,
          company_name: formData.company_name,
          symbol: formData.symbol.toUpperCase(),
          transaction_type: formData.transaction_type,
          quantity: quantity,
          price_per_share: pricePerShare,
          fees: fees,
          notes: formData.notes,
          transaction_date: formData.transaction_date
        }])

      if (insertError) throw insertError

      // 4. Update bank balance
      const newBalance = formData.transaction_type === 'BUY' 
        ? bank.balance - totalAmount 
        : bank.balance + totalAmount

      const { error: updateBankError } = await supabase
        .from('banks')
        .update({ balance: newBalance })
        .eq('id', formData.bank_id)

      if (updateBankError) throw updateBankError

      // 5. Update investment goal if it exists
      await this.updateInvestmentGoal(userId, formData.bank_id, formData.transaction_type, totalAmount)

    } catch (error) {
      console.error('Error in stock transaction:', error)
      throw error
    }
  },

  // Update investment goal balance
  async updateInvestmentGoal(
    userId: string,
    bankId: string,
    transactionType: 'BUY' | 'SELL',
    amount: number
  ): Promise<void> {
    try {
      // Find investment goals (search for variations)
      const { data: goals, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .or('name.ilike.%invest%,name.ilike.%investment%,category.eq.Investment')

      if (goalsError || !goals || goals.length === 0) {
        console.log('No investment goals found')
        return // Don't fail the transaction if no investment goal
      }

      // Update the first matching investment goal
      const investGoal = goals[0]
      
      // Calculate new target amount
      const newTarget = transactionType === 'BUY'
        ? Math.max(0, investGoal.target_amount - amount)  // Decrease when buying
        : investGoal.target_amount + amount  // Increase when selling

      // Update the goal's target amount
      const { error: updateError } = await supabase
        .from('goals')
        .update({ target_amount: newTarget })
        .eq('id', investGoal.id)

      if (updateError) {
        console.error('Error updating investment goal:', updateError)
        // Don't throw - let the transaction complete even if goal update fails
      }
    } catch (error) {
      console.error('Error in updateInvestmentGoal:', error)
      // Don't throw - this is a non-critical update
    }
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

  // Delete a stock transaction with balance restoration
  async deleteTransaction(transactionId: string): Promise<void> {
    // First get the transaction details
    const { data: transaction, error: fetchError } = await supabase
      .from('stock_transactions')
      .select('*')
      .eq('id', transactionId)
      .single()

    if (fetchError) throw fetchError
    if (!transaction) throw new Error('Transaction not found')

    // Calculate the amount to restore
    const amount = (transaction.quantity * transaction.price_per_share) + (transaction.fees || 0)

    // Get current bank balance
    const { data: bank, error: bankError } = await supabase
      .from('banks')
      .select('balance')
      .eq('id', transaction.bank_id)
      .single()

    if (bankError) throw bankError
    if (!bank) throw new Error('Bank not found')

    // Delete the transaction
    const { error: deleteError } = await supabase
      .from('stock_transactions')
      .delete()
      .eq('id', transactionId)

    if (deleteError) throw deleteError

    // Restore the balance (opposite of the original transaction)
    let newBalance: number
    if (transaction.transaction_type === 'BUY') {
      // Original was BUY, so restore the money (add it back)
      newBalance = bank.balance + amount
    } else {
      // Original was SELL, so remove the money (subtract it)
      newBalance = bank.balance - amount
    }

    // Update bank balance
    const { error: updateError } = await supabase
      .from('banks')
      .update({ balance: newBalance })
      .eq('id', transaction.bank_id)

    if (updateError) throw updateError

    // Update investment goal if exists
    const restoreType = transaction.transaction_type === 'BUY' ? 'SELL' : 'BUY'
    await this.updateInvestmentGoal(
      transaction.user_id,
      transaction.bank_id,
      restoreType as 'BUY' | 'SELL',
      amount
    )
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
  },

  // Check if bank has sufficient funds for purchase
  async checkSufficientFunds(
    bankId: string,
    requiredAmount: number
  ): Promise<boolean> {
    const { data: bank, error } = await supabase
      .from('banks')
      .select('balance')
      .eq('id', bankId)
      .single()

    if (error || !bank) return false
    return bank.balance >= requiredAmount
  }
}
