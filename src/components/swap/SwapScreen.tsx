import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowDownUp, 
  Settings, 
  Info, 
  Activity,
  History,
  TrendingUp,
  AlertTriangle,
  ArrowLeft,
  ChevronDown
} from 'lucide-react';
import { useWalletStore } from '../../stores/useWalletStore';
import { useUIStore } from '../../stores/useUIStore';

export function SwapScreen() {
  const { balance, usdcBalance, stakedUsdc, setBalances, addTransaction } = useWalletStore();
  const { triggerToast, setCurrentView, setActiveTab } = useUIStore();
  
  const [fromAsset, setFromAsset] = useState('RITUAL');
  const [toAsset, setToAsset] = useState('USDC');
  const [amount, setAmount] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [slippage, setSlippage] = useState('0.5');

  useEffect(() => {
    const prefilledFrom = localStorage.getItem('ritual_prefilled_swap_from_asset');
    const prefilledTo = localStorage.getItem('ritual_prefilled_swap_to_asset');
    const prefilledAmt = localStorage.getItem('ritual_prefilled_swap_amount');
    
    if (prefilledFrom) {
      setFromAsset(prefilledFrom);
      localStorage.removeItem('ritual_prefilled_swap_from_asset');
    }
    if (prefilledTo) {
      setToAsset(prefilledTo);
      localStorage.removeItem('ritual_prefilled_swap_to_asset');
    }
    if (prefilledAmt) {
      setAmount(prefilledAmt);
      localStorage.removeItem('ritual_prefilled_swap_amount');
    }
  }, []);

  const exchangeRate = 150.0; // Mock rate 1 RITUAL = 150 USDC
  const estimatedOutput = amount ? (parseFloat(amount) * (fromAsset === 'RITUAL' ? exchangeRate : (1 / exchangeRate))).toFixed(fromAsset === 'RITUAL' ? 2 : 6) : '0.00';
  const priceImpact = amount && parseFloat(amount) > 1000 ? '-2.4%' : '< 0.1%';

  const handleSwapClick = () => {
    const amtNum = parseFloat(amount);
    if (!amtNum || amtNum <= 0 || isNaN(amtNum)) {
      triggerToast('Enter a valid amount');
      return;
    }

    const available = fromAsset === 'RITUAL' ? parseFloat(balance) : parseFloat(usdcBalance);
    if (amtNum > available) {
      triggerToast(`Insufficient ${fromAsset} balance`);
      return;
    }

    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      
      let newNative = balance;
      let newUsdc = usdcBalance;
      
      if (fromAsset === 'RITUAL') {
        newNative = (parseFloat(balance) - amtNum).toFixed(6);
        newUsdc = (parseFloat(usdcBalance) + parseFloat(estimatedOutput)).toFixed(2);
      } else {
        newNative = (parseFloat(balance) + parseFloat(estimatedOutput)).toFixed(6);
        newUsdc = (parseFloat(usdcBalance) - amtNum).toFixed(2);
      }
      
      setBalances(newNative, newUsdc, stakedUsdc);
      localStorage.setItem('ritual_usdc', newUsdc);
      
      triggerToast('Swap successful!');
      addTransaction({
        hash: '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join(''),
        to: 'RitualDex Router',
        amount: `${amount} ${fromAsset} -> ${estimatedOutput} ${toAsset}`,
        type: 'swap',
        date: new Date().toISOString()
      });
      setAmount('');
    }, 1800);
  };

  const switchAssets = () => {
    setFromAsset(toAsset);
    setToAsset(fromAsset);
    setAmount('');
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[#090909] relative overflow-hidden text-white">
      {/* Top Header */}
      <div className="px-4 pt-6 pb-2 sticky top-0 bg-[#090909]/80 backdrop-blur-xl z-50 border-b border-white/5 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { setActiveTab('home'); setCurrentView('main'); }} 
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white transition"
          >
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-xl font-bold tracking-tight">Swap</h1>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`w-8 h-8 rounded-full flex items-center justify-center border transition ${showSettings ? 'bg-[#00FFA3]/10 border-[#00FFA3]/30 text-[#00FFA3]' : 'bg-white/5 border-white/5 hover:bg-white/10 text-gray-400'}`}
          >
            <Settings size={14} />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-3 bg-white/5 border-b border-white/5 flex flex-col gap-3 shrink-0 overflow-hidden"
          >
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Slippage Tolerance</div>
            <div className="flex gap-2">
              {['0.1', '0.5', '1.0'].map(val => (
                <button 
                  key={val}
                  onClick={() => setSlippage(val)}
                  className={`flex-1 py-1.5 rounded-full text-xs font-semibold border transition-all ${slippage === val ? 'bg-[#00FFA3]/10 border-[#00FFA3]/30 text-[#00FFA3]' : 'bg-black/20 border-white/10 text-gray-400 hover:text-white'}`}
                >
                  {val}%
                </button>
              ))}
              <div className="flex-1 relative">
                <input 
                  type="number"
                  placeholder="Custom"
                  className="w-full h-full rounded-full bg-black/20 border border-white/10 text-xs text-white px-2 text-center outline-none focus:border-[#00FFA3]/50"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Swap UI Disabled / Coming Soon */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-5 scrollbar-hide bg-[#09090b]">
        <div className="w-16 h-16 rounded-full bg-[#00FFA3]/10 border border-[#00FFA3]/20 flex items-center justify-center text-[#00FFA3] shadow-[0_0_20px_rgba(0,255,163,0.15)] animate-pulse">
          <ArrowDownUp size={28} />
        </div>
        <div className="max-w-[280px]">
          <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Requires Official Ritual Support</h2>
          <p className="text-xs text-gray-500 leading-relaxed mb-4">
            Swapping is currently unavailable on Ritual Testnet. Native AMM liquidity pools are not officially active.
          </p>
          <div className="p-3.5 rounded-[18px] bg-white/[0.02] border border-white/[0.06] text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
            Coming Soon
          </div>
        </div>
      </div>
    </div>
  );
}
