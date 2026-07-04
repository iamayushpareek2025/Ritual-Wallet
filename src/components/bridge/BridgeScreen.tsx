import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Info,
  ArrowRight,
  ArrowDown,
  Clock,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Settings,
  History
} from 'lucide-react';
import { useWalletStore } from '../../stores/useWalletStore';
import { useUIStore } from '../../stores/useUIStore';

export function BridgeScreen() {
  const { balance, addTransaction } = useWalletStore();
  const { triggerToast } = useUIStore();
  
  const [fromChain, setFromChain] = useState('Ethereum');
  const [toChain, _setToChain] = useState('Ritual');
  const [asset, _setAsset] = useState('RITUAL');
  const [amount, setAmount] = useState('');
  const [bridgeStatus, setBridgeStatus] = useState<'idle' | 'bridging' | 'completed'>('idle');

  const handleBridge = () => {
    setBridgeStatus('bridging');
    setTimeout(() => {
      setBridgeStatus('completed');
      triggerToast('Bridge transfer completed successfully!');
      addTransaction({
        hash: '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join(''),
        to: `${fromChain} -> ${toChain}`,
        amount: `${amount} ${asset}`,
        type: 'bridge',
        date: new Date().toISOString()
      });
    }, 4000);
  };

  const resetBridge = () => {
    setBridgeStatus('idle');
    setAmount('');
  };

  return (
    <div className="flex flex-col h-full bg-[#09090b]">
      {/* Header Area */}
      <div className="px-4 pt-6 pb-4 sticky top-0 bg-[#09090b]/80 backdrop-blur-xl z-50 border-b border-white/5 flex items-center gap-3">
        <button 
          onClick={() => useUIStore.getState().setCurrentView('main')}
          className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors shrink-0"
        >
          <ArrowRight size={20} className="text-white rotate-180" />
        </button>
        <h1 className="text-xl font-semibold text-white tracking-tight flex-1">Bridge</h1>
        <div className="flex gap-2">
          <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <History size={18} className="text-gray-400" />
          </button>
          <button 
            onClick={() => useUIStore.getState().setCurrentView('settings')}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <Settings size={18} className="text-gray-400" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-4 scrollbar-hide">
        <AnimatePresence mode="wait">
          
          {bridgeStatus === 'idle' && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col gap-4"
            >
              {/* Testnet Simulator Banner */}
              <div className="p-3 rounded-xl bg-[#0A84FF]/10 border border-[#0A84FF]/20 flex items-start gap-3">
                <Info size={16} className="text-[#0A84FF] mt-0.5 shrink-0" />
                <div className="text-xs text-[#0A84FF] leading-relaxed">
                  <span className="font-semibold block mb-0.5">Testnet Simulator Mode</span>
                  Bridge transactions are simulated locally. Mainnet will use LayerZero routing.
                </div>
              </div>
              
              {/* Network Selection */}
              <div className="flex items-center justify-between p-4 rounded-[20px] bg-white/5 border border-white/5 relative">
                <div className="flex flex-col items-center flex-1">
                  <span className="text-xs text-gray-500 mb-1">From</span>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#627EEA] flex items-center justify-center p-1">
                      <img src="https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=029" alt="ETH" />
                    </div>
                    <select 
                      value={fromChain}
                      onChange={(e) => setFromChain(e.target.value)}
                      className="bg-transparent text-white font-semibold outline-none cursor-pointer"
                    >
                      <option className="bg-[#09090b] text-white" value="Ethereum">Ethereum</option>
                      <option className="bg-[#09090b] text-white" value="Base">Base</option>
                      <option className="bg-[#09090b] text-white" value="Arbitrum">Arbitrum</option>
                    </select>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-black border border-white/10 flex items-center justify-center absolute left-1/2 -translate-x-1/2 z-10 shadow-xl">
                  <ArrowRight size={14} className="text-gray-400" />
                </div>

                <div className="flex flex-col items-center flex-1">
                  <span className="text-xs text-gray-500 mb-1">To</span>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-black border border-white/20 flex items-center justify-center p-1">
                      <img src="/logo.png" alt="Ritual" />
                    </div>
                    <span className="text-[#00FFA3] font-semibold">{toChain}</span>
                  </div>
                </div>
              </div>

              {/* Amount Input */}
              <div className="p-4 rounded-[20px] bg-white/5 border border-white/5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400 text-sm">Send Amount</span>
                  <span className="text-gray-500 text-xs font-medium cursor-pointer hover:text-gray-300">
                    Bal: {parseFloat(balance || "0").toLocaleString()} {asset}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <input 
                    type="number"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-transparent text-4xl font-bold text-white w-2/3 outline-none placeholder-gray-700"
                  />
                  <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                    <img 
                      src="https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=029" 
                      className="w-5 h-5 rounded-full"
                      alt={asset}
                    />
                    <span className="text-white font-semibold">{asset}</span>
                  </div>
                </div>
              </div>

              {/* Bridge Details */}
              {amount && parseFloat(amount) > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-[20px] bg-white/5 border border-white/5 flex flex-col gap-3"
                >
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 flex items-center gap-1"><Clock size={14} /> Est. Time</span>
                    <span className="text-white">~3 minutes</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 flex items-center gap-1"><Zap size={14} /> Bridge Provider</span>
                    <span className="text-[#00FFA3]">Stargate V2 (Optimal)</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 flex items-center gap-1">Network Fee</span>
                    <span className="text-white">$1.24 <span className="text-gray-600">(0.0003 ETH)</span></span>
                  </div>
                  
                  <div className="h-px bg-white/5 w-full my-1" />
                  
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span className="text-white">You will receive</span>
                    <span className="text-white">{amount} {asset}</span>
                  </div>
                </motion.div>
              )}

              {/* Action Button */}
              <button
                onClick={handleBridge}
                disabled={!amount || parseFloat(amount) <= 0}
                className="w-full mt-4 py-4 rounded-2xl bg-gradient-to-r from-[#00FFA3] to-[#0A84FF] text-black font-bold text-lg hover:brightness-110 transition shadow-[0_0_20px_rgba(0,255,163,0.3)] disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
              >
                Bridge Funds
              </button>
            </motion.div>
          )}

          {bridgeStatus === 'bridging' && (
            <motion.div 
              key="bridging"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center h-[50vh] gap-6 text-center"
            >
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-white/10 animate-spin" style={{ borderTopColor: '#00FFA3' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ArrowDown size={32} className="text-[#00FFA3] animate-bounce" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Bridging {asset}...</h3>
                <p className="text-gray-400 text-sm max-w-[250px] mx-auto">
                  Transferring your assets from {fromChain} to {toChain}. This usually takes about 3 minutes.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 flex items-start gap-3 mt-4">
                <ShieldCheck size={18} className="text-green-400 mt-0.5 shrink-0" />
                <div className="text-xs text-green-300 leading-relaxed text-left">
                  <strong>Safe Transfer:</strong> Your funds are secured by the LayerZero protocol. If the bridge fails, funds will automatically revert to your {fromChain} wallet.
                </div>
              </div>
            </motion.div>
          )}

          {bridgeStatus === 'completed' && (
            <motion.div 
              key="completed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center h-[50vh] gap-6 text-center"
            >
              <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 size={48} className="text-green-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Bridge Successful!</h3>
                <p className="text-gray-400 text-sm max-w-[250px] mx-auto">
                  Your {amount} {asset} have safely arrived on the {toChain} network.
                </p>
              </div>
              
              <button 
                onClick={resetBridge}
                className="px-8 py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors mt-4"
              >
                Bridge More
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
