import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search,
  Sparkles,
  Settings as SettingsIcon,
  Info
} from 'lucide-react';
import { useWalletStore } from '../../stores/useWalletStore';
import { useUIStore } from '../../stores/useUIStore';

export function PortfolioScreen() {
  const { balance, usdcBalance } = useWalletStore();
  const { setCurrentView } = useUIStore();
  
  const [activeSubTab, setActiveSubTab] = useState<'tokens'|'nfts'|'defi'>('tokens');
  const [searchQuery, setSearchQuery] = useState('');

  const nativeNum = parseFloat(balance || "0");
  const usdcNum = parseFloat(usdcBalance || "0");
  const totalTokens = nativeNum + usdcNum;
  
  const rtlPercent = totalTokens > 0 ? (nativeNum / totalTokens) * 100 : 100;
  const usdcPercent = totalTokens > 0 ? (usdcNum / totalTokens) * 100 : 0;

  const assets = [
    { id: 'ritual', name: 'Ritual', symbol: 'RITUAL', balance: balance || "0", icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=029' },
    { id: 'usdc', name: 'USD Coin', symbol: 'USDC', balance: usdcBalance || "0", icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=029' }
  ];

  const filteredAssets = assets.filter(a => {
    if (searchQuery && !a.name.toLowerCase().includes(searchQuery.toLowerCase()) && !a.symbol.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const subTabs = [
    { id: 'tokens', label: 'Assets' },
    { id: 'nfts', label: 'NFTs' },
    { id: 'defi', label: 'DeFi' }
  ] as const;

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[#000000] text-white">
      {/* Header Area */}
      <div className="px-4 pt-6 pb-2 sticky top-0 bg-[#000000]/80 backdrop-blur-xl z-10 border-b border-white/5 shrink-0 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-tight">Portfolio</h1>
        <button onClick={() => setCurrentView('settings')} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 active:scale-95 transition border border-white/5 cursor-pointer">
          <SettingsIcon size={14} className="text-gray-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24 scrollbar-hide space-y-5">
        
        {/* Total Value Hero section */}
        <div>
          <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Portfolio Assets</span>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-extrabold tracking-tight text-white font-sans">
              {nativeNum.toFixed(4)} RTL
            </div>
            {usdcNum > 0 && (
              <div className="text-sm text-gray-400 font-semibold tracking-tight">
                + {usdcNum.toFixed(2)} USDC
              </div>
            )}
          </div>
          <div className="text-gray-500 text-xs mt-1 font-semibold">
            No live market data available.
          </div>
        </div>

        {/* Circular SVG Donut Allocation Card */}
        <div className="p-4 rounded-[20px] bg-white/5 border border-white/10 flex items-center gap-5 justify-between">
          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90 pointer-events-none" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
              {totalTokens > 0 ? (
                <>
                  {/* RITUAL stroke */}
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
                  {/* USDC stroke */}
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
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[8px] text-gray-500 font-bold uppercase tracking-wider">Asset</span>
              <span className="text-[11px] font-bold text-white">Share</span>
            </div>
          </div>

          <div className="flex-1 space-y-2 text-[10px]">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00FFA3]" /> RITUAL
              </span>
              <span className="font-bold text-white">{rtlPercent.toFixed(0)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#3b82f6]" /> USDC
              </span>
              <span className="font-bold text-white">{usdcPercent.toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* Floating iOS style Segmented Tab Selectors */}
        <div className="p-1 rounded-full bg-white/5 border border-white/5 flex">
          {subTabs.map(tab => {
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex-1 py-1.5 rounded-full text-xs font-semibold tracking-wide transition cursor-pointer ${
                  isActive ? 'bg-white/10 text-[#00FFA3] shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* View switching based on tabs */}
        <AnimatePresence mode="wait">
          
          {/* TOKENS/ASSETS PANEL */}
          {activeSubTab === 'tokens' && (
            <motion.div 
              key="tokens"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4"
            >
              {/* Premium Search bar */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Search assets..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#00FFA3]/50 transition-colors"
                />
              </div>

              {/* Assets list */}
              <div className="flex flex-col gap-2.5">
                {filteredAssets.map(asset => (
                  <div 
                    key={asset.id} 
                    className="p-4 rounded-[20px] bg-white/5 border border-white/5 flex items-center justify-between hover:border-white/10 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center p-1.5 shrink-0">
                        <img src={asset.icon} className="w-full h-full object-contain" alt={asset.symbol} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{asset.name}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">{asset.symbol}</div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xs font-bold text-white">
                        {asset.symbol === 'RITUAL' ? `${nativeNum.toFixed(4)} RTL` : `${usdcNum.toFixed(2)} USDC`}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        No live pricing
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* NFTS TAB */}
          {activeSubTab === 'nfts' && (
            <motion.div 
              key="nfts"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-col items-center justify-center py-12 text-center bg-white/5 border border-white/5 rounded-[20px] p-6"
            >
              <span className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                <Sparkles size={16} className="text-gray-400" />
              </span>
              <h3 className="text-xs font-bold text-white mb-0.5">No NFTs Found</h3>
              <p className="text-[10px] text-gray-500 max-w-[200px]">Collectibles and ecosystem badge NFTs will show up here.</p>
            </motion.div>
          )}

          {/* DEFI / STAKING TAB */}
          {activeSubTab === 'defi' && (
            <motion.div 
              key="defi"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4"
            >
              {/* Coming Soon notice to prevent faking data */}
              <div className="flex flex-col items-center justify-center py-12 text-center bg-white/5 border border-white/5 rounded-[20px] p-6 gap-3">
                <span className="w-10 h-10 rounded-full bg-white/5 border border-[#00FFA3]/20 flex items-center justify-center mb-1 text-[#00FFA3]">
                  <Sparkles size={16} />
                </span>
                <h3 className="text-xs font-bold text-white mb-0.5">Requires Official Ritual Support</h3>
                <p className="text-[10px] text-gray-500 max-w-[200px] leading-relaxed">
                  USDC Yield Staking is currently unavailable on Ritual Testnet. TEE Vault staking features will be enabled once officially supported.
                </p>
                <div className="mt-2 p-2 rounded bg-white/5 text-[9px] uppercase tracking-wider text-gray-400 font-bold border border-white/5">
                  Coming Soon
                </div>
              </div>

              {/* TEE Secure Proof Warning */}
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex gap-2">
                <Info size={14} className="text-blue-400 shrink-0 mt-0.5" />
                <div className="text-[10px] text-blue-300 leading-relaxed">
                  <strong>Staking Assurance:</strong> Staking execution will take place within attested TEE nodes on Ritual Network, producing ZK-attestation logs.
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </div>
  );
}
