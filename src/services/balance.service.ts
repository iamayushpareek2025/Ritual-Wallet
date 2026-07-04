import { ethers } from 'ethers';
import { USDC, STAKING } from '../contracts';
import { BlockchainClient } from './blockchainClient';

export class BalanceService {
  public static formatEther(value: ethers.BigNumberish): string {
    return ethers.formatEther(value);
  }
  public static parseEther(value: string): bigint {
    return ethers.parseEther(value);
  }
  public static parseUnits(value: string, decimals: number | string): bigint {
    return ethers.parseUnits(value, decimals);
  }
  /**
   * Fetches the native RITUAL balance and format it.
   */
  public static async getNativeBalance(address: string, isMainnet: boolean): Promise<string> {
    const key = `native-bal-${address}-${isMainnet}`;
    return BlockchainClient.dedupRequest(key, async () => {
      try {
        const provider = BlockchainClient.getProvider(isMainnet);
        const bal = await provider.getBalance(address);
        return ethers.formatEther(bal);
      } catch (error) {
        console.error('Failed to fetch native balance', error);
        return '0.0';
      }
    });
  }

  /**
   * Fetches USDC balance if the deployed address is known.
   */
  public static async getUsdcBalance(address: string, usdcContractAddress: string, isMainnet: boolean): Promise<string> {
    if (!usdcContractAddress) return '0.00';
    try {
      const bal = await BlockchainClient.safeRead<bigint>(usdcContractAddress, USDC.abi, 'balanceOf', [address], isMainnet);
      return ethers.formatUnits(bal, 18); // assuming 18 decimals as per contracts.ts mocked usdc
    } catch (error) {
      console.error('Failed to fetch USDC balance', error);
      return '0.00';
    }
  }

  /**
   * Fetches staked USDC balance if staking contract is known.
   */
  public static async getStakedBalance(address: string, stakingContractAddress: string, isMainnet: boolean): Promise<string> {
    if (!stakingContractAddress) return '0.00';
    try {
      let bal = 0n;
      try {
        bal = await BlockchainClient.safeRead<bigint>(stakingContractAddress, STAKING.abi, 'stakes', [address], isMainnet);
      } catch {
        try {
          bal = await BlockchainClient.safeRead<bigint>(stakingContractAddress, STAKING.abi, 'stakedBalance', [address], isMainnet);
        } catch {
          bal = 0n;
        }
      }
      return ethers.formatUnits(bal, 18);
    } catch (error) {
      console.error('Failed to fetch staked balance', error);
      return '0.00';
    }
  }

  /**
   * Fetches all balances in a single batched Promise.all to reduce latency.
   */
  public static async getAllBalances(address: string, usdcAddress: string | null, stakingAddress: string | null, isMainnet: boolean) {
    const [native, usdc, staked] = await Promise.all([
      this.getNativeBalance(address, isMainnet),
      usdcAddress ? this.getUsdcBalance(address, usdcAddress, isMainnet) : Promise.resolve('0.00'),
      stakingAddress ? this.getStakedBalance(address, stakingAddress, isMainnet) : Promise.resolve('0.00')
    ]);
    return { native, usdc, staked };
  }
}
