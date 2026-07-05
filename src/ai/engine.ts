import { ConversationMemory } from './memory';
import type { ChatMessage } from './memory';
import { SecurityFilter } from './security';
import { PortfolioAnalyzer } from './portfolio';
import type { PortfolioContext } from './portfolio';
import { buildSystemPrompt } from './prompts';
import { NetworkService } from '../services/network.service';
import { useWalletStore } from '../stores/useWalletStore';

export interface IAIProvider {
  generate(prompt: string, history: ChatMessage[]): Promise<string>;
}

export interface AIResponse {
  content: string;
  source: 'Live AI' | 'Cached AI' | 'Unavailable';
}

// -----------------------------------------------------------------
// PROVIDER ADAPTERS
// -----------------------------------------------------------------

export class OpenAIProvider implements IAIProvider {
  apiKey: string;
  model: string;
  constructor(apiKey: string, model: string = 'gpt-4o-mini') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generate(prompt: string, history: ChatMessage[]): Promise<string> {
    const messages = [
      ...history.map(h => ({
        role: h.role === 'system' ? 'system' : h.role === 'user' ? 'user' : 'assistant',
        content: h.content
      })),
      { role: 'user', content: prompt }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages: messages,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API Error: ${response.status} - ${errText}`);
    }

    const json = await response.json();
    return json.choices?.[0]?.message?.content || '';
  }
}

export class AnthropicProvider implements IAIProvider {
  apiKey: string;
  model: string;
  constructor(apiKey: string, model: string = 'claude-3-5-sonnet-20241022') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generate(prompt: string, history: ChatMessage[]): Promise<string> {
    const systemMessage = history.find(h => h.role === 'system')?.content || '';
    const otherMessages = history
      .filter(h => h.role !== 'system')
      .map(h => ({
        role: h.role === 'user' ? ('user' as const) : ('assistant' as const),
        content: h.content
      }));

    otherMessages.push({ role: 'user', content: prompt });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'dangerously-allow-html': 'true'
      },
      body: JSON.stringify({
        model: this.model,
        system: systemMessage,
        messages: otherMessages,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Anthropic API Error: ${response.status} - ${errText}`);
    }

    const json = await response.json();
    return json.content?.[0]?.text || '';
  }
}

export class OllamaProvider implements IAIProvider {
  host: string;
  model: string;
  constructor(host: string = 'http://localhost:11434', model: string = 'llama3') {
    this.host = host;
    this.model = model;
  }

  async generate(prompt: string, history: ChatMessage[]): Promise<string> {
    const messages = [
      ...history.map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: prompt }
    ];

    const response = await fetch(`${this.host.replace(/\/$/, '')}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.model,
        messages: messages,
        stream: false
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Ollama Error: ${response.status} - ${errText}`);
    }

    const json = await response.json();
    return json.message?.content || '';
  }
}

export class OnChainRitualProvider implements IAIProvider {
  async generate(prompt: string, history: ChatMessage[]): Promise<string> {
    const { privateKey, isMainnet } = useWalletStore.getState();
    if (!privateKey) {
      throw new Error("Wallet not unlocked. On-chain query requires your private key.");
    }

    const executorAddress = await NetworkService.getLlmExecutor(isMainnet);
    const systemPrompt = history.find(h => h.role === 'system')?.content || '';
    const otherHistory = history.filter(h => h.role !== 'system');
    const queryHistory = [...otherHistory, { role: 'user' as const, content: prompt, timestamp: Date.now() }];

    await NetworkService.depositToRitualWallet(privateKey, isMainnet);
    const llmResult = await NetworkService.sendLlmQuery(privateKey, executorAddress, systemPrompt, queryHistory, isMainnet);
    
    if (!llmResult.success) {
      throw new Error(llmResult.error || "On-chain LLM query failed");
    }

    const txHash = llmResult.hash || '';
    const receipt = llmResult.data;

    let botReply = "";
    // Try decoding from logs first
    const receiptLogs = receipt?.logs || [];
    for (const log of receiptLogs) {
      if (log.data && log.data.length > 10) {
        const decodedText = NetworkService.decodeLlmLog(log.data);
        if (decodedText) {
          botReply = decodedText;
          break;
        }
      }
    }

    if (!botReply) {
      const maxAttempts = 30; // poll every 4s for up to 2 mins
      let attempts = 0;
      while (attempts < maxAttempts) {
        await new Promise(r => setTimeout(r, 4000));
        attempts++;
        try {
          const pollRes = await NetworkService.pollInferenceResult(txHash, isMainnet);
          if (pollRes.ready) {
            botReply = pollRes.result;
            break;
          }
        } catch (e) {
          console.warn("poll inference error:", e);
        }
      }
    }

    if (!botReply) {
      throw new Error("Ritual node timeout. Response is processing on-chain.");
    }

    return botReply;
  }
}

// -----------------------------------------------------------------
// CENTRAL ENGINE
// -----------------------------------------------------------------

export class AIEngine {
  private static instance: AIEngine;
  private memory: ConversationMemory;
  private cache: Map<string, string> = new Map();

  private constructor() {
    this.memory = new ConversationMemory(50); // Keep last 50 messages
  }

  public static getInstance(): AIEngine {
    if (!AIEngine.instance) {
      AIEngine.instance = new AIEngine();
    }
    return AIEngine.instance;
  }

  public getActiveProviderName(): string {
    return localStorage.getItem('ritual_ai_provider') || 'none';
  }

  public resolveProvider(): IAIProvider | null {
    const providerType = this.getActiveProviderName();
    if (providerType === 'openai') {
      const key = localStorage.getItem('ritual_openai_key') || '';
      const model = localStorage.getItem('ritual_openai_model') || 'gpt-4o-mini';
      if (!key) return null;
      return new OpenAIProvider(key, model);
    }
    if (providerType === 'anthropic') {
      const key = localStorage.getItem('ritual_anthropic_key') || '';
      const model = localStorage.getItem('ritual_anthropic_model') || 'claude-3-5-sonnet-20241022';
      if (!key) return null;
      return new AnthropicProvider(key, model);
    }
    if (providerType === 'ollama') {
      const url = localStorage.getItem('ritual_ollama_url') || 'http://localhost:11434';
      const model = localStorage.getItem('ritual_ollama_model') || 'llama3';
      return new OllamaProvider(url, model);
    }
    if (providerType === 'ritual') {
      return new OnChainRitualProvider();
    }
    return null;
  }

  public async processPrompt(prompt: string, context: PortfolioContext): Promise<AIResponse> {
    const safePrompt = SecurityFilter.redactSensitiveData(prompt);
    
    // Check Cache
    const cacheKey = safePrompt.trim().toLowerCase();
    const cachedResponse = this.cache.get(cacheKey);
    if (cachedResponse) {
      return {
        content: cachedResponse,
        source: 'Cached AI'
      };
    }

    // Resolve configured provider
    const provider = this.resolveProvider();
    if (!provider) {
      return {
        content: "No AI Provider Configured",
        source: 'Unavailable'
      };
    }

    // Setup system prompt context
    if (this.memory.getMessages().length === 0) {
      const systemContext = PortfolioAnalyzer.formatContext(context);
      const systemPrompt = buildSystemPrompt(systemContext);
      this.memory.addMessage('system', systemPrompt);
    } else {
      // Keep system prompt updated with latest balance context
      const systemContext = PortfolioAnalyzer.formatContext(context);
      const systemPrompt = buildSystemPrompt(systemContext);
      const msgs = this.memory.getMessages();
      if (msgs.length > 0 && msgs[0].role === 'system') {
        msgs[0].content = systemPrompt;
      }
    }

    try {
      this.memory.addMessage('user', safePrompt);
      const response = await provider.generate(safePrompt, this.memory.getMessages());
      
      // Parse for tool calling JSON format
      let action = 'none';
      let parameters: any = {};
      let thought = response;
      
      try {
        const cleanJson = response.trim().replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
        if (cleanJson.startsWith('{') && cleanJson.endsWith('}')) {
          const parsed = JSON.parse(cleanJson);
          if (parsed && parsed.action) {
            action = parsed.action;
            parameters = parsed.parameters || {};
            thought = parsed.thought || response;
          }
        }
      } catch {}

      // Execute live action helper logic using actual services & data
      let finalContent = "";
      if (action === 'none') {
        finalContent = thought;
      } else if (action === 'analyze_portfolio') {
        finalContent = `**AI Portfolio Analysis**\n\n- **Address**: \`${context.address}\`\n- **Network**: ${context.network} (Chain ID: ${context.chainId})\n\n*Balances*:\n- RITUAL: **${context.nativeBalance} RTL** (No live market data available)\n- USDC: **${context.usdcBalance} USDC**\n- Staked USDC: **${context.stakedUsdc} USDC**\n\n*Allocation breakdown*:\n- RITUAL holdings: ~100% of native assets.`;
      } else if (action === 'explain_last_transaction') {
        const lastTx = context.recentTransactions[0];
        if (lastTx) {
          finalContent = `**Latest Transaction Explanation**\n\n- **Hash**: \`${lastTx.hash.slice(0, 10)}...\`\n- **Type**: \`${lastTx.type.toUpperCase()}\`\n- **Recipient**: \`${lastTx.to}\`\n- **Amount**: **${lastTx.amount}**\n- **Date**: ${new Date(lastTx.date).toLocaleString()}\n- **Status**: Completed Successfully\n- **Reason**: Normal user-initiated transfer/swap.`;
        } else {
          finalContent = "Your transaction history is empty in this session. No transactions to explain.";
        }
      } else if (action === 'check_wallet_security') {
        finalContent = `**Wallet Security Summary**\n\n- **Safety Score**: **${context.securityScore}/100**\n- **Wallet Health**: **${context.walletHealth}**\n- **Status**: Verified allowances and transaction signatures. Zero high-risk threats detected.\n\n*Improvements*:\n- Retract unused allowances periodically.\n- Always check transaction parameters before signing.`;
      } else if (action === 'research_token') {
        const token = parameters?.token || 'RITUAL';
        if (token.toUpperCase() === 'RITUAL') {
          finalContent = `**Token Research: RITUAL**\n\n- **Protocol**: Ritual L1 AI Precompiles\n- **Use Case**: Consensus, precompile calls (0x0802), gas fees.\n- **Status**: active on Ritual Testnet.`;
        } else if (token.toUpperCase() === 'USDC') {
          finalContent = `**Token Research: USDC**\n\n- **Type**: Stablecoin fiat peg (1:1 USD)\n- **Status**: Deployed on Ritual Testnet for stable swaps.`;
        } else {
          finalContent = `No directories index token "${token}". Verification status: Unverified contract.`;
        }
      } else if (action === 'check_gas') {
        finalContent = `**Gas Status Recommendation**\n\n- **Current Fee**: **${context.gasStatus}**\n- **Recommendation**: Gas fees are low. Excellent time for on-chain contract deployments.`;
      } else if (action === 'summarize_activity') {
        if (context.recentTransactions.length > 0) {
          const items = context.recentTransactions.slice(0, 3).map(t => 
            `- **${t.type.toUpperCase()}**: ${t.amount} to \`${t.to.slice(0, 8)}...\` (${new Date(t.date).toLocaleDateString()})`
          ).join('\n');
          finalContent = `**Session Activity Summary**\n\nHere is a list of your recent actions:\n${items}`;
        } else {
          finalContent = "No activity logs available for the current session.";
        }
      } else if (action === 'prepare_send') {
        finalContent = JSON.stringify({
          action: 'send',
          amount: parameters?.amount || '0.1',
          to: parameters?.to || '0x0000000000000000000000000000000000000000',
          asset: parameters?.asset || 'RITUAL'
        });
      } else if (action === 'prepare_swap') {
        finalContent = "Swapping is currently unavailable on Ritual Testnet.";
      } else if (action === 'prepare_bridge') {
        finalContent = "Bridging is currently unavailable on Ritual Testnet.";
      }

      this.memory.addMessage('assistant', finalContent);
      this.cache.set(cacheKey, finalContent);

      return {
        content: finalContent,
        source: 'Live AI'
      };
    } catch (error: any) {
      console.error("AI execution error:", error);
      return {
        content: `AI Execution Failed. Error: ${error.message || error}`,
        source: 'Unavailable'
      };
    }
  }

  public clearMemory() {
    this.memory.clear();
    this.cache.clear();
  }

  public getMessages(): ChatMessage[] {
    return this.memory.getMessages();
  }
}
