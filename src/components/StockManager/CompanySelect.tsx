// src/components/StockManager/CompanySelect.tsx
import { useState, useEffect, useRef } from 'react'
import { Search, ChevronDown, Building2 } from 'lucide-react'
import { MoroccanCompany } from '../../types/stock'
import { companyService } from '../../services/companyService'

interface CompanySelectProps {
  value: string // casablanca_api_id
  onChange: (company: MoroccanCompany) => void
  disabled?: boolean
}

export function CompanySelect({ value, onChange, disabled }: CompanySelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [companies, setCompanies] = useState<MoroccanCompany[]>([])
  const [filteredCompanies, setFilteredCompanies] = useState<MoroccanCompany[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<MoroccanCompany | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Charger toutes les entreprises au montage
  useEffect(() => {
    loadCompanies()
  }, [])

  // Charger l'entreprise sélectionnée si value existe
  useEffect(() => {
    if (value) {
      loadSelectedCompany(parseInt(value))
    }
  }, [value])

  // Filtrer les entreprises lors de la recherche
  useEffect(() => {
    if (searchTerm.length < 2) {
      setFilteredCompanies(companies)
    } else {
      const filtered = companies.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredCompanies(filtered)
    }
  }, [searchTerm, companies])

  // Fermer le dropdown si on clique dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadCompanies = async () => {
    setLoading(true)
    try {
      const data = await companyService.fetchAllCompanies()
      setCompanies(data)
      setFilteredCompanies(data)
    } catch (error) {
      console.error('Error loading companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSelectedCompany = async (apiId: number) => {
    try {
      const company = await companyService.getCompanyByApiId(apiId)
      if (company) {
        setSelectedCompany(company)
      }
    } catch (error) {
      console.error('Error loading selected company:', error)
    }
  }

  const handleSelect = (company: MoroccanCompany) => {
    setSelectedCompany(company)
    onChange(company)
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Button trigger */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center space-x-2">
          <Building2 className="w-4 h-4 text-gray-400" />
          <span className="text-sm">
            {selectedCompany 
              ? `${selectedCompany.name} (${selectedCompany.symbol})`
              : 'Sélectionner une entreprise...'
            }
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-gray-200 dark:border-dark-600">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher une entreprise..."
                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100"
                autoFocus
              />
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto max-h-64">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredCompanies.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-dark-400 text-sm">
                Aucune entreprise trouvée
              </div>
            ) : (
              filteredCompanies.map((company) => (
                <button
                  key={company.id}
                  type="button"
                  onClick={() => handleSelect(company)}
                  className="w-full text-left px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-dark-100">
                        {company.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-dark-400">
                        {company.symbol}
                      </p>
                    </div>
                    {company.last_price && (
                      <div className="text-right">
                        <p className="text-xs font-semibold text-gray-900 dark:text-dark-100">
                          {company.last_price.toFixed(2)} MAD
                        </p>
                        <p className="text-xs text-gray-400">
                          Prix cache
                        </p>
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}