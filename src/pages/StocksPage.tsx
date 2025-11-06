// src/pages/StocksPage.tsx
import { useState, useEffect } from 'react'
import { Bank } from '../lib/supabase'
import { bankService } from '../services/bankService'
import { useAuth } from '../hooks/useAuth'
import { StockManager } from '../components/StockManager/StockManager_index'

export function StocksPage() {
  const { user } = useAuth()
  const [banks, setBanks] = useState<Bank[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadBanks()
    }
  }, [user])

  const loadBanks = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const data = await bankService.loadBanks(user.id)
      setBanks(data)
    } catch (error) {
      console.error('Error loading banks:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <StockManager banks={banks} />
      </div>
    </div>
  )
}