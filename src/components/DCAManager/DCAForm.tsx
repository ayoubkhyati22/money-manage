import { useState, FormEvent } from 'react';
import type { DCAPlanInput } from '../../types/dca';

interface DCAFormProps {
  onSubmit: (plan: DCAPlanInput) => Promise<void>;
  isLoading: boolean;
}

export function DCAForm({ onSubmit, isLoading }: DCAFormProps) {
  const [crypto, setCrypto] = useState<'BTC' | 'ETH'>('BTC');
  const [amountPerBuy, setAmountPerBuy] = useState('');
  const [frequency, setFrequency] = useState<'weekly' | 'monthly'>('weekly');
  const [startDate, setStartDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!amountPerBuy || !startDate || parseFloat(amountPerBuy) <= 0) {
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        crypto,
        amount_per_buy: parseFloat(amountPerBuy),
        frequency,
        start_date: startDate,
      });

      setAmountPerBuy('');
      setStartDate('');
    } catch (error) {
      console.error('Error creating DCA plan:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-gray-200 dark:border-gray-700"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Cryptomonnaie
        </label>
        <select
          value={crypto}
          onChange={(e) => setCrypto(e.target.value as 'BTC' | 'ETH')}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          disabled={submitting || isLoading}
        >
          <option value="BTC">Bitcoin (BTC)</option>
          <option value="ETH">Ethereum (ETH)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Montant par achat (MAD)
        </label>
        <input
          type="number"
          value={amountPerBuy}
          onChange={(e) => setAmountPerBuy(e.target.value)}
          placeholder="Ex: 500"
          min="0"
          step="0.01"
          required
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          disabled={submitting || isLoading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Fréquence
        </label>
        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as 'weekly' | 'monthly')}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          disabled={submitting || isLoading}
        >
          <option value="weekly">Hebdomadaire</option>
          <option value="monthly">Mensuelle</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Date de début
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          required
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          disabled={submitting || isLoading}
        />
      </div>

      <button
        type="submit"
        disabled={submitting || isLoading}
        className="col-span-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 text-white font-medium rounded-lg p-3 transition-colors duration-200 shadow-sm"
      >
        {submitting ? 'Ajout en cours...' : 'Ajouter le plan DCA'}
      </button>
    </form>
  );
}
