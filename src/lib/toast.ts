export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  id: string
  variant: ToastVariant
  title: string
  message?: string
  duration: number
}

type Listener = (item: ToastItem) => void
const _listeners = new Set<Listener>()

function dispatch(variant: ToastVariant, title: string, message?: string) {
  const item: ToastItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    variant,
    title,
    message,
    duration: 3500,
  }
  _listeners.forEach(fn => fn(item))
}

export const toast = {
  success: (title: string, message?: string) => dispatch('success', title, message),
  error: (title: string, message?: string) => dispatch('error', title, message),
  warning: (title: string, message?: string) => dispatch('warning', title, message),
  info: (title: string, message?: string) => dispatch('info', title, message),
  _on: (fn: Listener) => {
    _listeners.add(fn)
    return () => _listeners.delete(fn)
  },
}
