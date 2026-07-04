import type { TransactionRequest } from 'ethers';
import type { ISecurityProvider } from './provider';
import { AddressValidator } from './addressValidator';
import { ethers } from 'ethers';
import { ApprovalScanner } from './approvalScanner';
import { MaliciousContractScanner } from './maliciousContract';

export interface SecurityReport {
  score: number; // 0-100
  isSafe: boolean;
  warnings: string[];
  explanations: string[];
  riskLevel: 'Safe' | 'Low' | 'Medium' | 'High' | 'Critical';
}

export class TransactionRiskAnalyzer {
  /**
   * Computes a holistic risk score for a transaction.
   */
  public static async analyze(tx: TransactionRequest, provider: ISecurityProvider): Promise<SecurityReport> {
    const warnings: string[] = [];
    let score = 0;

    if (tx.to) {
      // 1. Check Address Risk
      const toAddress = await ethers.resolveAddress(tx.to);
      const addrAnalysis = await AddressValidator.analyzeAddress(toAddress, provider);
      if (addrAnalysis.risk) {
        if (addrAnalysis.risk.isMalicious) {
          warnings.push(`Target address is flagged as malicious (${addrAnalysis.risk.tags.join(', ')}).`);
          score += 80;
        } else if (addrAnalysis.risk.score > 30) {
          warnings.push('Target address has a suspicious history.');
          score += 20;
        }
      }

      // 2. Check Contract Reputation
      const contractRep = await MaliciousContractScanner.analyze(toAddress, provider);
      if (contractRep.isHoneypot) {
        warnings.push('Target contract is flagged as a HONEYPOT.');
        score += 90;
      } else if (!contractRep.isVerified && tx.data && tx.data !== '0x') {
        warnings.push('Interacting with an unverified smart contract.');
        score += 30;
      }
    }

    // 3. Analyze Approvals
    const approvalData = ApprovalScanner.analyzeData(tx);
    if (approvalData.isApproval) {
      if (approvalData.isInfinite) {
        warnings.push('This transaction grants INFINITE approval to a smart contract.');
        score += 40;
      } else {
        warnings.push('This transaction grants allowance to spend your tokens.');
        score += 10;
      }
      
      // If the spender is also a honeypot
      if (approvalData.spender) {
        const spenderRep = await MaliciousContractScanner.analyze(approvalData.spender, provider);
        if (spenderRep.isHoneypot) {
          warnings.push('CRITICAL: You are approving a known malicious contract to drain your tokens.');
          score += 100;
        }
      }
    }

    // Clamp score to 100
    score = Math.min(score, 100);

    let riskLevel: 'Safe' | 'Low' | 'Medium' | 'High' | 'Critical' = 'Safe';
    if (score >= 90) riskLevel = 'Critical';
    else if (score >= 70) riskLevel = 'High';
    else if (score >= 40) riskLevel = 'Medium';
    else if (score > 0) riskLevel = 'Low';

    const explanations: string[] = [];
    if (score === 0) explanations.push("This transaction appears safe.");
    else if (score < 40) explanations.push("This transaction contains minimal risk.");
    else if (score < 70) explanations.push("This transaction contains elevated risk.");
    else explanations.push("This transaction contains critical risks. Proceed with extreme caution.");

    return {
      score,
      isSafe: score < 70, // 70 is our high-risk threshold
      warnings,
      explanations,
      riskLevel
    };
  }
}
