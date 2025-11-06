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

  // 🔥 CORRIGÉ : Fetch portfolio holdings WITH casablanca_api_id
  async fetchPortfolio(userId: string): Promise<StockPortfolio[]> {
    console.log(`📂 [stockService] Fetching portfolio for user ${userId}`)
    
    // Étape 1: Récupérer le portfolio
    const { data: portfolioData, error: portfolioError } = await supabase
      .from('stock_portfolio')
      .select('*')
      .eq('user_id', userId)

    if (portfolioError) {
      console.error('❌ [stockService] Error fetching portfolio:', portfolioError)
      throw portfolioError
    }

    if (!portfolioData || portfolioData.length === 0) {
      console.log(`ℹ️ [stockService] No portfolio holdings found`)
      return []
    }

    // Étape 2: Récupérer les casablanca_api_id pour chaque symbole
    const symbols = [...new Set(portfolioData.map(item => item.symbol))]
    
    const { data: companiesData, error: companiesError } = await supabase
      .from('moroccan_companies')
      .select('symbol, casablanca_api_id')
      .in('symbol', symbols)

    if (companiesError) {
      console.error('❌ [stockService] Error fetching companies:', companiesError)
      // Continuer sans les API IDs plutôt que de fail complètement
      return portfolioData.map(item => ({
        ...item,
        casablanca_api_id: null
      }))
    }

    // Étape 3: Créer un map symbole -> casablanca_api_id
    const symbolToApiId = new Map<string, number>()
    companiesData?.forEach(company => {
      symbolToApiId.set(company.symbol, company.casablanca_api_id)
    })

    // Étape 4: Combiner les données
    const portfolioWithApiIds = portfolioData.map(item => {
      const apiId = symbolToApiId.get(item.symbol)
      console.log(`📊 [stockService] ${item.symbol} → API ID: ${apiId || 'MISSING'}`)
      
      return {
        ...item,
        casablanca_api_id: apiId || null
      }
    })

    console.log(`✅ [stockService] Fetched ${portfolioWithApiIds.length} holdings with API IDs`)
    
    return portfolioWithApiIds
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

  // Create a stock transaction with automatic balance updates and transaction tracking
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
          transaction_date: formData.transaction_date,
          casablanca_api_id: formData.casablanca_api_id // 🔥 IMPORTANT: Inclure l'API ID
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

      // 6. Create withdrawal/deposit transaction in objectives_transactions
      await this.createObjectiveTransaction(userId, formData, totalAmount)

    } catch (error) {
      console.error('Error in stock transaction:', error)
      throw error
    }
  },

  // Create a withdrawal/deposit in objectives_transactions for stock transactions
  async createObjectiveTransaction(
    userId: string,
    formData: StockFormData,
    totalAmount: number
  ): Promise<void> {
    try {
      // Find investment goal
      const { data: goals, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .or('name.ilike.%invest%,name.ilike.%stock%,category.eq.Investment')
        .limit(1)

      if (goalsError || !goals || goals.length === 0) {
        console.log('No investment goal found for stock transaction tracking')
        return
      }

      const investGoal = goals[0]

      // For BUY: create negative amount (withdrawal)
      // For SELL: create positive amount (deposit)
      const transactionAmount = formData.transaction_type === 'BUY' ? -totalAmount : totalAmount
      
      const description = formData.transaction_type === 'BUY' 
        ? `Stock Purchase: ${formData.quantity} ${formData.symbol} @ ${formData.price_per_share} MAD`
        : `Stock Sale: ${formData.quantity} ${formData.symbol} @ ${formData.price_per_share} MAD`

      // Insert the transaction with stock_transaction flag
      const { error: insertError } = await supabase
        .from('objectives_transactions')
        .insert([{
          objective_id: investGoal.id,
          bank_id: formData.bank_id,
          amount: transactionAmount,
          description: description,
          is_stock_transaction: true  // Flag to identify stock transactions
        }])

      if (insertError) {
        console.error('Error creating objective transaction for stock:', insertError)
      }

      // Update allocation if exists
      const { data: allocation, error: allocError } = await supabase
        .from('allocations')
        .select('amount')
        .eq('goal_id', investGoal.id)
        .eq('bank_id', formData.bank_id)
        .maybeSingle()

      if (!allocError && allocation) {
        const newAllocationAmount = Number(allocation.amount) + transactionAmount
        await supabase
          .from('allocations')
          .update({ amount: Math.max(0, newAllocationAmount) })
          .eq('goal_id', investGoal.id)
          .eq('bank_id', formData.bank_id)
      }
    } catch (error) {
      console.error('Error creating objective transaction:', error)
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
        return
      }

      // Update the first matching investment goal
      const investGoal = goals[0]
      
      // Calculate new target amount
      const newTarget = transactionType === 'BUY'
        ? Math.max(0, investGoal.target_amount - amount)
        : investGoal.target_amount + amount

      // Update the goal's target amount
      const { error: updateError } = await supabase
        .from('goals')
        .update({ target_amount: newTarget })
        .eq('id', investGoal.id)

      if (updateError) {
        console.error('Error updating investment goal:', updateError)
      }
    } catch (error) {
      console.error('Error in updateInvestmentGoal:', error)
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
    if (formData.casablanca_api_id !== undefined) updateData.casablanca_api_id = formData.casablanca_api_id

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
      newBalance = bank.balance + amount
    } else {
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

    // Also delete the corresponding objective transaction if exists
    await this.deleteStockObjectiveTransaction(transaction)
  },

  // Delete the corresponding objective transaction for a stock transaction
  async deleteStockObjectiveTransaction(
    stockTransaction: any
  ): Promise<void> {
    try {
      const amount = (stockTransaction.quantity * stockTransaction.price_per_share) + (stockTransaction.fees || 0)
      const transactionAmount = stockTransaction.transaction_type === 'BUY' ? -amount : amount
      
      // Find and delete the matching objective transaction
      const { error } = await supabase
        .from('objectives_transactions')
        .delete()
        .eq('bank_id', stockTransaction.bank_id)
        .eq('amount', transactionAmount)
        .eq('is_stock_transaction', true)
        .gte('created_at', new Date(stockTransaction.created_at).toISOString())
        .lte('created_at', new Date(new Date(stockTransaction.created_at).getTime() + 60000).toISOString())

      if (error) {
        console.error('Error deleting objective transaction:', error)
      }
    } catch (error) {
      console.error('Error in deleteStockObjectiveTransaction:', error)
    }
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