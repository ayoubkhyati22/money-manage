import { Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import type { DCAPlanWithPerformance } from '../../types/dca';

interface DCAPlanCardProps {
  plan: DCAPlanWithPerformance;
  onDelete: (id: string) => Promise<void>;
}

export function DCAPlanCard({ plan, onDelete }: DCAPlanCardProps) {
  const isPositive = plan.profit_loss >= 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm bg-white dark:bg-gray-800 transition-all duration-200 hover:shadow-md">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {plan.crypto}
            </span>
            <span className="text-sm px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
              {plan.frequency === 'weekly' ? 'Hebdo' : 'Mensuel'}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Depuis le {formatDate(plan.start_date)}
          </p>
        </div>
        <button
          onClick={() => onDelete(plan.id)}
          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          title="Supprimer le plan"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Montant par achat
          </span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {formatCurrency(plan.amount_per_buy)} MAD
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Nombre d'achats
          </span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {plan.number_of_buys}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Total investi
          </span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {formatCurrency(plan.total_invested)} MAD
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {plan.crypto} acheté
          </span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {plan.total_bought.toFixed(8)}
          </span>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Valeur actuelle
          </span>
          <span className="font-bold text-gray-900 dark:text-white">
            {formatCurrency(plan.current_value)} MAD
          </span>
        </div>

        <div
          className={`flex items-center justify-between p-3 rounded-lg ${
            isPositive
              ? 'bg-emerald-50 dark:bg-emerald-900/20'
              : 'bg-red-50 dark:bg-red-900/20'
          }`}
        >
          <div className="flex items-center gap-2">
            {isPositive ? (
              <TrendingUp className="text-emerald-600 dark:text-emerald-400" size={20} />
            ) : (
              <TrendingDown className="text-red-600 dark:text-red-400" size={20} />
            )}
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {isPositive ? 'Gain' : 'Perte'}
            </span>
          </div>
          <div className="text-right">
            <p
              className={`font-bold ${
                isPositive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {isPositive ? '+' : ''}
              {formatCurrency(plan.profit_loss)} MAD
            </p>
            <p
              className={`text-sm ${
                isPositive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {isPositive ? '+' : ''}
              {plan.profit_loss_percent.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
