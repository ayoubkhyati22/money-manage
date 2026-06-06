import { useState, useEffect } from 'react'
import { BankManagerProps } from '../types/bank'
import { useBankManager } from '../hooks/useBankManager'
import { BankHeader } from './BankManager/BankHeader'
import { BankForm } from './BankManager/BankForm'
import { BankGrid } from './BankManager/BankGrid'
import { BankDetail } from './BankManager/BankDetail'
import { AnimatePresence } from 'framer-motion'

type View = 'list' | 'detail'

export function BankManager({ banks, onUpdate }: BankManagerProps) {
  const {
    showForm,
    editingBank,
    loading,
    visibleBalances,
    formData,
    setFormData,
    handleSubmit,
    handleEdit,
    handleDelete,
    toggleBalanceVisibility,
    resetForm,
    toggleForm,
  } = useBankManager(onUpdate)

  const [view, setView] = useState<View>('list')
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null)

  const selectedBank = banks.find(b => b.id === selectedBankId) ?? null
  const selectedBankIndex = banks.findIndex(b => b.id === selectedBankId)

  // If selected bank was deleted, go back to list
  useEffect(() => {
    if (view === 'detail' && selectedBankId && !selectedBank) {
      setView('list')
      setSelectedBankId(null)
    }
  }, [banks, selectedBankId, view, selectedBank])

  const handleCardClick = (bankId: string) => {
    setSelectedBankId(bankId)
    setView('detail')
  }

  const handleBack = () => {
    resetForm()
    setView('list')
    setSelectedBankId(null)
  }

  if (view === 'detail' && selectedBank) {
    return (
      <BankDetail
        bank={selectedBank}
        banks={banks}
        index={selectedBankIndex}
        isBalanceHidden={!visibleBalances.has(selectedBank.id)}
        onToggleVisibility={() => toggleBalanceVisibility(selectedBank.id)}
        showEditForm={showForm && !!editingBank}
        formData={formData}
        editingBank={editingBank}
        loading={loading}
        onEdit={() => handleEdit(selectedBank)}
        onSubmit={handleSubmit}
        onFormChange={setFormData}
        onCancelEdit={resetForm}
        onDelete={() => handleDelete(selectedBank)}
        onBack={handleBack}
        onNavigate={setSelectedBankId}
      />
    )
  }

  return (
    <div className="space-y-6">
      <BankHeader onAddClick={toggleForm} />

      <AnimatePresence>
        {showForm && !editingBank && (
          <BankForm
            formData={formData}
            editingBank={null}
            loading={loading}
            onSubmit={handleSubmit}
            onChange={setFormData}
            onCancel={resetForm}
          />
        )}
      </AnimatePresence>

      <BankGrid
        banks={banks}
        visibleBalances={visibleBalances}
        onCardClick={handleCardClick}
        onToggleVisibility={toggleBalanceVisibility}
      />
    </div>
  )
}
