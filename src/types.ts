export interface User {
  id: string;
  email: string;
  fullName: string;
  btcWalletAddress?: string;
  phone?: string;
  dob?: string;
  country?: string;
  role: 'customer' | 'admin' | 'compliance_officer' | 'finance_manager' | 'risk_officer' | 'support_agent';
  mfaEnabled: boolean;
  kycStatus: 'not_started' | 'pending' | 'under_review' | 'approved' | 'rejected';
  createdAt: string;
  avatarUrl?: string;
  balance?: number;
  balances?: {
    USDT: number;
    USDC: number;
    BTC: number;
    ETH: number;
    SOL: number;
  };
}

export interface Asset {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap?: number;
  sparkline: number[];
  category: 'Layer 1' | 'DeFi' | 'AI & Data' | 'Stablecoin' | 'Layer 2';
  networks: string[];
  depositEnabled: boolean;
  withdrawalEnabled: boolean;
}

export interface Wallet {
  id: string;
  userId: string;
  currency: string;
  balance: number;
  lockedBalance: number;
  address: string;
  network: string;
}

export interface Transaction {
  id: string;
  userId: string;
  userEmail?: string;
  type: 'deposit' | 'withdrawal' | 'investment' | 'reward' | 'transfer';
  asset: string;
  amount: number;
  fee: number;
  netAmount: number;
  status: 'completed' | 'pending' | 'failed' | 'compliance_review';
  timestamp: string;
  txHash?: string;
  reference: string;
}

export interface InvestmentProduct {
  id: string;
  name: string;
  asset: string;
  category: string;
  targetReturn: string;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Aggressive';
  minInvestment: number;
  lockupPeriod: string;
  fees: string;
  liquidity: string;
  description: string;
  strategy: string;
  assetExposure: string[];
  status: 'active' | 'closing' | 'paused';
}

export interface InvestmentPosition {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  asset: string;
  investedAmount: number;
  currentValue: number;
  gainLoss: number;
  gainLossPercent: number;
  startDate: string;
  status: 'active' | 'matured' | 'withdrawn';
}

export interface SupportTicket {
  id: string;
  userId: string;
  userEmail: string;
  subject: string;
  category: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
  messages: { sender: 'user' | 'support'; message: string; timestamp: string }[];
}

export interface AuditLog {
  id: string;
  userId?: string;
  adminEmail?: string;
  action: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}
