// src/hooks/useSweetAlert.ts
import Swal, { SweetAlertIcon, SweetAlertOptions } from 'sweetalert2'

// Custom theme configuration
const defaultConfig: SweetAlertOptions = {
  customClass: {
    confirmButton: 'bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors',
    cancelButton: 'bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors mr-2',
    popup: 'rounded-xl shadow-2xl',
    title: 'text-gray-900 font-bold',
    content: 'text-gray-600',
    actions: 'gap-3'
  },
  buttonsStyling: false,
  showClass: {
    popup: 'animate__animated animate__fadeInUp animate__faster'
  },
  hideClass: {
    popup: 'animate__animated animate__fadeOutDown animate__faster'
  }
}

export interface AlertOptions {
  title?: string
  text?: string
  icon?: SweetAlertIcon
  confirmButtonText?: string
  cancelButtonText?: string
  showCancelButton?: boolean
  confirmButtonColor?: string
  cancelButtonColor?: string
  reverseButtons?: boolean
  allowOutsideClick?: boolean
  allowEscapeKey?: boolean
}

export const useSweetAlert = () => {
  // Success alert
  const showSuccess = (
    title: string = 'Success!',
    text?: string,
    options?: Partial<AlertOptions>
  ) => {
    return Swal.fire({
      ...defaultConfig,
      title,
      text,
      icon: 'success',
      confirmButtonText: 'OK',
      customClass: {
        ...defaultConfig.customClass,
        confirmButton: 'bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors'
      },
      ...options
    })
  }

  // Error alert
  const showError = (
    title: string = 'Error!',
    text?: string,
    options?: Partial<AlertOptions>
  ) => {
    return Swal.fire({
      ...defaultConfig,
      title,
      text,
      icon: 'error',
      confirmButtonText: 'OK',
      customClass: {
        ...defaultConfig.customClass,
        confirmButton: 'bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors'
      },
      ...options
    })
  }

  // Warning alert
  const showWarning = (
    title: string = 'Warning!',
    text?: string,
    options?: Partial<AlertOptions>
  ) => {
    return Swal.fire({
      ...defaultConfig,
      title,
      text,
      icon: 'warning',
      confirmButtonText: 'OK',
      customClass: {
        ...defaultConfig.customClass,
        confirmButton: 'bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors'
      },
      ...options
    })
  }

  // Info alert
  const showInfo = (
    title: string = 'Information',
    text?: string,
    options?: Partial<AlertOptions>
  ) => {
    return Swal.fire({
      ...defaultConfig,
      title,
      text,
      icon: 'info',
      confirmButtonText: 'OK',
      customClass: {
        ...defaultConfig.customClass,
        confirmButton: 'bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors'
      },
      ...options
    })
  }

  // Confirmation dialog
  const showConfirm = (
    title: string = 'Are you sure?',
    text?: string,
    options?: Partial<AlertOptions>
  ) => {
    return Swal.fire({
      ...defaultConfig,
      title,
      text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      ...options
    })
  }

  // Delete confirmation (danger)
  const showDeleteConfirm = (
    title: string = 'Delete Item?',
    text: string = 'This action cannot be undone!',
    options?: Partial<AlertOptions>
  ) => {
    return Swal.fire({
      ...defaultConfig,
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      customClass: {
        ...defaultConfig.customClass,
        confirmButton: 'bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors',
        cancelButton: 'bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors mr-2'
      },
      ...options
    })
  }

  // Loading alert
  const showLoading = (title: string = 'Loading...', text?: string) => {
    return Swal.fire({
      ...defaultConfig,
      title,
      text,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading()
      }
    })
  }

  // Toast notification
  const showToast = (
    icon: SweetAlertIcon,
    title: string,
    position: 'top' | 'top-start' | 'top-end' | 'center' | 'center-start' | 'center-end' | 'bottom' | 'bottom-start' | 'bottom-end' = 'top-end'
  ) => {
    return Swal.fire({
      toast: true,
      position,
      icon,
      title,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      customClass: {
        popup: 'rounded-lg shadow-lg',
        title: 'text-sm font-medium'
      }
    })
  }

  // Custom alert with HTML content
  const showCustom = (options: SweetAlertOptions) => {
    return Swal.fire({
      ...defaultConfig,
      ...options
    })
  }

  // Input dialog
  const showInput = (
    title: string,
    inputPlaceholder: string = '',
    inputType: 'text' | 'email' | 'password' | 'number' | 'tel' | 'range' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'file' | 'url' = 'text',
    options?: Partial<AlertOptions>
  ) => {
    return Swal.fire({
      ...defaultConfig,
      title,
      input: inputType,
      inputPlaceholder,
      showCancelButton: true,
      confirmButtonText: 'Submit',
      cancelButtonText: 'Cancel',
      inputValidator: (value) => {
        if (!value) {
          return 'Please enter a value!'
        }
      },
      ...options
    })
  }

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    showDeleteConfirm,
    showLoading,
    showToast,
    showCustom,
    showInput,
    fire: Swal.fire, // Direct access to Swal.fire for advanced usage
    close: Swal.close // Close current alert
  }
}

export default useSweetAlert