export interface NetworkConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  isMainnet: boolean;
}

export interface ProviderOptions {
  timeoutMs?: number;
  maxRetries?: number;
}

export interface GasEstimate {
  gasLimit: bigint;
  gasPrice: bigint;
  totalCostEther: string;
}

export class RitualNetworkError extends Error {
  public readonly code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = 'RitualNetworkError';
    this.code = code;
  }
}
