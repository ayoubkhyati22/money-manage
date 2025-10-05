import { TrendingUp, AlertCircle } from 'lucide-react';
import { useDCAPlans } from '../../hooks/useDCAPlans';
import { useSweetAlert } from '../../hooks/useSweetAlert';
import { DCAForm } from './DCAForm';
import { DCAPlanCard } from './DCAPlanCard';
import type { DCAPlanInput } from '../../types/dca';

export function DCAManager() {
  const { plans, addPlan, removePlan, isLoading, error } = useDCAPlans();
  const { showSuccess, showError, showConfirm } = useSweetAlert();

  const handleAddPlan = async (planInput: DCAPlanInput) => {
    try {
      await addPlan(planInput);
      showSuccess('Plan DCA créé avec succès!');
    } catch (err) {
      showError('Erreur lors de la création du plan DCA');
    }
  };

  const handleDeletePlan = async (id: string) => {
    const confirmed = await showConfirm(
      'Êtes-vous sûr de vouloir supprimer ce plan DCA?',
      'Cette action est irréversible'
    );

    if (confirmed) {
      try {
        await removePlan(id);
        showSuccess('Plan DCA supprimé');
      } catch (err) {
        showError('Erreur lors de la suppression du plan');
      }
    }
  };

  const totalInvested = plans.reduce((sum, plan) => sum + plan.total_invested, 0);
  const totalValue = plans.reduce((sum, plan) => sum + plan.current_value, 0);
  const totalProfit = totalValue - totalInvested;
  const totalProfitPercent = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (error) {
    return (
      <div className="rounded-2xl p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
        <div className="flex items-center gap-3">
          <AlertCircle className="text-red-600 dark:text-red-400" size={24} />
          <div>
            <h3 className="font-semibold text-red-900 dark:text-red-100">
              Erreur de chargement
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6 bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
            <TrendingUp className="text-emerald-600 dark:text-emerald-400" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Dollar Cost Averaging (DCA)
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Investissements réguliers en cryptomonnaies
            </p>
          </div>
        </div>

        {plans.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                Total investi
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalInvested)} MAD
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                Valeur actuelle
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalValue)} MAD
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                Gain/Perte total
              </p>
              <p
                className={`text-xl font-bold ${
                  totalProfit >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {totalProfit >= 0 ? '+' : ''}
                {formatCurrency(totalProfit)} MAD
                <span className="text-sm ml-2">
                  ({totalProfit >= 0 ? '+' : ''}
                  {totalProfitPercent.toFixed(2)}%)
                </span>
              </p>
            </div>
          </div>
        )}

        {isLoading && plans.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Chargement des plans DCA...
            </p>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-12 px-4">
            <TrendingUp
              className="mx-auto mb-4 text-gray-400 dark:text-gray-600"
              size={48}
            />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Aucun plan DCA
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Créez votre premier plan d'investissement régulier
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {plans.map((plan) => (
              <DCAPlanCard key={plan.id} plan={plan} onDelete={handleDeletePlan} />
            ))}
          </div>
        )}

        <DCAForm onSubmit={handleAddPlan} isLoading={isLoading} />
      </div>
    </div>
  );
}
