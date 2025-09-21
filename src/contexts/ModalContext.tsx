import React, { createContext, useContext, useState, ReactNode } from 'react'

export interface ModalOptions {
  title?: string
  message: string
  type?: 'confirm' | 'alert' | 'custom'
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void
  showCancel?: boolean
  variant?: 'default' | 'danger' | 'warning' | 'success'
}

interface ModalContextType {
  showModal: (options: ModalOptions) => Promise<boolean>
  confirmModal: (message: string, title?: string) => Promise<boolean>
  alertModal: (message: string, title?: string) => Promise<void>
  dangerModal: (message: string, title?: string) => Promise<boolean>
}

const ModalContext = createContext<ModalContextType>({} as ModalContextType)

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [modalOptions, setModalOptions] = useState<ModalOptions | null>(null)
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null)

  const showModal = (options: ModalOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setModalOptions(options)
      setResolvePromise(() => resolve)
      setIsOpen(true)
    })
  }

  const confirmModal = (message: string, title?: string): Promise<boolean> => {
    return showModal({
      title: title || 'Confirmation',
      message,
      type: 'confirm',
      showCancel: true,
      variant: 'default'
    })
  }

  const alertModal = (message: string, title?: string): Promise<void> => {
    return showModal({
      title: title || 'Information',
      message,
      type: 'alert',
      showCancel: false,
      variant: 'default'
    }).then(() => {})
  }

  const dangerModal = (message: string, title?: string): Promise<boolean> => {
    return showModal({
      title: title || 'Attention',
      message,
      type: 'confirm',
      showCancel: true,
      variant: 'danger',
      confirmText: 'Supprimer',
      cancelText: 'Annuler'
    })
  }

  const handleClose = (confirmed: boolean) => {
    setIsOpen(false)
    if (resolvePromise) {
      if (confirmed && modalOptions?.onConfirm) {
        modalOptions.onConfirm()
      } else if (!confirmed && modalOptions?.onCancel) {
        modalOptions.onCancel()
      }
      resolvePromise(confirmed)
    }
    setResolvePromise(null)
    setModalOptions(null)
  }

  const getVariantStyles = (variant: string) => {
    switch (variant) {
      case 'danger':
        return {
          confirmButton: 'bg-red-500 hover:bg-red-600 text-white',
          cancelButton: 'bg-gray-300 hover:bg-gray-400 text-gray-700',
          icon: '⚠️'
        }
      case 'warning':
        return {
          confirmButton: 'bg-yellow-500 hover:bg-yellow-600 text-white',
          cancelButton: 'bg-gray-300 hover:bg-gray-400 text-gray-700',
          icon: '⚠️'
        }
      case 'success':
        return {
          confirmButton: 'bg-green-500 hover:bg-green-600 text-white',
          cancelButton: 'bg-gray-300 hover:bg-gray-400 text-gray-700',
          icon: '✅'
        }
      default:
        return {
          confirmButton: 'bg-emerald-500 hover:bg-emerald-600 text-white',
          cancelButton: 'bg-gray-300 hover:bg-gray-400 text-gray-700',
          icon: '❓'
        }
    }
  }

  if (!isOpen || !modalOptions) return <>{children}</>

  const styles = getVariantStyles(modalOptions.variant || 'default')

  return (
    <>
      {children}
      {/* Modal Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-2xl">{styles.icon}</span>
            <h3 className="text-lg font-semibold text-gray-900">
              {modalOptions.title}
            </h3>
          </div>

          {/* Message */}
          <div className="mb-6">
            <p className="text-gray-600 leading-relaxed">
              {modalOptions.message}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3">
            {modalOptions.showCancel !== false && (
              <button
                onClick={() => handleClose(false)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${styles.cancelButton}`}
              >
                {modalOptions.cancelText || 'Annuler'}
              </button>
            )}
            <button
              onClick={() => handleClose(true)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${styles.confirmButton}`}
            >
              {modalOptions.confirmText || 'Confirmer'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export function useModal() {
  const context = useContext(ModalContext)
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}