import { supabase } from '../lib/supabase';
import type { DCAPlan, DCAPlanInput } from '../types/dca';

export async function fetchDCAPlans(): Promise<DCAPlan[]> {
  const { data, error } = await supabase
    .from('dca_plans')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createDCAPlan(planInput: DCAPlanInput): Promise<DCAPlan> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('dca_plans')
    .insert([
      {
        user_id: user.id,
        crypto: planInput.crypto,
        amount_per_buy: planInput.amount_per_buy,
        frequency: planInput.frequency,
        start_date: planInput.start_date,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDCAPlan(id: string): Promise<void> {
  const { error } = await supabase
    .from('dca_plans')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function updateDCAPlan(
  id: string,
  updates: Partial<DCAPlanInput>
): Promise<DCAPlan> {
  const { data, error } = await supabase
    .from('dca_plans')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
