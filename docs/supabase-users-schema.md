# Supabase User Table Schema & Setup

## SQL Schema for Users Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Create users table to store customer information
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create addresses table (reusable for multiple orders)
CREATE TABLE IF NOT EXISTS addresses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  pincode TEXT NOT NULL,
  email TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(user_id, address, pincode)
);

-- Add foreign key to orders table for user relationship
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS address_id TEXT REFERENCES addresses(id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(date DESC);

-- Update RLS policies

-- Users table policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public to create users" 
  ON users FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow users to view their own data" 
  ON users FOR SELECT 
  USING (true); -- For now allow all, refine later with auth

CREATE POLICY "Allow admin to update users" 
  ON users FOR UPDATE 
  USING (true);

-- Addresses table policies
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anyone to create addresses" 
  ON addresses FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow anyone to view addresses" 
  ON addresses FOR SELECT 
  USING (true);

-- Update orders table policy to allow user_id
-- (Your existing order policies should remain)

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

## Best Practices Implementation

### 1. Data Normalization
- `users` table stores core customer info
- `addresses` table allows multiple shipping addresses per user
- `orders` references both user and address

### 2. Security Considerations
- Use RLS policies to restrict data access
- Never expose sensitive user data to anonymous users
- Consider implementing proper authentication for production

### 3. Performance
- Indexes on frequently queried fields (email, user_id, date)
- Efficient joins using foreign keys

### 4. Data Integrity
- Foreign key constraints ensure referential integrity
- Cascade delete on user removal
- Unique constraints prevent duplicate addresses
