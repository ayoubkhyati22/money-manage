import { alert as _alert, ModalResult } from '../lib/alert'

// Maps our ModalResult to the SweetAlert2-compatible shape existing callers expect
function toSwal(r: ModalResult) {
  return {
    isConfirmed: r.confirmed,
    isDenied: r.denied,
    dismiss: r.dismissed ? 'cancel' : null,
    value: r.value,
    buttonValue: r.buttonValue,
  }
}

export const useSweetAlert = () => {
  const showSuccess = (title = 'Success!', text?: string) =>
    _alert.success(title, text).then(toSwal)

  const showError = (title = 'Error!', text?: string) =>
    _alert.error(title, text).then(toSwal)

  const showWarning = (title = 'Warning!', text?: string) =>
    _alert.warning(title, text).then(toSwal)

  const showInfo = (title = 'Information', text?: string) =>
    _alert.info(title, text).then(toSwal)

  const showConfirm = (title = 'Are you sure?', text?: string) =>
    _alert.confirm(title, text).then(toSwal)

  const showDeleteConfirm = (title = 'Delete?', text = 'This action cannot be undone!') =>
    _alert.deleteConfirm(title, text).then(toSwal)

  const showLoading = (title = 'Loading...') => {
    _alert.loading(title)
    return { close: () => {} }
  }

  const showToast = (variant: 'success' | 'error' | 'warning' | 'info', title: string) => {
    import('../lib/toast').then(({ toast }) => toast[variant](title))
  }

  const showInput = (
    title: string,
    inputPlaceholder = '',
    inputType: 'text' | 'number' = 'text',
  ) =>
    _alert.input(title, {
      input: { type: inputType, placeholder: inputPlaceholder },
    }).then(toSwal)

  const showCustom = (opts: { title?: string; text?: string; variant?: any }) =>
    _alert.info(opts.title ?? '', opts.text).then(toSwal)

  const fire = (opts: any) =>
    _alert.info(opts.title ?? '', opts.text ?? opts.html).then(toSwal)

  const close = () => {}

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    showDeleteConfirm,
    showLoading,
    showToast,
    showInput,
    showCustom,
    fire,
    close,
  }
}

export default useSweetAlert
