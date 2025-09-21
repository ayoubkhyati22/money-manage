/*
  # Update Goals System with Bank Balance Integration

  1. Schema Changes
    - Add category field to goals table
    - Create objectives_transactions table for tracking money additions
    - Remove allocations table (no longer needed)
    - Update transaction_goals to work with new system

  2. New Tables
    - `objectives_transactions` - tracks money additions to objectives
      - `id` (uuid, primary key)
      - `objective_id` (uuid, foreign key to goals)
      - `bank_id` (uuid, foreign key to banks)
      - `amount` (decimal)
      - `description` (text, optional)
      - `created_at` (timestamp)

  3. Security
    - Enable RLS on new table
    - Add policies for authenticated users
*/

-- Add category column to goals table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'goals' AND column_name = 'category'
  ) THEN
    ALTER TABLE goals ADD COLUMN category text DEFAULT '';
  END IF;
END $$;

-- Create objectives_transactions table
CREATE TABLE IF NOT EXISTS objectives_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  objective_id uuid NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  bank_id uuid NOT NULL REFERENCES banks(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL DEFAULT 0.00,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE objectives_transactions ENABLE ROW LEVEL SECURITY;

-- Create policy for objectives_transactions
CREATE POLICY "Users can manage their objective transactions"
  ON objectives_transactions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM goals
      WHERE goals.id = objectives_transactions.objective_id
      AND goals.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM goals
      WHERE goals.id = objectives_transactions.objective_id
      AND goals.user_id = auth.uid()
    )
  );

-- Add trigger for updated_at
CREATE TRIGGER update_objectives_transactions_updated_at
  BEFORE UPDATE ON objectives_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Drop allocations table if it exists (no longer needed)
DROP TABLE IF EXISTS allocations CASCADE;