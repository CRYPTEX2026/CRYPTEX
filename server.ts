import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize Gemini AI SDK if API key is present
const geminiApiKey = process.env.GEMINI_API_KEY || '';
const ai = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;

// In-Memory Database for CRYPTEX Platform
interface User {
  id: string;
  email: string;
  fullName: string;
  btcWalletAddress?: string;
  role: 'customer' | 'admin' | 'compliance_officer' | 'finance_manager' | 'risk_officer' | 'support_agent';
  mfaEnabled: boolean;
  mfaSecret?: string;
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

interface Asset {
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

interface Wallet {
  id: string;
  userId: string;
  currency: string;
  balance: number;
  lockedBalance: number;
  address: string;
  network: string;
}

interface Transaction {
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

interface InvestmentProduct {
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

interface InvestmentPosition {
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

interface SupportTicket {
  id: string;
  userId: string;
  userEmail: string;
  subject: string;
  category: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
  messages: { sender: 'user' | 'support'; message: string; timestamp: string }[];
}

interface AuditLog {
  id: string;
  userId?: string;
  adminEmail?: string;
  action: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

// Seed Data
let users: User[] = [
  {
    id: 'usr_1',
    email: 'client@cryptex.global',
    fullName: 'Alex Morgan',
    role: 'customer',
    mfaEnabled: true,
    kycStatus: 'approved',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  },
  {
    id: 'usr_admin',
    email: 'admin@cryptex.global',
    fullName: 'Victoria Sterling (Super Admin)',
    role: 'admin',
    mfaEnabled: true,
    kycStatus: 'approved',
    createdAt: new Date(Date.now() - 86400000 * 90).toISOString(),
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
  },
  {
    id: 'usr_admin_custom',
    email: 'Cryptex2026',
    fullName: 'Cryptex System Administrator',
    role: 'admin',
    mfaEnabled: true,
    kycStatus: 'approved',
    createdAt: new Date().toISOString(),
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
  }
];

let assets: Asset[] = [
  { symbol: 'BTC', name: 'Bitcoin', price: 92450.80, change24h: 3.42, volume24h: 42150000000, sparkline: [89000, 90200, 89800, 91500, 92100, 91800, 92450], category: 'Layer 1', networks: ['Bitcoin', 'Lightning', 'Ethereum (WBTC)'], depositEnabled: true, withdrawalEnabled: true },
  { symbol: 'ETH', name: 'Ethereum', price: 3420.50, change24h: -1.15, volume24h: 21400000000, sparkline: [3500, 3480, 3420, 3390, 3440, 3400, 3420], category: 'Layer 1', networks: ['Ethereum (ERC-20)', 'Arbitrum', 'Optimism', 'Base'], depositEnabled: true, withdrawalEnabled: true },
  { symbol: 'SOL', name: 'Solana', price: 215.30, change24h: 6.84, volume24h: 7890000000, sparkline: [198, 202, 205, 210, 208, 212, 215], category: 'Layer 1', networks: ['Solana'], depositEnabled: true, withdrawalEnabled: true },
  { symbol: 'AVAX', name: 'Avalanche', price: 38.40, change24h: 2.10, volume24h: 1200000000, sparkline: [36, 37, 36.5, 37.8, 38.1, 37.9, 38.4], category: 'Layer 1', networks: ['Avalanche C-Chain'], depositEnabled: true, withdrawalEnabled: true },
  { symbol: 'USDC', name: 'USD Coin', price: 1.00, change24h: 0.01, volume24h: 8900000000, sparkline: [1, 1, 1, 1, 1, 1, 1], category: 'Stablecoin', networks: ['Ethereum', 'Solana', 'Polygon', 'Arbitrum', 'Base'], depositEnabled: true, withdrawalEnabled: true },
  { symbol: 'LINK', name: 'Chainlink', price: 18.90, change24h: 4.25, volume24h: 950000000, sparkline: [17.5, 17.8, 18.1, 18.0, 18.5, 18.6, 18.9], category: 'AI & Data', networks: ['Ethereum', 'Polygon'], depositEnabled: true, withdrawalEnabled: true },
  { symbol: 'NEAR', name: 'NEAR Protocol', price: 6.75, change24h: -0.80, volume24h: 410000000, sparkline: [6.9, 6.8, 6.7, 6.75, 6.8, 6.6, 6.75], category: 'AI & Data', networks: ['NEAR', 'Arbitrum'], depositEnabled: true, withdrawalEnabled: true }
];

let wallets: Wallet[] = [
  { id: 'wal_1', userId: 'usr_1', currency: 'USDC', balance: 45200.00, lockedBalance: 5000.00, address: '0x71C...8b29', network: 'Ethereum (ERC-20)' },
  { id: 'wal_2', userId: 'usr_1', currency: 'BTC', balance: 1.25, lockedBalance: 0.0, address: 'bc1q...9xyz', network: 'Bitcoin' },
  { id: 'wal_3', userId: 'usr_1', currency: 'ETH', balance: 8.50, lockedBalance: 2.0, address: '0x71C...8b29', network: 'Ethereum (ERC-20)' },
  { id: 'wal_4', userId: 'usr_1', currency: 'SOL', balance: 65.00, lockedBalance: 0.0, address: 'H7x...9kp1', network: 'Solana' }
];

let transactions: Transaction[] = [
  { id: 'tx_101', userId: 'usr_1', type: 'deposit', asset: 'USDC', amount: 25000.00, fee: 0.00, netAmount: 25000.00, status: 'completed', timestamp: new Date(Date.now() - 86400000 * 5).toISOString(), txHash: '0x9f8...3e1a', reference: 'Bank Wire Transfer - SWIFT' },
  { id: 'tx_102', userId: 'usr_1', type: 'investment', asset: 'USDC', amount: 15000.00, fee: 15.00, netAmount: 14985.00, status: 'completed', timestamp: new Date(Date.now() - 86400000 * 4).toISOString(), reference: 'Allocated to BTC Smart Yield Vault' },
  { id: 'tx_103', userId: 'usr_1', type: 'deposit', asset: 'BTC', amount: 0.5, fee: 0.0, netAmount: 0.5, status: 'completed', timestamp: new Date(Date.now() - 86400000 * 12).toISOString(), txHash: '0x4a2...7c9b', reference: 'External Wallet Deposit' },
  { id: 'tx_104', userId: 'usr_1', type: 'withdrawal', asset: 'USDC', amount: 2500.00, fee: 5.00, netAmount: 2495.00, status: 'completed', timestamp: new Date(Date.now() - 86400000 * 20).toISOString(), txHash: '0x1b8...9d4e', reference: 'Withdrawal to Bank Account' }
];

let investmentProducts: InvestmentProduct[] = [
  {
    id: 'prod_1',
    name: 'Bitcoin Alpha Yield Vault',
    asset: 'BTC',
    category: 'Yield Strategy',
    targetReturn: '8.4% - 12.2% APY (Variable)',
    riskLevel: 'Moderate',
    minInvestment: 0.05,
    lockupPeriod: '30 Days',
    fees: '0.5% Management / 10% Performance',
    liquidity: 'Monthly Redemption Window',
    description: 'Algorithmic delta-neutral market making and institutional lending backed by overcollateralized positions.',
    strategy: 'Executes automated basis trading across tier-1 spot and perpetual derivatives exchanges with strict risk limits.',
    assetExposure: ['BTC', 'USDC'],
    status: 'active'
  },
  {
    id: 'prod_2',
    name: 'Ethereum Institutional Staking Trust',
    asset: 'ETH',
    category: 'Proof-of-Stake',
    targetReturn: '4.8% APY (Variable)',
    riskLevel: 'Low',
    minInvestment: 0.5,
    lockupPeriod: 'None (Liquid Staking)',
    fees: '0.25% Annual Fee',
    liquidity: 'Immediate via Liquidity Pool',
    description: 'Secure, institutional validator staking backed by Tier-1 ISO-certified custody infrastructure.',
    strategy: 'Participates directly in Ethereum consensus protocol validation with zero slashing insurance fund.',
    assetExposure: ['ETH'],
    status: 'active'
  },
  {
    id: 'prod_3',
    name: 'Multichain DeFi Blue-Chip Index',
    asset: 'USDC',
    category: 'Index Fund',
    targetReturn: '14.5% Historical Avg (Variable)',
    riskLevel: 'High',
    minInvestment: 1000,
    lockupPeriod: '90 Days',
    fees: '1.0% Management',
    liquidity: 'Quarterly Rebalancing Window',
    description: 'A diversified basket of top-tier decentralized finance assets rebalanced dynamically based on TVL and volatility metrics.',
    strategy: 'Diversified exposure to leading decentralized lending, oracle, and liquidity protocol governance tokens.',
    assetExposure: ['ETH', 'SOL', 'AVAX', 'LINK'],
    status: 'active'
  },
  {
    id: 'prod_4',
    name: 'AI & Data Infrastructure Growth Fund',
    asset: 'USDC',
    category: 'Venture / Growth',
    targetReturn: '22.0% Target IRR (Variable)',
    riskLevel: 'Aggressive',
    minInvestment: 5000,
    lockupPeriod: '365 Days',
    fees: '1.5% Management / 15% Performance',
    liquidity: 'Locked for 1 Year',
    description: 'Targeted allocation into decentralized AI compute networks, decentralized storage, and cryptographic oracle infrastructure.',
    strategy: 'Equity and token allocations in high-growth decentralized AI and machine learning compute protocols.',
    assetExposure: ['NEAR', 'LINK', 'SOL'],
    status: 'active'
  }
];

let platformSettings = {
  announcement: 'Welcome to CRYPTEX Global - Institutional Digital Asset Management',
  maintenanceMode: false,
  tradingEnabled: true,
  depositEnabled: true,
  withdrawalEnabled: true,
  companyWalletAddress: '0x71C92A8b29F41bE8e4d22199b08f8c29124a9102'
};

let investmentPositions: InvestmentPosition[] = [
  {
    id: 'pos_1',
    userId: 'usr_1',
    productId: 'prod_1',
    productName: 'Bitcoin Alpha Yield Vault',
    asset: 'BTC',
    investedAmount: 1.0,
    currentValue: 1.085,
    gainLoss: 0.085,
    gainLossPercent: 8.5,
    startDate: new Date(Date.now() - 86400000 * 45).toISOString(),
    status: 'active'
  },
  {
    id: 'pos_2',
    userId: 'usr_1',
    productId: 'prod_2',
    productName: 'Ethereum Institutional Staking Trust',
    asset: 'ETH',
    investedAmount: 5.0,
    currentValue: 5.210,
    gainLoss: 0.210,
    gainLossPercent: 4.2,
    startDate: new Date(Date.now() - 86400000 * 60).toISOString(),
    status: 'active'
  }
];

let supportTickets: SupportTicket[] = [
  {
    id: 'tic_101',
    userId: 'usr_1',
    userEmail: 'client@cryptex.global',
    subject: 'Question regarding monthly yield distribution schedule',
    category: 'Investments',
    status: 'resolved',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    messages: [
      { sender: 'user', message: 'Hello, when are yields for the Bitcoin Alpha Vault credited to my wallet?', timestamp: new Date(Date.now() - 86400000 * 3).toISOString() },
      { sender: 'support', message: 'Yields are automatically compounded or credited to your USDC wallet on the 1st of every calendar month.', timestamp: new Date(Date.now() - 86400000 * 2).toISOString() }
    ]
  }
];

let auditLogs: AuditLog[] = [
  { id: 'aud_1', userId: 'usr_1', action: 'USER_LOGIN', details: 'Successful login from Chrome / macOS', ipAddress: '192.168.1.50', timestamp: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: 'aud_2', userId: 'usr_1', action: 'INVESTMENT_CREATED', details: 'Allocated 1.0 BTC into Bitcoin Alpha Yield Vault', ipAddress: '192.168.1.50', timestamp: new Date(Date.now() - 86400000 * 4).toISOString() }
];

const app = express();
app.use(express.json());

// Session Mock State (in memory token storage)
const activeSessions = new Map<string, string>(); // token -> userId

// API Routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Invalid username/email or password.' });
  }
  if (user.email === 'Cryptex2026' && password !== 'CRYP_tex26@') {
    return res.status(401).json({ error: 'Invalid administrator password.' });
  }
  // In demo mode, accept any password
  const token = 'tok_' + Math.random().toString(36).substring(2) + Date.now();
  activeSessions.set(token, user.id);

  auditLogs.unshift({
    id: 'aud_' + Date.now(),
    userId: user.id,
    action: 'USER_LOGIN',
    details: `Successful login for ${user.email}`,
    ipAddress: req.ip || '127.0.0.1',
    timestamp: new Date().toISOString()
  });

  res.json({ token, user });
});

app.post('/api/auth/register', (req, res) => {
  const { email, fullName, password, btcWalletAddress } = req.body;
  if (!email || !fullName) {
    return res.status(400).json({ error: 'Email and full name are required.' });
  }
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: 'Email already registered.' });
  }

  const newUser: User = {
    id: 'usr_' + Date.now(),
    email,
    fullName,
    btcWalletAddress: btcWalletAddress || undefined,
    role: 'customer',
    mfaEnabled: false,
    kycStatus: 'not_started',
    createdAt: new Date().toISOString(),
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
  };

  users.push(newUser);

  // Initialize wallets for new user with 0 balance
  wallets.push(
    { id: 'wal_' + Date.now() + '_1', userId: newUser.id, currency: 'USDC', balance: 0, lockedBalance: 0, address: '0x92A...14e2', network: 'Ethereum' },
    { id: 'wal_' + Date.now() + '_2', userId: newUser.id, currency: 'BTC', balance: 0, lockedBalance: 0, address: 'bc1q...8abc', network: 'Bitcoin' },
    { id: 'wal_' + Date.now() + '_3', userId: newUser.id, currency: 'ETH', balance: 0, lockedBalance: 0, address: '0x92A...14e2', network: 'Ethereum' }
  );

  const token = 'tok_' + Math.random().toString(36).substring(2) + Date.now();
  activeSessions.set(token, newUser.id);

  auditLogs.unshift({
    id: 'aud_' + Date.now(),
    userId: newUser.id,
    action: 'USER_REGISTERED',
    details: `New account registered for ${email}`,
    ipAddress: req.ip || '127.0.0.1',
    timestamp: new Date().toISOString()
  });

  res.json({ token, user: newUser });
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : '';
  const userId = activeSessions.get(token);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized or session expired.' });
  }
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(401).json({ error: 'User not found.' });
  }
  res.json({ user });
});

app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : '';
  if (token) activeSessions.delete(token);
  res.json({ success: true });
});

// Markets
app.get('/api/markets', (req, res) => {
  res.json({ assets, timestamp: new Date().toISOString() });
});

// Portfolio & Wallets
app.get('/api/user/portfolio', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : '';
  const userId = activeSessions.get(token) || 'usr_1'; // fallback to demo user for ease

  const userWallets = wallets.filter(w => w.userId === userId);
  const userPositions = investmentPositions.filter(p => p.userId === userId);

  // Calculate total portfolio value in USD
  let totalBalanceUSD = 0;
  userWallets.forEach(w => {
    const assetObj = assets.find(a => a.symbol === w.currency);
    const price = assetObj ? assetObj.price : (w.currency === 'USDC' ? 1 : 100);
    totalBalanceUSD += (w.balance + w.lockedBalance) * price;
  });

  let totalInvestedUSD = 0;
  userPositions.forEach(p => {
    const assetObj = assets.find(a => a.symbol === p.asset);
    const price = assetObj ? assetObj.price : 100;
    totalInvestedUSD += p.currentValue * price;
  });

  res.json({
    totalValueUSD: totalBalanceUSD + totalInvestedUSD,
    availableBalanceUSD: totalBalanceUSD,
    investedAmountUSD: totalInvestedUSD,
    unrealizedGainUSD: totalInvestedUSD * 0.082,
    wallets: userWallets,
    positions: userPositions
  });
});

app.get('/api/user/transactions', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : '';
  const userId = activeSessions.get(token) || 'usr_1';
  const userTx = transactions.filter(t => t.userId === userId);
  res.json({ transactions: userTx });
});

// Investments
app.get('/api/investments/products', (req, res) => {
  res.json({ products: investmentProducts });
});

app.post('/api/investments/allocate', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : '';
  const userId = activeSessions.get(token) || 'usr_1';
  const { productId, amount } = req.body;

  const product = investmentProducts.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: 'Investment product not found.' });
  }

  if (amount < product.minInvestment) {
    return res.status(400).json({ error: `Minimum investment is ${product.minInvestment} ${product.asset}` });
  }

  // Check wallet balance
  const wallet = wallets.find(w => w.userId === userId && w.currency === product.asset);
  if (!wallet || wallet.balance < amount) {
    return res.status(400).json({ error: `Insufficient ${product.asset} balance in wallet.` });
  }

  // Deduct wallet balance
  wallet.balance -= amount;
  wallet.lockedBalance += amount;

  // Create position
  const newPosition: InvestmentPosition = {
    id: 'pos_' + Date.now(),
    userId,
    productId: product.id,
    productName: product.name,
    asset: product.asset,
    investedAmount: amount,
    currentValue: amount,
    gainLoss: 0,
    gainLossPercent: 0,
    startDate: new Date().toISOString(),
    status: 'active'
  };
  investmentPositions.push(newPosition);

  // Record transaction
  transactions.unshift({
    id: 'tx_' + Date.now(),
    userId,
    type: 'investment',
    asset: product.asset,
    amount,
    fee: amount * 0.001,
    netAmount: amount * 0.999,
    status: 'completed',
    timestamp: new Date().toISOString(),
    reference: `Allocated to ${product.name}`
  });

  auditLogs.unshift({
    id: 'aud_' + Date.now(),
    userId,
    action: 'INVESTMENT_ALLOCATED',
    details: `Allocated ${amount} ${product.asset} into ${product.name}`,
    ipAddress: req.ip || '127.0.0.1',
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, position: newPosition });
});

// Deposits & Withdrawals
app.post('/api/wallets/deposit', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : '';
  const userId = activeSessions.get(token) || 'usr_1';
  const { currency, amount, network } = req.body;

  let wallet = wallets.find(w => w.userId === userId && w.currency === currency);
  if (!wallet) {
    wallet = {
      id: 'wal_' + Date.now(),
      userId,
      currency,
      balance: 0,
      lockedBalance: 0,
      address: '0x71C...' + Math.random().toString(36).substring(2, 6),
      network: network || 'Ethereum'
    };
    wallets.push(wallet);
  }

  const tx: Transaction = {
    id: 'tx_' + Date.now(),
    userId,
    type: 'deposit',
    asset: currency,
    amount: Number(amount),
    fee: 0,
    netAmount: Number(amount),
    status: 'pending',
    timestamp: new Date().toISOString(),
    txHash: '0x' + Math.random().toString(16).substring(2, 42),
    reference: `Deposit via ${network || 'Blockchain'} (Pending Admin Approval)`
  };
  transactions.unshift(tx);

  res.json({ success: true, transaction: tx, message: 'Deposit request submitted successfully. Pending admin approval.' });
});

app.post('/api/wallets/withdraw', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : '';
  const userId = activeSessions.get(token) || 'usr_1';
  const { currency, amount, destinationAddress, network } = req.body;

  const wallet = wallets.find(w => w.userId === userId && w.currency === currency);
  if (!wallet || wallet.balance < Number(amount)) {
    return res.status(400).json({ error: 'Insufficient balance for withdrawal.' });
  }

  const fee = currency === 'USDC' ? 5.0 : 0.0002;
  const netAmount = Number(amount) - fee;

  wallet.balance -= Number(amount);

  const tx: Transaction = {
    id: 'tx_' + Date.now(),
    userId,
    type: 'withdrawal',
    asset: currency,
    amount: Number(amount),
    fee,
    netAmount,
    status: 'completed',
    timestamp: new Date().toISOString(),
    txHash: '0x' + Math.random().toString(16).substring(2, 42),
    reference: `Withdrawal to ${destinationAddress.substring(0, 8)}... (${network})`
  };
  transactions.unshift(tx);

  res.json({ success: true, transaction: tx, wallet });
});

// KYC
app.post('/api/kyc/submit', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : '';
  const userId = activeSessions.get(token) || 'usr_1';
  const user = users.find(u => u.id === userId);
  if (user) {
    user.kycStatus = 'pending';
  }
  res.json({ success: true, kycStatus: 'pending' });
});

// Support
app.get('/api/support/tickets', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : '';
  const userId = activeSessions.get(token) || 'usr_1';
  res.json({ tickets: supportTickets.filter(t => t.userId === userId) });
});

app.post('/api/support/tickets', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : '';
  const userId = activeSessions.get(token) || 'usr_1';
  const user = users.find(u => u.id === userId);
  const { subject, category, message } = req.body;

  const newTicket: SupportTicket = {
    id: 'tic_' + Date.now(),
    userId,
    userEmail: user?.email || 'client@cryptex.global',
    subject,
    category,
    status: 'open',
    createdAt: new Date().toISOString(),
    messages: [{ sender: 'user', message, timestamp: new Date().toISOString() }]
  };
  supportTickets.unshift(newTicket);
  res.json({ success: true, ticket: newTicket });
});

// AI Market Insights Endpoint using Google GenAI SDK
app.post('/api/ai/market-analysis', async (req, res) => {
  try {
    if (!ai) {
      return res.json({ analysis: "Gemini API key not configured. CRYPTEX market intelligence engine is operating on standard statistical models." });
    }

    const { assetSymbol, prompt } = req.body;
    const targetAsset = assets.find(a => a.symbol === (assetSymbol || 'BTC'));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are an expert crypto market analyst for CRYPTEX. Analyze the following asset: ${JSON.stringify(targetAsset)}. User query: ${prompt || 'Provide a professional macroeconomic and technical sentiment overview without financial advice or guaranteed profit claims.'}`
    });

    res.json({ analysis: response.text });
  } catch (err: any) {
    console.error('AI Analysis Error:', err);
    res.status(500).json({ error: 'Failed to generate AI market analysis.' });
  }
});

// Admin endpoints
app.get('/api/admin/overview', (req, res) => {
  res.json({
    totalUsers: users.length,
    totalAUM: 124500000,
    pendingKYC: users.filter(u => u.kycStatus === 'pending' || u.kycStatus === 'under_review').length,
    pendingWithdrawals: transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending').length,
    auditLogs: auditLogs.slice(0, 15)
  });
});

// Platform Settings Public API
app.get('/api/platform/settings', (req, res) => {
  res.json({ settings: platformSettings });
});

// Admin Control Endpoints
app.post('/api/admin/settings', (req, res) => {
  const { announcement, maintenanceMode, tradingEnabled, depositEnabled, withdrawalEnabled, companyWalletAddress } = req.body;
  platformSettings = {
    announcement: announcement ?? platformSettings.announcement,
    maintenanceMode: maintenanceMode ?? platformSettings.maintenanceMode,
    tradingEnabled: tradingEnabled ?? platformSettings.tradingEnabled,
    depositEnabled: depositEnabled ?? platformSettings.depositEnabled,
    withdrawalEnabled: withdrawalEnabled ?? platformSettings.withdrawalEnabled,
    companyWalletAddress: companyWalletAddress ?? platformSettings.companyWalletAddress
  };

  auditLogs.unshift({
    id: 'aud_' + Date.now(),
    adminEmail: 'admin@cryptex.global',
    action: 'UPDATE_PLATFORM_SETTINGS',
    details: `Updated platform configuration & frontend controls`,
    ipAddress: req.ip || '127.0.0.1',
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, settings: platformSettings });
});

app.post('/api/admin/products', (req, res) => {
  const { name, asset, category, targetReturn, riskLevel, minInvestment, lockupPeriod, fees, liquidity, description } = req.body;
  const newProduct: InvestmentProduct = {
    id: 'prod_' + Date.now(),
    name,
    asset,
    category,
    targetReturn,
    riskLevel,
    minInvestment: Number(minInvestment),
    lockupPeriod,
    fees,
    liquidity,
    description,
    strategy: 'Managed professional allocation strategy.',
    assetExposure: [asset, 'USDC'],
    status: 'active'
  };
  investmentProducts.push(newProduct);

  auditLogs.unshift({
    id: 'aud_' + Date.now(),
    adminEmail: 'admin@cryptex.global',
    action: 'CREATE_INVESTMENT_PRODUCT',
    details: `Created new investment product: ${name}`,
    ipAddress: req.ip || '127.0.0.1',
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, product: newProduct });
});

app.delete('/api/admin/products/:id', (req, res) => {
  const { id } = req.params;
  investmentProducts = investmentProducts.filter(p => p.id !== id);
  res.json({ success: true });
});

// Admin Deposit & Withdrawal Actions
app.post('/api/admin/deposits/:id/approve', (req, res) => {
  const { id } = req.params;
  const tx = transactions.find(t => t.id === id && t.type === 'deposit');
  if (!tx || tx.status === 'completed') {
    return res.status(404).json({ error: 'Pending deposit transaction not found.' });
  }

  tx.status = 'completed';
  tx.reference = tx.reference.replace(' (Pending Admin Approval)', ' (Approved by Admin)');

  // Credit user wallet
  let wallet = wallets.find(w => w.userId === tx.userId && w.currency === tx.asset);
  if (!wallet) {
    wallet = {
      id: 'wal_' + Date.now(),
      userId: tx.userId,
      currency: tx.asset,
      balance: 0,
      lockedBalance: 0,
      address: '0x71C...' + Math.random().toString(36).substring(2, 6),
      network: 'Ethereum'
    };
    wallets.push(wallet);
  }
  wallet.balance += tx.amount;

  auditLogs.unshift({
    id: 'aud_' + Date.now(),
    adminEmail: 'admin@cryptex.global',
    action: 'APPROVE_DEPOSIT',
    details: `Approved deposit of ${tx.amount} ${tx.asset} for user ${tx.userId}`,
    ipAddress: req.ip || '127.0.0.1',
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, transaction: tx });
});

app.post('/api/admin/withdrawals/:id/approve', (req, res) => {
  const { id } = req.params;
  const tx = transactions.find(t => t.id === id && t.type === 'withdrawal');
  if (!tx) {
    return res.status(404).json({ error: 'Withdrawal transaction not found.' });
  }
  tx.status = 'completed';
  res.json({ success: true, transaction: tx });
});

app.post('/api/admin/withdrawals/:id/reject', (req, res) => {
  const { id } = req.params;
  const tx = transactions.find(t => t.id === id && t.type === 'withdrawal');
  if (!tx) {
    return res.status(404).json({ error: 'Withdrawal transaction not found.' });
  }
  tx.status = 'failed';
  // Refund user wallet
  const wallet = wallets.find(w => w.userId === tx.userId && w.currency === tx.asset);
  if (wallet) {
    wallet.balance += tx.amount;
  }
  res.json({ success: true, transaction: tx });
});

app.post('/api/admin/users/:id/action', (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // 'approve_account' | 'suspend' | 'block' | 'delete'

  if (action === 'delete') {
    users = users.filter(u => u.id !== id);
    return res.json({ success: true, message: 'User account deleted.' });
  }

  const targetUser = users.find(u => u.id === id);
  if (!targetUser) return res.status(404).json({ error: 'User not found.' });

  if (action === 'approve_account') {
    targetUser.kycStatus = 'approved';
  } else if (action === 'suspend') {
    targetUser.kycStatus = 'restricted' as any;
  } else if (action === 'block') {
    targetUser.kycStatus = 'rejected';
  }

  res.json({ success: true, user: targetUser });
});

app.get('/api/admin/users/:id/profile', (req, res) => {
  const { id } = req.params;
  const targetUser = users.find(u => u.id === id);
  if (!targetUser) return res.status(404).json({ error: 'User not found.' });

  const userWallets = wallets.filter(w => w.userId === id);
  const userPositions = investmentPositions.filter(p => p.userId === id);
  const userTransactions = transactions.filter(t => t.userId === id);

  res.json({
    user: targetUser,
    wallets: userWallets,
    positions: userPositions,
    transactions: userTransactions
  });
});

app.post('/api/admin/users/:id/kyc', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const targetUser = users.find(u => u.id === id);
  if (targetUser) {
    targetUser.kycStatus = status;
  }
  res.json({ success: true, user: targetUser });
});

app.get('/api/admin/users', (req, res) => {
  res.json({ users });
});

app.get('/api/admin/audit-logs', (req, res) => {
  res.json({ auditLogs });
});

// Vite middleware for development
if (process.env.NODE_ENV !== 'production') {
  const vite = await createViteServer({
    server: { middlewareMode: true, hmr: false }
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`CRYPTEX Platform running on http://localhost:${PORT}`);
});
