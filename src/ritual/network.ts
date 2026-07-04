import { ethers } from 'ethers';
import { getRitualProvider } from './provider';
import { RITUAL_TESTNET, RITUAL_MAINNET } from './config';
import { RitualNetworkError } from './types';
import type { GasEstimate } from './types';

/**
 * Validates that the provider is connected to the expected Ritual network.
 * Throws an error if the chain ID does not match.
 */
export async function validateNetwork(isMainnet: boolean): Promise<boolean> {
  try {
    const provider = getRitualProvider(isMainnet);
    const network = await provider.getNetwork();
    const expectedChainId = isMainnet ? RITUAL_MAINNET.chainId : RITUAL_TESTNET.chainId;

    if (Number(network.chainId) !== expectedChainId) {
      throw new RitualNetworkError(
        `Network mismatch: Expected chain ${expectedChainId}, got ${network.chainId}`,
        'CHAIN_MISMATCH'
      );
    }
    return true;
  } catch (error: any) {
    if (error instanceof RitualNetworkError) throw error;
    throw new RitualNetworkError(`Failed to validate network: ${error.message}`, 'VALIDATION_FAILED');
  }
}

/**
 * Safely estimates gas with a built-in safety buffer (e.g., 20% extra limit).
 */
export async function estimateSafeGas(
  isMainnet: boolean,
  tx: ethers.TransactionRequest,
  bufferMultiplier: number = 1.2
): Promise<GasEstimate> {
  const provider = getRitualProvider(isMainnet);
  
  try {
    const [gasLimit, feeData] = await Promise.all([
      provider.estimateGas(tx),
      provider.getFeeData()
    ]);

    const safeGasLimit = (gasLimit * BigInt(Math.floor(bufferMultiplier * 100))) / 100n;
    const gasPrice = feeData.gasPrice || ethers.parseUnits('1', 'gwei');
    const totalCostWei = safeGasLimit * gasPrice;

    return {
      gasLimit: safeGasLimit,
      gasPrice,
      totalCostEther: ethers.formatEther(totalCostWei),
    };
  } catch (error: any) {
    throw new RitualNetworkError(`Gas estimation failed: ${error.message}`, 'GAS_ESTIMATE_FAILED');
  }
}
