import { supabase } from '../lib/supabase'
import { ObjectiveTransaction } from '../types/transaction'

export const PAGE_SIZE = 10

export const fetchTransactions = async (
  pageNumber: number,
  showWithdrawnOnly: boolean
) => {
  let query = supabase
    .from('objectives_transactions')
    .select(`
      *,
      banks:bank_id(name),
      goals:objective_id(name)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((pageNumber - 1) * PAGE_SIZE, pageNumber * PAGE_SIZE - 1)

  if (showWithdrawnOnly) {
    query = query.lt('amount', 0)
  }

  const { data, error, count } = await query
  if (error) throw error

  const formatted: ObjectiveTransaction[] = data?.map((t) => ({
    id: t.id,
    objective_id: t.objective_id,
    bank_id: t.bank_id,
    amount: Number(t.amount),
    description: t.description || '',
    created_at: t.created_at,
    bank_name: (t.banks as any)?.name || 'Unknown Bank',
    objective_name: (t.goals as any)?.name || 'Unknown Objective'
  })) || []

  return { transactions: formatted, totalCount: count || 0 }
}

export const returnMoney = async (
  transaction: ObjectiveTransaction
): Promise<void> => {
  if (transaction.amount >= 0) {
    throw new Error('Can only return withdrawal transactions')
  }

  const returnAmount = Math.abs(transaction.amount)

  const { error: deleteError } = await supabase
    .from('objectives_transactions')
    .delete()
    .eq('id', transaction.id)
  if (deleteError) throw deleteError

  const { data: bankData, error: bankFetchError } = await supabase
    .from('banks')
    .select('balance')
    .eq('id', transaction.bank_id)
    .single()
  if (bankFetchError) throw bankFetchError

  const newBankBalance = Number(bankData.balance) + returnAmount
  const { error: bankUpdateError } = await supabase
    .from('banks')
    .update({ balance: newBankBalance })
    .eq('id', transaction.bank_id)
  if (bankUpdateError) throw bankUpdateError

  const { data: allocationData, error: allocationFetchError } = await supabase
    .from('allocations')
    .select('amount')
    .eq('goal_id', transaction.objective_id)
    .eq('bank_id', transaction.bank_id)
    .single()
  if (allocationFetchError) throw allocationFetchError

  const newAllocationAmount = Number(allocationData.amount) + returnAmount
  const { error: allocationUpdateError } = await supabase
    .from('allocations')
    .update({ amount: newAllocationAmount })
    .eq('goal_id', transaction.objective_id)
    .eq('bank_id', transaction.bank_id)
  if (allocationUpdateError) throw allocationUpdateError
}
