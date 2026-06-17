import type { ReactNode } from 'react'

export type ModalVariant =
  | 'success' | 'error' | 'warning' | 'info'
  | 'confirm' | 'delete' | 'loading' | 'input' | 'multi'

export interface ModalBtn {
  label: string
  value: string
  color: 'green' | 'red' | 'blue' | 'yellow' | 'gray'
}

export interface ModalInputOpts {
  type?: 'number' | 'text'
  defaultValue?: string
  placeholder?: string
  label?: string
  min?: number
  max?: number
  step?: number
  validator?: (val: string) => string | null
}

export interface ModalConfig {
  variant: ModalVariant
  title: string
  message?: string
  node?: ReactNode
  buttons?: ModalBtn[]
  input?: ModalInputOpts
  timer?: number
}

export interface ModalResult {
  confirmed: boolean
  denied: boolean
  dismissed: boolean
  value?: string
  buttonValue?: string
}

type Handler = (cfg: ModalConfig) => Promise<ModalResult>
let _handler: Handler | null = null

export const _setModalHandler = (fn: Handler) => { _handler = fn }

const DISMISSED: ModalResult = { confirmed: false, denied: false, dismissed: true }

const show = (cfg: ModalConfig): Promise<ModalResult> =>
  _handler ? _handler(cfg) : Promise.resolve(DISMISSED)

export const alert = {
  success: (title: string, message?: string, timer?: number) =>
    show({ variant: 'success', title, message, timer }),

  error: (title: string, message?: string) =>
    show({ variant: 'error', title, message }),

  warning: (title: string, message?: string) =>
    show({ variant: 'warning', title, message }),

  info: (title: string, message?: string) =>
    show({ variant: 'info', title, message }),

  confirm: (title: string, message?: string, node?: ReactNode) =>
    show({ variant: 'confirm', title, message, node }),

  deleteConfirm: (title: string, message?: string) =>
    show({ variant: 'delete', title, message }),

  loading: (title = 'Loading...') =>
    show({ variant: 'loading', title }),

  input: (title: string, opts?: { message?: string; node?: ReactNode; input?: ModalInputOpts }) =>
    show({ variant: 'input', title, message: opts?.message, node: opts?.node, input: opts?.input }),

  multi: (title: string, opts?: { message?: string; node?: ReactNode; buttons?: ModalBtn[] }) =>
    show({ variant: 'multi', title, message: opts?.message, node: opts?.node, buttons: opts?.buttons }),
}
