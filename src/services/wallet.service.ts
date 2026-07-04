import { ethers } from 'ethers';
import { BlockchainClient } from './blockchainClient';

export class WalletService {
  /**
   * Checks if an address is a contract.
   */
  public static async isContractAddress(address: string, isMainnet: boolean): Promise<boolean> {
    try {
      const provider = BlockchainClient.getProvider(isMainnet);
      const code = await provider.getCode(address);
      return code !== '0x' && code !== '0x0';
    } catch {
      return false;
    }
  }
  /**
   * Validates if a string is a valid Ethereum address.
   */
  public static isValidAddress(address: string): boolean {
    return ethers.isAddress(address);
  }

  /**
   * Formats an address (checksums it).
   */
  public static formatAddress(address: string): string {
    return ethers.getAddress(address);
  }

  /**
   * Generates a completely random new wallet (mnemonic and private key).
   */
  public static createRandomWallet() {
    const wallet = ethers.Wallet.createRandom();
    return {
      mnemonic: wallet.mnemonic?.phrase || '',
      privateKey: wallet.privateKey,
      address: wallet.address
    };
  }

  /**
   * Recovers a wallet from a mnemonic phrase.
   */
  public static importFromMnemonic(mnemonic: string) {
    try {
      const wallet = ethers.Wallet.fromPhrase(mnemonic.trim());
      return {
        privateKey: wallet.privateKey,
        address: wallet.address
      };
    } catch (e) {
      throw new Error('Invalid mnemonic phrase');
    }
  }

  /**
   * Recovers a wallet from a private key.
   */
  public static importFromPrivateKey(privateKey: string) {
    try {
      // Ensure private key starts with 0x
      let formattedPk = privateKey.trim();
      if (!formattedPk.startsWith('0x')) {
        formattedPk = '0x' + formattedPk;
      }
      const wallet = new ethers.Wallet(formattedPk);
      return {
        privateKey: wallet.privateKey,
        address: wallet.address
      };
    } catch (e) {
      throw new Error('Invalid private key');
    }
  }

  /**
   * Derives a wallet from a mnemonic at a specific account index (BIP-44).
   */
  public static deriveAccount(mnemonic: string, index: number) {
    try {
      const path = `m/44'/60'/0'/0/${index}`;
      const wallet = ethers.HDNodeWallet.fromMnemonic(ethers.Mnemonic.fromPhrase(mnemonic), path);
      return {
        privateKey: wallet.privateKey,
        address: wallet.address
      };
    } catch (e) {
      throw new Error('Failed to derive account');
    }
  }
}
