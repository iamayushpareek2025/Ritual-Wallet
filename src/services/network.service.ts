import { ethers } from 'ethers';
import { BlockchainClient } from './blockchainClient';
import { WalletService } from './wallet.service';
import { BalanceService } from './balance.service';
import type { TxResult } from './transaction.service';

const TEE_REGISTRY = "0xc30dbA7fb36316D90455fCda64fE09f7a55FafF1";
const RITUAL_WALLET_CONTRACT = "0x532F0dF0896F353d8C3DD8cc134e8129DA2a3948";
const INFERENCE_REGISTRY = "0x7EebcAE5c34e320dfCdeA746B7b43f9Dbc9eb796";

export class NetworkService {
  /**
   * Fetch an executor address from the TEE registry for capability 1 (LLM).
   */
  public static async getLlmExecutor(isMainnet: boolean): Promise<string> {
    try {
      const registryAbi = [
        "function getExecutors(uint8 capability) external view returns (address[] memory)"
      ];
      
      const executors = await BlockchainClient.safeRead<string[]>(TEE_REGISTRY, registryAbi, 'getExecutors', [1], isMainnet);
      if (!executors || executors.length === 0) throw new Error("no executors");
      
      // Pick a random one to distribute load
      const raw = executors[Math.floor(Math.random() * executors.length)];
      
      let executorAddress: string | null = null;
      try { executorAddress = WalletService.formatAddress(raw); }
      catch { try { executorAddress = WalletService.formatAddress(raw.toLowerCase()); } catch { return ''; } }

      if (!executorAddress) throw new Error('invalid executor address from registry');
      return executorAddress;
    } catch (err) {
      // Fallback - known working executor from recent transactions on explorer
      const stored = typeof window !== 'undefined' ? localStorage.getItem('ritual_executor_address') : null;
      const fallback = stored || "0xB42e4e5D64f4B9a16CFD28a57dc76e4cb5F79d95";
      
      let executorAddress: string | null = null;
      try { executorAddress = WalletService.formatAddress(fallback); }
      catch { try { executorAddress = WalletService.formatAddress(fallback.toLowerCase()); } catch { return ''; } }
      
      if (!executorAddress) throw new Error('No valid LLM executor available');
      return executorAddress;
    }
  }

  /**
   * Deposits into RitualWallet so async settlement can complete
   */
  public static async depositToRitualWallet(privateKey: string, isMainnet: boolean): Promise<void> {
    const ritualWalletAbi = [
      "function deposit(uint256 lockDuration) external payable"
    ];
    try {
      const wallet = BlockchainClient.getSigner(privateKey, isMainnet);
      const rw = new ethers.Contract(RITUAL_WALLET_CONTRACT, ritualWalletAbi, wallet);
      const depositTx = await rw.deposit(5000n, { value: BalanceService.parseEther("0.01") });
      await depositTx.wait();
      console.log("RitualWallet deposit complete");
    } catch (e) {
      console.warn("RitualWallet deposit skipped:", (e as Error).message);
    }
  }

  /**
   * Polls the inference registry for a response.
   */
  public static async pollInferenceResult(hash: string, isMainnet: boolean): Promise<{ ready: boolean; result: string }> {
    const pollAbi = [
      "function getResponse(bytes32 reqHash) external view returns (bool ready, bytes memory result)"
    ];
    const reqHash = ethers.keccak256(ethers.toUtf8Bytes(hash));
    try {
      const res = await BlockchainClient.safeRead<any>(
        "0x0000000000000000000000000000000000000802",
        pollAbi,
        'getResponse',
        [reqHash],
        isMainnet
      );
      
      const ready = res[0];
      const resultBytes = res[1];
      
      if (!ready) return { ready: false, result: "" };
      
      const abiCoder = ethers.AbiCoder.defaultAbiCoder();
      const [ , , , , , , choicesCount, choicesData] = abiCoder.decode(
        ["string", "string", "uint256", "string", "string", "string", "uint256", "bytes[]", "bytes"],
        resultBytes
      );
      if (Number(choicesCount) > 0 && choicesData.length > 0) {
        const [ , [ , content]] = abiCoder.decode(
          ["uint256", "tuple(string, string)", "bytes", "string"],
          choicesData[0]
        );
        const botReply = (content as string).replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
        return { ready: true, result: botReply };
      }
      return { ready: true, result: "" };
    } catch (e) {
      console.warn("Poll response failed:", e);
      return { ready: false, result: "" };
    }
  }

  public static encodeLlmParams(executorAddress: string, messagesJson: string): string {
    const abiCoder = ethers.AbiCoder.defaultAbiCoder();
    return abiCoder.encode(
      [
        "address", "bytes[]", "uint256", "bytes[]", "bytes",
        "string", "string", "int256", "string", "bool",
        "int256", "string", "string", "uint256", "bool",
        "int256", "string", "bytes", "int256", "string",
        "string", "bool", "int256", "bytes", "bytes",
        "int256", "int256", "string", "bool",
        "tuple(string,string,string)"
      ],
      [
        executorAddress,
        [],
        300n,
        [],
        "0x",
        messagesJson,
        "zai-org/GLM-4.7-FP8",
        0n,
        "",
        false,
        4096n,
        "",
        "",
        1n,
        true,
        0n,
        "medium",
        "0x",
        -1n,
        "auto",
        "",
        false,
        700n,
        "0x",
        "0x",
        -1n,
        1000n,
        "",
        false,
        ["", "", ""]
      ]
    );
  }

  public static decodeLlmLog(logData: string): string {
    try {
      const abiCoder = ethers.AbiCoder.defaultAbiCoder();
      const decoded = abiCoder.decode(
        ["bool", "bytes", "bytes", "string", "tuple(string,string,string)"],
        logData
      );
      if (!decoded[0]) {
        const completionData = decoded[1];
        const [ , , , , , , choicesCount, choicesData] = abiCoder.decode(
          ["string", "string", "uint256", "string", "string", "string", "uint256", "bytes[]", "bytes"],
          completionData
        );
        if (Number(choicesCount) > 0 && choicesData.length > 0) {
          const [ , [ , content]] = abiCoder.decode(
            ["uint256", "tuple(string, string)", "bytes", "string"],
            choicesData[0]
          );
          return (content as string).replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
        }
      }
    } catch (e) {
      console.warn("Decode log failed:", e);
    }
    return "";
  }

  public static async sendLlmQuery(
    privateKey: string,
    executorAddress: string,
    systemPrompt: string,
    history: any[],
    isMainnet: boolean
  ): Promise<TxResult & { data?: any }> {
    try {
      const wallet = BlockchainClient.getSigner(privateKey, isMainnet);
      const messagesJson = JSON.stringify([
        { role: 'system', content: systemPrompt },
        ...history.map(m => ({ role: m.role, content: m.content }))
      ]);
      const encodedData = this.encodeLlmParams(executorAddress, messagesJson);
      
      const tx = await wallet.sendTransaction({
        to: "0x0000000000000000000000000000000000000802",
        data: encodedData,
        gasLimit: 5000000
      });
      const receipt = await tx.wait();
      
      return { success: true, hash: tx.hash, data: receipt };
    } catch (e: any) {
      return { success: false, error: e.message || 'LLM query failed' };
    }
  }

  public static async getBlockNumber(isMainnet: boolean): Promise<number> {
    const provider = BlockchainClient.getProvider(isMainnet);
    return await provider.getBlockNumber();
  }
}
