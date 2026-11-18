import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallbackTitle?: string
  fallbackMessage?: string
  onReset?: () => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null })
    if (this.props.onReset) {
      this.props.onReset()
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 my-6 rounded-2xl bg-white dark:bg-[#121520] border border-rose-500/30 text-center max-w-lg mx-auto space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-display font-bold text-stone-900 dark:text-white">
              {this.props.fallbackTitle || 'Section Encountered an Issue'}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 font-mono leading-relaxed">
              {this.props.fallbackMessage ||
                this.state.error?.message ||
                'An unexpected error occurred while rendering this view.'}
            </p>
          </div>
          <button
            onClick={this.handleReset}
            className="px-5 py-2.5 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-950 font-mono text-xs font-semibold inline-flex items-center gap-2 hover:opacity-90 transition-all shadow-md"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Recover View</span>
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
