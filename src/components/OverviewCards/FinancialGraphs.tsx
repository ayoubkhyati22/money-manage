import { useState, useEffect } from 'react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Calendar, DollarSign, Target, ArrowDownCircle, Activity } from 'lucide-react'
import { Bank, Goal, ObjectiveWithAmount } from '../../lib/supabase'
import { supabase } from '../../lib/supabase'
import { format, subDays } from 'date-fns'

interface FinancialGraphsProps {
  banks: Bank[]
  goals: Goal[]
  objectives: ObjectiveWithAmount[]
}

type ChartType = 'overview' | 'banks' | 'objectives' | 'withdrawals'

export function FinancialGraphs({ banks, goals, objectives }: FinancialGraphsProps) {
  const [activeChart, setActiveChart] = useState<ChartType>('overview')
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [transactionHistory, setTransactionHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTransactionHistory()
  }, [timeRange])

  const loadTransactionHistory = async () => {
    setLoading(true)
    try {
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
      const startDate = subDays(new Date(), days).toISOString()

      const { data, error } = await supabase
        .from('objectives_transactions')
        .select('*')
        .gte('created_at', startDate)
        .order('created_at', { ascending: true })

      if (error) throw error

      // Group by date
      const groupedData: { [key: string]: { date: string; deposits: number; withdrawals: number; net: number } } = {}
      
      data?.forEach(transaction => {
        const date = format(new Date(transaction.created_at), 'MMM dd')
        if (!groupedData[date]) {
          groupedData[date] = { date, deposits: 0, withdrawals: 0, net: 0 }
        }
        
        const amount = Number(transaction.amount)
        if (amount > 0) {
          groupedData[date].deposits += amount
        } else {
          groupedData[date].withdrawals += Math.abs(amount)
        }
        groupedData[date].net += amount
      })

      setTransactionHistory(Object.values(groupedData))
    } catch (error) {
      console.error('Error loading transaction history:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate statistics
//   const totalBankBalance = banks.reduce((sum, bank) => sum + Number(bank.balance), 0)
//   const totalObjectivesAmount = objectives.reduce((sum, obj) => sum + obj.total_amount, 0)
//   const totalWithdrawn = objectives.reduce((sum, obj) => {
//     const withdrawn = obj.transactions
//       .filter(t => t.amount < 0)
//       .reduce((s, t) => s + Math.abs(t.amount), 0)
//     return sum + withdrawn
//   }, 0)

  // Prepare data for different charts
  const bankDistributionData = banks.map((bank, index) => ({
    name: bank.name,
    value: Number(bank.balance),
    color: COLORS[index % COLORS.length]
  }))

  const objectivesProgressData = objectives.map((obj, index) => ({
    name: obj.name.length > 15 ? obj.name.substring(0, 15) + '...' : obj.name,
    current: obj.total_amount,
    target: obj.target_amount || obj.total_amount,
    progress: obj.target_amount ? (obj.total_amount / obj.target_amount) * 100 : 100,
    color: COLORS[index % COLORS.length]
  }))

  const charts = [
    { id: 'overview' as const, label: 'Overview', icon: Activity },
    { id: 'banks' as const, label: 'Banks', icon: DollarSign },
    { id: 'objectives' as const, label: 'Objectives', icon: Target },
    { id: 'withdrawals' as const, label: 'Activity', icon: TrendingUp },
  ]

  const timeRanges = [
    { id: '7d' as const, label: '7 Days' },
    { id: '30d' as const, label: '30 Days' },
    { id: '90d' as const, label: '90 Days' },
  ]

  return (
    <div className="space-y-4">
      {/* Header with Stats */}
      <div className="bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm rounded-2xl shadow-lg border border-mint-200/50 dark:border-dark-600/50 overflow-hidden">
        <div className="bg-gradient-to-r from-primary-50 to-mint-50 dark:from-primary-900/30 dark:to-mint-900/30 p-4 sm:p-6 border-b border-primary-200 dark:border-dark-600">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-dark-500 dark:text-dark-100">Financial Analytics</h3>
              <p className="text-xs sm:text-sm text-dark-400 dark:text-dark-300 mt-1">Track your financial growth</p>
            </div>
            
            {/* Time Range Selector */}
            <div className="flex items-center space-x-1 sm:space-x-2 bg-white/60 dark:bg-dark-700/60 backdrop-blur-sm rounded-lg p-1 border border-primary-200 dark:border-dark-600">
              {timeRanges.map((range) => (
                <button
                  key={range.id}
                  onClick={() => setTimeRange(range.id)}
                  className={`px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all duration-300 ${
                    timeRange === range.id
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'text-dark-500 dark:text-dark-300 hover:bg-primary-100 dark:hover:bg-dark-600'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          {/* <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4">
            <div className="bg-white/60 dark:bg-dark-700/60 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-primary-200 dark:border-dark-600">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg">
                  <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs text-dark-400 dark:text-dark-300">Banks</p>
                  <p className="text-xs sm:text-sm font-semibold text-dark-600 dark:text-dark-100 truncate">{totalBankBalance.toFixed(2)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/60 dark:bg-dark-700/60 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-primary-200 dark:border-dark-600">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg">
                  <Target className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs text-dark-400 dark:text-dark-300">Objectives</p>
                  <p className="text-xs sm:text-sm font-semibold text-dark-600 dark:text-dark-100 truncate">{totalObjectivesAmount.toFixed(2)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/60 dark:bg-dark-700/60 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-primary-200 dark:border-dark-600">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-red-400 to-red-600 rounded-lg">
                  <ArrowDownCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs text-dark-400 dark:text-dark-300">Withdrawn</p>
                  <p className="text-xs sm:text-sm font-semibold text-dark-600 dark:text-dark-100 truncate">{totalWithdrawn.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div> */}
        </div>

        {/* Chart Type Selector */}
        <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-900/30">
          <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            {charts.map((chart) => {
              const Icon = chart.icon
              return (
                <button
                  key={chart.id}
                  onClick={() => setActiveChart(chart.id)}
                  className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                    activeChart === chart.id
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                      : 'text-dark-500 dark:text-dark-300 hover:bg-primary-100 dark:hover:bg-dark-700'
                  }`}
                >
                  <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{chart.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Chart Container */}
        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64 sm:h-80">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
          ) : (
            <div className="h-64 sm:h-80">
              {activeChart === 'overview' && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={transactionHistory}>
                    <defs>
                      <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" className="dark:stroke-dark-600" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#6B7280" 
                      className="dark:stroke-dark-400"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      stroke="#6B7280" 
                      className="dark:stroke-dark-400"
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #E5E7EB',
                        borderRadius: '12px',
                        padding: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      labelStyle={{ color: '#374151', fontWeight: 600, marginBottom: '8px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="net" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      fill="url(#colorNet)" 
                      name="Net Flow"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}

              {activeChart === 'banks' && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={bankDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={window.innerWidth < 640 ? 60 : 100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {bankDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #E5E7EB',
                        borderRadius: '12px',
                        padding: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value: any) => `${Number(value).toFixed(2)} MAD`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}

              {activeChart === 'objectives' && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={objectivesProgressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" className="dark:stroke-dark-600" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#6B7280" 
                      className="dark:stroke-dark-400"
                      tick={{ fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      stroke="#6B7280" 
                      className="dark:stroke-dark-400"
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #E5E7EB',
                        borderRadius: '12px',
                        padding: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value: any) => `${Number(value).toFixed(2)} MAD`}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="current" fill="#10B981" name="Current Amount" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="target" fill="#E5E7EB" name="Target Amount" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}

              {activeChart === 'withdrawals' && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={transactionHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" className="dark:stroke-dark-600" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#6B7280" 
                      className="dark:stroke-dark-400"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      stroke="#6B7280" 
                      className="dark:stroke-dark-400"
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #E5E7EB',
                        borderRadius: '12px',
                        padding: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      labelStyle={{ color: '#374151', fontWeight: 600, marginBottom: '8px' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Line 
                      type="monotone" 
                      dataKey="deposits" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Deposits"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="withdrawals" 
                      stroke="#EF4444" 
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Withdrawals"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          )}
        </div>

        {/* Chart Legend/Info */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-mint-50 dark:from-dark-900/30 dark:to-mint-900/20 border-t border-gray-200 dark:border-dark-600">
          <div className="flex items-center justify-between text-xs sm:text-sm text-dark-500 dark:text-dark-300">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Last updated: {format(new Date(), 'MMM dd, yyyy HH:mm')}</span>
            </div>
            {transactionHistory.length > 0 && (
              <div className="flex items-center space-x-2">
                {transactionHistory[transactionHistory.length - 1]?.net >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className="font-medium">
                  {transactionHistory.length} data points
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const COLORS = [
  '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', 
  '#06B6D4', '#EC4899', '#6366F1', '#14B8A6', '#F97316'
]