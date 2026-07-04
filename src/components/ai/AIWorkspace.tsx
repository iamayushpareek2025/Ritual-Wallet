import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Sparkles, 
  Settings, 
  Plus, 
  Mic, 
  Bot, 
  Clock, 
  TrendingUp,
  Trash2
} from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';
import { useWalletStore } from '../../stores/useWalletStore';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'transaction' | 'image' | 'automation';
  metadata?: any;
}

export function AIWorkspace() {
  const { triggerToast } = useUIStore();
  const { balance: _balance } = useWalletStore();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'automations'>('chat');
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Welcome to your Ritual AI Workspace. ✨\n\nI am your on-chain intelligent agent. I can help you execute trades, create automations, or answer crypto questions.\n\nTry saying:\n- "Send 0.1 USDC to vitalik.eth"\n- "Buy $100 of RITUAL every week"\n- "Generate a cyberpunk NFT avatar"',
      timestamp: new Date(),
      type: 'text'
    }
  ]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (activeTab === 'chat' && messages.length > 1) {
      scrollToBottom();
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Mock AI response
    setTimeout(() => {
      let aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        type: 'text'
      };

      const lowerInput = userMsg.content.toLowerCase();
      
      if (lowerInput.includes('send') || lowerInput.includes('transfer')) {
        aiResponse.content = "I've prepared that transaction for you. Please review and confirm.";
        aiResponse.type = 'transaction';
        aiResponse.metadata = { action: 'send', amount: '0.1', asset: 'USDC', to: 'vitalik.eth' };
      } 
      else if (lowerInput.includes('buy') && lowerInput.includes('every')) {
        aiResponse.content = "I've created an automation rule for this DCA strategy.";
        aiResponse.type = 'automation';
        aiResponse.metadata = { action: 'dca', amount: '100', asset: 'RITUAL', frequency: 'weekly' };
      }
      else if (lowerInput.includes('generate') || lowerInput.includes('image') || lowerInput.includes('nft')) {
        aiResponse.content = "Here is the cyberpunk NFT avatar you requested. Do you want to mint it on Ritual?";
        aiResponse.type = 'image';
        aiResponse.metadata = { imageUrl: 'https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?auto=format&fit=crop&q=80&w=800' };
      }
      else {
        aiResponse.content = `I'm analyzing the Ritual network data for "${userMsg.content}". Current network gas is 0.0001 RITUAL, and your portfolio is looking healthy!`;
      }

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const clearChat = () => {
    setMessages([{
      id: Date.now().toString(),
      role: 'assistant',
      content: 'Welcome to your Ritual AI Workspace. ✨\n\nI am your on-chain intelligent agent. I can help you execute trades, create automations, or answer crypto questions.\n\nTry saying:\n- "Send 0.1 USDC to vitalik.eth"\n- "Buy $100 of RITUAL every week"\n- "Generate a cyberpunk NFT avatar"',
      timestamp: new Date(),
      type: 'text'
    }]);
  };

  const executeAction = (type: string, _data: any) => {
    triggerToast(`${type === 'transaction' ? 'Transaction sent!' : type === 'automation' ? 'Automation created!' : 'NFT Minted!'}`);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[#09090b]">
      {/* Header (Tabs & Actions) */}
      <div className="px-4 pt-4 pb-2 sticky top-0 bg-[#09090b]/80 backdrop-blur-xl z-50 border-b border-white/5 flex justify-between items-center">
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab('chat')}
            className={`pb-2 text-sm font-medium transition-colors relative ${activeTab === 'chat' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Assistant
            {activeTab === 'chat' && (
              <motion.div layoutId="aiTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00FFA3]" />
            )}
          </button>
          <button 
            onClick={() => setActiveTab('automations')}
            className={`pb-2 text-sm font-medium transition-colors relative ${activeTab === 'automations' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Automations
            {activeTab === 'automations' && (
              <motion.div layoutId="aiTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00FFA3]" />
            )}
          </button>
        </div>
        
        {activeTab === 'chat' && (
          <button 
            onClick={clearChat}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-red-500/10 transition-colors text-red-400/70 hover:text-red-400"
            title="Clear Chat"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div ref={scrollContainerRef} className="flex-1 min-h-0 overflow-y-auto pb-4 scrollbar-hide relative">
        <AnimatePresence mode="wait">
          
          {activeTab === 'chat' && (
            <motion.div 
              key="chat"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col p-4 gap-6"
            >
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  
                  {/* Avatar / Sender name */}
                  <div className="flex items-center gap-2 mb-1">
                    {msg.role === 'assistant' ? (
                      <>
                        <div className="w-6 h-6 rounded-full bg-[#00FFA3]/20 flex items-center justify-center">
                          <Bot size={12} className="text-[#00FFA3]" />
                        </div>
                        <span className="text-xs text-gray-500 font-medium">Ritual AI</span>
                      </>
                    ) : (
                      <span className="text-xs text-gray-500 font-medium">You</span>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className={`p-4 rounded-2xl max-w-[85%] ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-white rounded-tr-sm' 
                      : 'bg-white/5 border border-white/5 text-gray-200 rounded-tl-sm'
                  }`}>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>

                    {/* Transaction Card inside Chat */}
                    {msg.type === 'transaction' && msg.metadata && (
                      <div className="mt-4 p-3 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400">Action</span>
                          <span className="text-xs font-semibold text-white uppercase">{msg.metadata.action}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400">Amount</span>
                          <span className="text-sm font-bold text-white">{msg.metadata.amount} {msg.metadata.asset}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400">To</span>
                          <span className="text-xs text-[#00FFA3] font-mono">{msg.metadata.to}</span>
                        </div>
                        <button 
                          onClick={() => executeAction('transaction', msg.metadata)}
                          className="w-full mt-2 py-2 rounded-lg bg-[#00FFA3]/20 text-[#00FFA3] text-sm font-semibold hover:bg-[#00FFA3]/30 transition-colors"
                        >
                          Confirm & Sign
                        </button>
                      </div>
                    )}

                    {/* Automation Card inside Chat */}
                    {msg.type === 'automation' && msg.metadata && (
                      <div className="mt-4 p-3 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-purple-400 mb-1">
                          <Clock size={14} />
                          <span className="text-xs font-bold uppercase">New Automation</span>
                        </div>
                        <div className="text-sm text-white">Buy {msg.metadata.amount} USD of {msg.metadata.asset} {msg.metadata.frequency}</div>
                        <button 
                          onClick={() => executeAction('automation', msg.metadata)}
                          className="w-full mt-2 py-2 rounded-lg bg-purple-500/20 text-purple-400 text-sm font-semibold hover:bg-purple-500/30 transition-colors"
                        >
                          Enable Rule
                        </button>
                      </div>
                    )}

                    {/* Image Card inside Chat */}
                    {msg.type === 'image' && msg.metadata && (
                      <div className="mt-4 flex flex-col gap-2">
                        <img src={msg.metadata.imageUrl} alt="Generated AI" className="w-full rounded-xl border border-white/10 object-cover h-32" />
                        <button 
                          onClick={() => executeAction('mint', msg.metadata)}
                          className="w-full py-2 rounded-lg bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-colors"
                        >
                          Mint as NFT
                        </button>
                      </div>
                    )}

                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-[#00FFA3]/20 flex items-center justify-center">
                      <Bot size={12} className="text-[#00FFA3]" />
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 rounded-tl-sm flex gap-1">
                    <motion.div animate={{y:[0,-5,0]}} transition={{repeat:Infinity, duration:0.6}} className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                    <motion.div animate={{y:[0,-5,0]}} transition={{repeat:Infinity, duration:0.6, delay:0.2}} className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                    <motion.div animate={{y:[0,-5,0]}} transition={{repeat:Infinity, duration:0.6, delay:0.4}} className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                  </div>
                </div>
              )}
              
            </motion.div>
          )}

          {activeTab === 'automations' && (
            <motion.div 
              key="automations"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4 flex flex-col gap-4"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-semibold text-gray-400">Active Rules</h2>
                <button className="text-xs text-[#00FFA3] flex items-center gap-1 hover:underline">
                  <Plus size={12}/> Create New
                </button>
              </div>

              {/* Sample Automation 1 */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-3 group hover:border-[#00FFA3]/30 transition-colors cursor-pointer">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <Clock size={14} className="text-purple-400" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">DCA Ritual</div>
                      <div className="text-xs text-gray-500">Weekly on Monday</div>
                    </div>
                  </div>
                  <div className="px-2 py-1 rounded bg-[#00FFA3]/10 text-[#00FFA3] text-[10px] font-bold uppercase">Active</div>
                </div>
                <div className="text-sm text-gray-400">
                  Swaps <span className="text-white">100 USDC</span> for <span className="text-white">RITUAL</span>
                </div>
              </div>

              {/* Sample Automation 2 */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-3 group hover:border-blue-500/30 transition-colors cursor-pointer">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <TrendingUp size={14} className="text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">Take Profit ETH</div>
                      <div className="text-xs text-gray-500">Condition-based</div>
                    </div>
                  </div>
                  <div className="px-2 py-1 rounded bg-gray-500/20 text-gray-400 text-[10px] font-bold uppercase">Paused</div>
                </div>
                <div className="text-sm text-gray-400">
                  If <span className="text-white">ETH &gt; $4,000</span>, sell <span className="text-white">50%</span> to USDC
                </div>
              </div>

              {/* Create Automation Banner */}
              <div className="mt-4 p-5 rounded-2xl bg-gradient-to-br from-[#09090b] to-[#1a1a24] border border-white/10 flex flex-col items-center text-center gap-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FFA3]/10 rounded-full blur-3xl" />
                <Sparkles size={24} className="text-[#00FFA3]" />
                <h3 className="text-white font-bold">Need a custom strategy?</h3>
                <p className="text-xs text-gray-400">Ask the AI Assistant to create complex multi-step automations using natural language.</p>
                <button 
                  onClick={() => setActiveTab('chat')}
                  className="mt-2 text-sm font-semibold text-[#00FFA3] hover:underline"
                >
                  Try it now
                </button>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Input Area (Only show for Chat) */}
      <AnimatePresence>
        {activeTab === 'chat' && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="w-full px-4 pt-4 pb-4 bg-[#09090b] z-20 shrink-0 border-t border-white/5"
          >
            {/* Suggestion Chips */}
            <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide pb-1">
              <button onClick={() => setInput('Send 50 USDC to @alice')} className="shrink-0 px-3 py-1.5 rounded-full bg-white/10 text-xs text-gray-300 hover:bg-white/20 transition-colors border border-white/5 whitespace-nowrap backdrop-blur-md">
                Send 50 USDC to @alice
              </button>
              <button onClick={() => setInput('What is the current gas fee?')} className="shrink-0 px-3 py-1.5 rounded-full bg-white/10 text-xs text-gray-300 hover:bg-white/20 transition-colors border border-white/5 whitespace-nowrap backdrop-blur-md">
                Check gas fee
              </button>
            </div>

            <div className="p-1 pl-4 rounded-full bg-[#18181b] border border-white/10 flex items-center gap-2 shadow-2xl focus-within:border-white/30 transition-colors backdrop-blur-xl">
              <input 
                type="text"
                placeholder="Ask Ritual AI..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 bg-transparent text-sm text-white outline-none placeholder-gray-500"
              />
              <button className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                <Mic size={16} />
              </button>
              <button 
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-10 h-10 rounded-full bg-[#00FFA3] text-black flex items-center justify-center hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0"
              >
                <Send size={16} className="ml-1" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
