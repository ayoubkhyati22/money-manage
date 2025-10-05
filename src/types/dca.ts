export interface DCAPlan {
  id: string;
  user_id: string;
  crypto: 'BTC' | 'ETH';
  amount_per_buy: number;
  frequency: 'weekly' | 'monthly';
  start_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface DCAPlanWithPerformance extends DCAPlan {
  total_invested: number;
  total_bought: number;
  current_value: number;
  profit_loss: number;
  profit_loss_percent: number;
  number_of_buys: number;
}

export interface CryptoPriceData {
  btc: {
    price: number;
    change_24h: number;
  } | null;
  eth: {
    price: number;
    change_24h: number;
  } | null;
}

export interface DCAPlanInput {
  crypto: 'BTC' | 'ETH';
  amount_per_buy: number;
  frequency: 'weekly' | 'monthly';
  start_date: string;
}
