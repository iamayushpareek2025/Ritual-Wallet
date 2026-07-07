import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Sparkles, 
  Bot, 
  Trash2,
  AlertTriangle,
  ArrowRight,
  Shield,
  Cpu,
  Zap,
  Activity,
  FileText,
  TrendingUp,
  AlertCircle,
  Bell,
  BookOpen,
  Settings as SettingsIcon,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  Lock
} from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';
import { useAIStore, executeAiCommand } from '../../stores/useAIStore';
import { useWalletStore } from '../../stores/useWalletStore';
import { AIEngine } from '../../ai';
import { AddressValidator } from '../../security/addressValidator';
import { MockSecurityProvider } from '../../security/provider';
import { useIsDesktop } from '../../hooks/useMediaQuery';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'transaction' | 'image' | 'automation' | 'swap_redirect' | 'bridge_redirect' | 'health_redirect' | 'yield_redirect';
  metadata?: any;
}

interface AutomationRule {
  id: string;
  type: string;
  triggerValue: string;
  active: boolean;
}

export function AIWorkspace() {
  const isDesktop = useIsDesktop();
  const { triggerToast, setCurrentView, setSendToken, setActiveTab } = useUIStore();
  const { chatHistory, isAiLoading, pendingPrompt, setPendingPrompt, clearHistory } = useAIStore();
  const { address, balance, usdcBalance, stakedUsdc, isMainnet } = useWalletStore();
  
  const [input, setInput] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'assistant' | 'portfolio' | 'security' | 'research' | 'automation'>('assistant');
  
  // Overview states
  const [localScore, setLocalScore] = useState<number>(92);
  const [localHealth, setLocalHealth] = useState<string>("Healthy");
  const [localRisk, setLocalRisk] = useState<string>("Low");
  const [gasRecommend, setGasRecommend] = useState<string>("Low (0.00015 RITUAL)");

  // AI Status parameters
  const [activeProvider, setActiveProvider] = useState<string>('none');
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [modelName, setModelName] = useState<string>('');
  const [responseTime, setResponseTime] = useState<string>('N/A');
  const [memoryUsage, setMemoryUsage] = useState<string>('0 messages');

  // Automation states
  const [automations, setAutomations] = useState<AutomationRule[]>([]);
  const [newAutoType, setNewAutoType] = useState<string>('gas');
  const [newAutoVal, setNewAutoVal] = useState<string>('');

  const [researchToken, setResearchToken] = useState<string>('RITUAL');
  const [researchResult, setResearchResult] = useState<string>('');

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Load wallet overview stats
  useEffect(() => {
    let active = true;
    const loadOverviewStats = async () => {
      if (!address) return;
      try {
        const provider = new MockSecurityProvider();
        const res = await AddressValidator.analyzeAddress(address, provider);
        if (active && res.valid && res.risk) {
          const score = 100 - res.risk.score;
          setLocalScore(score);
          setLocalHealth(score > 70 ? "Healthy" : "At Risk");
          setLocalRisk(score > 70 ? "Low" : score > 40 ? "Medium" : "High");
        }
      } catch {}
    };
    loadOverviewStats();
    return () => { active = false; };
  }, [address]);

  // Load AI configuration status & memory usage
  useEffect(() => {
    const provider = AIEngine.getInstance().getActiveProviderName();
    setActiveProvider(provider);
    
    if (provider === 'none') {
      setIsOnline(false);
      setModelName('None');
      setResponseTime('N/A');
    } else {
      setIsOnline(true);
      setResponseTime('~1.2s');
      if (provider === 'openai') {
        setModelName(localStorage.getItem('ritual_openai_model') || 'gpt-4o-mini');
      } else if (provider === 'anthropic') {
        setModelName(localStorage.getItem('ritual_anthropic_model') || 'claude-3-5-sonnet-20241022');
      } else if (provider === 'ollama') {
        setModelName(localStorage.getItem('ritual_ollama_model') || 'llama3');
      } else if (provider === 'ritual') {
        setModelName('Ritual Llama-3-TEE');
      }
    }
  }, [activeProvider]);

  useEffect(() => {
    setMemoryUsage(`${chatHistory.length} messages`);
  }, [chatHistory]);

  // Load saved automations
  useEffect(() => {
    const saved = localStorage.getItem('ritual_ai_automations');
    if (saved) {
      try {
        setAutomations(JSON.parse(saved));
      } catch {}
    } else {
      const defaults = [
        { id: '1', type: 'Notify when gas < 20 Gwei', triggerValue: '20', active: true },
        { id: '2', type: 'Notify when wallet receives funds', triggerValue: 'any', active: true }
      ];
      setAutomations(defaults);
      localStorage.setItem('ritual_ai_automations', JSON.stringify(defaults));
    }
  }, []);

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isAiLoading, activeSubTab]);

  useEffect(() => {
    if (pendingPrompt) {
      const promptToRun = pendingPrompt;
      setPendingPrompt(undefined);
      setInput('');
      setActiveSubTab('assistant');
      executeAiCommand(promptToRun);
    }
  }, [pendingPrompt, setPendingPrompt]);

  const handleSend = () => {
    if (!input.trim()) return;
    const currentInput = input.trim();
    setInput('');
    executeAiCommand(currentInput);
  };

  const handleQuickAction = (promptText: string) => {
    setInput('');
    setActiveSubTab('assistant');
    executeAiCommand(promptText);
  };

  const handleCreateAutomation = (e: React.FormEvent) => {
    e.preventDefault();
    let desc = '';
    if (newAutoType === 'gas') {
      desc = `Notify when gas < ${newAutoVal || '10'} Gwei`;
    } else if (newAutoType === 'funds') {
      desc = `Notify when wallet receives funds`;
    } else if (newAutoType === 'portfolio') {
      desc = `Notify when portfolio changes by > ${newAutoVal || '5'}%`;
    }

    const newRule: AutomationRule = {
      id: Date.now().toString(),
      type: desc,
      triggerValue: newAutoVal || 'default',
      active: true
    };

    const updated = [...automations, newRule];
    setAutomations(updated);
    localStorage.setItem('ritual_ai_automations', JSON.stringify(updated));
    triggerToast(`Automation rule created successfully!`);
    setNewAutoVal('');
  };

  const handleToggleRule = (id: string) => {
    const updated = automations.map(r => r.id === id ? { ...r, active: !r.active } : r);
    setAutomations(updated);
    localStorage.setItem('ritual_ai_automations', JSON.stringify(updated));
    triggerToast(`Rule status updated.`);
  };

  const handleDeleteRule = (id: string) => {
    const updated = automations.filter(r => r.id !== id);
    setAutomations(updated);
    localStorage.setItem('ritual_ai_automations', JSON.stringify(updated));
    triggerToast(`Automation rule removed.`);
  };

  const triggerTokenResearch = () => {
    if (!researchToken.trim()) return;
    const t = researchToken.toLowerCase().trim();
    if (t === 'ritual') {
      setResearchResult('RITUAL is the native utility token of the Ritual AI-native layer. It is used to execute on-chain inferences, pay gas for decentralized workflows, and reward validation nodes.');
    } else if (t === 'usdc') {
      setResearchResult('USD Coin (USDC) is a fully backed USD stablecoin. On Ritual, USDC is supported across DEX pools and used extensively inside secure TEE staking vaults.');
    } else {
      setResearchResult(`No local documentation found for "${researchToken}". Check the Ecosystem tab for external links.`);
    }
  };

  // Decode JSON outputs
  const parseMessageContent = (content: string, imageUrl?: string) => {
    if (imageUrl) {
      return {
        text: content || "Here is your generated image:",
        type: 'image' as const,
        metadata: { imageUrl }
      };
    }

    try {
      const trimmed = content.trim();
      const cleanJson = trimmed.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
      if (cleanJson.startsWith('{') && cleanJson.endsWith('}')) {
        const parsed = JSON.parse(cleanJson);
        if (parsed && typeof parsed === 'object' && parsed.action) {
          if (parsed.action === 'send') {
            return {
              text: "I've prepared that transaction for you. Please review and sign below.",
              type: 'transaction' as const,
              metadata: {
                action: 'send',
                amount: parsed.amount,
                asset: parsed.asset || 'RITUAL',
                to: parsed.to
              }
            };
          }
          if (parsed.action === 'swap') {
            return {
              text: `I've prepared a swap of **${parsed.amount || '10'} ${parsed.fromAsset || 'RITUAL'}** to **${parsed.toAsset || 'USDC'}**. Click below to review and confirm.`,
              type: 'swap_redirect' as const,
              metadata: {
                fromAsset: parsed.fromAsset || 'RITUAL',
                toAsset: parsed.toAsset || 'USDC',
                amount: parsed.amount || '10'
              }
            };
          }
          if (parsed.action === 'bridge') {
            return {
              text: `I've prepared a bridge of **${parsed.amount || '50'} ${parsed.asset || 'RITUAL'}** from **${parsed.fromChain || 'Ritual Testnet'}** to **${parsed.toChain || 'Ritual Mainnet'}**. Click below to review and confirm.`,
              type: 'bridge_redirect' as const,
              metadata: {
                fromChain: parsed.fromChain || 'Ritual Testnet',
                toChain: parsed.toChain || 'Ritual Mainnet',
                amount: parsed.amount || '50',
                asset: parsed.asset || 'RITUAL'
              }
            };
          }
          if (parsed.action === 'health') {
            return {
              text: "Wallet Health analysis triggered. Click below to inspect your security and status details.",
              type: 'health_redirect' as const,
              metadata: {}
            };
          }
          if (parsed.action === 'yield') {
            return {
              text: "Staking & yield opportunities identified. Click below to check staking options.",
              type: 'yield_redirect' as const,
              metadata: {}
            };
          }
        }
      }
    } catch {}

    return {
      text: content,
      type: 'text' as const,
      metadata: undefined
    };
  };

  const parsedMessages: Message[] = chatHistory.map((m, index) => {
    const parsed = parseMessageContent(m.content, m.imageUrl);
    return {
      id: `${index}-${m.role}`,
      role: m.role as 'user' | 'assistant',
      content: parsed.text,
      timestamp: new Date(),
      type: parsed.type,
      metadata: parsed.metadata
    };
  });

  const executeAction = (type: string, metadata: any) => {
    if (type === 'transaction') {
      localStorage.setItem('ritual_prefilled_send_to', metadata.to);
      localStorage.setItem('ritual_prefilled_send_amount', metadata.amount);
      localStorage.setItem('ritual_prefilled_send_token', metadata.asset);
      setSendToken(metadata.asset === 'USDC' ? 'USDC' : 'RITUAL');
      setCurrentView('send');
      triggerToast('Prefilled Send flow initialized!');
    } else if (type === 'swap_redirect') {
      localStorage.setItem('ritual_prefilled_swap_from_asset', metadata.fromAsset);
      localStorage.setItem('ritual_prefilled_swap_to_asset', metadata.toAsset);
      localStorage.setItem('ritual_prefilled_swap_amount', metadata.amount);
      setActiveTab('swap');
      triggerToast('Prefilled Swap flow initialized!');
    } else if (type === 'bridge_redirect') {
      localStorage.setItem('ritual_prefilled_bridge_from_chain', metadata.fromChain);
      localStorage.setItem('ritual_prefilled_bridge_to_chain', metadata.toChain);
      localStorage.setItem('ritual_prefilled_bridge_amount', metadata.amount);
      localStorage.setItem('ritual_prefilled_bridge_asset', metadata.asset);
      setCurrentView('bridge');
      triggerToast('Prefilled Bridge flow initialized!');
    } else if (type === 'health_redirect' || type === 'yield_redirect') {
      localStorage.setItem('ritual_portfolio_subtab', 'staking');
      setActiveTab('portfolio');
    }
  };

  const totalValueUsd = (
    parseFloat(balance || '0.0') * 150 +
    parseFloat(usdcBalance || '0.00') +
    parseFloat(stakedUsdc || '0.00')
  ).toFixed(2);

  const subTabs = [
    { id: 'assistant', label: 'Assistant', icon: Bot },
    { id: 'portfolio', label: 'Portfolio', icon: TrendingUp },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'research', label: 'Research', icon: BookOpen },
    { id: 'automation', label: 'Automation', icon: Bell }
  ] as const;

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[#000000] text-white">
      
      {/* Header Area */}
      <div className="px-4 pt-6 pb-2 sticky top-0 bg-[#000000]/80 backdrop-blur-xl z-10 border-b border-white/5 shrink-0 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-tight">AI Command Center</h1>
        <button onClick={() => setCurrentView('settings')} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition border border-white/5">
          <SettingsIcon size={14} className="text-gray-400" />
        </button>
      </div>

      {/* Sub-tab Navigation */}
      <div className="px-4 py-3 bg-[#000000]/90 border-b border-white/5 flex gap-1.5 overflow-x-auto scrollbar-hide shrink-0">
        {subTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition border ${
                isActive 
                  ? 'bg-[#00FFA3]/10 border-[#00FFA3]/30 text-[#00FFA3]' 
                  : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <Icon size={12} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        <AnimatePresence mode="wait">
          
          {/* ASSISTANT SUB-TAB */}
          {activeSubTab === 'assistant' && (
            <motion.div 
              key="assistant"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex-1 flex flex-col min-h-0"
            >
              {/* Scrollable Chat Feed Area */}
              <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 scrollbar-hide flex flex-col gap-4">
                {activeProvider === 'none' && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
                    <AlertCircle size={15} />
                    No AI Provider Configured.
                  </div>
                )}

                {parsedMessages.length === 0 && (
                  <>
                    {/* AI Guardian Top Card */}
                    <div className="p-4 rounded-[20px] bg-white/5 border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#00FFA3]/10 border border-[#00FFA3]/20 flex items-center justify-center text-[#00FFA3]">
                          <ShieldCheck size={18} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">AI Guardian</div>
                          <div className="text-[10px] text-gray-500 mt-0.5">Monitoring your wallet 24/7</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-[#00FFA3] bg-[#00FFA3]/10 border border-[#00FFA3]/20 px-2.5 py-0.5 rounded-full">Healthy</span>
                    </div>

                    {/* 2x2 Quick Actions Grid */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <button 
                        onClick={() => handleQuickAction("Analyze portfolio")} 
                        disabled={isAiLoading} 
                        className="p-3.5 rounded-[18px] bg-white/5 border border-white/5 hover:border-[#00FFA3]/20 hover:bg-white/10 text-left text-xs font-semibold text-gray-200 transition active:scale-97 disabled:opacity-40 flex flex-col justify-between h-20"
                      >
                        <TrendingUp size={16} className="text-[#00FFA3]" />
                        <span>Analyze Portfolio</span>
                      </button>
                      <button 
                        onClick={() => handleQuickAction("Check wallet security")} 
                        disabled={isAiLoading} 
                        className="p-3.5 rounded-[18px] bg-white/5 border border-white/5 hover:border-green-400/20 hover:bg-white/10 text-left text-xs font-semibold text-gray-200 transition active:scale-97 disabled:opacity-40 flex flex-col justify-between h-20"
                      >
                        <Shield size={16} className="text-green-400" />
                        <span>Check Security</span>
                      </button>
                      <button 
                        onClick={() => handleQuickAction("Explain last transaction")} 
                        disabled={isAiLoading} 
                        className="p-3.5 rounded-[18px] bg-white/5 border border-white/5 hover:border-blue-400/20 hover:bg-white/10 text-left text-xs font-semibold text-gray-200 transition active:scale-97 disabled:opacity-40 flex flex-col justify-between h-20"
                      >
                        <FileText size={16} className="text-blue-400" />
                        <span>Explain Tx</span>
                      </button>
                      <button 
                        onClick={() => handleQuickAction("Research Ritual token")} 
                        disabled={isAiLoading} 
                        className="p-3.5 rounded-[18px] bg-white/5 border border-white/5 hover:border-purple-400/20 hover:bg-white/10 text-left text-xs font-semibold text-gray-200 transition active:scale-97 disabled:opacity-40 flex flex-col justify-between h-20"
                      >
                        <BookOpen size={16} className="text-purple-400" />
                        <span>Research Token</span>
                      </button>
                    </div>

                    {/* Suggested Prompts List with green arrow icons */}
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Suggested Prompts</div>
                      <div className="flex flex-col gap-2">
                        {[
                          "What is my portfolio performance?",
                          "Are my approvals safe?",
                          "Explain my last transaction"
                        ].map((prompt, i) => (
                          <button
                            key={i}
                            onClick={() => handleQuickAction(prompt)}
                            disabled={isAiLoading}
                            className="w-full p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-left text-xs font-semibold text-gray-300 flex items-center justify-between disabled:opacity-40 transition active:scale-99"
                          >
                            <span>{prompt}</span>
                            <ArrowRight size={13} className="text-[#00FFA3]" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Chat Feed */}
                {parsedMessages.length > 0 && (
                  <div className="flex-1 flex flex-col gap-4 min-h-[220px]">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Conversation logs</span>
                      <button onClick={clearHistory} className="text-[10px] text-red-400 hover:underline flex items-center gap-1 font-bold">
                        <Trash2 size={10} /> Clear Logs
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {parsedMessages.map((msg) => (
                        <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                          <span className="text-[9px] text-gray-500 mb-1">{msg.role === 'user' ? 'You' : 'Agent'}</span>
                          <div className={`p-3.5 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                            msg.role === 'user' 
                              ? 'bg-blue-600/15 border border-blue-500/20 text-white rounded-tr-none' 
                              : 'bg-white/5 border border-white/5 text-gray-200 rounded-tl-none'
                          }`}>
                            <div className="whitespace-pre-wrap">{msg.content}</div>

                            {msg.type === 'transaction' && msg.metadata && (
                              <div className="mt-3 p-2.5 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-1">
                                <div className="flex justify-between text-[10px]">
                                  <span className="text-gray-500 font-medium">To Recipient</span>
                                  <span className="text-white font-mono">{msg.metadata.to.slice(0, 8)}...</span>
                                </div>
                                <div className="flex justify-between text-[10px]">
                                  <span className="text-gray-500 font-medium">Asset & Amount</span>
                                  <span className="text-[#00FFA3] font-bold">{msg.metadata.amount} {msg.metadata.asset}</span>
                                </div>
                                <button 
                                  onClick={() => executeAction('transaction', msg.metadata)}
                                  className="w-full mt-2 py-1.5 rounded-lg bg-[#00FFA3] text-black text-[10px] font-bold hover:brightness-105 transition"
                                >
                                  Review & Sign
                                </button>
                              </div>
                            )}

                            {(msg.type === 'swap_redirect' || msg.type === 'bridge_redirect' || msg.type === 'health_redirect' || msg.type === 'yield_redirect') && (
                              <button 
                                onClick={() => executeAction(msg.type!, msg.metadata)}
                                className="mt-2.5 py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-[10px] font-semibold transition flex items-center gap-1 border border-white/5"
                              >
                                Launch Interface <ArrowRight size={11} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {isAiLoading && (
                      <div className="flex flex-col items-start">
                        <span className="text-[9px] text-gray-500 mb-1">Agent</span>
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5 rounded-tl-none flex gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#00FFA3] animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-1.5 h-1.5 rounded-full bg-[#00FFA3] animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-1.5 h-1.5 rounded-full bg-[#00FFA3] animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Chat Input Field pinned at the bottom */}
              <div className="shrink-0 p-4 border-t border-white/5 bg-[#000000]/90 backdrop-blur-md" style={{ paddingBottom: isDesktop ? '16px' : '96px' }}>
                <div className="p-1 pl-3.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5 shadow-xl focus-within:border-white/20">
                  <input 
                    type="text" 
                    placeholder="Query AI Agent..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isAiLoading}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    className="flex-1 bg-transparent text-xs text-white outline-none placeholder-gray-600 disabled:opacity-40"
                  />
                  <button 
                    onClick={handleSend}
                    disabled={!input.trim() || isAiLoading}
                    className="w-8 h-8 rounded-full bg-[#00FFA3] text-black flex items-center justify-center hover:brightness-105 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    <Send size={12} className="ml-0.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* PORTFOLIO TAB */}
          {activeSubTab === 'portfolio' && (
            <motion.div 
              key="portfolio"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex-1 overflow-y-auto p-4 scrollbar-hide space-y-4"
              style={{ paddingBottom: isDesktop ? '16px' : '96px' }}
            >
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-gray-400 text-xs font-semibold mb-1 uppercase tracking-wider">Total Assets Value</div>
                <div className="text-3xl font-bold text-white">${parseFloat(totalValueUsd).toLocaleString()}</div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1"><TrendingUp size={13}/> Allocation Breakdown</div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Native RITUAL</span>
                    <span className="font-semibold">{balance} RITUAL</span>
                  </div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#00FFA3] h-full" style={{ width: `${((parseFloat(balance)*150)/parseFloat(totalValueUsd))*100}%` }} />
                  </div>
                  
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-gray-400">Stable USDC</span>
                    <span className="font-semibold">{usdcBalance} USDC</span>
                  </div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-400 h-full" style={{ width: `${(parseFloat(usdcBalance)/parseFloat(totalValueUsd))*100}%` }} />
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <span className="text-gray-400">TEE Staked USDC</span>
                    <span className="font-semibold">{stakedUsdc} USDC</span>
                  </div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full" style={{ width: `${(parseFloat(stakedUsdc)/parseFloat(totalValueUsd))*100}%` }} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* SECURITY TAB WITH SCORE GAUGE */}
          {activeSubTab === 'security' && (
            <motion.div 
              key="security"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex-1 overflow-y-auto p-4 scrollbar-hide space-y-5"
              style={{ paddingBottom: isDesktop ? '16px' : '96px' }}
            >
              {/* Circular SVG Gauge matching reference designs */}
              <div className="p-5 rounded-[24px] bg-white/5 border border-white/10 text-center space-y-4">
                <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90 pointer-events-none" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#00FFA3" strokeWidth="3" strokeDasharray={`${localScore} ${100 - localScore}`} strokeDashoffset="0" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold text-white">{localScore}</span>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">/100</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">AI Security Guard</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">Attestation verification index status: {localHealth}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Scan Audit</div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center p-2 rounded-lg bg-black/20 border border-white/5">
                    <span className="text-gray-400">Address Risk Level</span>
                    <span className="text-white font-medium capitalize">{localRisk}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-black/20 border border-white/5">
                    <span className="text-gray-400">Risky contract approvals</span>
                    <span className="text-[#00FFA3] font-semibold">None detected</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* RESEARCH TAB */}
          {activeSubTab === 'research' && (
            <motion.div 
              key="research"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex-1 overflow-y-auto p-4 scrollbar-hide space-y-4"
              style={{ paddingBottom: isDesktop ? '16px' : '96px' }}
            >
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1"><BookOpen size={14} className="text-purple-400"/> Research Token</div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Enter token symbol (e.g. RITUAL)" 
                    value={researchToken}
                    onChange={(e) => setResearchToken(e.target.value)}
                    className="flex-1 bg-black/30 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#00FFA3]/50"
                  />
                  <button onClick={triggerTokenResearch} className="px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition">
                    Search
                  </button>
                </div>
                {researchResult && (
                  <div className="p-3 bg-black/40 border border-white/5 rounded-xl text-xs text-gray-300 leading-relaxed font-medium">
                    {researchResult}
                  </div>
                )}
              </div>

              {/* TEE parameters */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1"><Cpu size={14} className="text-blue-400"/> TEE Parameters</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-black/30 border border-white/5 p-2 rounded-lg">
                    <span className="text-[9px] text-gray-500 block">LLM Provider</span>
                    <span className="text-[#00FFA3] font-bold capitalize">{activeProvider}</span>
                  </div>
                  <div className="bg-black/30 border border-white/5 p-2 rounded-lg">
                    <span className="text-[9px] text-gray-500 block">TEE Nodes</span>
                    <span className={`font-bold ${isOnline ? 'text-blue-400' : 'text-gray-500'}`}>{isOnline ? 'Active' : 'Inactive'}</span>
                  </div>
                  <div className="bg-black/30 border border-white/5 p-2 rounded-lg col-span-2">
                    <span className="text-[9px] text-gray-500 block">Model File</span>
                    <span className="text-white font-semibold truncate block">{modelName || 'None'}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* AUTOMATION TAB */}
          {activeSubTab === 'automation' && (
            <motion.div 
              key="automation"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex-1 overflow-y-auto p-4 scrollbar-hide space-y-4"
              style={{ paddingBottom: isDesktop ? '16px' : '96px' }}
            >
              <form onSubmit={handleCreateAutomation} className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5"><Bell size={14} className="text-orange-400" /> Create AI Automation</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-1 uppercase font-semibold">Trigger Event</label>
                    <select 
                      value={newAutoType}
                      onChange={(e) => setNewAutoType(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-xs text-white outline-none focus:border-[#00FFA3]/50"
                    >
                      <option value="gas" className="bg-[#09090b]">Gas &lt; X Gwei</option>
                      <option value="funds" className="bg-[#09090b]">Receive funds</option>
                      <option value="portfolio" className="bg-[#09090b]">Portfolio Change &gt; X%</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-1 uppercase font-semibold">Trigger Value</label>
                    <input 
                      type="text" 
                      value={newAutoVal}
                      onChange={(e) => setNewAutoVal(e.target.value)}
                      placeholder="e.g. 15 or 5"
                      disabled={newAutoType === 'funds'}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#00FFA3]/50 disabled:opacity-40"
                    />
                  </div>
                </div>
                <button type="submit" className="w-full py-2 rounded-xl bg-[#00FFA3] text-black text-xs font-bold hover:brightness-105 transition flex items-center justify-center gap-1">
                  Save Automation
                </button>
              </form>

              <div className="space-y-2">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Active Triggers</div>
                {automations.length === 0 ? (
                  <div className="text-center text-xs text-gray-500 py-4 bg-white/5 rounded-2xl border border-white/10">No automations configured.</div>
                ) : (
                  automations.map((rule) => (
                    <div key={rule.id} className="flex justify-between items-center bg-white/5 border border-white/10 rounded-2xl p-3">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-gray-200">{rule.type}</span>
                        <span className="text-[9px] text-gray-500">Auto-execute trigger</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleToggleRule(rule.id)}
                          className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition-colors ${
                            rule.active 
                              ? 'bg-[#00FFA3]/10 text-[#00FFA3] border border-[#00FFA3]/20' 
                              : 'bg-white/5 text-gray-500 border border-white/10'
                          }`}
                        >
                          {rule.active ? 'Active' : 'Paused'}
                        </button>
                        <button onClick={() => handleDeleteRule(rule.id)} className="text-red-400 hover:text-red-300 p-1">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
