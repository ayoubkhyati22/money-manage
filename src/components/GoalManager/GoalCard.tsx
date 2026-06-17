import { Goal } from '../../lib/supabase'
import { Calendar, Eye, EyeOff, Sparkles, ChevronRight, Target, Clock } from 'lucide-react'
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

const catCfg: Record<string, { grad: string; ring: string; glow: string; bar: string }> = {
  Personal:   { grad: 'from-violet-600 via-indigo-600 to-indigo-700',  ring: '#c4b5fd', glow: 'rgba(124,58,237,.22)',  bar: 'from-violet-400 via-indigo-400 to-indigo-500'  },
  Family:     { grad: 'from-pink-600 via-rose-600 to-rose-700',         ring: '#fbcfe8', glow: 'rgba(219,39,119,.22)',  bar: 'from-pink-400 via-rose-400 to-rose-500'        },
  Investment: { grad: 'from-amber-500 via-orange-500 to-orange-600',    ring: '#fcd34d', glow: 'rgba(245,158,11,.22)',  bar: 'from-amber-300 via-amber-400 to-orange-500'    },
  Emergency:  { grad: 'from-red-600 via-red-700 to-rose-800',           ring: '#fca5a5', glow: 'rgba(220,38,38,.22)',   bar: 'from-red-400 via-red-500 to-rose-600'          },
  Travel:     { grad: 'from-sky-500 via-blue-600 to-blue-700',          ring: '#7dd3fc', glow: 'rgba(14,165,233,.22)',  bar: 'from-sky-300 via-sky-400 to-blue-500'          },
  Education:  { grad: 'from-indigo-600 via-violet-700 to-purple-800',   ring: '#a5b4fc', glow: 'rgba(99,102,241,.22)',  bar: 'from-indigo-400 via-violet-500 to-purple-600'  },
  Health:     { grad: 'from-emerald-500 via-teal-600 to-teal-700',      ring: '#6ee7b7', glow: 'rgba(16,185,129,.22)',  bar: 'from-emerald-300 via-teal-400 to-teal-500'     },
  Other:      { grad: 'from-slate-600 via-slate-700 to-slate-800',      ring: '#cbd5e1', glow: 'rgba(100,116,139,.22)', bar: 'from-slate-400 via-slate-400 to-slate-500'     },
}
const defCfg  = { grad: 'from-primary-600 via-primary-700 to-accent-700', ring: '#a5b4fc', glow: 'rgba(79,70,229,.22)',  bar: 'from-primary-400 via-primary-500 to-accent-500' }
const doneCfg = { grad: 'from-emerald-500 via-teal-600 to-cyan-700',       ring: '#6ee7b7', glow: 'rgba(16,185,129,.28)', bar: 'from-emerald-300 via-teal-400 to-cyan-400'     }

export function GoalCard({
  goal, index, currentAmount, showAmounts: globalShow,
  onEdit, onDelete, onAddMoney, onManageAllocations, onViewDetails,
}: GoalCardProps) {
  const [localShow, setLocalShow] = useState<boolean | null>(null)
  const showAmount = localShow !== null ? localShow : globalShow

  const progress    = goal.target_amount ? Math.min((currentAmount / goal.target_amount) * 100, 100) : 0
  const isCompleted = progress >= 100
  const cfg         = isCompleted ? doneCfg : (catCfg[goal.category ?? ''] ?? defCfg)
  const daysLeft    = goal.target_date ? differenceInDays(new Date(goal.target_date), new Date()) : null
  const remaining   = goal.target_amount ? Math.max(Number(goal.target_amount) - currentAmount, 0) : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, ease: 'easeOut' }}
      onClick={onViewDetails}
      whileHover={{ y: -4, scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      className={`rounded-2xl overflow-hidden ${onViewDetails ? 'cursor-pointer' : ''}`}
      style={{ boxShadow: `0 2px 8px rgba(0,0,0,.08), 0 16px 48px ${cfg.glow}` }}
    >

      {/* ── Gradient header ────────────────────────────────────────────── */}
      <div className={`relative bg-gradient-to-br ${cfg.grad} px-4 pt-3 pb-3 overflow-hidden`}>
        {/* Decorative blobs */}
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-10 -left-6 w-28 h-28 rounded-full bg-black/10 pointer-events-none" />

        {/* Top row: category badge + visibility toggle */}
        <div className="relative z-10 flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-bold uppercase tracking-widest text-white/75 bg-white/15 px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/15">
              {goal.category || 'General'}
            </span>
            {isCompleted && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: index * 0.07 + 0.3 }}
                className="flex items-center gap-0.5 text-[9px] font-bold text-amber-300 bg-amber-400/20 px-1.5 py-0.5 rounded-full border border-amber-400/30"
              >
                <Sparkles className="w-2 h-2" /> Done
              </motion.span>
            )}
          </div>
          <button
            onClick={e => { e.stopPropagation(); setLocalShow(v => v === null ? !globalShow : !v) }}
            className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/30 active:bg-white/40 flex items-center justify-center transition-all text-white border border-white/15"
            style={{ minWidth: 28, minHeight: 28 }}
          >
            {showAmount ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </button>
        </div>

        {/* Goal name + percentage inline */}
        <div className="relative z-10 flex items-center justify-between gap-2">
          <p className="text-base font-extrabold text-white leading-tight line-clamp-1 tracking-tight flex-1">
            {goal.name}
          </p>
          {goal.target_amount && (
            <p className="text-lg font-extrabold tabular-nums leading-none shrink-0" style={{ color: cfg.ring }}>
              {progress.toFixed(0)}<span className="text-xs font-semibold text-white/55">%</span>
            </p>
          )}
        </div>

        {/* Saved amount */}
        <div className="relative z-10 mt-1.5">
          <p className="text-[8px] font-bold uppercase tracking-widest text-white/50 mb-0.5">Saved</p>
          {showAmount ? (
            <p className="text-lg font-extrabold text-white tabular-nums leading-none">
              {currentAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              <span className="text-xs font-semibold text-white/55 ml-1">MAD</span>
            </p>
          ) : (
            <div className="flex items-center gap-1 h-6">
              {[...Array(4)].map((_, i) => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-white/30" />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Progress bar bridge ─────────────────────────────────────────── */}
      {goal.target_amount && (
        <div className="relative h-[5px] bg-slate-100 dark:bg-slate-700/80">
          <motion.div
            className={`h-full bg-gradient-to-r ${cfg.bar}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.3, ease: [0.25, 0.46, 0.45, 0.94], delay: index * 0.07 }}
            style={{ boxShadow: `0 0 14px ${cfg.ring}70, 0 0 4px ${cfg.ring}50` }}
          />
        </div>
      )}

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800/90 px-4 pt-3 pb-3">

        {/* Stats row */}
        {(goal.target_amount || daysLeft !== null) && (
          <div className="flex items-stretch gap-0 mb-3">
            {goal.target_amount && (
              <div className="flex-1">
                <div className="flex items-center gap-1 mb-0.5">
                  <Target className="w-2.5 h-2.5 text-slate-400" />
                  <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Target</p>
                </div>
                {showAmount ? (
                  <p className="text-xs font-bold text-slate-800 dark:text-white tabular-nums">
                    {Number(goal.target_amount).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    <span className="text-[9px] font-normal text-slate-400 ml-0.5">MAD</span>
                  </p>
                ) : (
                  <div className="flex items-center gap-1 h-4">
                    {[...Array(3)].map((_, i) => <span key={i} className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-600" />)}
                  </div>
                )}
              </div>
            )}

            {goal.target_amount && remaining !== null && showAmount && (
              <>
                <div className="w-px bg-slate-100 dark:bg-slate-700 mx-2 self-stretch" />
                <div className="flex-1">
                  <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Left</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-white tabular-nums">
                    {remaining.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    <span className="text-[9px] font-normal text-slate-400 ml-0.5">MAD</span>
                  </p>
                </div>
              </>
            )}

            {daysLeft !== null && (
              <>
                {goal.target_amount && (
                  <div className="w-px bg-slate-100 dark:bg-slate-700 mx-2 self-stretch" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-0.5">
                    <Clock className="w-2.5 h-2.5 text-slate-400" />
                    <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400">
                      {daysLeft < 0 ? 'Overdue' : 'Days left'}
                    </p>
                  </div>
                  <p className={`text-xs font-bold tabular-nums ${
                    daysLeft < 0 ? 'text-red-500' : daysLeft < 30 ? 'text-amber-500' : 'text-slate-800 dark:text-white'
                  }`}>
                    {Math.abs(daysLeft)}
                    <span className="text-[9px] font-normal text-slate-400 ml-0.5">d</span>
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-700/50">
          {goal.target_date ? (
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <Calendar className="w-2.5 h-2.5 flex-shrink-0" />
              {format(new Date(goal.target_date), 'MMM dd, yyyy')}
            </div>
          ) : (
            <span className="text-[10px] text-slate-400">Open-ended</span>
          )}
          <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600" />
        </div>
      </div>
    </motion.div>
  )
}
