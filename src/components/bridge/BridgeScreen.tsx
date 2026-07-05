import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft,
  ArrowRight, 
  Clock, 
  Zap, 
  CheckCircle2, 
  ArrowDown, 
  ShieldCheck,
  History,
  Settings,
  Info
} from 'lucide-react';
import { useWalletStore } from '../../stores/useWalletStore';
import { useUIStore } from '../../stores/useUIStore';

export function BridgeScreen() {
  const { balance, usdcBalance, stakedUsdc, setBalances, addTransaction } = useWalletStore();
  const { triggerToast, setCurrentView } = useUIStore();
  
  const [fromChain, setFromChain] = useState('Ethereum');
  const [toChain, _setToChain] = useState('Ritual');
  const [asset, setAsset] = useState<'RITUAL'|'USDC'>('RITUAL');
  const [amount, setAmount] = useState('');
  const [bridgeStatus, setBridgeStatus] = useState<'idle' | 'bridging' | 'completed'>('idle');

  useEffect(() => {
    const prefilledAsset = localStorage.getItem('ritual_prefilled_bridge_asset');
    const prefilledAmt = localStorage.getItem('ritual_prefilled_bridge_amount');
    
    if (prefilledAsset) {
      setAsset(prefilledAsset === 'USDC' ? 'USDC' : 'RITUAL');
      localStorage.removeItem('ritual_prefilled_bridge_asset');
    }
    if (prefilledAmt) {
      setAmount(prefilledAmt);
      localStorage.removeItem('ritual_prefilled_bridge_amount');
    }
  }, []);

  const handleBridge = () => {
    const amtNum = parseFloat(amount);
    if (!amtNum || amtNum <= 0 || isNaN(amtNum)) {
      triggerToast('Enter a valid amount');
      return;
    }

    setBridgeStatus('bridging');
    setTimeout(() => {
      setBridgeStatus('completed');
      
      const { setBalances } = useWalletStore.getState();
      const currentBal = useWalletStore.getState().balance;
      const currentUsdc = useWalletStore.getState().usdcBalance;
      const currentStaked = useWalletStore.getState().stakedUsdc;
      
      let newNative = currentBal;
      let newUsdc = currentUsdc;
      
      if (asset === 'RITUAL') {
        newNative = (parseFloat(currentBal) + amtNum).toFixed(6);
      } else {
        newUsdc = (parseFloat(currentUsdc) + amtNum).toFixed(2);
      }
      
      setBalances(newNative, newUsdc, currentStaked);
      localStorage.setItem('ritual_usdc', newUsdc);
      
      triggerToast('Bridge successful!');
      addTransaction({
        hash: '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join(''),
        to: `${fromChain} -> ${toChain}`,
        amount: `${amount} ${asset}`,
        type: 'bridge',
        date: new Date().toISOString()
      });
    }, 3500);
  };

  const resetBridge = () => {
    setBridgeStatus('idle');
    setAmount('');
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[#090909] text-white">
      {/* Header Area */}
      <div className="px-4 pt-6 pb-2 sticky top-0 bg-[#090909]/80 backdrop-blur-xl z-50 border-b border-white/5 flex items-center gap-3 shrink-0">
        <button 
          onClick={() => setCurrentView('main')}
          className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition border border-white/5 shrink-0"
        >
          <ArrowLeft size={16} className="text-white" />
        </button>
        <h1 className="text-xl font-bold tracking-tight flex-1">Bridge</h1>
      </div>

      {/* Bridge UI Disabled / Coming Soon */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-5 scrollbar-hide bg-[#09090b]">
        <div className="w-16 h-16 rounded-full bg-[#00FFA3]/10 border border-[#00FFA3]/20 flex items-center justify-center text-[#00FFA3] shadow-[0_0_20px_rgba(0,255,163,0.15)] animate-pulse">
          <Zap size={28} />
        </div>
        <div className="max-w-[280px]">
          <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Requires Official Ritual Support</h2>
          <p className="text-xs text-gray-500 leading-relaxed mb-4">
            Bridging is currently unavailable on Ritual Testnet. Native cross-chain bridge mechanisms are not officially active.
          </p>
          <div className="p-3.5 rounded-[18px] bg-white/[0.02] border border-white/[0.06] text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
            Coming Soon
          </div>
        </div>
      </div>
    </div>
  );
}
