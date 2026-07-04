import type { ISocialProvider } from './provider';

export class ReputationManager {
  /**
   * Evaluates the on-chain and social reputation of a given address.
   */
  public static async getScore(address: string, provider: ISocialProvider): Promise<number> {
    return await provider.getReputation(address);
  }
}
