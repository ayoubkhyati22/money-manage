import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useDCAPlans } from '../../hooks/useDCAPlans';
import { useCryptoPrices } from '../../hooks/useCryptoPrices';
import { BarChart3 } from 'lucide-react';

interface ChartDataPoint {
  date: string;
  btcValue: number;
  ethValue: number;
  totalValue: number;
}

export function DCAPerformanceChart() {
  const { plans } = useDCAPlans();
  const { data: cryptoData } = useCryptoPrices();

  const chartData = useMemo(() => {
    if (plans.length === 0) return [];

    const dataPoints: ChartDataPoint[] = [];
    const allDates = new Set<string>();

    plans.forEach((plan) => {
      const startDate = new Date(plan.start_date);
      const now = new Date();
      const diffMs = now.getTime() - startDate.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      const interval = plan.frequency === 'weekly' ? 7 : 30;
      const numberOfPoints = Math.floor(diffDays / interval);

      for (let i = 0; i <= numberOfPoints; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i * interval);
        allDates.add(date.toISOString().split('T')[0]);
      }
    });

    const sortedDates = Array.from(allDates).sort();

    sortedDates.forEach((dateStr) => {
      let btcValue = 0;
      let ethValue = 0;

      plans.forEach((plan) => {
        const startDate = new Date(plan.start_date);
        const currentDate = new Date(dateStr);

        if (currentDate >= startDate) {
          const diffMs = currentDate.getTime() - startDate.getTime();
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          const interval = plan.frequency === 'weekly' ? 7 : 30;
          const numberOfBuys = Math.floor(diffDays / interval) + 1;

          const totalInvested = numberOfBuys * plan.amount_per_buy;
          const currentPrice =
            plan.crypto === 'BTC'
              ? cryptoData.btc?.price || 0
              : cryptoData.eth?.price || 0;

          if (currentPrice > 0) {
            const totalBought = totalInvested / currentPrice;
            const value = totalBought * currentPrice;

            if (plan.crypto === 'BTC') {
              btcValue += value;
            } else {
              ethValue += value;
            }
          }
        }
      });

      dataPoints.push({
        date: new Date(dateStr).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'short',
        }),
        btcValue,
        ethValue,
        totalValue: btcValue + ethValue,
      });
    });

    return dataPoints;
  }, [plans, cryptoData]);

  if (plans.length === 0 || chartData.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl p-6 bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
          <BarChart3 className="text-emerald-600 dark:text-emerald-400" size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Évolution du portefeuille DCA
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Valeur totale investie au fil du temps
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-gray-300 dark:stroke-gray-700"
          />
          <XAxis
            dataKey="date"
            className="text-gray-600 dark:text-gray-400"
            tick={{ fill: 'currentColor' }}
          />
          <YAxis
            className="text-gray-600 dark:text-gray-400"
            tick={{ fill: 'currentColor' }}
            tickFormatter={(value) =>
              `${new Intl.NumberFormat('fr-MA', {
                notation: 'compact',
                compactDisplay: 'short',
              }).format(value)} MAD`
            }
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
            }}
            labelStyle={{ color: '#1f2937', fontWeight: 600 }}
            formatter={(value: number) =>
              `${new Intl.NumberFormat('fr-MA', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(value)} MAD`
            }
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="btcValue"
            stroke="#f97316"
            strokeWidth={2}
            name="Bitcoin (BTC)"
            dot={false}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="ethValue"
            stroke="#10b981"
            strokeWidth={2}
            name="Ethereum (ETH)"
            dot={false}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="totalValue"
            stroke="#059669"
            strokeWidth={3}
            name="Total"
            dot={false}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
