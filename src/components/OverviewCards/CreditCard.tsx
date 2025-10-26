import { useState, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Autoplay } from 'swiper/modules'
import { Wallet, Eye, EyeOff, Building2 } from 'lucide-react'
import { Bank } from '../../lib/supabase'

import 'swiper/css'
import 'swiper/css/pagination'

interface CreditCardProps {
  totalBalance: number
  banksCount: number
  banks: Bank[]
}

const getCardGradient = (index: number) => {
  const gradients = [
    'bg-gradient-to-br from-slate-900 to-blue-900', // Deep Navy
    'bg-gradient-to-br from-burgundy-900 to-burgundy-700', // Burgundy
    'bg-gradient-to-br from-emerald-900 to-emerald-700', // Forest Green
    'bg-gradient-to-br from-gray-900 to-gray-700' // Charcoal
  ]
  return gradients[index % gradients.length]
}

function CreditCard({ totalBalance, banksCount, banks }: CreditCardProps) {
  const [showTotalBalance, setShowTotalBalance] = useState(false)
  const [hiddenBalances, setHiddenBalances] = useState<Set<string>>(new Set())

  // Hide all balances by default when banks change
  useEffect(() => {
    const initialHidden = new Set(banks.map(b => b.id))
    setHiddenBalances(initialHidden)
  }, [banks])

  const toggleBankBalance = (bankId: string) => {
    setHiddenBalances(prev => {
      const newSet = new Set(prev)
      newSet.has(bankId) ? newSet.delete(bankId) : newSet.add(bankId)
      return newSet
    })
  }

  return (
    <div className="w-full space-y-6">
      {/* Total Balance Header */}
      <div className="rounded-2xl p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-300 font-medium">Total Balance</p>
              <div className="flex items-center space-x-2">
                <h2
                  className={`text-2xl sm:text-3xl font-bold transition-all duration-300 ${showTotalBalance ? 'blur-0' : 'blur-sm select-none'
                    } ${showTotalBalance ? 'text-gray-900 dark:text-white' : 'text-gray-900/60 dark:text-white/60'}`}
                >
                  {showTotalBalance
                    ? totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : '•••••••'}
                </h2>
                <span className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">MAD</span>

              </div>
              <p className="text-xs text-gray-400 mt-1">
                Across {banksCount} bank{banksCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowTotalBalance(!showTotalBalance)}
            className="p-2 sm:p-3 hover:bg-white/10 rounded-xl transition-colors"
            title={showTotalBalance ? 'Hide balance' : 'Show balance'}
          >
            {showTotalBalance ? (
              <EyeOff className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300" />
            ) : (
              <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300" />
            )}
          </button>
        </div>
      </div>

      {/* Bank Cards Swiper */}
      {banks.length > 0 && (
        <div className="relative">
          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            pagination={{ clickable: true }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="!pb-12"
          >
            {banks.map((bank, index) => {
              const gradient = getCardGradient(index)
              const isBalanceHidden = hiddenBalances.has(bank.id)

              return (
                <SwiperSlide key={bank.id}>
                  <div className="relative">
                    <div
                      className={`relative w-full h-48 bg-gradient-to-br ${gradient} rounded-2xl border border-white/10 overflow-hidden`}
                    >
                      {/* Animated gradient light effect */}
                      <div className="absolute inset-0 opacity-20">
                        <div className="absolute w-[150%] h-[150%] -left-1/4 -top-1/4 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_0%,transparent_70%)] animate-pulse"></div>
                      </div>

                      {/* Top Section */}
                      <div className="absolute top-4 left-6 right-6 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {bank.logo ? (
                            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center p-1">
                              <img src={bank.logo} alt={bank.name} className="w-full h-full object-contain" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                              <Building2 className="w-4 h-4 text-white" />
                            </div>
                          )}
                          <div>
                            <p className="text-white/90 text-sm font-medium">{bank.name}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => toggleBankBalance(bank.id)}
                          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors z-10"
                          title={isBalanceHidden ? 'Show balance' : 'Hide balance'}
                        >
                          {isBalanceHidden ? (
                            <EyeOff className="w-4 h-4 text-white/70 hover:text-white" />
                          ) : (
                            <Eye className="w-4 h-4 text-white/70 hover:text-white" />
                          )}
                        </button>
                      </div>

                      {/* Balance Section */}
                      <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2">
                        <p className="text-white/70 text-xs uppercase tracking-wider mb-1">Available Balance</p>
                        {isBalanceHidden ? (
                          <h3 className="text-2xl font-bold text-white">
                            ••••••• <span className="text-sm font-medium text-white/80">MAD</span>
                          </h3>
                        ) : (
                          <h3 className="text-2xl font-bold text-white">
                            {Number(bank.balance).toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}{' '}
                            <span className="text-sm font-medium text-white/80">MAD</span>
                          </h3>
                        )}
                      </div>

                      {/* Hover light sweep */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000 ease-in-out"></div>
                    </div>
                  </div>
                </SwiperSlide>
              )
            })}
          </Swiper>
        </div>
      )}
    </div>
  )
}

export { CreditCard }
