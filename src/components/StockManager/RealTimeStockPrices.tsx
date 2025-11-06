// src/components/StockManager/RealTimeStockPrices.tsx
import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, RefreshCw, Activity, AlertCircle, Clock, Wifi, WifiOff, Zap } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useStockPrices } from '../../hooks/useStockPrices'
import { stockService } from '../../services/stockService'
import { StockPortfolio } from '../../types/stock'
import { stockPriceEventBus } from '../../utils/stockPriceEventBus' // 🔥 NOUVEAU

interface PortfolioWithPrice extends StockPortfolio {
  currentPrice?: number
  priceChange?: number
  priceChangePercent?: number
  currentValue?: number
  totalGain?: number
  totalGainPercent?: number
  lastUpdate?: string
  priceSource: 'live' | 'api_closed' | 'fallback'
}

export function RealTimeStockPrices() {
  const { user } = useAuth()
  const [portfolio, setPortfolio] = useState<StockPortfolio[]>([])
  const [portfolioWithPrices, setPortfolioWithPrices] = useState<PortfolioWithPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastEventSync, setLastEventSync] = useState<Date | null>(null)

  // Extraire les casablanca_api_ids du portfolio
  const apiIds = portfolio
    .filter(p => p.casablanca_api_id)
    .map(p => p.casablanca_api_id!.toString())

  console.log(`🎯 [Component] Monitoring ${apiIds.length} stocks:`, apiIds)

  // Hook pour récupérer les prix en temps réel (refresh toutes les 30s)
  const { prices, loading: pricesLoading, error: pricesError, lastRefresh, refresh, fetchCount } = useStockPrices(apiIds, 30000)

  // 🔥 ÉCOUTER LES ÉVÉNEMENTS DE L'EVENT BUS
  useEffect(() => {
    console.log('📡 [Component] Setting up event listeners')

    // Écouter quand le formulaire récupère un prix
    const unsubscribePriceFetched = stockPriceEventBus.on('price:fetched', (data) => {
      console.log('📡 [Component] Received price:fetched event', data)
      setLastEventSync(new Date())
      // Optionnel: refresh immédiat si c'est un prix qu'on affiche
      if (apiIds.includes(data.casablancaApiId)) {
        console.log('🔄 [Component] Price for displayed stock updated, refreshing...')
        refresh()
      }
    })

    // Écouter quand le formulaire demande un refresh
    const unsubscribePriceRefresh = stockPriceEventBus.on('price:refresh', () => {
      console.log('📡 [Component] Received price:refresh event, refreshing prices...')
      setLastEventSync(new Date())
      refresh()
    })

    // Écouter quand une transaction est créée
    const unsubscribeTransactionCreated = stockPriceEventBus.on('transaction:created', (data) => {
      console.log('📡 [Component] Received transaction:created event', data)
      setLastEventSync(new Date())
      // Recharger le portfolio après 1 seconde (pour laisser le temps à la DB de se mettre à jour)
      setTimeout(() => {
        console.log('🔄 [Component] Reloading portfolio after transaction...')
        loadPortfolio()
      }, 1000)
    })

    // Écouter quand le portfolio est mis à jour
    const unsubscribePortfolioUpdated = stockPriceEventBus.on('portfolio:updated', () => {
      console.log('📡 [Component] Received portfolio:updated event')
      setLastEventSync(new Date())
      loadPortfolio()
    })

    // Cleanup: se désabonner lors du démontage du composant
    return () => {
      console.log('📡 [Component] Cleaning up event listeners')
      unsubscribePriceFetched()
      unsubscribePriceRefresh()
      unsubscribeTransactionCreated()
      unsubscribePortfolioUpdated()
    }
  }, [apiIds]) // Re-setup si les apiIds changent

  useEffect(() => {
    if (user) {
      loadPortfolio()
    }
  }, [user])

  useEffect(() => {
    if (portfolio.length > 0) {
      updatePortfolioWithPrices()
    }
  }, [portfolio, prices])

  const loadPortfolio = async () => {
    if (!user) return
    console.log(`📂 [Component] Loading portfolio for user ${user.id}`)
    setLoading(true)
    try {
      const data = await stockService.fetchPortfolio(user.id)
      console.log(`✅ [Component] Loaded ${data.length} holdings`)
      setPortfolio(data)
      setError(null)
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to load portfolio'
      console.error(`❌ [Component] Error loading portfolio:`, errorMsg, err)
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const isMarketOpen = () => {
    const now = new Date()
    const casablancaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Casablanca' }))
    
    const day = casablancaTime.getDay()
    const hour = casablancaTime.getHours()
    const minute = casablancaTime.getMinutes()
    const currentTime = hour * 60 + minute
    
    const marketOpen = 9 * 60 + 30
    const marketClose = 15 * 60 + 30
    
    const isWeekday = day >= 1 && day <= 5
    const isDuringHours = currentTime >= marketOpen && currentTime <= marketClose
    
    return isWeekday && isDuringHours
  }

  const updatePortfolioWithPrices = () => {
    console.log(`🔄 [Component] Updating portfolio with ${prices.size} prices`)
    const marketOpen = isMarketOpen()
    console.log(`📊 [Market Status] ${marketOpen ? '🟢 OPEN' : '🔴 CLOSED'}`)
    
    const updated = portfolio.map(holding => {
      const apiId = holding.casablanca_api_id?.toString()
      
      if (!apiId) {
        const fallbackValue = holding.total_quantity * holding.avg_buy_price
        return {
          ...holding,
          currentPrice: holding.avg_buy_price,
          currentValue: fallbackValue,
          totalGain: 0,
          totalGainPercent: 0,
          priceSource: 'fallback' as const
        }
      }
      
      const priceData = prices.get(apiId)

      if (priceData) {
        const currentPrice = priceData.currentPrice
        const currentValue = holding.total_quantity * currentPrice
        const totalGain = currentValue - holding.total_invested
        const totalGainPercent = holding.total_invested > 0 
          ? (totalGain / holding.total_invested) * 100 
          : 0

        const priceSource = marketOpen ? 'live' : 'api_closed'
        
        console.log(`💰 [${priceSource.toUpperCase()}] ${holding.symbol}: ${currentPrice} MAD x ${holding.total_quantity} = ${currentValue.toFixed(2)} MAD`)

        return {
          ...holding,
          currentPrice,
          priceChange: priceData.change,
          priceChangePercent: priceData.changePercent,
          currentValue,
          totalGain,
          totalGainPercent,
          lastUpdate: priceData.lastUpdate,
          priceSource
        }
      }

      console.error(`❌ [API FAILED] ${holding.symbol} (API ID: ${apiId})`)
      const fallbackValue = holding.total_quantity * holding.avg_buy_price
      
      return {
        ...holding,
        currentPrice: holding.avg_buy_price,
        currentValue: fallbackValue,
        totalGain: 0,
        totalGainPercent: 0,
        priceSource: 'fallback' as const
      }
    })

    setPortfolioWithPrices(updated)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeSinceRefresh = () => {
    const seconds = Math.floor((Date.now() - lastRefresh.getTime()) / 1000)
    if (seconds < 60) return `il y a ${seconds}s`
    const minutes = Math.floor(seconds / 60)
    return `il y a ${minutes}m`
  }

  const getPriceSourceLabel = (source: 'live' | 'api_closed' | 'fallback') => {
    switch (source) {
      case 'live':
        return { label: 'EN DIRECT', color: 'bg-green-500', icon: Wifi }
      case 'api_closed':
        return { label: 'CLÔTURE', color: 'bg-blue-500', icon: Clock }
      case 'fallback':
        return { label: 'HORS LIGNE', color: 'bg-gray-500', icon: WifiOff }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Chargement du portefeuille...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
          <div>
            <h3 className="font-semibold text-red-900 dark:text-red-100">
              Erreur de chargement
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
            <button
              onClick={loadPortfolio}
              className="mt-2 text-xs text-red-600 dark:text-red-400 underline hover:no-underline"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (portfolio.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full mx-auto mb-4">
          <Activity className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-2">
          Aucune action en portefeuille
        </h3>
        <p className="text-sm text-gray-500 dark:text-dark-300">
          Achetez vos premières actions pour voir les prix en temps réel
        </p>
      </div>
    )
  }

  const totalPortfolioValue = portfolioWithPrices.reduce((sum, p) => sum + (p.currentValue || 0), 0)
  const totalInvested = portfolioWithPrices.reduce((sum, p) => sum + p.total_invested, 0)
  const totalGain = totalPortfolioValue - totalInvested
  const totalGainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0
  
  const livePricesCount = portfolioWithPrices.filter(p => p.priceSource === 'live').length
  const closedPricesCount = portfolioWithPrices.filter(p => p.priceSource === 'api_closed').length
  const fallbackCount = portfolioWithPrices.filter(p => p.priceSource === 'fallback').length
  const apiPricesCount = livePricesCount + closedPricesCount

  const marketStatus = isMarketOpen()

  return (
    <div className="space-y-6">
      {/* Header avec stats globales */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 rounded-xl p-6 text-white shadow-lg border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Activity className="w-8 h-8" />
              {apiPricesCount > 0 && (
                <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                  marketStatus ? 'bg-green-400 animate-pulse' : 'bg-blue-400'
                }`}></div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold">Prix en Temps Réel</h2>
              <div className="flex items-center space-x-2 text-sm text-white/60">
                <Clock className="w-3 h-3" />
                <span>{getTimeSinceRefresh()}</span>
                <span>•</span>
                <span>Refresh #{fetchCount}</span>
                {lastEventSync && (
                  <>
                    <span>•</span>
                    <Zap className="w-3 h-3 text-yellow-300" />
                    <span className="text-yellow-300">Synchronisé</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={refresh}
            disabled={pricesLoading}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 relative group"
            title="Actualiser les prix"
          >
            <RefreshCw className={`w-5 h-5 ${pricesLoading ? 'animate-spin' : ''}`} />
            {pricesLoading && (
              <span className="absolute -bottom-8 right-0 text-xs bg-white/10 px-2 py-1 rounded whitespace-nowrap">
                Mise à jour...
              </span>
            )}
          </button>
        </div>

        {/* Indicateur de connexion */}
        <div className="mb-4 flex items-center space-x-2">
          {apiPricesCount > 0 ? (
            <>
              <Wifi className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-300">
                {apiPricesCount}/{portfolio.length} prix depuis l'API
                {livePricesCount > 0 && ` (${livePricesCount} en direct)`}
              </span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-red-400" />
              <span className="text-xs text-red-300">
                Aucun prix disponible depuis l'API
              </span>
            </>
          )}
          {fallbackCount > 0 && (
            <>
              <span className="text-white/40">•</span>
              <AlertCircle className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-yellow-300">
                {fallbackCount} prix d'achat utilisés
              </span>
            </>
          )}
        </div>

        {/* Stats globales */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
            <p className="text-xs text-white/60 uppercase tracking-wider mb-1">
              Valeur Totale
            </p>
            <p className="text-2xl font-bold">{formatCurrency(totalPortfolioValue)} MAD</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
            <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Investi</p>
            <p className="text-2xl font-bold">{formatCurrency(totalInvested)} MAD</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Gain/Perte</p>
                <p className={`text-2xl font-bold ${totalGain >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {totalGain >= 0 ? '+' : ''}{formatCurrency(totalGain)} MAD
                </p>
                <p className={`text-sm ${totalGain >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {totalGain >= 0 ? '+' : ''}{totalGainPercent.toFixed(2)}%
                </p>
              </div>
              {totalGain >= 0 ? (
                <TrendingUp className="w-6 h-6 text-green-300" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-300" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Liste des actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {portfolioWithPrices.map((holding) => {
          const isProfit = (holding.totalGain || 0) >= 0
          const sourceInfo = getPriceSourceLabel(holding.priceSource)
          const SourceIcon = sourceInfo.icon

          return (
            <div
              key={`${holding.symbol}-${holding.bank_id}`}
              className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-md hover:shadow-xl transition-all duration-300"
            >
              {/* Badge source du prix */}
              <div className={`absolute top-3 right-3 flex items-center space-x-1 ${sourceInfo.color} text-white px-2 py-1 rounded-full text-xs font-semibold`}>
                {holding.priceSource === 'live' && (
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
                {holding.priceSource !== 'live' && (
                  <SourceIcon className="w-3 h-3" />
                )}
                <span>{sourceInfo.label}</span>
              </div>

              {/* Header */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  {holding.company_name}
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium rounded">
                    {holding.symbol}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {holding.total_quantity} actions
                  </span>
                </div>
              </div>

              {/* Prix actuel */}
              <div className="mb-4 pb-4 border-b border-gray-200 dark:border-slate-700">
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(holding.currentPrice || 0)}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">MAD</span>
                </div>
                {holding.priceChange !== undefined && holding.priceSource !== 'fallback' && (
                  <div className="flex items-center space-x-2 mt-1">
                    {holding.priceChange >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                    )}
                    <span className={`text-sm font-medium ${
                      holding.priceChange >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {holding.priceChange >= 0 ? '+' : ''}{formatCurrency(holding.priceChange)} 
                      ({holding.priceChange >= 0 ? '+' : ''}{holding.priceChangePercent?.toFixed(2)}%)
                    </span>
                  </div>
                )}
                {holding.priceSource === 'fallback' && (
                  <div className="flex items-center space-x-1 mt-1 text-xs text-yellow-600 dark:text-yellow-400">
                    <AlertCircle className="w-3 h-3" />
                    <span>Prix d'achat utilisé</span>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Prix d'achat moyen</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(holding.avg_buy_price)} MAD
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Valeur actuelle</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(holding.currentValue || 0)} MAD
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Investi</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(holding.total_invested)} MAD
                  </span>
                </div>
              </div>

              {/* Gain/Perte */}
              <div className={`p-3 rounded-lg ${
                isProfit
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {isProfit ? 'Gain' : 'Perte'}
                  </span>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      isProfit
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {isProfit ? '+' : ''}{formatCurrency(holding.totalGain || 0)} MAD
                    </p>
                    <p className={`text-xs ${
                      isProfit
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {isProfit ? '+' : ''}{holding.totalGainPercent?.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Dernière mise à jour */}
              {holding.lastUpdate && holding.priceSource !== 'fallback' && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 text-center">
                  Actualisé: {formatDateTime(holding.lastUpdate)}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* Message d'erreur des prix */}
      {pricesError && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                Certains prix n'ont pas pu être récupérés
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                {pricesError}
              </p>
              <button
                onClick={refresh}
                className="mt-2 text-xs text-yellow-600 dark:text-yellow-400 underline hover:no-underline"
              >
                Réessayer maintenant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}