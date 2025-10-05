/*
  # Create DCA Plans Table

  1. New Tables
    - `dca_plans`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `crypto` (text, BTC or ETH)
      - `amount_per_buy` (numeric, amount invested per period)
      - `frequency` (text, weekly or monthly)
      - `start_date` (date, when DCA started)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `dca_plans` table
    - Add policies for authenticated users to manage their own plans
*/

CREATE TABLE IF NOT EXISTS dca_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crypto text NOT NULL CHECK (crypto IN ('BTC', 'ETH')),
  amount_per_buy numeric NOT NULL CHECK (amount_per_buy > 0),
  frequency text NOT NULL CHECK (frequency IN ('weekly', 'monthly')),
  start_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE dca_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own DCA plans"
  ON dca_plans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own DCA plans"
  ON dca_plans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own DCA plans"
  ON dca_plans FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own DCA plans"
  ON dca_plans FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_dca_plans_user_id ON dca_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_dca_plans_crypto ON dca_plans(crypto);