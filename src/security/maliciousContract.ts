import type { ISecurityProvider, ContractReputation } from './provider';

export class MaliciousContractScanner {
  /**
   * Checks if a target contract has known malicious signatures or bad reputation.
   */
  public static async analyze(contractAddress: string, provider: ISecurityProvider): Promise<ContractReputation> {
    return await provider.getContractReputation(contractAddress);
  }
}
