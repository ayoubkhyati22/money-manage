import { useEffect, useRef, useState, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2, XCircle, AlertTriangle, Info,
  HelpCircle, Trash2, Loader2,
} from 'lucide-react'
import type { ModalConfig, ModalResult, ModalVariant } from '../../lib/alert'

type BtnColor = 'green' | 'red' | 'blue' | 'yellow' | 'gray'

const BTN_COLORS: Record<BtnColor, { bg: string; hover: string; text: string }> = {
  green:  { bg: '#0ECB81', hover: '#0AB574', text: '#fff' },
  red:    { bg: '#F6465D', hover: '#E03350', text: '#fff' },
  blue:   { bg: '#6366F1', hover: '#4F46E5', text: '#fff' },
  yellow: { bg: '#F59E0B', hover: '#D97706', text: '#fff' },
  gray:   { bg: 'rgba(255,255,255,0.07)', hover: 'rgba(255,255,255,0.12)', text: '#848E9C' },
}

const VARIANT_CFG: Record<ModalVariant, {
  icon: React.FC<any>
  color: string
  bgColor: string
  ringColor: string
  btnBg: string
  btnHover: string
  spin?: boolean
}> = {
  success: { icon: CheckCircle2,  color: '#0ECB81', bgColor: 'rgba(14,203,129,0.1)',  ringColor: 'rgba(14,203,129,0.15)',  btnBg: '#0ECB81', btnHover: '#0AB574' },
  error:   { icon: XCircle,       color: '#F6465D', bgColor: 'rgba(246,70,93,0.1)',   ringColor: 'rgba(246,70,93,0.15)',   btnBg: '#F6465D', btnHover: '#E03350' },
  warning: { icon: AlertTriangle, color: '#F59E0B', bgColor: 'rgba(245,158,11,0.1)',  ringColor: 'rgba(245,158,11,0.15)',  btnBg: '#F59E0B', btnHover: '#D97706' },
  info:    { icon: Info,          color: '#818CF8', bgColor: 'rgba(129,140,248,0.1)', ringColor: 'rgba(129,140,248,0.15)', btnBg: '#6366F1', btnHover: '#4F46E5' },
  confirm: { icon: HelpCircle,    color: '#818CF8', bgColor: 'rgba(129,140,248,0.1)', ringColor: 'rgba(129,140,248,0.15)', btnBg: '#6366F1', btnHover: '#4F46E5' },
  delete:  { icon: Trash2,        color: '#F6465D', bgColor: 'rgba(246,70,93,0.1)',   ringColor: 'rgba(246,70,93,0.15)',   btnBg: '#F6465D', btnHover: '#E03350' },
  loading: { icon: Loader2,       color: '#818CF8', bgColor: 'rgba(129,140,248,0.1)', ringColor: 'rgba(129,140,248,0.15)', btnBg: '#6366F1', btnHover: '#4F46E5', spin: true },
  input:   { icon: Info,          color: '#818CF8', bgColor: 'rgba(129,140,248,0.1)', ringColor: 'rgba(129,140,248,0.15)', btnBg: '#6366F1', btnHover: '#4F46E5' },
  multi:   { icon: HelpCircle,    color: '#818CF8', bgColor: 'rgba(129,140,248,0.1)', ringColor: 'rgba(129,140,248,0.15)', btnBg: '#0ECB81', btnHover: '#0AB574' },
}

function HoverBtn({
  onClick, bg, hover, text, children, border,
}: {
  onClick: () => void
  bg: string
  hover: string
  text: string
  children: ReactNode
  border?: string
}) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="flex-1 h-11 rounded-xl font-semibold text-sm transition-all duration-150 flex items-center justify-center gap-2"
      style={{
        background: hov ? hover : bg,
        color: text,
        border: border || 'none',
      }}
    >
      {children}
    </button>
  )
}

interface PremiumModalProps {
  config: ModalConfig | null
  onResult: (r: ModalResult) => void
}

export function PremiumModal({ config, onResult }: PremiumModalProps) {
  const [inputVal, setInputVal] = useState('')
  const [inputErr, setInputErr] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!config) return
    setInputVal(config.input?.defaultValue ?? '')
    setInputErr(null)
    if (config.variant === 'input') {
      setTimeout(() => inputRef.current?.focus(), 120)
    }
  }, [config])

  useEffect(() => {
    if (!config?.timer) return
    const t = setTimeout(() => onResult({ confirmed: true, denied: false, dismissed: false }), config.timer)
    return () => clearTimeout(t)
  }, [config, onResult])

  useEffect(() => {
    if (!config) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && config.variant !== 'loading') {
        onResult({ confirmed: false, denied: false, dismissed: true })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [config, onResult])

  if (!config) return null

  const cfg = VARIANT_CFG[config.variant]
  const Icon = cfg.icon

  const confirm = () => {
    if (config.variant === 'input') {
      const err = config.input?.validator?.(inputVal) ?? null
      if (err) { setInputErr(err); return }
    }
    onResult({ confirmed: true, denied: false, dismissed: false, value: inputVal })
  }

  const deny = () => onResult({ confirmed: false, denied: true, dismissed: false })
  const dismiss = () => onResult({ confirmed: false, denied: false, dismissed: true })

  const isAlert   = ['success', 'error', 'warning', 'info'].includes(config.variant)
  const isConfirm = ['confirm', 'delete'].includes(config.variant)
  const isLoading = config.variant === 'loading'
  const isInput   = config.variant === 'input'
  const isMulti   = config.variant === 'multi'

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="backdrop"
        className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(6px)' }}
        onClick={!isLoading ? dismiss : undefined}
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 440, damping: 32 }}
          onClick={e => e.stopPropagation()}
          className="w-full overflow-hidden"
          style={{
            maxWidth: isMulti ? 440 : 400,
            background: 'linear-gradient(160deg, #1c2028 0%, #13161c 100%)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '22px',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          {/* Top accent line */}
          <div
            className="h-[2px]"
            style={{ background: `linear-gradient(90deg, transparent 0%, ${cfg.color} 50%, transparent 100%)` }}
          />

          <div className="px-8 pt-8 pb-7">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div
                className="w-[68px] h-[68px] rounded-2xl flex items-center justify-center"
                style={{
                  background: cfg.bgColor,
                  boxShadow: `0 0 0 10px ${cfg.ringColor}`,
                }}
              >
                <Icon
                  className={cfg.spin ? 'animate-spin' : ''}
                  style={{ color: cfg.color, width: 32, height: 32 }}
                />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-center font-bold text-xl leading-tight mb-2" style={{ color: '#EAECEF' }}>
              {config.title}
            </h3>

            {/* Message */}
            {config.message && (
              <p className="text-center text-sm leading-relaxed mb-5 whitespace-pre-line" style={{ color: '#848E9C' }}>
                {config.message}
              </p>
            )}

            {/* Custom React node */}
            {config.node && (
              <div className="mb-5">
                {config.node}
              </div>
            )}

            {/* Input */}
            {isInput && config.input && (
              <div className="mb-5 space-y-2">
                {config.input.label && (
                  <label className="block text-sm font-medium mb-1" style={{ color: '#EAECEF' }}>
                    {config.input.label}
                  </label>
                )}
                <input
                  ref={inputRef}
                  type={config.input.type || 'text'}
                  value={inputVal}
                  placeholder={config.input.placeholder}
                  min={config.input.min}
                  max={config.input.max}
                  step={config.input.step}
                  onChange={e => { setInputVal(e.target.value); setInputErr(null) }}
                  onKeyDown={e => e.key === 'Enter' && confirm()}
                  className="w-full text-center text-xl font-bold outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: `1.5px solid ${inputErr ? '#F6465D' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '12px',
                    padding: '14px 16px',
                    color: '#EAECEF',
                    caretColor: cfg.color,
                  }}
                  onFocus={e => { if (!inputErr) e.target.style.borderColor = cfg.color }}
                  onBlur={e => { if (!inputErr) e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
                />
                {inputErr && (
                  <p className="text-xs mt-1" style={{ color: '#F6465D' }}>{inputErr}</p>
                )}
              </div>
            )}

            {/* Buttons */}
            {!isLoading && (
              <div className="flex gap-2.5">
                {isAlert && (
                  <HoverBtn onClick={confirm} bg={cfg.btnBg} hover={cfg.btnHover} text="#fff">
                    OK
                  </HoverBtn>
                )}

                {isConfirm && (
                  <>
                    <HoverBtn
                      onClick={dismiss}
                      bg="rgba(255,255,255,0.06)"
                      hover="rgba(255,255,255,0.1)"
                      text="#848E9C"
                      border="1px solid rgba(255,255,255,0.08)"
                    >
                      Cancel
                    </HoverBtn>
                    <HoverBtn onClick={confirm} bg={cfg.btnBg} hover={cfg.btnHover} text="#fff">
                      {config.variant === 'delete' ? 'Delete' : 'Confirm'}
                    </HoverBtn>
                  </>
                )}

                {isInput && (
                  <>
                    <HoverBtn
                      onClick={dismiss}
                      bg="rgba(255,255,255,0.06)"
                      hover="rgba(255,255,255,0.1)"
                      text="#848E9C"
                      border="1px solid rgba(255,255,255,0.08)"
                    >
                      Cancel
                    </HoverBtn>
                    <HoverBtn onClick={confirm} bg={cfg.btnBg} hover={cfg.btnHover} text="#fff">
                      Confirm
                    </HoverBtn>
                  </>
                )}

                {isMulti && (
                  <div className="flex flex-col gap-2 w-full">
                    {(config.buttons ?? []).map((btn, i) => {
                      const s = BTN_COLORS[btn.color] ?? BTN_COLORS.gray
                      return (
                        <HoverBtn
                          key={i}
                          onClick={() => {
                            if (btn.value === 'cancel') { dismiss(); return }
                            if (btn.value === 'deny')   { deny();    return }
                            onResult({ confirmed: true, denied: false, dismissed: false, buttonValue: btn.value })
                          }}
                          bg={s.bg}
                          hover={s.hover}
                          text={s.text}
                          border={btn.color === 'gray' ? '1px solid rgba(255,255,255,0.08)' : undefined}
                        >
                          {btn.label}
                        </HoverBtn>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Timer bar */}
          {config.timer && (
            <motion.div
              className="h-[3px] mx-8 mb-4 rounded-full overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ background: cfg.color }}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: config.timer / 1000, ease: 'linear' }}
              />
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}
