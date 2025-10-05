import { useState, useEffect } from 'react';
import type { CryptoPriceData } from '../types/dca';

export function useCryptoPrices() {
  const [data, setData] = useState<CryptoPriceData>({
    btc: null,
    eth: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let intervalId: number;

    async function fetchPrices() {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true'
        );

        if (!response.ok) {
          throw new Error('Failed to fetch crypto prices');
        }

        const result = await response.json();

        setData({
          btc: {
            price: result.bitcoin?.usd || 0,
            change_24h: result.bitcoin?.usd_24h_change || 0,
          },
          eth: {
            price: result.ethereum?.usd || 0,
            change_24h: result.ethereum?.usd_24h_change || 0,
          },
        });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }

    fetchPrices();
    intervalId = window.setInterval(fetchPrices, 60000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return { data, isLoading, error };
}
