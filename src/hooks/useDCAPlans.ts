import { useState, useEffect, useCallback } from 'react';
import { useCryptoPrices } from './useCryptoPrices';
import { fetchDCAPlans, createDCAPlan, deleteDCAPlan } from '../services/dcaService';
import type { DCAPlan, DCAPlanWithPerformance, DCAPlanInput } from '../types/dca';

function calculateNumberOfBuys(startDate: string, frequency: 'weekly' | 'monthly'): number {
  const start = new Date(startDate);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (frequency === 'weekly') {
    return Math.max(0, Math.floor(diffDays / 7));
  } else {
    const monthsDiff =
      (now.getFullYear() - start.getFullYear()) * 12 +
      (now.getMonth() - start.getMonth());
    return Math.max(0, monthsDiff);
  }
}

export function useDCAPlans() {
  const { data: cryptoData, isLoading: pricesLoading } = useCryptoPrices();
  const [plans, setPlans] = useState<DCAPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPlans = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchDCAPlans();
      setPlans(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load DCA plans');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const addPlan = useCallback(
    async (planInput: DCAPlanInput) => {
      try {
        await createDCAPlan(planInput);
        await loadPlans();
      } catch (err) {
        throw err;
      }
    },
    [loadPlans]
  );

  const removePlan = useCallback(
    async (id: string) => {
      try {
        await deleteDCAPlan(id);
        await loadPlans();
      } catch (err) {
        throw err;
      }
    },
    [loadPlans]
  );

  const plansWithPerformance: DCAPlanWithPerformance[] = plans.map((plan) => {
    const numberOfBuys = calculateNumberOfBuys(plan.start_date, plan.frequency);
    const totalInvested = numberOfBuys * plan.amount_per_buy;

    const currentPrice =
      plan.crypto === 'BTC'
        ? cryptoData.btc?.price || 0
        : cryptoData.eth?.price || 0;

    const totalBought = currentPrice > 0 ? totalInvested / currentPrice : 0;
    const currentValue = totalBought * currentPrice;
    const profitLoss = currentValue - totalInvested;
    const profitLossPercent =
      totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

    return {
      ...plan,
      total_invested: totalInvested,
      total_bought: totalBought,
      current_value: currentValue,
      profit_loss: profitLoss,
      profit_loss_percent: profitLossPercent,
      number_of_buys: numberOfBuys,
    };
  });

  return {
    plans: plansWithPerformance,
    addPlan,
    removePlan,
    isLoading: isLoading || pricesLoading,
    error,
    refresh: loadPlans,
  };
}
