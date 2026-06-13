import { Goal } from '../../lib/supabase'
import { Calendar, Eye, EyeOff, Sparkles, ChevronRight } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import { motion } from 'framer-motion'
import { useState } from 'react'

interface GoalCardProps {
  goal: Goal
  index: number
  currentAmount: number
  showAmounts: boolean
  onEdit: () => void
  onDelete: () => void
  onAddMoney: () => void
  onManageAllocations: () => void
  onViewDetails?: () => void
}

// Per-category config: gradient, ring color, glow, accent
const catCfg: Record<string, { grad: string; ring: string; glow: string; bar: string }> = {
  Personal:   { grad: 'from-violet-600 via-indigo-600 to-indigo-700',  ring: '#c4b5fd', glow: 'rgba(124,58,237,.18)',  bar: 'from-violet-500 to-indigo-500'  },
  Family:     { grad: 'from-pink-600 via-rose-600 to-rose-700',         ring: '#fbcfe8', glow: 'rgba(219,39,119,.18)',  bar: 'from-pink-500 to-rose-500'      },
  Investment: { grad: 'from-amber-500 via-orange-500 to-orange-600',    ring: '#fcd34d', glow: 'rgba(245,158,11,.18)',  bar: 'from-amber-400 to-orange-500'   },
  Emergency:  { grad: 'from-red-600 via-red-700 to-rose-800',           ring: '#fca5a5', glow: 'rgba(220,38,38,.18)',   bar: 'from-red-500 to-rose-600'       },
  Travel:     { grad: 'from-sky-500 via-blue-600 to-blue-700',          ring: '#7dd3fc', glow: 'rgba(14,165,233,.18)',  bar: 'from-sky-400 to-blue-500'       },
  Education:  { grad: 'from-indigo-600 via-violet-700 to-purple-800',   ring: '#a5b4fc', glow: 'rgba(99,102,241,.18)',  bar: 'from-indigo-500 to-violet-600'  },
  Health:     { grad: 'from-emerald-500 via-teal-600 to-teal-700',      ring: '#6ee7b7', glow: 'rgba(16,185,129,.18)',  bar: 'from-emerald-400 to-teal-500'   },
  Other:      { grad: 'from-slate-600 via-slate-700 to-slate-800',      ring: '#cbd5e1', glow: 'rgba(100,116,139,.18)', bar: 'from-slate-400 to-slate-500'    },
}
const defCfg  = { grad: 'from-primary-600 via-primary-700 to-accent-700', ring: '#a5b4fc', glow: 'rgba(79,70,229,.18)', bar: 'from-primary-500 to-accent-500' }
const doneCfg = { grad: 'from-emerald-500 via-teal-600 to-cyan-700',       ring: '#6ee7b7', glow: 'rgba(16,185,129,.22)', bar: 'from-emerald-400 to-cyan-400'  }

const R = 24, CIRC = 2 * Math.PI * R

export function GoalCard({
  goal, index, currentAmount, showAmounts: globalShow,
  onEdit, onDelete, onAddMoney, onManageAllocations, onViewDetails,
}: GoalCardProps) {
  const [localShow, setLocalShow] = useState<boolean | null>(null)
  const showAmount = localShow !== null ? localShow : globalShow

  const progress    = goal.target_amount ? Math.min((currentAmount / goal.target_amount) * 100, 100) : 0
  const isCompleted = progress >= 100
  const cfg         = isCompleted ? doneCfg : (catCfg[goal.category ?? ''] ?? defCfg)
  const dashOffset  = CIRC * (1 - progress / 100)
  const daysLeft    = goal.target_date ? differenceInDays(new Date(goal.target_date), new Date()) : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, ease: 'easeOut' }}
      onClick={onViewDetails}
      whileHover={{ y: -2 }}
      className={`rounded-2xl overflow-hidden ${onViewDetails ? 'cursor-pointer' : ''}`}
      style={{ boxShadow: `0 2px 0 0 rgba(0,0,0,.06), 0 8px 32px ${cfg.glow}` }}
    >

      {/* ── Gradient header ───────────────────────────────────────────────── */}
      <div className={`relative bg-gradient-to-br ${cfg.grad} px-4 pt-4 pb-5 overflow-hidden`}>
        {/* Decorative blobs */}
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-8 -left-4 w-24 h-24 rounded-full bg-white/8 pointer-events-none" />

        {/* Top row */}
        <div className="relative z-10 flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/60 bg-white/15 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
              {goal.category || 'General'}
            </span>
            {isCompleted && (
              <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-full">
                <Sparkles className="w-2.5 h-2.5" /> Done
              </span>
            )}
          </div>
          <button
            onClick={e => { e.stopPropagation(); setLocalShow(v => v === null ? !globalShow : !v) }}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center transition-colors text-white flex-shrink-0"
            style={{ minWidth: 32, minHeight: 32 }}
          >
            {showAmount ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Name + ring row */}
        <div className="relative z-10 flex items-end justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-lg font-bold text-white leading-tight line-clamp-2 mb-1">{goal.name}</p>

            {/* Saved amount */}
            {showAmount ? (
              <p className="text-white/90 text-sm font-semibold tabular-nums">
                {currentAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                <span className="text-white/50 font-normal text-xs ml-1">MAD</span>
              </p>
            ) : (
              <div className="flex items-center gap-1 h-5">
                {[...Array(4)].map((_, i) => <span key={i} className="w-1.5 h-1.5 rounded-full bg-white/30" />)}
              </div>
            )}
          </div>

          {/* Mini progress ring */}
          {goal.target_amount ? (
            <div className="relative flex-shrink-0" style={{ width: 60, height: 60 }}>
              <svg width="60" height="60" viewBox="0 0 64 64" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="32" cy="32" r={R} fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="6" />
                <motion.circle
                  cx="32" cy="32" r={R}
                  fill="none" stroke={cfg.ring} strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={CIRC}
                  initial={{ strokeDashoffset: CIRC }}
                  animate={{ strokeDashoffset: dashOffset }}
                  transition={{ duration: 1, ease: 'easeOut', delay: index * 0.07 + 0.1 }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-white leading-none">{progress.toFixed(0)}%</span>
              </div>
            </div>
          ) : (
            <ChevronRight className="w-5 h-5 text-white/40 flex-shrink-0 mb-1" />
          )}
        </div>
      </div>

      {/* ── Data section ─────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800/90 px-4 pt-3 pb-4">

        {/* Stat columns (target / days) */}
        {(goal.target_amount || daysLeft !== null) && (
          <div className="flex items-center gap-4 mb-3">
            {goal.target_amount && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Target</p>
                {showAmount ? (
                  <p className="text-sm font-bold text-slate-800 dark:text-white tabular-nums">
                    {Number(goal.target_amount).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    <span className="text-xs font-normal text-slate-400 ml-0.5">MAD</span>
                  </p>
                ) : (
                  <div className="flex items-center gap-1 h-5">
                    {[...Array(3)].map((_, i) => <span key={i} className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-600" />)}
                  </div>
                )}
              </div>
            )}
            {goal.target_amount && daysLeft !== null && (
              <div className="w-px h-8 bg-slate-100 dark:bg-slate-700" />
            )}
            {daysLeft !== null && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  {daysLeft < 0 ? 'Overdue' : 'Remaining'}
                </p>
                <p className={`text-sm font-bold tabular-nums ${
                  daysLeft < 0 ? 'text-red-500' : daysLeft < 30 ? 'text-amber-500' : 'text-slate-800 dark:text-white'
                }`}>
                  {Math.abs(daysLeft)}
                  <span className="text-xs font-normal text-slate-400 ml-0.5">d</span>
                </p>
              </div>
            )}
            {!goal.target_amount && daysLeft === null && null}
          </div>
        )}

        {/* Progress bar */}
        {goal.target_amount && (
          <div className="mb-3">
            <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full bg-gradient-to-r ${cfg.bar}`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: index * 0.07 }}
              />
            </div>
          </div>
        )}

        {/* Footer: date */}
        <div className="flex items-center justify-between">
          {goal.target_date ? (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Calendar className="w-3 h-3 flex-shrink-0" />
              {format(new Date(goal.target_date), 'MMM dd, yyyy')}
            </div>
          ) : (
            <span className="text-xs text-slate-400">Open-ended</span>
          )}

          <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
        </div>
      </div>
    </motion.div>
  )
}
