import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUpRight, 
  ArrowDownToLine, 
  ArrowRightLeft, 
  Route, // Bridge
  ShieldCheck,
  ChevronRight,
  Eye,
  Maximize2,
  PieChart,
  Zap,
  Droplet,
  Sparkles,
  MoreVertical,
  X,
  SlidersHorizontal,
  Hexagon
} from 'lucide-react';
import { useWalletStore } from '../../stores/useWalletStore';
import { useUIStore } from '../../stores/useUIStore';
import { useAIStore } from '../../stores/useAIStore';
import { useIsDesktop } from '../../hooks/useMediaQuery';

export function HomeDashboard() {
  const isDesktop = useIsDesktop();
  const { balance, usdcBalance, address, transactions, activeAccountIndex, accountNames } = useWalletStore();
  const { triggerToast, setActiveTab, setCurrentView, setShowAccountDropdown, setSendToken } = useUIStore();

  const [showBalance, setShowBalance] = useState(true);
  const [showAiPromo, setShowAiPromo] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'assets' | 'nfts' | 'activity'>('assets');

  const nativeNum = parseFloat(balance || "0");
  const usdcNum = parseFloat(usdcBalance || "0");
  const totalTokens = nativeNum + usdcNum;
  
  const rtlPercent = totalTokens > 0 ? (nativeNum / totalTokens) * 100 : 100;
  const usdcPercent = totalTokens > 0 ? (usdcNum / totalTokens) * 100 : 0;

  const expandToDashboard = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: chrome.runtime.getURL("index.html") });
    } else {
      window.open(window.location.href, '_blank');
    }
  };

  const quickActionsPopup = [
    { icon: ArrowUpRight, label: 'Send', onClick: () => setCurrentView('send'), active: false },
    { icon: ArrowRightLeft, label: 'Swap', onClick: () => setActiveTab('swap'), active: false },
    { icon: Hexagon, label: 'Ritual AI', onClick: () => setActiveTab('ai'), active: true },
    { icon: ArrowDownToLine, label: 'Receive', onClick: () => setCurrentView('receive'), active: false },
    { icon: Route, label: 'Bridge', onClick: () => setActiveTab('bridge'), active: false },
  ];

  const quickActionsDesktop = [
    { icon: ArrowUpRight, label: 'Send', onClick: () => setCurrentView('send') },
    { icon: ArrowDownToLine, label: 'Receive', onClick: () => setCurrentView('receive') },
    { icon: ArrowRightLeft, label: 'Swap', onClick: () => setActiveTab('swap') },
    { icon: Route, label: 'Bridge', onClick: () => setActiveTab('bridge') },
  ];

  const recentTxs = transactions.slice(0, 4);

  // -------------------------------------------------------------
  // DESKTOP LAYOUT (MODE 2)
  // -------------------------------------------------------------
  if (isDesktop) {
    return (
      <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8 scrollbar-hide bg-[#09090b] text-white">
        
        {/* Top Header section */}
        <div className="flex justify-between items-start border-b border-white/[0.04] pb-6">
          <div>
            <div className="text-gray-400 text-sm mb-1 font-medium tracking-tight">Welcome back,</div>
            <h1 className="text-3xl font-extrabold mb-2 tracking-tight flex items-center gap-2">
              Ritualist 👋
            </h1>
            <div className="text-gray-400 text-sm font-medium tracking-tight">Here's what's happening with your wallet today.</div>
          </div>

          <div className="flex flex-col items-end gap-4 shrink-0">
             <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.06] px-4 py-2 rounded-full transition active:scale-95 cursor-pointer">
                   <span className="w-2 h-2 rounded-full bg-[#00FFA3] shadow-[0_0_8px_#00FFA3] animate-pulse" />
                   <span className="text-sm font-semibold tracking-tight">Ritual Testnet</span>
                   <ChevronRight size={14} className="text-gray-500" />
                </button>
                <div 
                  className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00FFA3] to-[#0A84FF] flex items-center justify-center font-bold text-black cursor-pointer border-2 border-transparent hover:border-[#00FFA3] active:scale-95 transition-all shadow-lg"
                  onClick={() => setShowAccountDropdown(true)}
                >
                  {accountNames?.[activeAccountIndex]?.charAt(0).toUpperCase() || 'R'}
                </div>
             </div>

             <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 flex items-center gap-4 shadow-xl min-w-[300px]">
               <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
                 <ShieldCheck size={20} className="text-[#00FFA3]" />
               </div>
               <div className="flex-1">
                 <div className="text-sm font-bold text-white mb-0.5 tracking-tight">Wallet Status</div>
                 <div className="text-[#00FFA3] text-xs font-semibold">All systems secure</div>
                 <div className="text-gray-500 text-xs mt-0.5 font-medium">Your wallet is protected</div>
               </div>
               <ChevronRight size={16} className="text-gray-500" />
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* TOTAL BALANCE CARD */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-[24px] bg-gradient-to-b from-[#0c1015] to-[#080a0d] border border-white/[0.07] p-6 relative overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.5)] flex flex-col justify-between min-h-[240px] group hover:border-white/[0.12] transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-72 h-72 bg-[#00FFA3] opacity-[0.04] blur-3xl rounded-full pointer-events-none" />
            
            <div className="relative z-10 flex justify-between items-start">
              <div className="flex items-center gap-2 text-gray-400 text-xs font-bold tracking-wider uppercase">
                TOTAL BALANCE
                <Eye size={14} className="cursor-pointer hover:text-white transition-colors" onClick={() => setShowBalance(!showBalance)} />
              </div>
            </div>

            <div className="relative z-10 mt-4 mb-8">
              <div className="flex items-baseline gap-2.5">
                <span className="text-4xl md:text-5xl font-extrabold tracking-tight">
                  {showBalance ? `${nativeNum.toFixed(4)}` : '••••••••'}
                </span>
                <span className="text-lg text-gray-400 font-semibold tracking-tight">RTL</span>
              </div>
              <div className="text-gray-400 text-sm mt-2 flex items-center gap-2 font-mono">
                {showBalance ? `${usdcNum.toFixed(2)} USDC` : '••••'}
              </div>
              <div className="text-xs font-bold mt-2.5 flex items-center gap-1.5">
                <span className="bg-white/5 text-gray-500 px-2.5 py-0.5 rounded-md font-medium">No live market data available</span>
              </div>
            </div>

            {/* Glowing Line Chart */}
            <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-0 opacity-90 transition-opacity duration-300 group-hover:opacity-100">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 100">
                <defs>
                  <linearGradient id="glowLine" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00FFA3" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#00FFA3" stopOpacity="0" />
                  </linearGradient>
                  <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                <path d="M0,80 Q50,90 100,70 T200,60 T300,50 T400,20 L400,100 L0,100 Z" fill="url(#glowLine)" />
                <path d="M0,80 Q50,90 100,70 T200,60 T300,50 T400,20" fill="none" stroke="#00FFA3" strokeWidth="2.5" filter="url(#neonGlow)" />
                <circle cx="400" cy="20" r="3.5" fill="#00FFA3" filter="url(#neonGlow)" />
              </svg>
            </div>
          </motion.div>

          {/* QUICK ACTIONS */}
          <div className="rounded-[24px] bg-white/[0.02] border border-white/[0.06] p-6 shadow-xl flex flex-col justify-between min-h-[240px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-bold tracking-wider uppercase text-gray-400">QUICK ACTIONS</h3>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white cursor-pointer transition">
                Customize <Zap size={12} />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {quickActionsDesktop.map((action, i) => (
                <motion.button
                  key={i}
                  onClick={action.onClick}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex flex-col items-center gap-2 group cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-gray-300 group-hover:text-[#00FFA3] group-hover:border-[#00FFA3]/40 group-hover:bg-[#00FFA3]/[0.02] group-hover:shadow-[0_0_15px_rgba(0,255,163,0.15)] transition-all duration-200">
                    <action.icon size={22} strokeWidth={2.2} />
                  </div>
                  <span className="text-[11px] font-medium text-gray-400 group-hover:text-white transition-colors">{action.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

        </div>

        {/* Second Row: AI & Asset Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* AI ASSISTANT */}
          <div className="rounded-[24px] bg-white/[0.02] border border-white/[0.06] p-6 shadow-xl flex flex-col justify-between min-h-[280px] hover:border-white/[0.09] transition-all duration-300">
             <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <Sparkles size={15} className="text-gray-400" />
                  <h3 className="text-xs font-bold tracking-wider uppercase text-gray-400">AI ASSISTANT</h3>
                  <span className="px-1.5 py-0.5 rounded bg-[#00FFA3]/10 text-[#00FFA3] text-[8px] font-bold tracking-wider">BETA</span>
                </div>
                <button onClick={() => setActiveTab('ai')} className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 active:scale-95 transition cursor-pointer">
                   <ArrowUpRight size={14} className="text-gray-400" />
                </button>
             </div>
             
             <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-b from-[#00FFA3]/20 to-transparent p-[1.5px] shadow-[0_0_24px_rgba(0,255,163,0.12)] shrink-0">
                   <div className="w-full h-full rounded-full bg-[#0a0a0c] overflow-hidden relative">
                      <img src="/ai_cat_avatar_1783277858093.png" alt="AI Cat" className="w-full h-full object-cover" />
                   </div>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold mb-1 tracking-tight text-white">Hello, Ritualist! 👋</h2>
                  <p className="text-sm text-gray-400 leading-normal">Need insights about your portfolio or on-chain activity?</p>
                </div>
             </div>
             
             <div className="flex items-center gap-3">
                <button 
                  onClick={() => setActiveTab('portfolio')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.06] hover:border-white/[0.15] active:scale-95 transition text-xs text-gray-200 font-semibold cursor-pointer"
                >
                   <PieChart size={14} className="text-[#00FFA3]" /> Analyze Portfolio
                </button>
                <button 
                  onClick={() => setActiveTab('ai')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.06] hover:border-white/[0.15] active:scale-95 transition text-xs text-gray-200 font-semibold cursor-pointer"
                >
                   <Sparkles size={14} className="text-[#00FFA3]" /> Market Insights
                </button>
                <button 
                  onClick={() => triggerToast('Gas Tracker loading...')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.06] hover:border-white/[0.15] active:scale-95 transition text-xs text-gray-200 font-semibold cursor-pointer"
                >
                   <Droplet size={14} className="text-[#00FFA3]" /> Gas Tracker
                </button>
             </div>
          </div>

          {/* ASSET OVERVIEW */}
          <div className="rounded-[24px] bg-white/[0.02] border border-white/[0.06] p-6 shadow-xl flex flex-col justify-between min-h-[280px] hover:border-white/[0.09] transition-all duration-300">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-bold tracking-wider uppercase text-gray-400">ASSET OVERVIEW</h3>
                <div className="flex items-center gap-1 text-xs text-gray-500 hover:text-white cursor-pointer transition">
                  View Portfolio <ChevronRight size={12} />
                </div>
              </div>
              
              <div className="flex items-center gap-10 flex-1">
                 <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                      {totalTokens > 0 ? (
                        <>
                          <circle 
                            cx="18" 
                            cy="18" 
                            r="15.915" 
                            fill="none" 
                            stroke="#00FFA3" 
                            strokeWidth="3.2" 
                            strokeDasharray={`${rtlPercent} ${100 - rtlPercent}`} 
                            strokeDashoffset="100" 
                            style={{ filter: 'drop-shadow(0 0 3px rgba(0,255,163,0.3))' }}
                          />
                          {usdcPercent > 0 && (
                            <circle 
                              cx="18" 
                              cy="18" 
                              r="15.915" 
                              fill="none" 
                              stroke="#3b82f6" 
                              strokeWidth="3.2" 
                              strokeDasharray={`${usdcPercent} ${100 - usdcPercent}`} 
                              strokeDashoffset={`${100 - rtlPercent}`} 
                            />
                          )}
                        </>
                      ) : (
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#00FFA3" strokeWidth="3.2" strokeDasharray="100 0" strokeDashoffset="100" />
                      )}
                    </svg>
                 </div>
                 <div className="flex-1 space-y-2">
                     <div 
                       onClick={() => { setSendToken('RITUAL'); setCurrentView('send'); }}
                       className="flex items-center justify-between text-sm cursor-pointer hover:bg-white/[0.04] p-2 rounded-xl transition active:scale-[0.99]"
                     >
                        <div className="flex items-center gap-2">
                           <span className="w-2.5 h-2.5 rounded-full bg-[#00FFA3] shadow-[0_0_5px_#00FFA3]" />
                           <span className="font-semibold text-gray-300">RTL</span>
                        </div>
                        <span className="text-gray-400 font-medium">{rtlPercent.toFixed(0)}%</span>
                        <span className="font-mono text-gray-300 text-xs text-right w-24">{Number(balance).toFixed(2)} RTL</span>
                     </div>
                     <div 
                       onClick={() => { setSendToken('USDC'); setCurrentView('send'); }}
                       className="flex items-center justify-between text-sm cursor-pointer hover:bg-white/[0.04] p-2 rounded-xl transition active:scale-[0.99]"
                     >
                        <div className="flex items-center gap-2">
                           <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" />
                           <span className="font-semibold text-gray-300">USDC</span>
                        </div>
                        <span className="text-gray-400 font-medium">{usdcPercent.toFixed(0)}%</span>
                        <span className="font-mono text-gray-300 text-xs text-right w-24">{Number(usdcBalance).toFixed(2)} USDC</span>
                     </div>
                  </div>
              </div>
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="rounded-[24px] bg-white/[0.02] border border-white/[0.06] p-6 shadow-xl mb-8">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-bold tracking-wider uppercase text-gray-400">RECENT ACTIVITY</h3>
              <div className="flex items-center gap-1 text-xs text-gray-500 hover:text-white cursor-pointer transition">
                 View All <ChevronRight size={12} />
              </div>
           </div>
           
           <div className="space-y-2">
              {recentTxs.map((tx, idx) => (
                 <div key={idx} className="flex items-center justify-between py-3 px-4 rounded-xl bg-[#0e0f12]/30 hover:bg-white/[0.03] border border-transparent hover:border-white/[0.05] transition-all duration-200 cursor-pointer active:scale-[0.99] group">
                    <div className="flex items-center gap-4">
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${
                          tx.type === 'receive' 
                            ? 'bg-[#00FFA3]/10 text-[#00FFA3] border-[#00FFA3]/20' 
                            : 'bg-white/5 text-gray-400 border-white/[0.06]'
                       }`}>
                          {tx.type === 'receive' ? <ArrowDownToLine size={18} /> : <ArrowUpRight size={18} />}
                       </div>
                       <div>
                          <div className="text-sm font-bold text-gray-200 mb-0.5 capitalize">{tx.type === 'receive' ? 'Received' : 'Sent'}</div>
                          <div className="text-xs text-gray-500 font-mono">{tx.type === 'receive' ? `From ${tx.to.slice(0, 6)}...` : `To ${tx.to.slice(0, 6)}...`}</div>
                       </div>
                    </div>
                    <div className="text-right">
                       <div className={`text-sm font-bold mb-1 ${tx.type === 'receive' ? 'text-[#00FFA3]' : 'text-gray-300'}`}>
                          {tx.type === 'receive' ? '+' : '-'}{tx.amount} RTL
                       </div>
                       <div className="text-xs text-gray-500 font-medium">{new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                    <div className="w-20 flex justify-end">
                       <span className="px-2.5 py-1 rounded-full border border-green-500/20 bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-wider">Success</span>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // EXTENSION POPUP LAYOUT (MODE 1)
  // -------------------------------------------------------------
  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide p-4 pb-28 flex flex-col gap-4 bg-[#09090b] text-white">
      
      {/* TOTAL BALANCE CARD */}
      <motion.div 
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="rounded-[20px] bg-gradient-to-b from-[#0e1217] to-[#0a0d11] border border-white/[0.06] p-5 relative overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.4)] min-h-[180px] flex flex-col justify-between hover:border-white/[0.09] transition-colors"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#00FFA3] opacity-[0.04] blur-2xl rounded-full pointer-events-none" />
        
        <div className="relative z-10 flex justify-between items-center">
          <div className="flex items-center gap-1.5 text-gray-400 text-[10px] font-bold tracking-wider uppercase">
            TOTAL BALANCE
            <Eye size={12} className="cursor-pointer hover:text-white transition-colors" onClick={() => setShowBalance(!showBalance)} />
          </div>
          
          <div className="flex items-center gap-1.5">
             <button className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 rounded-full text-[9px] font-bold text-gray-300 hover:bg-white/5 transition">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FFA3] shadow-[0_0_5px_#00FFA3]" />
                Ritual Testnet
             </button>
             <button 
               onClick={expandToDashboard}
               className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 active:scale-90 transition cursor-pointer"
             >
               <Maximize2 size={10} className="text-gray-400" />
             </button>
          </div>
        </div>

        <div className="relative z-10 mt-3 mb-2">
          <div className="text-3xl font-extrabold tracking-tight text-white mb-0.5">
            {showBalance ? `${nativeNum.toFixed(4)} RTL` : '••••••••'}
          </div>
          <div className="text-gray-400 text-xs font-mono">
            {showBalance ? `${usdcNum.toFixed(2)} USDC` : '••••••••'}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] font-bold text-gray-500 bg-white/5 px-2 py-0.5 rounded-md">No live market data available</span>
          </div>
        </div>

        {/* Glowing Line Chart */}
        <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none z-0 opacity-80">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 300 60">
            <path 
              d="M0,45 Q40,50 80,35 T160,30 T240,25 T300,10 L300,60 L0,60 Z" 
              fill="url(#glowLinePopup)" 
            />
            <path 
              d="M0,45 Q40,50 80,35 T160,30 T240,25 T300,10" 
              fill="none" 
              stroke="#00FFA3" 
              strokeWidth="2"
            />
            <circle cx="300" cy="10" r="3" fill="#00FFA3" />
            <defs>
              <linearGradient id="glowLinePopup" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00FFA3" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#00FFA3" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </motion.div>

      {/* QUICK ACTIONS ROW OF 5 */}
      <div className="grid grid-cols-5 gap-2 pt-1 px-1">
        {quickActionsPopup.map((action, i) => (
          <button
            key={i}
            onClick={action.onClick}
            className="flex flex-col items-center gap-1.5 group cursor-pointer active:scale-95 transition-transform"
          >
            <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center border transition-all duration-200 ${
              action.active 
                ? 'border-[#00FFA3] bg-[#00FFA3]/[0.05] text-[#00FFA3] shadow-[0_0_12px_rgba(0,255,163,0.2)]' 
                : 'bg-white/[0.03] border-white/[0.06] text-gray-400 group-hover:text-white group-hover:bg-white/[0.06] group-hover:border-white/[0.1]'
            }`}>
              <action.icon size={19} strokeWidth={2.2} />
            </div>
            <span className="text-[10px] font-medium text-gray-400 group-hover:text-white transition-colors">{action.label}</span>
          </button>
        ))}
      </div>

      {/* RITUAL AI PROMO BANNER */}
      <AnimatePresence>
        {showAiPromo && (
          <motion.div 
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative rounded-2xl bg-gradient-to-r from-white/[0.03] to-transparent border border-white/[0.06] p-4 flex items-center gap-4 shadow-[0_8px_24px_rgba(0,0,0,0.3)] overflow-hidden shrink-0 hover:border-white/[0.09] transition-colors"
          >
            <button 
              onClick={() => setShowAiPromo(false)} 
              className="absolute top-3 right-3 text-gray-500 hover:text-white active:scale-90 transition p-0.5 rounded-full hover:bg-white/5"
            >
              <X size={12} />
            </button>
            
            <div className="w-11 h-11 rounded-full bg-gradient-to-b from-[#00FFA3]/30 to-transparent p-[1.5px] shadow-[0_0_15px_rgba(0,255,163,0.15)] shrink-0">
               <div className="w-full h-full rounded-full bg-[#0d0e12] overflow-hidden">
                  <img src="/ai_cat_avatar_1783277858093.png" alt="AI" className="w-full h-full object-cover" />
               </div>
            </div>
            
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-xs font-bold text-white tracking-tight">Ritual AI</span>
                <span className="px-1.5 py-0.5 rounded bg-[#00FFA3]/10 text-[#00FFA3] text-[8px] font-bold tracking-wider">BETA</span>
              </div>
              <div className="text-[10px] text-gray-300 font-semibold mb-0.5">Your on-chain co-pilot ✨</div>
              <div className="text-[9px] text-gray-500 leading-normal truncate">Ask anything. Track anything. Ritual AI is here.</div>
            </div>

            <button 
              onClick={() => setActiveTab('ai')}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 text-white font-bold text-[10px] transition shrink-0 flex items-center gap-1 cursor-pointer"
            >
              Chat Now <ChevronRight size={10} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* POPUP SUB-TABS (Assets, NFTs, Activity) */}
      <div className="flex flex-col flex-1 min-h-0 mt-2 px-1">
        
        {/* Tab Headers */}
        <div className="flex items-center justify-between border-b border-white/[0.06] mb-3">
          <div className="flex gap-5">
            {(['assets', 'nfts', 'activity'] as const).map((tab) => {
              const active = activeSubTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveSubTab(tab)}
                  className={`py-2.5 text-xs font-bold capitalize transition-all relative cursor-pointer ${
                    active ? 'text-[#00FFA3]' : 'text-gray-500 hover:text-gray-400'
                  }`}
                >
                  {tab}
                  {active && (
                    <motion.div 
                      layoutId="subTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00FFA3] rounded-full shadow-[0_0_8px_rgba(0,255,163,0.5)]"
                    />
                  )}
                </button>
              );
            })}
          </div>
          <button 
            onClick={() => triggerToast('Asset filters are locked to defaults.')}
            className="p-1 text-gray-500 hover:text-white active:scale-95 transition cursor-pointer"
          >
            <SlidersHorizontal size={13} />
          </button>
        </div>

        {/* Tab Body */}
        <div className="space-y-2">
          
          {/* ASSETS TAB */}
          {activeSubTab === 'assets' && (
            <div className="space-y-2 pb-6">
              {/* RTL Token */}
              <div 
                onClick={() => { setSendToken('RITUAL'); setCurrentView('send'); }}
                className="flex items-center justify-between p-3.5 rounded-[16px] bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.08] hover:bg-white/[0.04] transition-all cursor-pointer group active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#00FFA3]/10 text-[#00FFA3] flex items-center justify-center border border-[#00FFA3]/20 shadow-[0_0_10px_rgba(0,255,163,0.05)]">
                    <Hexagon size={16} strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white tracking-tight">Ritual</div>
                    <div className="text-[10px] text-gray-500 font-mono mt-0.5">{nativeNum.toFixed(4)} RTL</div>
                  </div>
                </div>
                <div className="text-right flex items-center gap-2">
                  <div>
                    <div className="text-xs font-bold text-gray-500">No live pricing</div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); triggerToast('Token actions are locked to default transfers.'); }}
                    className="p-1 text-gray-500 hover:text-white rounded transition active:scale-90 cursor-pointer"
                  >
                    <MoreVertical size={13} />
                  </button>
                </div>
              </div>

              {/* USDC Token */}
              <div 
                onClick={() => { setSendToken('USDC'); setCurrentView('send'); }}
                className="flex items-center justify-between p-3.5 rounded-[16px] bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.08] hover:bg-white/[0.04] transition-all cursor-pointer group active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.05)]">
                    USDC
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white tracking-tight">USD Coin</div>
                    <div className="text-[10px] text-gray-500 font-mono mt-0.5">{usdcNum.toFixed(2)} USDC</div>
                  </div>
                </div>
                <div className="text-right flex items-center gap-2">
                  <div>
                    <div className="text-xs font-bold text-gray-500">No live pricing</div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); triggerToast('Token actions are locked to default transfers.'); }}
                    className="p-1 text-gray-500 hover:text-white rounded transition active:scale-90 cursor-pointer"
                  >
                    <MoreVertical size={13} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* NFTS TAB */}
          {activeSubTab === 'nfts' && (
            <div className="py-8 text-center text-gray-500 text-xs flex flex-col items-center justify-center gap-2">
              <PieChart size={24} className="text-gray-600 animate-pulse" />
              <div className="font-semibold text-gray-400">No NFTs Found</div>
              <p className="text-[10px] text-gray-600 max-w-[200px]">Collectibles and ecosystem badge NFTs will show up here.</p>
            </div>
          )}

          {/* ACTIVITY TAB */}
          {activeSubTab === 'activity' && (
            <div className="space-y-2 pb-6">
              {recentTxs.length === 0 ? (
                <div className="py-8 text-center text-gray-500 text-xs">No recent transactions.</div>
              ) : (
                recentTxs.map((tx, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 rounded-[16px] bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.08] hover:bg-white/[0.04] transition-all cursor-pointer active:scale-[0.99]">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                        tx.type === 'receive' 
                          ? 'bg-[#00FFA3]/10 text-[#00FFA3] border-[#00FFA3]/20 shadow-[0_0_8px_rgba(0,255,163,0.05)]' 
                          : 'bg-white/5 text-gray-400 border-white/[0.06]'
                      }`}>
                        {tx.type === 'receive' ? <ArrowDownToLine size={14} /> : <ArrowUpRight size={14} />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white capitalize">{tx.type}</div>
                        <div className="text-[9px] text-gray-500 font-mono mt-0.5">{tx.to.slice(0, 8)}...</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs font-bold ${tx.type === 'receive' ? 'text-[#00FFA3]' : 'text-white'}`}>
                        {tx.type === 'receive' ? '+' : '-'}{tx.amount} RTL
                      </div>
                      <div className="text-[9px] text-gray-500 mt-0.5">{new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
