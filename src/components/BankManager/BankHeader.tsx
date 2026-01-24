import { Plus, Building2 } from 'lucide-react'
import { motion } from 'framer-motion'

interface BankHeaderProps {
  onAddClick: () => void
}

export function BankHeader({ onAddClick }: BankHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg">
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-800 dark:text-white">Banks</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage your bank accounts</p>
        </div>
      </div>
      <button
        onClick={onAddClick}
        className="btn-primary"
      >
        <Plus className="w-4 h-4" />
        <span>Add Bank</span>
      </button>
    </motion.div>
  )
}
