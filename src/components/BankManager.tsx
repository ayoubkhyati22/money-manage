import { BankManagerProps } from '../types/bank'
import { useBankManager } from '../hooks/useBankManager'
import { BankHeader } from './BankManager/BankHeader'
import { BankForm } from './BankManager/BankForm'
import { BankGrid } from './BankManager/BankGrid'
import { AnimatePresence } from 'framer-motion'

export function BankManager({ banks, onUpdate }: BankManagerProps) {
  const {
    showForm,
    editingBank,
    loading,
    hiddenBalances,
    formData,
    setFormData,
    handleSubmit,
    handleEdit,
    handleDelete,
    toggleBalanceVisibility,
    resetForm,
    toggleForm
  } = useBankManager(onUpdate)

  return (
    <div className="space-y-6">
      <BankHeader onAddClick={toggleForm} />

      <AnimatePresence>
        {showForm && (
          <BankForm
            formData={formData}
            editingBank={editingBank}
            loading={loading}
            onSubmit={handleSubmit}
            onChange={setFormData}
            onCancel={resetForm}
          />
        )}
      </AnimatePresence>

      <BankGrid
        banks={banks}
        hiddenBalances={hiddenBalances}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleVisibility={toggleBalanceVisibility}
      />
    </div>
  )
}
