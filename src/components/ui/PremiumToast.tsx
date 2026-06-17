import { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { toast, ToastItem, ToastVariant } from '../../lib/toast'

const VARIANT_CONFIG: Record<ToastVariant, { icon: React.FC<any>; color: string; bgColor: string }> = {
  success: { icon: CheckCircle2, color: '#0ECB81', bgColor: 'rgba(14,203,129,0.1)' },
  error:   { icon: XCircle,      color: '#F6465D', bgColor: 'rgba(246,70,93,0.1)' },
  warning: { icon: AlertTriangle, color: '#F59E0B', bgColor: 'rgba(245,158,11,0.1)' },
  info:    { icon: Info,          color: '#818CF8', bgColor: 'rgba(129,140,248,0.1)' },
}

function ToastCard({ item, onRemove }: { item: ToastItem; onRemove: () => void }) {
  const cfg = VARIANT_CONFIG[item.variant]
  const Icon = cfg.icon

  useEffect(() => {
    const t = setTimeout(onRemove, item.duration)
    return () => clearTimeout(t)
  }, [item.duration, onRemove])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 56, scale: 0.94 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 56, scale: 0.9, transition: { duration: 0.18 } }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="relative overflow-hidden"
      style={{
        width: '340px',
        background: 'linear-gradient(145deg, #1a1d21 0%, #161b22 100%)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderLeft: `3px solid ${cfg.color}`,
        borderRadius: '14px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.25)',
      }}
    >
      <div className="flex items-start gap-3 p-4 pr-10">
        <div
          className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center mt-0.5"
          style={{ background: cfg.bgColor }}
        >
          <Icon className="w-4.5 h-4.5" style={{ color: cfg.color, width: 18, height: 18 }} />
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="font-semibold text-sm leading-snug" style={{ color: '#EAECEF' }}>
            {item.title}
          </p>
          {item.message && (
            <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#848E9C' }}>
              {item.message}
            </p>
          )}
        </div>
      </div>

      <button
        onClick={onRemove}
        className="absolute top-3 right-3 w-6 h-6 rounded-lg flex items-center justify-center transition-all"
        style={{ color: '#5a6272' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#EAECEF' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#5a6272' }}
      >
        <X style={{ width: 12, height: 12 }} />
      </button>

      <motion.div
        className="absolute bottom-0 left-0 h-[2px]"
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: item.duration / 1000, ease: 'linear' }}
        style={{ background: cfg.color, opacity: 0.4 }}
      />
    </motion.div>
  )
}

export function PremiumToastContainer() {
  const [items, setItems] = useState<ToastItem[]>([])

  useEffect(() => {
    return toast._on(item => setItems(prev => [item, ...prev].slice(0, 5)))
  }, [])

  const remove = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }, [])

  return createPortal(
    <div
      className="fixed z-[9999] flex flex-col gap-3"
      style={{ top: '1rem', right: '1rem' }}
    >
      <AnimatePresence initial={false}>
        {items.map(item => (
          <ToastCard key={item.id} item={item} onRemove={() => remove(item.id)} />
        ))}
      </AnimatePresence>
    </div>,
    document.body
  )
}
