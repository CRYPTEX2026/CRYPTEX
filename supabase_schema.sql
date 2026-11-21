-- ============================================================================
-- CRYPTEX Platform - Supabase PostgreSQL Database Schema
-- ============================================================================

-- 1. Users Table (Stores user profiles, roles, KYC status, and per-coin balances)
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'compliance_officer', 'finance_manager', 'risk_officer', 'support_agent')),
    mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    kyc_status TEXT NOT NULL DEFAULT 'not_started' CHECK (kyc_status IN ('not_started', 'pending', 'under_review', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    avatar_url TEXT,
    btc_wallet_address TEXT,
    balance NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    balances JSONB NOT NULL DEFAULT '{"USDT": 0, "USDC": 0, "BTC": 0, "ETH": 0, "SOL": 0}'::jsonb
);

-- 2. Deposits Table (Stores user digital asset deposits and payment proofs)
CREATE TABLE IF NOT EXISTS public.deposits (
    id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL REFERENCES public.users(email) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    amount NUMERIC(18, 4) NOT NULL,
    coin TEXT NOT NULL DEFAULT 'USDC',
    method TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    proof TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Transactions Ledger Table (Stores all deposit, withdrawal, investment, and reward transactions)
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    user_email TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'investment', 'reward', 'transfer')),
    asset TEXT NOT NULL,
    amount NUMERIC(18, 4) NOT NULL,
    fee NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    net_amount NUMERIC(18, 4) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('completed', 'pending', 'failed', 'compliance_review', 'approved', 'rejected')),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    tx_hash TEXT,
    reference TEXT
);

-- 4. Active Investments / Staking Vaults Table
CREATE TABLE IF NOT EXISTS public.investments (
    id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL REFERENCES public.users(email) ON DELETE CASCADE,
    invested_amount NUMERIC(18, 4) NOT NULL,
    plan_name TEXT NOT NULL,
    daily_earning NUMERIC(18, 4) NOT NULL,
    total_earned NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    date_invested DATE NOT NULL DEFAULT CURRENT_DATE,
    roi_date DATE NOT NULL,
    total_days INT NOT NULL DEFAULT 30,
    days_passed INT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'PENDING', 'WITHDRAWN'))
);

-- 5. KYC Submissions Table
CREATE TABLE IF NOT EXISTS public.kyc_submissions (
    id TEXT PRIMARY KEY,
    user_email TEXT UNIQUE NOT NULL REFERENCES public.users(email) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    dob TEXT,
    country TEXT,
    id_type TEXT,
    id_number TEXT,
    front_image TEXT,
    back_image TEXT,
    selfie_image TEXT,
    address_image TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT
);

-- 6. Support Chats Table
CREATE TABLE IF NOT EXISTS public.support_chats (
    id TEXT PRIMARY KEY,
    user_email TEXT UNIQUE NOT NULL REFERENCES public.users(email) ON DELETE CASCADE,
    messages JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Withdrawals Table
CREATE TABLE IF NOT EXISTS public.withdrawals (
    id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL REFERENCES public.users(email) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    coin TEXT NOT NULL DEFAULT 'USDT',
    amount NUMERIC(18, 4) NOT NULL,
    address TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'))
);

-- ============================================================================
-- Row Level Security (RLS) & Performance Indexes
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

-- Allow authenticated or public read/write access (or tailor policies as per Supabase auth roles)
CREATE POLICY "Enable all access for users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for deposits" ON public.deposits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for investments" ON public.investments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for kyc" ON public.kyc_submissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for support_chats" ON public.support_chats FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for withdrawals" ON public.withdrawals FOR ALL USING (true) WITH CHECK (true);

-- Indexes for lightning-fast queries
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_deposits_user_email ON public.deposits(user_email);
CREATE INDEX IF NOT EXISTS idx_transactions_email ON public.transactions(user_email);
CREATE INDEX IF NOT EXISTS idx_investments_email ON public.investments(user_email);
CREATE INDEX IF NOT EXISTS idx_withdrawals_email ON public.withdrawals(user_email);
