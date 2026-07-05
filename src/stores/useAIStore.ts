import { create } from 'zustand';

export interface ChatMessage {
  role: string;
  content: string;
  imageUrl?: string;
}

interface AIState {
  chatHistory: ChatMessage[];
  isAiLoading: boolean;
  pendingPrompt?: string;
  
  addMessage: (msg: ChatMessage) => void;
  setLoading: (loading: boolean) => void;
  clearHistory: () => void;
  setChatHistory: (history: ChatMessage[]) => void;
  setPendingPrompt: (prompt?: string) => void;
}

// Global executor registry to avoid component re-render loops in React/Zustand
let globalExecuteAiCommand: ((prompt: string) => Promise<void>) | undefined = undefined;

export const setGlobalExecuteAiCommand = (cb?: (prompt: string) => Promise<void>) => {
  globalExecuteAiCommand = cb;
};

export const executeAiCommand = async (prompt: string) => {
  if (globalExecuteAiCommand) {
    await globalExecuteAiCommand(prompt);
  } else {
    console.warn("AI command executor not registered");
  }
};

export const useAIStore = create<AIState>((set) => ({
  chatHistory: [
    { role: 'assistant', content: 'Welcome to Ritual AI. ✨\n\nI am your on-chain intelligent agent. I can help you manage your portfolio, execute trades, answer crypto questions, or even generate AI art. Try saying:\n\n- "Send 0.1 USDC to 0x123..."\n- "Generate a picture of a cyberpunk city"' }
  ],
  isAiLoading: false,
  pendingPrompt: undefined,

  addMessage: (msg) => set((state) => ({ chatHistory: [...state.chatHistory, msg] })),
  setLoading: (loading) => set({ isAiLoading: loading }),
  clearHistory: () => set({ chatHistory: [
    { role: 'assistant', content: 'Welcome to Ritual AI. ✨\n\nI am your on-chain intelligent agent. I can help you manage your portfolio, execute trades, answer crypto questions, or even generate AI art.' }
  ]}),
  setChatHistory: (history) => set({ chatHistory: history }),
  setPendingPrompt: (prompt) => set({ pendingPrompt: prompt })
}));
