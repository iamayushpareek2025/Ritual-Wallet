import { ethers } from 'ethers';
import { getRitualProvider } from '../ritual/provider';
import { useWalletStore } from '../stores/useWalletStore';

export class BlockchainClient {
  private static inflightRequests: Map<string, Promise<any>> = new Map();

  /**
   * Prevents race conditions and duplicate requests by deduplicating overlapping RPC calls.
   */
  public static async dedupRequest<T>(
    key: string,
    fetcher: () => Promise<T>
  ): Promise<T> {
    if (this.inflightRequests.has(key)) {
      return this.inflightRequests.get(key) as Promise<T>;
    }

    const promise = fetcher().finally(() => {
      this.inflightRequests.delete(key);
    });

    this.inflightRequests.set(key, promise);
    return promise;
  }

  /**
   * Safely execute a contract read call with deduplication and standard error handling.
   */
  public static async safeRead<T>(
    contractAddress: string,
    abi: any,
    method: string,
    args: any[],
    isMainnet: boolean
  ): Promise<T> {
    const key = `read-${contractAddress}-${method}-${JSON.stringify(args)}-${isMainnet}`;
    return this.dedupRequest(key, async () => {
      try {
        const provider = getRitualProvider(isMainnet);
        const contract = new ethers.Contract(contractAddress, abi, provider);
        return await contract[method](...args);
      } catch (error: any) {
        console.error(`[BlockchainClient] safeRead error on ${method}:`, error);
        throw new Error(`Failed to read from contract: ${error.message || error}`);
      }
    });
  }

  /**
   * Get provider
   */
  public static getProvider(isMainnet: boolean) {
    return getRitualProvider(isMainnet);
  }

  /**
   * Get connected wallet instance (signer)
   */
  public static getSigner(privateKey: string, isMainnet: boolean): ethers.Wallet {
    const provider = getRitualProvider(isMainnet);
    return new ethers.Wallet(privateKey, provider);
  }
}
