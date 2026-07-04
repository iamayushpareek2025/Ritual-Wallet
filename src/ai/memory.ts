export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export class ConversationMemory {
  private messages: ChatMessage[] = [];
  private maxMessages: number = 20;

  constructor(maxMessages: number = 20) {
    this.maxMessages = maxMessages;
  }

  public addMessage(role: 'system' | 'user' | 'assistant', content: string) {
    this.messages.push({ role, content, timestamp: Date.now() });
    
    // Always keep the system prompt (first message if it is system)
    const hasSystem = this.messages.length > 0 && this.messages[0].role === 'system';
    
    if (this.messages.length > this.maxMessages) {
      if (hasSystem) {
        // Keep the first message, remove the second
        this.messages.splice(1, 1);
      } else {
        this.messages.shift();
      }
    }
  }

  public getMessages(): ChatMessage[] {
    return this.messages;
  }

  public clear() {
    // Keep system prompt if it exists
    const sysPrompt = this.messages.find(m => m.role === 'system');
    this.messages = sysPrompt ? [sysPrompt] : [];
  }
}
