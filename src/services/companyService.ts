// src/services/companyService.ts
import { supabase } from '../lib/supabase'
import { MoroccanCompany } from '../types/stock'

export const companyService = {
  /**
   * Récupérer toutes les entreprises
   */
  async fetchAllCompanies(): Promise<MoroccanCompany[]> {
    const { data, error } = await supabase
      .from('moroccan_companies')
      .select('*')
      .order('name')

    if (error) throw error
    return data || []
  },

  /**
   * Rechercher des entreprises par nom ou symbole
   */
  async searchCompanies(searchTerm: string): Promise<MoroccanCompany[]> {
    if (!searchTerm || searchTerm.length < 2) {
      return this.fetchAllCompanies()
    }

    const { data, error } = await supabase
      .rpc('search_moroccan_companies', { search_term: searchTerm })

    if (error) {
      console.error('Error searching companies:', error)
      // Fallback sur recherche simple
      return this.simpleSearch(searchTerm)
    }

    return data || []
  },

  /**
   * Recherche simple (fallback)
   */
  async simpleSearch(searchTerm: string): Promise<MoroccanCompany[]> {
    const { data, error } = await supabase
      .from('moroccan_companies')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,symbol.ilike.%${searchTerm}%`)
      .order('name')
      .limit(20)

    if (error) throw error
    return data || []
  },

  /**
   * Récupérer une entreprise par ID
   */
  async getCompanyById(id: string): Promise<MoroccanCompany | null> {
    const { data, error } = await supabase
      .from('moroccan_companies')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching company:', error)
      return null
    }

    return data
  },

  /**
   * Récupérer une entreprise par casablanca_api_id
   */
  async getCompanyByApiId(apiId: number): Promise<MoroccanCompany | null> {
    const { data, error } = await supabase
      .from('moroccan_companies')
      .select('*')
      .eq('casablanca_api_id', apiId)
      .single()

    if (error) {
      console.error('Error fetching company by API ID:', error)
      return null
    }

    return data
  }
}