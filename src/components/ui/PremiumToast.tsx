import { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { toast, ToastItem, ToastVariant } from '../../lib/toast'

const CFG: Record<ToastVariant, { icon: React.FC<any>; color: string; glow: string; label: string }> = {
  success: { icon: CheckCircle2,  color: '#10d987', glow: 'rgba(16,217,135,0.30)',  label: 'Success' },
  error:   { icon: XCircle,       color: '#f64f62', glow: 'rgba(246,79,98,0.30)',   label: 'Error'   },
  warning: { icon: AlertTriangle, color: '#f59e0b', glow: 'rgba(245,158,11,0.30)',  label: 'Warning' },
  info:    { icon: Info,          color: '#818cf8', glow: 'rgba(129,140,248,0.30)', label: 'Info'    },
}

function ToastCard({ item, onRemove }: { item: ToastItem; onRemove: () => void }) {
  const cfg = CFG[item.variant]
  const Icon = cfg.icon

  useEffect(() => {
    const t = setTimeout(onRemove, item.duration)
    return () => clearTimeout(t)
  }, [item.duration, onRemove])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 72, scale: 0.85, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: 48, scale: 0.88, filter: 'blur(4px)', transition: { duration: 0.2, ease: 'easeIn' } }}
      transition={{ type: 'spring', stiffness: 360, damping: 26 }}
      className="relative"
      style={{ minWidth: 290, maxWidth: 360 }}
    >
      {/* Main card */}
      <div
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(140deg, rgba(20,22,30,0.98) 0%, rgba(12,14,20,0.98) 100%)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '22px',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          boxShadow: [
            'inset 0 1px 0 rgba(255,255,255,0.06)',
            '0 4px 20px rgba(0,0,0,0.55)',
            '0 16px 48px rgba(0,0,0,0.40)',
            `0 32px 80px ${cfg.glow}`,
            `0 48px 100px ${cfg.glow}`,
          ].join(', '),
        }}
      >
        {/* Top shimmer line */}
        <div
          className="absolute top-0 left-8 right-8 h-px pointer-events-none"
          style={{
            background: `linear-gradient(90deg, transparent, ${cfg.color}70, transparent)`,
          }}
        />

        <div className="flex items-center gap-3 px-4 py-3.5 pr-11">
          {/* Icon badge */}
          <div
            className="flex-shrink-0 w-9 h-9 rounded-[14px] flex items-center justify-center"
            style={{
              background: `radial-gradient(circle at 35% 35%, ${cfg.color}30, ${cfg.color}0a)`,
              border: `1px solid ${cfg.color}35`,
              boxShadow: `0 0 16px ${cfg.color}20`,
            }}
          >
            <Icon style={{ color: cfg.color, width: 17, height: 17 }} />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm leading-snug" style={{ color: 'rgba(235,238,245,0.95)' }}>
              {item.title}
            </p>
            {item.message && (
              <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.38)' }}>
                {item.message}
              </p>
            )}
          </div>
        </div>

        {/* Dismiss button */}
        <button
          onClick={onRemove}
          className="absolute top-3 right-3 w-6 h-6 rounded-xl flex items-center justify-center transition-all"
          style={{ color: 'rgba(255,255,255,0.25)' }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
            e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'rgba(255,255,255,0.25)'
          }}
        >
          <X style={{ width: 11, height: 11 }} />
        </button>

        {/* Timer track */}
        <div className="mx-4 mb-3 h-[2px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <motion.div
            className="h-full rounded-full"
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: item.duration / 1000, ease: 'linear' }}
            style={{ background: `linear-gradient(90deg, ${cfg.color}50, ${cfg.color})` }}
          />
        </div>
      </div>

      {/* Glow puddle underneath */}
      <div
        className="absolute -bottom-3 left-1/2 pointer-events-none"
        style={{
          transform: 'translateX(-50%)',
          width: '70%',
          height: '28px',
          background: cfg.glow,
          filter: 'blur(18px)',
          borderRadius: '50%',
        }}
      />
    </motion.div>
  )
}

export function PremiumToastContainer() {
  const [items, setItems] = useState<ToastItem[]>([])

  useEffect(() => {
    return toast._on(item => setItems(prev => [...prev, item].slice(-5)))
  }, [])

  const remove = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }, [])

  return createPortal(
    <div
      className="fixed z-[9999] flex flex-col-reverse items-center gap-2.5"
      style={{
        bottom: '1.75rem',
        left: '50%',
        transform: 'translateX(-50%)',
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence initial={false} mode="sync">
        {items.map(item => (
          <div key={item.id} style={{ pointerEvents: 'auto' }}>
            <ToastCard item={item} onRemove={() => remove(item.id)} />
          </div>
        ))}
      </AnimatePresence>
    </div>,
    document.body
  )
}
