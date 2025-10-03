import { supabase, Bank } from '../lib/supabase'
import type { Allocation } from '../types/goal'

export const allocationService = {
  async addMoney(
    objectiveId: string,
    bankId: string,
    amount: number,
    description: string,
    banks: Bank[]
  ): Promise<void> {
    const { error: transactionError } = await supabase
      .from('objectives_transactions')
      .insert([{
        objective_id: objectiveId,
        bank_id: bankId,
        amount: amount,
        description: description
      }])

    if (transactionError) throw transactionError

    const selectedBank = banks.find(b => b.id === bankId)
    if (selectedBank) {
      const newBalance = Number(selectedBank.balance) + amount
      const { error: bankError } = await supabase
        .from('banks')
        .update({ balance: newBalance })
        .eq('id', bankId)

      if (bankError) throw bankError
    }

    const { data: existingAllocation, error: allocError } = await supabase
      .from('allocations')
      .select('amount')
      .eq('goal_id', objectiveId)
      .eq('bank_id', bankId)
      .maybeSingle()

    if (allocError) throw allocError

    if (existingAllocation) {
      const newAmount = Number(existingAllocation.amount) + amount
      await supabase
        .from('allocations')
        .update({ amount: newAmount })
        .eq('goal_id', objectiveId)
        .eq('bank_id', bankId)
    } else {
      await supabase
        .from('allocations')
        .insert([{
          goal_id: objectiveId,
          bank_id: bankId,
          amount: amount
        }])
    }
  },

  async updateBankBalance(
    bankId: string,
    newBalance: number,
    currentBalance: number,
    objectiveId: string,
    allocationId: string,
    description: string,
    allocations: Allocation[]
  ): Promise<void> {
    await supabase
      .from('banks')
      .update({ balance: newBalance })
      .eq('id', bankId)

    const difference = newBalance - currentBalance

    if (difference !== 0) {
      const desc = description ||
        `Bank balance ${difference > 0 ? 'increased' : 'decreased'} by ${Math.abs(difference).toFixed(2)} MAD`

      await supabase
        .from('objectives_transactions')
        .insert([{
          objective_id: objectiveId,
          bank_id: bankId,
          amount: difference,
          description: desc
        }])

      const allocation = allocations.find(a => a.id === allocationId)
      if (allocation) {
        const newAllocationAmount = allocation.amount + difference
        await supabase
          .from('allocations')
          .update({ amount: Math.max(0, newAllocationAmount) })
          .eq('id', allocationId)
      }
    }
  },

  async updateAllocation(
    allocationId: string,
    bankId: string,
    newAmount: number,
    oldAmount: number,
    objectiveId: string,
    banks: Bank[]
  ): Promise<void> {
    await supabase
      .from('allocations')
      .update({ amount: newAmount })
      .eq('id', allocationId)

    const difference = newAmount - oldAmount

    if (difference !== 0) {
      const selectedBank = banks.find(b => b.id === bankId)

      await supabase
        .from('objectives_transactions')
        .insert([{
          objective_id: objectiveId,
          bank_id: bankId,
          amount: difference,
          description: difference > 0
            ? `Allocation increase: +${difference.toFixed(2)} MAD`
            : `Allocation decrease: ${difference.toFixed(2)} MAD`
        }])

      if (selectedBank) {
        const newBalance = Number(selectedBank.balance) + difference
        await supabase
          .from('banks')
          .update({ balance: newBalance })
          .eq('id', bankId)
      }
    }
  },

  async deleteAllocation(
    allocation: Allocation,
    banks: Bank[]
  ): Promise<void> {
    await supabase
      .from('allocations')
      .delete()
      .eq('id', allocation.id)

    await supabase
      .from('objectives_transactions')
      .insert([{
        objective_id: allocation.goal_id,
        bank_id: allocation.bank_id,
        amount: -allocation.amount,
        description: `Allocation deleted: -${allocation.amount.toFixed(2)} MAD`
      }])

    const selectedBank = banks.find(b => b.id === allocation.bank_id)
    if (selectedBank) {
      const newBalance = Number(selectedBank.balance) - allocation.amount
      await supabase
        .from('banks')
        .update({ balance: newBalance })
        .eq('id', allocation.bank_id)
    }
  },

  async returnMoneyToBanks(goalId: string, banks: Bank[]): Promise<void> {
    const { data: transactions, error: fetchError } = await supabase
      .from('objectives_transactions')
      .select('bank_id, amount')
      .eq('objective_id', goalId)

    if (fetchError) throw fetchError

    const bankAmounts: { [bankId: string]: number } = {}
    transactions?.forEach(trans => {
      if (!bankAmounts[trans.bank_id]) {
        bankAmounts[trans.bank_id] = 0
      }
      bankAmounts[trans.bank_id] += Number(trans.amount)
    })

    for (const [bankId, amount] of Object.entries(bankAmounts)) {
      const bank = banks.find(b => b.id === bankId)
      if (bank) {
        const newBalance = Number(bank.balance) - amount
        await supabase
          .from('banks')
          .update({ balance: newBalance })
          .eq('id', bankId)
      }
    }
  }
}
