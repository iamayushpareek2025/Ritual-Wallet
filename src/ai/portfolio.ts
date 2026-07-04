export interface PortfolioContext {
  address: string;
  nativeBalance: string;
  usdcBalance: string;
  stakedUsdc: string;
  network: string;
}

export class PortfolioAnalyzer {
  /**
   * Converts raw wallet state into a formatted string for the AI's system prompt.
   */
  public static formatContext(context: PortfolioContext): string {
    return `
WALLET ADDRESS: ${context.address}
CURRENT NETWORK: ${context.network}
RITUAL BALANCE: ${context.nativeBalance}
USDC BALANCE: ${context.usdcBalance}
STAKED USDC: ${context.stakedUsdc}
    `.trim();
  }
}
