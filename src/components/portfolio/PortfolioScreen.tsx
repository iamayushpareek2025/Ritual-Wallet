import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Eye, 
  EyeOff,
  Search,
  Star,
  Sparkles,
  Send as SendIcon
} from 'lucide-react';
import { useWalletStore } from '../../stores/useWalletStore';
import { useUIStore } from '../../stores/useUIStore';

const MOCK_ASSETS = [
  { id: 'ritual', name: 'Ritual', symbol: 'RITUAL', balance: '0.00', price: 150.00, change24h: 5.2, isNative: true, icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=029' },
  { id: 'usdc', name: 'USD Coin', symbol: 'USDC', balance: '0.00', price: 1.00, change24h: 0.01, isNative: false, icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=029' },
];

export function PortfolioScreen() {
  const { balance, usdcBalance } = useWalletStore();
  const [activeSubTab, setActiveSubTab] = useState<'tokens'|'nfts'|'staking'|'defi'>('tokens');
  const [hideZero, setHideZero] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const totalValue = (parseFloat(balance || "0") * 150) + parseFloat(usdcBalance || "0");
  
  MOCK_ASSETS[0].balance = balance || "0";
  MOCK_ASSETS[1].balance = usdcBalance || "0";

  const filteredAssets = MOCK_ASSETS.filter(a => {
    if (hideZero && parseFloat(a.balance) === 0) return false;
    if (searchQuery && !a.name.toLowerCase().includes(searchQuery.toLowerCase()) && !a.symbol.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const subTabs = [
    { id: 'tokens', label: 'Tokens' },
    { id: 'nfts', label: 'NFTs' },
    { id: 'staking', label: 'Staking' },
    { id: 'defi', label: 'DeFi' }
  ];

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[#09090b]">
      {/* Header Area */}
      <div className="px-4 pt-6 pb-2 sticky top-0 bg-[#09090b]/80 backdrop-blur-xl z-10 border-b border-white/5">
        <h1 className="text-2xl font-semibold text-white tracking-tight mb-4">Portfolio</h1>
        
        {/* Total Value */}
        <div className="mb-6">
          <div className="text-gray-400 text-sm font-medium mb-1">Total Portfolio Value</div>
          <div className="flex items-end gap-3">
            <div className="text-4xl font-bold text-white tracking-tighter">
              ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1 text-[#00FFA3] text-sm font-semibold mb-1 bg-[#00FFA3]/10 px-2 py-0.5 rounded border border-[#00FFA3]/20">
              <TrendingUp size={14} />
              Simulated Data
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search assets..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00FFA3]/50 transition-colors"
            />
          </div>
          <button 
            onClick={() => setHideZero(!hideZero)}
            className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors ${hideZero ? 'bg-[#00FFA3]/10 border-[#00FFA3]/30 text-[#00FFA3]' : 'bg-white/5 border-white/10 text-gray-400'}`}
          >
            {hideZero ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* Sub Navigation */}
        <div className="flex gap-6 border-b border-white/10">
          {subTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`pb-3 text-sm font-medium transition-colors relative ${activeSubTab === tab.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {tab.label}
              {activeSubTab === tab.id && (
                <motion.div 
                  layoutId="portfolioSubTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00FFA3] shadow-[0_0_8px_#00FFA3]"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Asset List */}
      <div className="flex-1 overflow-y-auto p-4 pb-4 scrollbar-hide">
        <AnimatePresence mode="popLayout">
          {activeSubTab === 'tokens' && (
            <div className="flex flex-col gap-3">
              {filteredAssets.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-10 text-center text-gray-500">
                  No tokens found
                </motion.div>
              ) : (
                filteredAssets.map((asset, i) => (
                  <motion.div
                    key={asset.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => {
                      const { setCurrentView, setSendToken } = useUIStore.getState();
                      if (asset.symbol === 'RITUAL' || asset.symbol === 'USDC') {
                        setSendToken(asset.symbol);
                      }
                      setCurrentView('send');
                    }}
                    className="p-4 rounded-[20px] bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 p-2 relative">
                        <img src={asset.icon} alt={asset.symbol} className="w-full h-full object-contain" />
                        {asset.isNative && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#0A84FF] rounded-full border-2 border-[#09090b]" />}
                      </div>
                      <div>
                        <div className="text-white font-semibold flex items-center gap-2">
                          {asset.name}
                          <Star size={12} className="text-gray-600 hover:text-yellow-500 transition-colors" />
                        </div>
                        <div className="text-gray-400 text-xs">${asset.price.toFixed(2)}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <div className="text-white font-semibold">{parseFloat(asset.balance).toLocaleString()} {asset.symbol}</div>
                        <div className="text-gray-400 text-xs">${(parseFloat(asset.balance) * asset.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <SendIcon size={14} className="text-[#00FFA3] -ml-0.5" />
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {activeSubTab !== 'tokens' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Sparkles size={24} className="text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Coming Soon</h3>
              <p className="text-sm text-gray-400 max-w-[200px]">This section is currently being upgraded.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
