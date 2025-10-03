import { X, FileText } from 'lucide-react'

interface TermsModalProps {
  isOpen: boolean
  onClose: () => void
  onAccept: () => void
}

export function TermsModal({ isOpen, onClose, onAccept }: TermsModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl max-w-lg w-full border border-mint-200 dark:border-dark-600">
        <div className="flex items-center justify-between p-4 border-b border-mint-200 dark:border-dark-600 bg-gradient-to-r from-primary-50 to-mint-50 dark:from-primary-900/30 dark:to-mint-900/30">
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-primary-500 rounded-lg">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-dark-600 dark:text-dark-100">Terms & Privacy</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-dark-500 dark:text-dark-300" />
          </button>
        </div>

        <div className="p-4">
          <div className="text-center mb-4">
            <h3 className="text-base font-semibold text-dark-600 dark:text-dark-100 mb-2">FinanceFlow Service Agreement</h3>
            <p className="text-sm text-dark-500 dark:text-dark-300">Summary of key terms for your account</p>
          </div>

          <div className="space-y-3 text-sm text-dark-500 dark:text-dark-200">
            <div className="flex items-start space-x-3 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <div className="w-2 h-2 bg-primary-500 rounded-full mt-1.5 flex-shrink-0"></div>
              <div>
                <p className="font-medium text-dark-600 dark:text-dark-100">Personal Finance Management</p>
                <p className="text-xs">Track funds across banks, set goals, and manage transactions securely</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-mint-50 dark:bg-mint-900/20 rounded-lg">
              <div className="w-2 h-2 bg-mint-500 rounded-full mt-1.5 flex-shrink-0"></div>
              <div>
                <p className="font-medium text-dark-600 dark:text-dark-100">Privacy & Security</p>
                <p className="text-xs">Your data is encrypted and never shared without consent</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-accent-50 dark:bg-accent-900/20 rounded-lg">
              <div className="w-2 h-2 bg-accent-500 rounded-full mt-1.5 flex-shrink-0"></div>
              <div>
                <p className="font-medium text-dark-600 dark:text-dark-100">Account Responsibility</p>
                <p className="text-xs">You're responsible for account security and data accuracy</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-dark-700/50 rounded-lg">
              <div className="w-2 h-2 bg-gray-500 rounded-full mt-1.5 flex-shrink-0"></div>
              <div>
                <p className="font-medium text-dark-600 dark:text-dark-100">Service Availability</p>
                <p className="text-xs">Service provided "as is" with standard industry protections</p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
              <strong>Complete terms available at:</strong> financeflow.app/terms<br/>
              <span className="opacity-75">Last updated: {new Date().toLocaleDateString()}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border-t border-mint-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-900/30">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm text-gray-600 dark:text-dark-300 hover:text-gray-800 dark:hover:text-dark-100 font-medium transition-colors"
          >
            Cancel
          </button>
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-dark-200 hover:bg-gray-300 dark:hover:bg-dark-600 rounded-lg transition-colors"
            >
              Read Later
            </button>
            <button
              onClick={() => {
                onAccept()
                onClose()
              }}
              className="px-4 py-1.5 text-sm bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              Accept & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
