import { useState, useEffect, useMemo } from 'react'
import { Bank, Goal, TransactionWithDetails, ObjectiveWithAmount } from '../../lib/supabase'
import { supabase } from '../../lib/supabase'
import { toast } from '../../lib/toast'
import {
  TrendingUp,
  Building2,
  Target,
  ArrowDownCircle,
  ArrowDownRight,
  Eye,
  EyeOff,
  Copy,
  Check,
  RotateCw,
  Plus,
  ChevronRight,
  Clock,
  Wallet,
  Activity,
  ArrowRight
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { stockService } from '../../services/stockService'
import { format, subDays, differenceInDays } from 'date-fns'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface OverviewCardsProps {
  banks: Bank[]
  goals: Goal[]
  transactions: TransactionWithDetails[]
  onRefresh?: () => void
}

interface StockOverviewData {
  totalInvested: number
  totalRevenue: number
  totalGains: number
  totalGainsPercent: number
}

interface CashflowPoint {
  date: string
  rawDate: string
  inflow: number
  outflow: number
  net: number
}

// Institution branding detector for Moroccan & international banks
function getBankIdentity(name: string) {
  const n = (name || '').toLowerCase()
  if (n.includes('attijari') || n.includes('wafa')) {
    return {
      brand: 'Attijariwafa Bank',
      accent: '#C5A059',
      badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      gradient: 'from-[#1a140d] via-[#120f09] to-[#0a0805]',
      border: 'border-amber-500/30',
      tag: 'Premier Banking',
    }
  }
  if (n.includes('populaire') || n.includes('bcp') || n.includes('chaabi')) {
    return {
      brand: 'Banque Populaire',
      accent: '#D97706',
      badgeBg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
      gradient: 'from-[#1c130b] via-[#140e07] to-[#0a0704]',
      border: 'border-orange-500/30',
      tag: 'Retail Vault',
    }
  }
  if (n.includes('cih')) {
    return {
      brand: 'CIH Bank',
      accent: '#06B6D4',
      badgeBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
      gradient: 'from-[#081824] via-[#06121b] to-[#04090d]',
      border: 'border-cyan-500/30',
      tag: 'Digital Core',
    }
  }
  if (n.includes('bmce') || n.includes('africa')) {
    return {
      brand: 'Bank of Africa',
      accent: '#2563EB',
      badgeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      gradient: 'from-[#0c162c] via-[#081020] to-[#050812]',
      border: 'border-blue-500/30',
      tag: 'Corporate Account',
    }
  }
  if (n.includes('cfg')) {
    return {
      brand: 'CFG Bank',
      accent: '#94A3B8',
      badgeBg: 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20',
      gradient: 'from-[#1e222b] via-[#14161c] to-[#0b0c0f]',
      border: 'border-slate-500/30',
      tag: 'Private Wealth',
    }
  }
  if (n.includes('sgmb') || n.includes('societe') || n.includes('générale') || n.includes('generale')) {
    return {
      brand: 'Société Générale',
      accent: '#E11D48',
      badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      gradient: 'from-[#200e13] via-[#160a0d] to-[#0a0406]',
      border: 'border-rose-500/30',
      tag: 'Direct Depository',
    }
  }
  // Default Bespoke Bank Identity
  return {
    brand: name || 'Depository Account',
    accent: '#10B981',
    badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    gradient: 'from-[#111915] via-[#0c120f] to-[#060907]',
    border: 'border-emerald-500/20',
    tag: 'Liquid Reserve',
  }
}

export function OverviewCards({ banks, goals, transactions: initialTransactions, onRefresh }: OverviewCardsProps) {
  const { user } = useAuth()
  const [objectivesWithAmounts, setObjectivesWithAmounts] = useState<ObjectiveWithAmount[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isMasked, setIsMasked] = useState(() => {
    return localStorage.getItem('ff_mask_balances') === 'true'
  })
  const [copied, setCopied] = useState(false)
  const [stockData, setStockData] = useState<StockOverviewData>({
    totalInvested: 0,
    totalRevenue: 0,
    totalGains: 0,
    totalGainsPercent: 0,
  })
  const [chartRange, setChartRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [chartMode, setChartMode] = useState<'net' | 'flow'>('net')
  const [rawChartData, setRawChartData] = useState<CashflowPoint[]>([])

  // Toggle and save privacy state
  const toggleMask = () => {
    setIsMasked(prev => {
      const next = !prev
      localStorage.setItem('ff_mask_balances', String(next))
      return next
    })
  }

  // Load objective balances & transactions
  useEffect(() => {
    loadObjectiveDetails()
  }, [goals])

  // Load stock market data & cashflow chart
  useEffect(() => {
    if (user) {
      loadStockPortfolio()
      loadCashflowHistory()
    }
  }, [user, chartRange])

  const loadStockPortfolio = async () => {
    if (!user) return
    try {
      const res = await stockService.calculateTotalGains(user.id)
      if (res) {
        setStockData(res)
      }
    } catch (e) {
      console.warn('Stock data not available:', e)
    }
  }

  const loadObjectiveDetails = async () => {
    try {
      if (goals.length === 0) {
        setObjectivesWithAmounts([])
        setLoading(false)
        return
      }

      const { data: txs, error } = await supabase
        .from('objectives_transactions')
        .select('objective_id, amount, description, created_at, banks:bank_id(name)')
        .in('objective_id', goals.map(g => g.id))

      if (error) throw error

      const mapped: ObjectiveWithAmount[] = goals.map(goal => {
        const goalTxs = txs?.filter(t => t.objective_id === goal.id) || []
        const total = goalTxs.reduce((sum, t) => sum + Number(t.amount), 0)
        return {
          ...goal,
          total_amount: total,
          transactions: goalTxs.map(t => ({
            bank_name: (t.banks as { name?: string } | null)?.name || 'Depository',
            amount: Number(t.amount),
            description: t.description || '',
            created_at: t.created_at,
          })),
        }
      }).sort((a, b) => {
        const ratioA = a.target_amount ? a.total_amount / a.target_amount : 0
        const ratioB = b.target_amount ? b.total_amount / b.target_amount : 0
        return ratioB - ratioA
      })

      setObjectivesWithAmounts(mapped)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error('Failed to load portfolio allocations: ' + msg)
    } finally {
      setLoading(false)
    }
  }

  const loadCashflowHistory = async () => {
    if (!user) return
    try {
      const days = chartRange === '7d' ? 7 : chartRange === '30d' ? 30 : 90
      const startDate = subDays(new Date(), days).toISOString()

      const { data, error } = await supabase
        .from('objectives_transactions')
        .select('amount, created_at')
        .gte('created_at', startDate)
        .order('created_at', { ascending: true })

      if (error) throw error

      // Group by calendar day
      const grouped: { [key: string]: { inflow: number; outflow: number; net: number } } = {}

      // Pre-populate all days in range for continuous curve
      for (let i = days - 1; i >= 0; i--) {
        const d = subDays(new Date(), i)
        const key = format(d, 'MMM dd')
        grouped[key] = { inflow: 0, outflow: 0, net: 0 }
      }

      data?.forEach(t => {
        const key = format(new Date(t.created_at), 'MMM dd')
        const val = Number(t.amount)
        if (!grouped[key]) {
          grouped[key] = { inflow: 0, outflow: 0, net: 0 }
        }
        if (val > 0) {
          grouped[key].inflow += val
        } else {
          grouped[key].outflow += Math.abs(val)
        }
        grouped[key].net += val
      })

      const points: CashflowPoint[] = Object.keys(grouped).map(k => ({
        date: k,
        rawDate: k,
        inflow: grouped[k].inflow,
        outflow: grouped[k].outflow,
        net: grouped[k].net,
      }))

      setRawChartData(points)
    } catch (e) {
      console.warn('Error loading cashflow trend:', e)
    }
  }

  // Handle Sync
  const handleSyncAll = async () => {
    setIsRefreshing(true)
    try {
      if (onRefresh) onRefresh()
      await Promise.all([loadObjectiveDetails(), loadStockPortfolio(), loadCashflowHistory()])
      toast.success('Portfolio Ledger Synchronized')
    } catch {
      toast.error('Sync completed with warnings')
    } finally {
      setTimeout(() => setIsRefreshing(false), 600)
    }
  }

  // Navigation dispatcher
  const navigate = (tab: string) => {
    window.dispatchEvent(new CustomEvent('tabChange', { detail: tab }))
  }

  // Financial calculations
  const totalLiquidCash = useMemo(() => {
    return banks.reduce((sum, b) => sum + Number(b.balance || 0), 0)
  }, [banks])

  const totalCommittedSavings = useMemo(() => {
    return objectivesWithAmounts.reduce((sum, o) => sum + Math.max(0, o.total_amount), 0)
  }, [objectivesWithAmounts])

  const totalGoalsTarget = useMemo(() => {
    return goals.reduce((sum, g) => sum + Number(g.target_amount || 0), 0)
  }, [goals])

  const totalStockValuation = useMemo(() => {
    return Math.max(0, stockData.totalInvested + stockData.totalGains)
  }, [stockData])

  // Total Estimated Net Worth
  const totalNetWorth = useMemo(() => {
    return totalLiquidCash + totalStockValuation
  }, [totalLiquidCash, totalStockValuation])

  // Free unallocated capital (liquid cash minus commitments, floored at 0)
  const unallocatedCash = useMemo(() => {
    return Math.max(0, totalLiquidCash - totalCommittedSavings)
  }, [totalLiquidCash, totalCommittedSavings])

  // Savings allocation index
  const savingsAllocationRate = useMemo(() => {
    if (totalLiquidCash <= 0) return 0
    return Math.min(100, (totalCommittedSavings / totalLiquidCash) * 100)
  }, [totalLiquidCash, totalCommittedSavings])

  // Format monetary value
  const formatMAD = (amount: number, digits = 2) => {
    if (isMasked) return '••••••'
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    })
  }

  const copyNetWorth = () => {
    navigator.clipboard.writeText(`${totalNetWorth.toFixed(2)} MAD`)
    setCopied(true)
    toast.success('Net worth copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  // User display name
  const cardHolderName = user?.email
    ? user.email.split('@')[0].replace(/[._-]/g, ' ').toUpperCase()
    : 'PATRIMOINE CLIENT'

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Terminal Header Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 p-6 bg-white dark:bg-[#121520] border border-slate-200/90 dark:border-white/[0.08] rounded-2xl shadow-sm animate-pulse">
          <div className="space-y-2">
            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-8 w-64 bg-slate-300 dark:bg-slate-700 rounded-lg" />
          </div>
          <div className="h-10 w-44 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>

        {/* Hero Card + Matrix Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-5 h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          <div className="lg:col-span-7 grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-28 bg-white dark:bg-[#0e1118] border border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse p-4" />
            ))}
          </div>
        </div>

        {/* Chart Skeleton */}
        <div className="h-80 bg-white dark:bg-[#0e1118] border border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-7 max-w-7xl mx-auto">
      {/* ── 1. COMMAND HEADER & PORTFOLIO TELEMETRY ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200 dark:border-white/[0.06]"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-stone-900 dark:text-white tracking-tight">
            Dashboard
          </h1>
        </div>

        {/* Quick Utilities */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Privacy Switch */}
          <button
            onClick={toggleMask}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border transition-all ${isMasked
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300 shadow-sm'
              : 'bg-white dark:bg-[#12141c] border-stone-200 dark:border-white/[0.08] text-stone-600 dark:text-stone-300 hover:border-stone-300 dark:hover:border-white/20'
              }`}
            title={isMasked ? 'Reveal asset balances' : 'Mask asset balances'}
          >
            {isMasked ? <EyeOff className="w-4 h-4 text-amber-500" /> : <Eye className="w-4 h-4 text-stone-400" />}
            <span>{isMasked ? 'Balances Masked' : 'Mask Balances'}</span>
          </button>

          {/* Sync Button */}
          <button
            onClick={handleSyncAll}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-white dark:bg-[#12141c] border border-stone-200 dark:border-white/[0.08] text-stone-600 dark:text-stone-300 hover:border-stone-300 dark:hover:border-white/20 transition-all active:scale-95"
            title="Synchronize all banking data"
          >
            <RotateCw className={`w-4 h-4 text-stone-400 ${isRefreshing ? 'animate-spin text-amber-500' : ''}`} />
            <span className="hidden sm:inline">Synchronize</span>
          </button>
        </div>
      </motion.div>

      {/* ── 2. THE SOVEREIGN CORE: LUXURY CARD & ASSET MATRIX ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Physical-Grade Titanium & Obsidian Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="lg:col-span-5 relative flex flex-col justify-between p-6 sm:p-7 rounded-2xl overflow-hidden titanium-card text-white min-h-[260px] group"
        >
          {/* Subtle Guilloché / Hairline Texture */}
          <div
            className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay"
            style={{
              backgroundImage: `radial-gradient(circle at 100% 0%, rgba(197, 160, 89, 0.25) 0%, transparent 50%), repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 12px)`,
            }}
          />

          {/* Ambient Lighting Sheen */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/[0.07] rounded-full blur-3xl pointer-events-none" />

          {/* Card Center: Total Net Worth */}
          <div className="relative z-10 my-4">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[11px] font-mono tracking-wider uppercase text-stone-400">
                Consolidated Net Assets
              </p>
              <span className="text-[10px] font-mono text-amber-400/80">MAD // MOROCCAN DIRHAM</span>
            </div>

            <div className="flex items-baseline gap-2.5">
              <span className="text-3xl sm:text-4xl font-mono font-bold tracking-tight text-white tabular-num">
                {formatMAD(totalNetWorth)}
              </span>
              <span className="text-sm font-mono font-semibold text-amber-400">MAD</span>
              <button
                onClick={copyNetWorth}
                className="p-1 rounded-md text-stone-400 hover:text-white transition-colors ml-1"
                title="Copy net worth"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <p className="text-[11px] text-stone-400/80 mt-1 flex items-center gap-1.5">
              <span>{banks.length} Connected Accounts</span>
              <span>•</span>
              <span>{goals.length} Strategic Goals</span>
            </p>
          </div>

          {/* Card Bottom Row: Cardholder & Status */}
          <div className="relative z-10 pt-3 border-t border-white/[0.08] flex items-center justify-between">
            <div>
              <p className="text-[9px] font-mono uppercase tracking-widest text-stone-500">Portfolio Owner</p>
              <p className="text-xs font-mono tracking-wider font-semibold text-stone-200">
                {cardHolderName}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Capital Matrix (4 Precision Quadrants) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {/* Quadrant 1: Liquid Reserves */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121520] border border-stone-200/90 dark:border-white/[0.08] hover:border-stone-300 dark:hover:border-white/20 transition-all flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  Liquid Cash
                </span>
              </div>
              <span className="text-[11px] font-mono text-stone-400 dark:text-stone-500">
                {banks.length} Accounts
              </span>
            </div>

            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-mono font-bold text-stone-900 dark:text-white tabular-num">
                  {formatMAD(totalLiquidCash)}
                </span>
                <span className="text-xs font-mono text-stone-400">MAD</span>
              </div>
            </div>
          </div>

          {/* Quadrant 2: Committed Capital in Goals */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121520] border border-stone-200/90 dark:border-white/[0.08] hover:border-stone-300 dark:hover:border-white/20 transition-all flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  Secured Goals
                </span>
              </div>
              <span className="text-[11px] font-mono text-stone-400 dark:text-stone-500">
                {goals.length} Targets
              </span>
            </div>

            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-mono font-bold text-stone-900 dark:text-white tabular-num">
                  {formatMAD(totalCommittedSavings)}
                </span>
                <span className="text-xs font-mono text-stone-400">MAD</span>
              </div>
              <div className="mt-2.5 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 pt-2 border-t border-stone-100 dark:border-white/[0.05]">
                <span>Goal progress</span>
                <span className="font-mono font-medium text-amber-600 dark:text-amber-400">
                  {totalGoalsTarget > 0 ? ((totalCommittedSavings / totalGoalsTarget) * 100).toFixed(0) : 0}% achieved
                </span>
              </div>
            </div>
          </div>

          {/* Quadrant 3: Casablanca Bourse & Equities */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121520] border border-stone-200/90 dark:border-white/[0.08] hover:border-stone-300 dark:hover:border-white/20 transition-all flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  Moroccan Bourse
                </span>
              </div>
              <span className={`text-[11px] font-mono font-bold ${stockData.totalGains >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {stockData.totalGains >= 0 ? '+' : ''}{stockData.totalGainsPercent.toFixed(1)}%
              </span>
            </div>

            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-mono font-bold text-stone-900 dark:text-white tabular-num">
                  {formatMAD(totalStockValuation)}
                </span>
                <span className="text-xs font-mono text-stone-400">MAD</span>
              </div>
              <div className="mt-2.5 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 pt-2 border-t border-stone-100 dark:border-white/[0.05]">
                <span>Net Gain / Loss</span>
                <span className={`font-mono font-medium ${stockData.totalGains >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                  {stockData.totalGains >= 0 ? '+' : ''}{formatMAD(stockData.totalGains, 0)} MAD
                </span>
              </div>
            </div>
          </div>

          {/* Quadrant 4: Unallocated Free Capital */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121520] border border-stone-200/90 dark:border-white/[0.08] hover:border-stone-300 dark:hover:border-white/20 transition-all flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  Unallocated Cash
                </span>
              </div>
              <span className="text-[11px] font-mono text-purple-600 dark:text-purple-400">
                Ready to Deploy
              </span>
            </div>

            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-mono font-bold text-stone-900 dark:text-white tabular-num">
                  {formatMAD(unallocatedCash)}
                </span>
                <span className="text-xs font-mono text-stone-400">MAD</span>
              </div>
              <div className="mt-2.5 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 pt-2 border-t border-stone-100 dark:border-white/[0.05]">
                <span>Savings discipline index</span>
                <span className="font-mono font-medium text-purple-600 dark:text-purple-400">
                  {savingsAllocationRate.toFixed(0)}% secured
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── 3. TACTILE COMMAND RAIL ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.12 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {[
          {
            title: 'Allocate Capital',
            sub: 'Deposit into goals',
            icon: Plus,
            tab: 'goals',
            accent: 'group-hover:border-amber-500/50 group-hover:bg-amber-500/5',
            iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
          },
          {
            title: 'Withdraw Funds',
            sub: 'Record expense & split',
            icon: ArrowDownCircle,
            tab: 'transactions',
            accent: 'group-hover:border-rose-500/50 group-hover:bg-rose-500/5',
            iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
          },
          {
            title: 'Manage Vaults',
            sub: 'Connected bank accounts',
            icon: Building2,
            tab: 'banks',
            accent: 'group-hover:border-blue-500/50 group-hover:bg-blue-500/5',
            iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
          },
          {
            title: 'Audit Ledger',
            sub: 'Full transaction logs',
            icon: Clock,
            tab: 'history',
            accent: 'group-hover:border-emerald-500/50 group-hover:bg-emerald-500/5',
            iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
          },
        ].map(btn => {
          const Icon = btn.icon
          return (
            <button
              key={btn.tab}
              onClick={() => navigate(btn.tab)}
              className={`group p-4 rounded-2xl bg-white dark:bg-[#121520] border border-stone-200/90 dark:border-white/[0.08] shadow-sm text-left transition-all ${btn.accent} flex items-center justify-between`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${btn.iconBg} flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-stone-900 dark:text-white leading-tight">
                    {btn.title}
                  </p>
                  <p className="text-[11px] text-stone-400 mt-0.5 truncate">{btn.sub}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-300 dark:text-stone-600 group-hover:text-stone-600 dark:group-hover:text-stone-300 group-hover:translate-x-0.5 transition-all" />
            </button>
          )
        })}
      </motion.div>

      {/* ── 4. CASHFLOW VELOCITY & PERFORMANCE ENGINE (RECHARTS) ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.16 }}
        className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#121520] border border-stone-200/90 dark:border-white/[0.08] shadow-sm"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <h2 className="text-base font-display font-bold text-stone-900 dark:text-white">
                Cashflow Velocity & Net Asset Trajectory
              </h2>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Historical inflow deposits vs withdrawal pressure across your accounts
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode switch */}
            <div className="flex bg-stone-100 dark:bg-stone-900/80 p-0.5 rounded-xl border border-stone-200/50 dark:border-white/[0.06]">
              <button
                onClick={() => setChartMode('net')}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${chartMode === 'net'
                  ? 'bg-white dark:bg-[#1a1d28] text-stone-900 dark:text-white shadow-sm'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                  }`}
              >
                Net Growth
              </button>
              <button
                onClick={() => setChartMode('flow')}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${chartMode === 'flow'
                  ? 'bg-white dark:bg-[#1a1d28] text-stone-900 dark:text-white shadow-sm'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                  }`}
              >
                In vs Out
              </button>
            </div>

            {/* Range buttons */}
            <div className="flex bg-stone-100 dark:bg-stone-900/80 p-0.5 rounded-xl border border-stone-200/50 dark:border-white/[0.06]">
              {(['7d', '30d', '90d'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setChartRange(r)}
                  className={`px-2.5 py-1 text-xs font-mono font-medium rounded-lg uppercase transition-colors ${chartRange === r
                    ? 'bg-white dark:bg-[#1a1d28] text-stone-900 dark:text-white shadow-sm'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                    }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* The Chart */}
        <div className="h-64 sm:h-72 w-full">
          {rawChartData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-stone-400 text-xs">
              <Activity className="w-8 h-8 mb-2 opacity-40" />
              <span>No cashflow events recorded in this period</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={rawChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  {/* Gold Net Gradient */}
                  <linearGradient id="goldNet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C5A059" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#C5A059" stopOpacity={0.0} />
                  </linearGradient>

                  {/* Emerald Inflow Gradient */}
                  <linearGradient id="emeraldInflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>

                  {/* Rose Outflow Gradient */}
                  <linearGradient id="roseOutflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150, 150, 150, 0.08)" />

                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#78716c', fontFamily: 'monospace' }}
                  axisLine={false}
                  tickLine={false}
                  dy={8}
                />

                <YAxis
                  tick={{ fontSize: 11, fill: '#78716c', fontFamily: 'monospace' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val: number) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : String(val))}
                  dx={-4}
                />

                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null
                    return (
                      <div className="bg-[#0b0d12] border border-amber-500/30 rounded-xl p-3 shadow-2xl text-xs font-mono text-stone-200 min-w-[170px]">
                        <p className="text-[10px] text-stone-400 uppercase tracking-widest pb-1 border-b border-white/10 mb-2">
                          {label}
                        </p>
                        {payload.map((entry) => (
                          <div key={entry.name} className="flex items-center justify-between py-0.5">
                            <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: entry.color }} />
                              {entry.name}:
                            </span>
                            <span className="font-bold text-white">
                              {Number(entry.value).toLocaleString('en-US', { minimumFractionDigits: 2 })} MAD
                            </span>
                          </div>
                        ))}
                      </div>
                    )
                  }}
                />

                {chartMode === 'net' ? (
                  <Area
                    type="monotone"
                    dataKey="net"
                    name="Net Balance Flow"
                    stroke="#C5A059"
                    strokeWidth={2.5}
                    fill="url(#goldNet)"
                  />
                ) : (
                  <>
                    <Area
                      type="monotone"
                      dataKey="inflow"
                      name="Capital Inflow"
                      stroke="#10B981"
                      strokeWidth={2}
                      fill="url(#emeraldInflow)"
                    />
                    <Area
                      type="monotone"
                      dataKey="outflow"
                      name="Capital Outflow"
                      stroke="#F43F5E"
                      strokeWidth={2}
                      fill="url(#roseOutflow)"
                    />
                  </>
                )}
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </motion.div>

      {/* ── 5. SPLIT SECTION: VAULT ACCOUNTS & STRATEGIC GOALS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Bank Vaults (Cassettes) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="lg:col-span-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-500" />
              <h3 className="text-base font-display font-bold text-stone-900 dark:text-white">
                Active Bank Vaults
              </h3>
            </div>
            <button
              onClick={() => navigate('banks')}
              className="text-xs font-mono font-medium text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>Manage all ({banks.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {banks.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white dark:bg-[#121520] border border-dashed border-stone-200/90 dark:border-white/10 text-center shadow-sm">
              <Building2 className="w-8 h-8 mx-auto text-stone-400 mb-2 opacity-50" />
              <p className="text-sm font-medium text-stone-700 dark:text-stone-300">No bank accounts linked yet</p>
              <p className="text-xs text-stone-400 mt-1 mb-4">Connect your first Moroccan or international bank account</p>
              <button
                onClick={() => navigate('banks')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-stone-900 dark:bg-white text-white dark:text-stone-900 hover:opacity-90"
              >
                <Plus className="w-3.5 h-3.5" /> Add Bank Account
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {banks.slice(0, 4).map(bank => {
                const id = getBankIdentity(bank.name)
                const sharePercent = totalLiquidCash > 0 ? (Number(bank.balance) / totalLiquidCash) * 100 : 0
                return (
                  <div
                    key={bank.id}
                    onClick={() => navigate('banks')}
                    className="p-4 rounded-2xl bg-white dark:bg-[#121520] border border-stone-200/90 dark:border-white/[0.08] hover:border-amber-500/30 transition-all cursor-pointer group shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {/* Custom Bank Emblem */}
                        <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-[#161a24] border border-stone-200/60 dark:border-white/[0.08] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
                          {bank.logo ? (
                            <img src={bank.logo} alt={bank.name} className="w-6 h-6 object-contain" />
                          ) : (
                            <span className="font-mono font-bold text-xs" style={{ color: id.accent }}>
                              {bank.name.slice(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-stone-900 dark:text-white leading-tight">
                              {bank.name}
                            </h4>
                            <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full border ${id.badgeBg}`}>
                              {id.tag}
                            </span>
                          </div>
                          <p className="text-[11px] font-mono text-stone-400 mt-0.5">
                            RIB •••• {bank.id.slice(-4).toUpperCase()}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-base font-mono font-bold text-stone-900 dark:text-white tabular-num">
                          {formatMAD(Number(bank.balance))}
                        </p>
                        <p className="text-[10px] font-mono text-stone-400">MAD</p>
                      </div>
                    </div>

                    {/* Balance Share Metric */}
                    <div className="pt-2 border-t border-stone-100 dark:border-white/[0.05] flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2 flex-1 mr-4">
                        <div className="h-1 flex-1 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(5, sharePercent))}%`, backgroundColor: id.accent }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-stone-400">
                          {sharePercent.toFixed(0)}%
                        </span>
                      </div>
                      <span className="text-stone-400 group-hover:text-amber-500 font-mono text-[10px] flex items-center gap-0.5">
                        Details <ArrowRight className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* Right Column: Strategic Milestones (Goals) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.24 }}
          className="lg:col-span-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-500" />
              <h3 className="text-base font-display font-bold text-stone-900 dark:text-white">
                Capital Milestones
              </h3>
            </div>
            <button
              onClick={() => navigate('goals')}
              className="text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>View all ({goals.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {objectivesWithAmounts.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white dark:bg-[#121520] border border-dashed border-stone-200/90 dark:border-white/10 text-center shadow-sm">
              <Target className="w-8 h-8 mx-auto text-stone-400 mb-2 opacity-50" />
              <p className="text-sm font-medium text-stone-700 dark:text-stone-300">No financial milestones active</p>
              <p className="text-xs text-stone-400 mt-1 mb-4">Set up a savings target for emergency funds, real estate, or acquisitions</p>
              <button
                onClick={() => navigate('goals')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-stone-900 dark:bg-white text-white dark:text-stone-900 hover:opacity-90"
              >
                <Plus className="w-3.5 h-3.5" /> Create Milestone
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {objectivesWithAmounts.slice(0, 4).map(goal => {
                const target = goal.target_amount ? Number(goal.target_amount) : 0
                const current = goal.total_amount ? Number(goal.total_amount) : 0
                const progress = target > 0 ? Math.min(100, (current / target) * 100) : 0
                const isComplete = progress >= 100

                // Deadline countdown
                let horizonText = 'Open Horizon'
                if (goal.target_date) {
                  try {
                    const daysLeft = differenceInDays(new Date(goal.target_date), new Date())
                    if (daysLeft < 0) horizonText = 'Deadline Passed'
                    else if (daysLeft === 0) horizonText = 'Due Today'
                    else horizonText = `${daysLeft} days remaining`
                  } catch {
                    horizonText = goal.target_date
                  }
                }

                return (
                  <div
                    key={goal.id}
                    onClick={() => navigate('goals')}
                    className="p-4 rounded-2xl bg-white dark:bg-[#121520] border border-stone-200/90 dark:border-white/[0.08] hover:border-emerald-500/30 transition-all cursor-pointer group shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span className="text-sm font-semibold text-stone-900 dark:text-white truncate">
                          {goal.name}
                        </span>
                        {goal.category && (
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400">
                            {goal.category}
                          </span>
                        )}
                      </div>

                      <span className={`text-xs font-mono font-bold flex-shrink-0 ${isComplete ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {progress.toFixed(0)}%
                      </span>
                    </div>

                    {/* Stepped Milestone Gauge with 25%, 50%, 75% tick marks */}
                    <div className="relative my-2.5">
                      <div className="h-2 bg-stone-100 dark:bg-stone-800/90 rounded-full overflow-hidden relative">
                        <motion.div
                          className={`h-full rounded-full ${isComplete
                            ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                            : 'bg-gradient-to-r from-amber-500 to-emerald-500'
                            }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                      </div>
                      {/* Milestone Tick Lines */}
                      <div className="absolute inset-0 flex justify-between pointer-events-none px-1">
                        <span className="w-0.5 h-2 bg-stone-300 dark:bg-stone-700 opacity-60 ml-[25%]" />
                        <span className="w-0.5 h-2 bg-stone-300 dark:bg-stone-700 opacity-60 ml-[25%]" />
                        <span className="w-0.5 h-2 bg-stone-300 dark:bg-stone-700 opacity-60 ml-[25%]" />
                      </div>
                    </div>

                    {/* Saved vs Target & Horizon */}
                    <div className="flex items-center justify-between text-[11px] font-mono text-stone-400 pt-1">
                      <span>
                        <strong className="text-stone-700 dark:text-stone-200">{formatMAD(current, 0)}</strong> / {formatMAD(target, 0)} MAD
                      </span>
                      <span className="flex items-center gap-1 text-[10px]">
                        <Clock className="w-3 h-3 text-stone-400" />
                        {horizonText}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* ── 6. CASHFLOW RECENT ACTIVITY LEDGER ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.28 }}
        className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#121520] border border-stone-200/90 dark:border-white/[0.08] shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-stone-400" />
            <h3 className="text-base font-display font-bold text-stone-900 dark:text-white">
              Recent Cash Movements
            </h3>
          </div>
          <button
            onClick={() => navigate('history')}
            className="text-xs font-mono font-medium text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 flex items-center gap-1"
          >
            <span>Full Audit Trail</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {initialTransactions.length === 0 ? (
          <div className="py-8 text-center text-xs text-stone-400 font-mono">
            No transactions logged in the primary registry
          </div>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-white/[0.04]">
            {initialTransactions.slice(0, 5).map(tx => {
              const amount = Number(tx.total_amount)
              const formattedDate = format(new Date(tx.created_at), 'MMM dd, yyyy • HH:mm')

              return (
                <div
                  key={tx.id}
                  className="py-3.5 flex items-center justify-between gap-4 hover:bg-stone-50/60 dark:hover:bg-white/[0.02] -mx-2 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center flex-shrink-0">
                      <ArrowDownRight className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-stone-900 dark:text-white truncate">
                        {tx.description || 'Withdrawal Dispersal'}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] font-mono text-stone-400 mt-0.5">
                        <span>{tx.bank_name}</span>
                        <span>•</span>
                        <span>{formattedDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 font-mono">
                    <p className="text-sm font-bold text-rose-600 dark:text-rose-400 tabular-num">
                      - {formatMAD(amount)} MAD
                    </p>
                    {tx.transaction_goals && tx.transaction_goals.length > 0 && (
                      <p className="text-[10px] text-stone-400">
                        {tx.transaction_goals.length} target{tx.transaction_goals.length > 1 ? 's' : ''} deducted
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </motion.div>
    </div>
  )
}
