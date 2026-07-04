import type { TransactionRequest } from 'ethers';

export interface AddressRisk {
  isMalicious: boolean;
  score: number; // 0-100, 100 being highly risky
  tags: string[];
}

export interface ContractReputation {
  isVerified: boolean;
  hasAudits: boolean;
  isHoneypot: boolean;
  riskScore: number;
}

export interface SimulationResult {
  success: boolean;
  gasUsed: string;
  assetChanges: { asset: string; amount: string; type: 'send' | 'receive' }[];
  error?: string;
}

export interface ISecurityProvider {
  checkAddress(address: string): Promise<AddressRisk>;
  getContractReputation(address: string): Promise<ContractReputation>;
  simulateTransaction(tx: TransactionRequest, isMainnet: boolean): Promise<SimulationResult>;
}

export class MockSecurityProvider implements ISecurityProvider {
  async checkAddress(address: string): Promise<AddressRisk> {
    const isMockPhishing = address.toLowerCase().includes('bad');
    return {
      isMalicious: isMockPhishing,
      score: isMockPhishing ? 95 : 10,
      tags: isMockPhishing ? ['phishing', 'scam'] : ['clean']
    };
  }

  async getContractReputation(address: string): Promise<ContractReputation> {
    const isMockHoneypot = address.toLowerCase().includes('honey');
    return {
      isVerified: !isMockHoneypot,
      hasAudits: !isMockHoneypot,
      isHoneypot: isMockHoneypot,
      riskScore: isMockHoneypot ? 99 : 5
    };
  }

  async simulateTransaction(tx: TransactionRequest, isMainnet: boolean): Promise<SimulationResult> {
    return {
      success: true,
      gasUsed: '21000',
      assetChanges: []
    };
  }
}
