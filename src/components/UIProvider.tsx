import { useState, useCallback, useEffect, ReactNode } from 'react'
import { PremiumModal } from './ui/PremiumModal'
import { PremiumToastContainer } from './ui/PremiumToast'
import { _setModalHandler, ModalConfig, ModalResult } from '../lib/alert'

let _pendingResolve: ((r: ModalResult) => void) | null = null

export function UIProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ModalConfig | null>(null)

  const showModal = useCallback((cfg: ModalConfig): Promise<ModalResult> => {
    return new Promise(resolve => {
      _pendingResolve = resolve
      setConfig(cfg)
    })
  }, [])

  useEffect(() => {
    _setModalHandler(showModal)
  }, [showModal])

  const handleResult = useCallback((result: ModalResult) => {
    setConfig(null)
    _pendingResolve?.(result)
    _pendingResolve = null
  }, [])

  return (
    <>
      {children}
      <PremiumToastContainer />
      <PremiumModal config={config} onResult={handleResult} />
    </>
  )
}
