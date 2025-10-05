/*
  # Finance Management Database Schema

  1. New Tables
    - `banks` - Store user banks with balances
    - `goals` - Financial goals with targets and dates  
    - `allocations` - Bank-to-goal allocation amounts
    - `transactions` - Withdrawal transaction records
    - `transaction_goals` - Transaction-to-goal breakdown

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data only

  3. Features
    - Automatic balance calculations
    - Transaction history tracking
    - Multi-goal transaction allocation
*/

-- Banks table
CREATE TABLE IF NOT EXISTS banks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  logo text,
  balance decimal(10,2) DEFAULT 0.00 NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Goals table  
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  target_amount decimal(10,2),
  target_date date,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Allocations table (bank ↔ goal)
CREATE TABLE IF NOT EXISTS allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid REFERENCES goals(id) ON DELETE CASCADE NOT NULL,
  bank_id uuid REFERENCES banks(id) ON DELETE CASCADE NOT NULL,
  amount decimal(10,2) DEFAULT 0.00 NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(goal_id, bank_id)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  bank_id uuid REFERENCES banks(id) ON DELETE CASCADE NOT NULL,
  total_amount decimal(10,2) NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Transaction goals table (transaction ↔ goal relation)
CREATE TABLE IF NOT EXISTS transaction_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid REFERENCES transactions(id) ON DELETE CASCADE NOT NULL,
  goal_id uuid REFERENCES goals(id) ON DELETE CASCADE NOT NULL,
  amount decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_goals ENABLE ROW LEVEL SECURITY;

-- Banks policies
CREATE POLICY "Users can manage their own banks"
  ON banks
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Goals policies
CREATE POLICY "Users can manage their own goals"
  ON goals
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allocations policies
CREATE POLICY "Users can manage allocations for their goals and banks"
  ON allocations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM goals 
      WHERE goals.id = allocations.goal_id 
      AND goals.user_id = auth.uid()
    )
  );

-- Transactions policies
CREATE POLICY "Users can manage their own transactions"
  ON transactions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Transaction goals policies
CREATE POLICY "Users can manage transaction goals for their transactions"
  ON transaction_goals
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM transactions 
      WHERE transactions.id = transaction_goals.transaction_id 
      AND transactions.user_id = auth.uid()
    )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_banks_updated_at BEFORE UPDATE ON banks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_allocations_updated_at BEFORE UPDATE ON allocations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();



    -- Migration script to add user profiles table
-- This will NOT impact existing data

-- Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone_number VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
-- Users can only read their own profile
CREATE POLICY "Users can view own profile"
    ON public.user_profiles
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
    ON public.user_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.user_profiles
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.user_profiles;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Grant necessary permissions
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_profiles TO service_role;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration completed successfully! User profiles table created.';
END $$;