import { WalletService } from '../services/wallet.service';
import type { ISecurityProvider, AddressRisk } from './provider';

export class AddressValidator {
  /**
   * Validates format and queries the provider for risk assessment.
   */
  public static async analyzeAddress(address: string, provider: ISecurityProvider): Promise<{ valid: boolean; risk?: AddressRisk }> {
    if (!WalletService.isValidAddress(address)) {
      return { valid: false };
    }
    
    const formattedAddress = WalletService.formatAddress(address);
    const risk = await provider.checkAddress(formattedAddress);
    return { valid: true, risk };
  }
}
