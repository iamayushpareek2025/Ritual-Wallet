import type { TransactionRequest } from 'ethers';

export interface ApprovalRisk {
  isApproval: boolean;
  isInfinite: boolean;
  spender?: string;
  amount?: string;
}

export class ApprovalScanner {
  /**
   * Identifies if a transaction is an ERC20/ERC721 approval and assesses its risk.
   */
  public static analyzeData(tx: TransactionRequest): ApprovalRisk {
    if (!tx.data || typeof tx.data !== 'string' || tx.data.length < 10) {
      return { isApproval: false, isInfinite: false };
    }

    const approveSelector = '0x095ea7b3';
    const setApprovalForAllSelector = '0xa22cb465';

    if (tx.data.startsWith(approveSelector)) {
      // Decode: spender (address), amount (uint256)
      const spenderHex = '0x' + tx.data.substring(34, 74);
      const amountHex = '0x' + tx.data.substring(74);
      const isInfinite = amountHex.toLowerCase() === '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

      return {
        isApproval: true,
        isInfinite,
        spender: spenderHex,
        amount: amountHex
      };
    }

    if (tx.data.startsWith(setApprovalForAllSelector)) {
      // Decode: operator (address), approved (bool)
      const operatorHex = '0x' + tx.data.substring(34, 74);
      const isApproved = tx.data.substring(137, 138) === '1';

      return {
        isApproval: isApproved, // only risky if they are approving
        isInfinite: true, // setApprovalForAll is effectively infinite for that collection
        spender: operatorHex
      };
    }

    return { isApproval: false, isInfinite: false };
  }
}
