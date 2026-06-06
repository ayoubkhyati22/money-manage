import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'

interface BankHeaderProps {
  onAddClick: () => void
}

export function BankHeader({ onAddClick }: BankHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-center"
    >
      <button
        onClick={onAddClick}
        className="w-full max-w-sm flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl py-7 px-8 text-slate-500 dark:text-slate-400 hover:border-primary-400 dark:hover:border-primary-500 hover:text-primary-500 dark:hover:text-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all duration-200"
      >
        <div className="w-11 h-11 rounded-full border-2 border-dashed border-current flex items-center justify-center">
          <Plus className="w-5 h-5" />
        </div>
        <span className="font-semibold text-sm">Add Bank Account</span>
      </button>
    </motion.div>
  )
}
