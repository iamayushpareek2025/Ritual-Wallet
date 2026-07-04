import { ethers } from 'ethers';
import { BlockchainClient } from './blockchainClient';

export interface TxRecord {
  hash: string;
  to: string;
  amount: string;
  type: 'send' | 'swap' | 'stake' | 'receive' | 'bridge';
  date: string | number;
}

export class PortfolioService {
  /**
   * Scans blockchain history for incoming ERC20 transfers.
   * Uses BlockchainClient for robust Provider handling.
   */
  public static async scanBlockchainHistory(address: string, isMainnet: boolean): Promise<TxRecord[]> {
    const key = `scan-${address}-${isMainnet}`;
    return BlockchainClient.dedupRequest(key, async () => {
      try {
        const provider = BlockchainClient.getProvider(isMainnet);
        const currentBlock = await provider.getBlockNumber();
        const fromBlock = Math.max(0, currentBlock - 5000); 
        
        const erc20Topic = ethers.id("Transfer(address,address,uint256)");
        const addressPad = ethers.zeroPadValue(address, 32);
        
        const logs = await provider.getLogs({
          fromBlock,
          toBlock: currentBlock,
          topics: [erc20Topic, null, addressPad]
        });

        if (logs.length > 0) {
          return logs.map(log => ({
            hash: log.transactionHash,
            to: address,
            amount: "? (Scanned)",
            date: Date.now(),
            type: 'receive'
          }));
        }
        return [];
      } catch (error) {
        console.error('Failed to scan history', error);
        return [];
      }
    });
  }
}
