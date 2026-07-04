import { ethers, FetchRequest } from 'ethers';
import { RITUAL_TESTNET, RITUAL_MAINNET, DEFAULT_PROVIDER_OPTIONS } from './config';
import type { ProviderOptions } from './types';

class RitualProviderManager {
  private static instance: RitualProviderManager;
  private providers: Map<string, ethers.JsonRpcProvider> = new Map();

  private constructor() {}

  public static getInstance(): RitualProviderManager {
    if (!RitualProviderManager.instance) {
      RitualProviderManager.instance = new RitualProviderManager();
    }
    return RitualProviderManager.instance;
  }

  public getProvider(isMainnet: boolean, options: ProviderOptions = DEFAULT_PROVIDER_OPTIONS): ethers.JsonRpcProvider {
    const config = isMainnet ? RITUAL_MAINNET : RITUAL_TESTNET;
    const cacheKey = `${config.rpcUrl}-${options.timeoutMs}-${options.maxRetries}`;

    if (this.providers.has(cacheKey)) {
      return this.providers.get(cacheKey)!;
    }

    const fetchReq = new FetchRequest(config.rpcUrl);
    if (options.timeoutMs) {
      fetchReq.timeout = options.timeoutMs;
    }

    // Configure retry logic
    const originalSend = fetchReq.send.bind(fetchReq);
    fetchReq.send = async () => {
      let attempts = 0;
      const maxRetries = options.maxRetries || 3;
      
      while (attempts <= maxRetries) {
        try {
          return await originalSend();
        } catch (error: any) {
          attempts++;
          if (attempts > maxRetries) {
            throw error;
          }
          // Exponential backoff: 500ms, 1000ms, 2000ms...
          const backoff = 500 * Math.pow(2, attempts - 1);
          await new Promise(resolve => setTimeout(resolve, backoff));
        }
      }
      throw new Error("Max retries exceeded");
    };

    const provider = new ethers.JsonRpcProvider(fetchReq, undefined, { staticNetwork: true });
    this.providers.set(cacheKey, provider);
    
    return provider;
  }

  public clearCache() {
    this.providers.clear();
  }
}

/**
 * Gets a robust, cached, and retry-enabled Ritual JSON-RPC Provider.
 * @param isMainnet Whether to connect to Mainnet or Testnet.
 */
export const getRitualProvider = (isMainnet: boolean = false): ethers.JsonRpcProvider => {
  return RitualProviderManager.getInstance().getProvider(isMainnet);
};
