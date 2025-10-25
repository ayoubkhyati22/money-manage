import { useState, useEffect } from 'react'
import { Bank, Goal, TransactionWithDetails, supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { BankManager } from './BankManager'
import { GoalManager } from './GoalManager/index'
import { TransactionManager } from './TransactionManager'
import { TransactionHistory } from './TransactionHistory'
import { OverviewCards } from './OverviewCards/index'
import { DCAManager } from './DCAManager'
import { DCAPerformanceChart } from './DCAManager/DCAPerformanceChart'
import {
  Building2,
  Target,
  ArrowDownCircle,
  History,
  TrendingUp,
  LineChart
} from 'lucide-react'
import toast from 'react-hot-toast'
import { StockManager } from './StockManager/StockManager_index'
import { motion } from "framer-motion";


type ActiveTab = 'overview' | 'goals' | 'banks' | 'transactions' | 'history' | 'dca' | 'stocks'

export function Dashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview')
  const [banks, setBanks] = useState<Bank[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: TrendingUp },
    { id: 'goals' as const, label: 'Goals', icon: Target },
    { id: 'banks' as const, label: 'Banks', icon: Building2 },
    { id: 'transactions' as const, label: 'Withdraw', icon: ArrowDownCircle },
    { id: 'history' as const, label: 'History', icon: History },
    { id: 'stocks' as const, label: 'Stocks', icon: History },
    // { id: 'dca' as const, label: 'DCA', icon: LineChart },
  ]


  useEffect(() => {
    if (user) loadAllData()
  }, [user])

  // Listen for DCA navigation event from Layout component
  useEffect(() => {
    const handleNavigateToDCA = () => {
      setActiveTab('dca')
    }

    window.addEventListener('navigateToDCA', handleNavigateToDCA)
    return () => window.removeEventListener('navigateToDCA', handleNavigateToDCA)
  }, [])

  const loadAllData = async () => {
    if (!user) return
    setLoading(true)
    try {
      await Promise.all([loadBanks(), loadGoals(), loadTransactions()])
    } catch (error: any) {
      console.error(error)
      toast.error('Error loading data: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const loadBanks = async () => {
    const { data, error } = await supabase.from('banks').select('*').order('created_at', { ascending: false })
    if (!error) setBanks(data || [])
  }

  const loadGoals = async () => {
    const { data, error } = await supabase.from('goals').select('*').order('created_at', { ascending: false })
    if (!error) setGoals(data || [])
  }

  const loadTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        banks:bank_id(name),
        transaction_goals(amount, goals:goal_id(name))
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    if (!error) {
      const mapped: TransactionWithDetails[] =
        data?.map((t) => ({
          id: t.id,
          user_id: t.user_id,
          bank_id: t.bank_id,
          total_amount: Number(t.total_amount),
          description: t.description || '',
          created_at: t.created_at,
          bank_name: (t.banks as any)?.name || 'Unknown Bank',
          transaction_goals:
            t.transaction_goals?.map((tg: any) => ({
              goal_name: tg.goals?.name || 'Unknown Goal',
              amount: Number(tg.amount),
            })) || [],
        })) || []
      setTransactions(mapped)
    }
  }

  const refreshAllData = () => loadAllData()

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewCards banks={banks} goals={goals} transactions={transactions} />
      case 'goals':
        return (
          <GoalManager
            goals={goals}
            banks={banks}
            onUpdate={(updated) => {
              setGoals(updated)
              loadBanks()
            }}
            onBanksUpdate={setBanks}
          />
        )
      case 'banks':
        return (
          <BankManager
            banks={banks}
            onUpdate={(updated) => {
              setBanks(updated)
              refreshAllData()
            }}
          />
        )
      case 'transactions':
        return (
          <TransactionManager
            banks={banks}
            goals={goals}
            onBanksUpdate={setBanks}
            onGoalsUpdate={setGoals}
            onTransactionAdded={refreshAllData}
          />
        )
      case 'history':
        return <TransactionHistory onUpdate={refreshAllData} />
      case 'dca':
        return (
          <div className="space-y-6">
            <DCAManager />
            <DCAPerformanceChart />
          </div>
        )
        case 'stocks':
        return <StockManager banks={banks} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 via-white to-primary-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900">
      <div className="pt-safe-top pb-16 sm:pb-0"> {/* espace pour bottom nav sur mobile */}
        <div className="space-y-4 p-2 sm:p-4 max-w-7xl mx-auto">
          {/* --- TABS DESKTOP --- */}
          <div className="hidden sm:block">
            <div className="bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm rounded-xl shadow-md border border-mint-200/50 dark:border-dark-600/50 p-1.5">
              <div className="flex space-x-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium text-xs sm:text-sm transition-all flex-1 justify-center duration-300 transform hover:scale-105 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-primary-400 to-primary-500 text-white shadow-md shadow-primary-200 dark:shadow-primary-900/30'
                          : 'text-dark-500 dark:text-dark-200 hover:text-dark-600 dark:hover:text-dark-100 hover:bg-mint-100/70 dark:hover:bg-dark-700/70'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline font-medium">{tab.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* --- CONTENU --- */}
          <div className="animate-fadeIn">{renderContent()}</div>
        </div>
      </div>

      {/* --- BOTTOM NAV MOBILE - ENHANCED DARK VERSION --- */}
      <div className="sm:hidden fixed bottom-6 left-4 right-4 z-50">
        {/* Floating Navigation Bar */}
        <div className="relative">
          {/* 3D Shadow Layer */}
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/20 to-emerald-900/40 rounded-3xl blur-xl translate-y-2" />
          
          {/* Main Navigation Container */}
          <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 rounded-3xl border border-emerald-500/20 shadow-2xl overflow-hidden">
            {/* Top Highlight */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
            
            {/* Ambient Glow Background */}
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/50 via-transparent to-transparent" />
            
            {/* Navigation Buttons */}
            <div className="relative flex justify-around items-center px-3 py-3 gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center justify-center py-3 transition-all duration-500 ease-out group ${
                      active ? 'flex-[2] px-4' : 'flex-1 px-2'
                    }`}
                  >
                    {/* Active Glow Base */}
                    {active && (
                      <>
                        {/* Outer Glow - Blur Layer */}
                        {/* <div className="absolute -inset-2 bg-emerald-500/20 rounded-3xl blur-2xl animate-pulse" /> */}
                        
                        {/* Middle Glow */}
                        <div className="absolute -inset-1 bg-gradient-to-br from-emerald-400/30 to-emerald-400/10 rounded-2xl blur-md" />
                        
                        {/* Solid Background Base */}
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 rounded-2xl shadow-[0_4px_20px_rgba(16,185,129,0.1)]" />
                        
                        {/* Top Shine/Reflection */}
                        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/10 to-transparent rounded-2xl" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 35%, 0 50%)' }} />
                        
                        {/* Bottom Shadow/Depth */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent rounded-2xl" />
                      </>
                    )}
                    
                    {/* Content Container */}
                    <div className={`relative z-10 flex items-center gap-2 transition-all duration-700 ${
                      active ? 'opacity-100' : 'opacity-100'
                    }`}>
                      {/* Icon */}
                      <Icon 
                        className={`transition-all duration-700 ${
                          active 
                            ? 'w-5 h-5 text-white drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]' 
                            : 'w-5 h-5 text-slate-400 group-hover:text-emerald-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_1px_rgba(16,185,129,0.2)]'
                        }`}
                        strokeWidth={active ? 2.5 : 2}
                      />
                      
                      {/* Label */}
                      <motion.span 
                        className="whitespace-nowrap overflow-hidden text-xs"
                        initial={false}
                        animate={{
                          maxWidth: active ? '100px' : '0px',
                          opacity: active ? 1 : 0,
                          x: active ? 0 : -8,
                        }}
                        transition={{
                          duration: 0.5,
                          ease: "easeOut"
                        }}
                      >
                        <span className="text-white drop-shadow-[0_0_6px_rgba(16,185,129,0.2)]">
                          {tab.label}
                        </span>
                      </motion.span>
                    </div>
                  </button>
                );
              })}
            </div>
            
            {/* Bottom Glow Line */}
            {/* <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" /> */}
          </div>
        </div>
        </div>
    </div>
  )
}