import { AddressValidator } from '../security/addressValidator';
import { MockSecurityProvider } from '../security/provider';
import { useWalletStore } from '../stores/useWalletStore';

export interface PortfolioContext {
  address: string;
  network: string;
  chainId: number;
  nativeBalance: string;
  usdcBalance: string;
  stakedUsdc: string;
  tokenHoldings: Array<{ symbol: string; balance: string; valueUsd: string }>;
  recentTransactions: Array<{ hash: string; to: string; amount: string; type: string; date: number }>;
  securityScore: number;
  walletHealth: string;
  gasStatus: string;
}

export class PortfolioAnalyzer {
  public static formatContext(context: PortfolioContext): string {
    const txsStr = context.recentTransactions.map(t => 
      `- Hash: ${t.hash.slice(0, 10)}..., To: ${t.to}, Amount: ${t.amount}, Type: ${t.type}, Date: ${new Date(t.date).toLocaleDateString()}`
    ).join('\n');

    const holdingsStr = context.tokenHoldings.map(h =>
      `- ${h.symbol}: Balance = ${h.balance}, Value = $${h.valueUsd}`
    ).join('\n');

    return `
WALLET ADDRESS: ${context.address}
CURRENT NETWORK: ${context.network}
CHAIN ID: ${context.chainId}
RITUAL BALANCE: ${context.nativeBalance}
USDC BALANCE: ${context.usdcBalance}
STAKED USDC: ${context.stakedUsdc}
TOKEN HOLDINGS:
${holdingsStr || 'None'}
RECENT TRANSACTIONS:
${txsStr || 'No transactions yet.'}
WALLET SECURITY SCORE: ${context.securityScore}/100
WALLET HEALTH: ${context.walletHealth}
GAS STATUS: ${context.gasStatus}
    `.trim();
  }
}

export async function getLivePortfolioContext(): Promise<PortfolioContext> {
  const store = useWalletStore.getState();
  const address = store.address || '';
  const isMainnet = store.isMainnet;
  const balance = store.balance || '0.0';
  const usdc = store.usdcBalance || '0.00';
  const staked = store.stakedUsdc || '0.00';

  // Fetch security info
  let score = 90;
  let health = 'Healthy';
  if (address) {
    try {
      const secResult = await AddressValidator.analyzeAddress(address, new MockSecurityProvider());
      if (secResult.valid && secResult.risk) {
        score = 100 - secResult.risk.score;
        health = score > 70 ? 'Healthy' : 'At Risk';
      }
    } catch {}
  }

  // Set default gas status
  const gasStatus = 'Low (0.00015 RITUAL)';

  const holdings = [
    { symbol: 'RITUAL', balance: balance, valueUsd: (parseFloat(balance) * 150).toFixed(2) },
    { symbol: 'USDC', balance: usdc, valueUsd: parseFloat(usdc).toFixed(2) }
  ];

  const txs = store.transactions || [];

  return {
    address,
    network: isMainnet ? 'Ritual Mainnet' : 'Ritual Testnet',
    chainId: isMainnet ? 80001 : 1979,
    nativeBalance: balance,
    usdcBalance: usdc,
    stakedUsdc: staked,
    tokenHoldings: holdings,
    recentTransactions: txs.map(t => ({
      hash: t.hash,
      to: t.to,
      amount: t.amount,
      type: t.type,
      date: typeof t.date === 'string' ? Date.parse(t.date) || Date.now() : t.date
    })),
    securityScore: score,
    walletHealth: health,
    gasStatus
  };
}
