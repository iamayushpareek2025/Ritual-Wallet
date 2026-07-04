import { ethers } from 'ethers';
import { estimateSafeGas } from '../ritual';
import type { GasEstimate } from '../ritual';
import { USDC } from '../contracts';
import { BlockchainClient } from './blockchainClient';

export interface TxResult {
  success: boolean;
  hash?: string;
  error?: string;
}

export class TransactionService {
  /**
   * Estimates gas cost for sending native tokens.
   */
  public static async estimateNativeSend(isMainnet: boolean, to: string, amount: string): Promise<GasEstimate> {
    const tx: ethers.TransactionRequest = {
      to,
      value: amount ? ethers.parseEther(amount) : 0n
    };
    return estimateSafeGas(isMainnet, tx);
  }

  /**
   * Sends Native Ritual tokens.
   */
  public static async sendNative(privateKey: string, to: string, amount: string, isMainnet: boolean): Promise<TxResult> {
    try {
      const wallet = BlockchainClient.getSigner(privateKey, isMainnet);
      
      const tx = await wallet.sendTransaction({
        to,
        value: ethers.parseEther(amount)
      });
      
      return { success: true, hash: tx.hash };
    } catch (e: any) {
      return { success: false, error: e.message || 'Transaction failed' };
    }
  }

  /**
   * Sends USDC tokens.
   */
  public static async sendUsdc(privateKey: string, to: string, amount: string, contractAddress: string, isMainnet: boolean): Promise<TxResult> {
    try {
      const wallet = BlockchainClient.getSigner(privateKey, isMainnet);
      const usdc = new ethers.Contract(contractAddress, USDC.abi, wallet);
      
      const parsedAmount = ethers.parseUnits(amount, 18);
      const tx = await usdc.transfer(to, parsedAmount);
      
      return { success: true, hash: tx.hash };
    } catch (e: any) {
      return { success: false, error: e.message || 'USDC transfer failed' };
    }
  }
}
