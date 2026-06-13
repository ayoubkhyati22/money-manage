import { supabase, Goal } from '../lib/supabase'
import type { Allocation, GoalTransaction } from '../types/goal'

export const goalService = {
  async loadGoals(userId: string): Promise<Goal[]> {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async loadObjectiveAmounts(goalIds: string[]): Promise<{ [goalId: string]: number }> {
    const { data, error } = await supabase
      .from('objectives_transactions')
      .select('objective_id, amount')
      .in('objective_id', goalIds)

    if (error) throw error

    const amounts: { [goalId: string]: number } = {}
    data?.forEach(transaction => {
      if (!amounts[transaction.objective_id]) {
        amounts[transaction.objective_id] = 0
      }
      amounts[transaction.objective_id] += Number(transaction.amount)
    })

    return amounts
  },

  async loadAllocations(goalId: string): Promise<Allocation[]> {
    const { data, error } = await supabase
      .from('allocations')
      .select(`
        *,
        banks:bank_id(name)
      `)
      .eq('goal_id', goalId)

    if (error) throw error

    return data?.map(alloc => ({
      id: alloc.id,
      goal_id: alloc.goal_id,
      bank_id: alloc.bank_id,
      amount: Number(alloc.amount),
      bank_name: (alloc.banks as any)?.name || 'Unknown Bank'
    })) || []
  },

  async loadGoalTransactions(goalId: string): Promise<GoalTransaction[]> {
    const { data, error } = await supabase
      .from('objectives_transactions')
      .select('*, banks:bank_id(name)')
      .eq('objective_id', goalId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data?.map(t => ({
      id: t.id,
      goal_id: t.objective_id,
      bank_id: t.bank_id,
      bank_name: (t.banks as any)?.name || 'Unknown Bank',
      amount: Number(t.amount),
      description: t.description || '',
      created_at: t.created_at,
    })) || []
  },

  async createGoal(userId: string, goalData: Partial<Goal>): Promise<void> {
    const { error } = await supabase
      .from('goals')
      .insert([{
        ...goalData,
        user_id: userId
      }])

    if (error) throw error
  },

  async updateGoal(goalId: string, goalData: Partial<Goal>): Promise<void> {
    const { error } = await supabase
      .from('goals')
      .update(goalData)
      .eq('id', goalId)

    if (error) throw error
  },

  async deleteGoal(goalId: string): Promise<void> {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId)

    if (error) throw error
  }
}
