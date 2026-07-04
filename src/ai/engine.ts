import { ConversationMemory } from './memory';
import type { ChatMessage } from './memory';
import { SecurityFilter } from './security';
import { PortfolioAnalyzer } from './portfolio';
import type { PortfolioContext } from './portfolio';
import { buildSystemPrompt } from './prompts';

export interface IAIProvider {
  generate(prompt: string, history: ChatMessage[]): Promise<string>;
  stream?(prompt: string, history: ChatMessage[], onChunk: (chunk: string) => void): Promise<void>;
}

/**
 * Mock Provider for local development without paid APIs.
 */
class MockProvider implements IAIProvider {
  async generate(prompt: string, history: ChatMessage[]): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return `Simulated response to: "${prompt}"`;
  }
  
  async stream(prompt: string, history: ChatMessage[], onChunk: (chunk: string) => void): Promise<void> {
    const response = `Simulated streaming response to: "${prompt}"`;
    const words = response.split(' ');
    
    for (const word of words) {
      await new Promise(resolve => setTimeout(resolve, 100));
      onChunk(word + ' ');
    }
  }
}

export class AIEngine {
  private static instance: AIEngine;
  private memory: ConversationMemory;
  private provider: IAIProvider;

  private constructor() {
    this.memory = new ConversationMemory(50); // Keep last 50 messages
    this.provider = new MockProvider(); // Inject actual Ritual AI provider here later
  }

  public static getInstance(): AIEngine {
    if (!AIEngine.instance) {
      AIEngine.instance = new AIEngine();
    }
    return AIEngine.instance;
  }

  public setProvider(provider: IAIProvider) {
    this.provider = provider;
  }

  public async processPrompt(prompt: string, context: PortfolioContext): Promise<string> {
    const safePrompt = SecurityFilter.redactSensitiveData(prompt);
    
    if (this.memory.getMessages().length === 0) {
      const systemContext = PortfolioAnalyzer.formatContext(context);
      const systemPrompt = buildSystemPrompt(systemContext);
      this.memory.addMessage('system', systemPrompt);
    }
    
    this.memory.addMessage('user', safePrompt);
    const response = await this.provider.generate(safePrompt, this.memory.getMessages());
    this.memory.addMessage('assistant', response);
    
    return response;
  }
  
  public async streamPrompt(prompt: string, context: PortfolioContext, onChunk: (chunk: string) => void): Promise<string> {
    const safePrompt = SecurityFilter.redactSensitiveData(prompt);
    
    if (this.memory.getMessages().length === 0) {
      const systemContext = PortfolioAnalyzer.formatContext(context);
      const systemPrompt = buildSystemPrompt(systemContext);
      this.memory.addMessage('system', systemPrompt);
    }
    
    this.memory.addMessage('user', safePrompt);
    
    let fullResponse = '';
    if (this.provider.stream) {
      await this.provider.stream(safePrompt, this.memory.getMessages(), (chunk) => {
        fullResponse += chunk;
        onChunk(chunk);
      });
    } else {
      fullResponse = await this.provider.generate(safePrompt, this.memory.getMessages());
      onChunk(fullResponse);
    }
    
    this.memory.addMessage('assistant', fullResponse);
    return fullResponse;
  }
  
  public clearMemory() {
    this.memory.clear();
  }
}
