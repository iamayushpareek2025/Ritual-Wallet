import type { TransactionRequest } from 'ethers';
import type { ISecurityProvider, SimulationResult } from './provider';

export class TransactionSimulator {
  /**
   * Simulates the transaction before broadcasting.
   */
  public static async simulate(tx: TransactionRequest, isMainnet: boolean, provider: ISecurityProvider): Promise<SimulationResult> {
    return await provider.simulateTransaction(tx, isMainnet);
  }
}
