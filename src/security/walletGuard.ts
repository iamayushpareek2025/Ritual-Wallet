import type { TransactionRequest } from 'ethers';
import { MockSecurityProvider } from './provider';
import type { ISecurityProvider, SimulationResult } from './provider';
import { TransactionRiskAnalyzer } from './transactionRisk';
import type { SecurityReport } from './transactionRisk';
import { TransactionSimulator } from './simulation';

export class WalletGuard {
  private static instance: WalletGuard;
  private provider: ISecurityProvider;

  private constructor() {
    this.provider = new MockSecurityProvider();
  }

  public static getInstance(): WalletGuard {
    if (!WalletGuard.instance) {
      WalletGuard.instance = new WalletGuard();
    }
    return WalletGuard.instance;
  }

  public setProvider(provider: ISecurityProvider) {
    this.provider = provider;
  }

  /**
   * Evaluates a transaction's risk before it is sent.
   */
  public async guardTransaction(tx: TransactionRequest, isMainnet: boolean): Promise<{
    isSafe: boolean;
    report: SecurityReport;
    simulation: SimulationResult;
  }> {
    const report = await TransactionRiskAnalyzer.analyze(tx, this.provider);
    const simulation = await TransactionSimulator.simulate(tx, isMainnet, this.provider);

    // If simulation fails, we instantly mark it as unsafe.
    if (!simulation.success) {
      report.isSafe = false;
      report.warnings.push('CRITICAL: Transaction simulation failed. This transaction will likely revert.');
      report.score = 100;
    }

    return {
      isSafe: report.isSafe,
      report,
      simulation
    };
  }
}
