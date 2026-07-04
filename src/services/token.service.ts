import { ethers } from 'ethers';
import { BlockchainClient } from './blockchainClient';
import { USDC, STAKING } from '../contracts';
import type { TxResult } from './transaction.service';

export class TokenService {
  /**
   * Mints USDC (Mock logic in the current App).
   */
  public static async swapRitualForUsdc(privateKey: string, amount: string, contractAddress: string, isMainnet: boolean): Promise<TxResult> {
    try {
      const wallet = BlockchainClient.getSigner(privateKey, isMainnet);
      const usdc = new ethers.Contract(contractAddress, USDC.abi, wallet);
      
      const parsedAmount = ethers.parseUnits(amount, 18);
      const tx = await usdc.mint(wallet.address, parsedAmount);
      
      return { success: true, hash: tx.hash };
    } catch (e: any) {
      return { success: false, error: e.message || 'Swap failed' };
    }
  }

  /**
   * Transfers USDC to Dead address (Mock logic in the current App).
   */
  public static async swapUsdcForRitual(privateKey: string, amount: string, contractAddress: string, isMainnet: boolean): Promise<TxResult> {
    try {
      const wallet = BlockchainClient.getSigner(privateKey, isMainnet);
      const usdc = new ethers.Contract(contractAddress, USDC.abi, wallet);
      
      const parsedAmount = ethers.parseUnits(amount, 18);
      const tx = await usdc.transfer("0x000000000000000000000000000000000000dEaD", parsedAmount);
      
      return { success: true, hash: tx.hash };
    } catch (e: any) {
      return { success: false, error: e.message || 'Swap failed' };
    }
  }

  /**
   * Stakes USDC (Mock logic in the current App).
   */
  public static async stakeUsdc(privateKey: string, amount: string, usdcContractAddress: string, stakingContractAddress: string, isMainnet: boolean): Promise<TxResult> {
    try {
      const wallet = BlockchainClient.getSigner(privateKey, isMainnet);
      const usdc = new ethers.Contract(usdcContractAddress, USDC.abi, wallet);
      const staking = new ethers.Contract(stakingContractAddress, STAKING.abi, wallet);
      
      const parsedAmount = ethers.parseUnits(amount, 18);
      
      // Approve first
      const approveTx = await usdc.approve(stakingContractAddress, parsedAmount);
      await approveTx.wait();
      
      // Stake
      const stakeTx = await staking.stake(parsedAmount);
      
      return { success: true, hash: stakeTx.hash };
    } catch (e: any) {
      return { success: false, error: e.message || 'Stake failed' };
    }
  }

  /**
   * Unstakes USDC.
   */
  public static async unstakeUsdc(privateKey: string, amount: string, stakingContractAddress: string, isMainnet: boolean): Promise<TxResult> {
    try {
      const wallet = BlockchainClient.getSigner(privateKey, isMainnet);
      const staking = new ethers.Contract(stakingContractAddress, STAKING.abi, wallet);
      
      const parsedAmount = ethers.parseUnits(amount, 18);
      const unstakeTx = await staking.unstake(parsedAmount);
      
      return { success: true, hash: unstakeTx.hash };
    } catch (e: any) {
      return { success: false, error: e.message || 'Unstake failed' };
    }
  }

  /**
   * Revokes approvals by setting allowance to 0.
   */
  public static async revokeApprovals(privateKey: string, usdcContractAddress: string, spenderAddress: string, isMainnet: boolean): Promise<TxResult> {
    try {
      const wallet = BlockchainClient.getSigner(privateKey, isMainnet);
      const usdc = new ethers.Contract(usdcContractAddress, USDC.abi, wallet);
      const tx = await usdc.approve(spenderAddress, 0);
      return { success: true, hash: tx.hash };
    } catch (e: any) {
      return { success: false, error: e.message || 'Revoke failed' };
    }
  }

  /**
   * Mock deployment of USDC contract for local testing
   */
  public static async deployMockUsdc(privateKey: string, isMainnet: boolean): Promise<string | null> {
    try {
      const wallet = BlockchainClient.getSigner(privateKey, isMainnet);
      const usdcFactory = new ethers.ContractFactory(USDC.abi, USDC.bytecode, wallet);
      const usdc = await usdcFactory.deploy() as ethers.Contract;
      await usdc.waitForDeployment();
      return await usdc.getAddress();
    } catch (e) {
      console.error("Failed to deploy mock USDC", e);
      return null;
    }
  }

  /**
   * Mock deployment of Staking contract for local testing
   */
  public static async deployMockStaking(privateKey: string, usdcAddress: string, isMainnet: boolean): Promise<string | null> {
    try {
      const wallet = BlockchainClient.getSigner(privateKey, isMainnet);
      const stakingFactory = new ethers.ContractFactory(STAKING.abi, STAKING.bytecode, wallet);
      const staking = await stakingFactory.deploy(usdcAddress) as ethers.Contract;
      await staking.waitForDeployment();
      return await staking.getAddress();
    } catch (e) {
      console.error("Failed to deploy mock Staking", e);
      return null;
    }
  }

  /**
   * Mints an NFT by sending a 0 value transaction with the image URL inscribed in the data.
   */
  public static async mintNft(privateKey: string, imageUrl: string, isMainnet: boolean): Promise<TxResult> {
    try {
      const wallet = BlockchainClient.getSigner(privateKey, isMainnet);
      const data = ethers.hexlify(ethers.toUtf8Bytes(imageUrl));
      const tx = await wallet.sendTransaction({
        to: "0x0000000000000000000000000000000000000000",
        value: 0,
        data
      });
      return { success: true, hash: tx.hash };
    } catch (e: any) {
      return { success: false, error: e.message || 'Mint failed' };
    }
  }
}
