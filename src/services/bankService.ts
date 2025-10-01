import { supabase } from '../lib/supabase'
import { Bank, BankFormData } from '../types/bank'

export const fetchBanks = async (): Promise<Bank[]> => {
  const { data, error } = await supabase
    .from('banks')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export const createBank = async (userId: string, formData: BankFormData): Promise<void> => {
  const { error } = await supabase
    .from('banks')
    .insert([{
      user_id: userId,
      name: formData.name,
      logo: formData.logo || null,
      balance: formData.balance
    }])

  if (error) throw error
}

export const updateBank = async (bankId: string, formData: BankFormData): Promise<void> => {
  const { error } = await supabase
    .from('banks')
    .update({
      name: formData.name,
      logo: formData.logo || null,
      balance: formData.balance
    })
    .eq('id', bankId)

  if (error) throw error
}

export const deleteBank = async (bankId: string): Promise<void> => {
  const { error } = await supabase
    .from('banks')
    .delete()
    .eq('id', bankId)

  if (error) throw error
}
