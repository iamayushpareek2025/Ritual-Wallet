export interface ActionIntent {
  action: 'send' | 'swap' | 'stake' | 'none';
  amount?: string;
  asset?: string;
  to?: string;
}

export class ChatParser {
  /**
   * Naive parser to extract transactional intent from a simulated LLM response.
   * A real implementation would rely on LLM function calling (JSON schema).
   */
  public static extractIntent(response: string): ActionIntent {
    const text = response.toUpperCase();
    
    if (text.includes('SEND')) {
      // Mock extraction: SEND 10 USDC TO 0x123...
      return { action: 'send', amount: '10', asset: 'USDC', to: '0x0000000000000000000000000000000000000000' };
    }
    
    if (text.includes('SWAP')) {
      return { action: 'swap', amount: '100', asset: 'RITUAL' };
    }
    
    return { action: 'none' };
  }
}
