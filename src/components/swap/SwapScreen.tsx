import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowDownUp, 
  Settings, 
  Info, 
  Activity,
  History,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { useWalletStore } from '../../stores/useWalletStore';
import { useUIStore } from '../../stores/useUIStore';

export function SwapScreen() {
  const { balance, addTransaction } = useWalletStore();
  const { triggerToast } = useUIStore();
  
  const [fromAsset, setFromAsset] = useState('RITUAL');
  const [toAsset, setToAsset] = useState('USDC');
  const [amount, setAmount] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [slippage, setSlippage] = useState('0.5');

  const exchangeRate = 150.0; // Mock rate 1 RITUAL = 150 USDC
  const estimatedOutput = amount ? (parseFloat(amount) * exchangeRate).toFixed(2) : '0.00';
  const priceImpact = amount && parseFloat(amount) > 1000 ? '-2.4%' : '< 0.1%';

  const handleSwapClick = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      triggerToast('Swap successful! Route: RitualDex -> Uniswap V3');
      addTransaction({
        hash: '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join(''),
        to: 'RitualDex Router',
        amount: `${amount} ${fromAsset} -> ${estimatedOutput} ${toAsset}`,
        type: 'swap',
        date: new Date().toISOString()
      });
      setAmount('');
    }, 1500);
  };

  const switchAssets = () => {
    setFromAsset(toAsset);
    setToAsset(fromAsset);
    setAmount('');
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[#09090b] relative overflow-hidden">
      {/* Background Glow */}
      <div className="px-4 pt-6 pb-4 sticky top-0 bg-[#09090b]/80 backdrop-blur-xl z-50 border-b border-white/5 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-white tracking-tight">Swap</h1>
        <div className="flex gap-2">
          <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <History size={18} className="text-gray-400" />
          </button>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${showSettings ? 'bg-[#00FFA3]/10 text-[#00FFA3]' : 'bg-white/5 hover:bg-white/10 text-gray-400'}`}
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="px-4 py-3 bg-white/5 border-b border-white/5 flex flex-col gap-3"
        >
          <div className="text-sm font-semibold text-white">Max Slippage</div>
          <div className="flex gap-2">
            {['0.1', '0.5', '1.0'].map(val => (
              <button 
                key={val}
                onClick={() => setSlippage(val)}
                className={`flex-1 py-1.5 rounded-lg text-sm font-medium border ${slippage === val ? 'bg-[#00FFA3]/10 border-[#00FFA3]/30 text-[#00FFA3]' : 'bg-black/20 border-white/10 text-gray-400'}`}
              >
                {val}%
              </button>
            ))}
            <div className="flex-1 relative">
              <input 
                type="number"
                placeholder="Custom"
                className="w-full h-full rounded-lg bg-black/20 border border-white/10 text-sm text-white px-2 text-center outline-none focus:border-[#00FFA3]/50"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Swap UI */}
      <div className="flex-1 overflow-y-auto p-4 pb-4 scrollbar-hide">
        {/* Testnet Simulator Banner */}
        <div className="mb-4 p-3 rounded-xl bg-[#0A84FF]/10 border border-[#0A84FF]/20 flex items-start gap-3">
          <Info size={16} className="text-[#0A84FF] mt-0.5 shrink-0" />
          <div className="text-xs text-[#0A84FF] leading-relaxed">
            <span className="font-semibold block mb-0.5">Testnet Simulator Mode</span>
            Swaps are simulated locally for UI testing. Real DEX routing will be available on mainnet.
          </div>
        </div>
        
        <div className="flex flex-col gap-2 relative">
          
          {/* Input Panel */}
          <div className="p-4 rounded-[24px] bg-white/5 border border-white/5 focus-within:border-white/20 transition-colors">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400 text-sm">You pay</span>
              <span className="text-gray-500 text-xs font-medium cursor-pointer hover:text-gray-300">
                Bal: {fromAsset === 'RITUAL' ? parseFloat(balance || "0").toLocaleString() : '0.00'} {fromAsset}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <input 
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-transparent text-4xl font-bold text-white w-1/2 outline-none placeholder-gray-700"
              />
              <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors">
                <img 
                  src={fromAsset === 'RITUAL' ? 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=029' : 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=029'} 
                  className="w-5 h-5 rounded-full"
                  alt={fromAsset}
                />
                <span className="text-white font-semibold">{fromAsset}</span>
              </button>
            </div>
            <div className="text-gray-500 text-sm mt-1">
              ${amount ? (parseFloat(amount) * (fromAsset === 'RITUAL' ? 150 : 1)).toFixed(2) : '0.00'}
            </div>
          </div>

          {/* Swap Button (Absolute center) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <button 
              onClick={switchAssets}
              className="w-10 h-10 rounded-full bg-[#09090b] border-4 border-[#09090b] flex items-center justify-center hover:bg-white/10 transition-colors shadow-lg"
            >
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <ArrowDownUp size={16} className="text-white" />
              </div>
            </button>
          </div>

          {/* Output Panel */}
          <div className="p-4 rounded-[24px] bg-white/5 border border-white/5 focus-within:border-white/20 transition-colors">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400 text-sm">You receive</span>
              <span className="text-gray-500 text-xs font-medium cursor-pointer hover:text-gray-300">
                Bal: {toAsset === 'RITUAL' ? parseFloat(balance || "0").toLocaleString() : '0.00'} {toAsset}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <input 
                type="number"
                placeholder="0"
                value={amount ? estimatedOutput : ''}
                readOnly
                className="bg-transparent text-4xl font-bold text-white w-1/2 outline-none placeholder-gray-700"
              />
              <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors">
                <img 
                  src={toAsset === 'USDC' ? 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=029' : 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=029'} 
                  className="w-5 h-5 rounded-full"
                  alt={toAsset}
                />
                <span className="text-white font-semibold">{toAsset}</span>
              </button>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-gray-500 text-sm">
                ${amount ? (parseFloat(estimatedOutput) * (toAsset === 'USDC' ? 1 : 150)).toFixed(2) : '0.00'}
              </span>
              {amount && parseFloat(amount) > 1000 && (
                <span className="text-red-400 text-xs flex items-center gap-1 bg-red-400/10 px-1.5 rounded">
                  <AlertTriangle size={10}/> High Price Impact
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Aggregator Route Details */}
        {amount && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 rounded-[20px] bg-white/5 border border-white/5 flex flex-col gap-3"
          >
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm flex items-center gap-1"><TrendingUp size={14}/> Best Route</span>
              <div className="flex items-center gap-1 text-[#00FFA3] text-sm font-medium">
                RitualDex <span className="text-gray-600">→</span> Uniswap V3
              </div>
            </div>
            
            <div className="h-px bg-white/5 w-full" />
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">1 {fromAsset} =</span>
              <span className="text-white font-medium">{fromAsset === 'RITUAL' ? '150 USDC' : '0.0066 RITUAL'}</span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Price Impact</span>
              <span className={`${priceImpact.includes('-') ? 'text-red-400' : 'text-[#00FFA3]'}`}>{priceImpact}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Network Fee</span>
              <span className="text-white">~$0.02 <span className="text-gray-600">(0.00015 RITUAL)</span></span>
            </div>
          </motion.div>
        )}

        {/* Swap Action Button */}
        <button
          onClick={handleSwapClick}
          disabled={!amount || isSimulating}
          className="w-full mt-6 py-4 rounded-2xl bg-gradient-to-r from-[#00FFA3] to-[#0A84FF] text-black font-bold text-lg hover:brightness-110 transition shadow-[0_0_20px_rgba(0,255,163,0.3)] disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSimulating ? (
            <><Activity className="animate-spin" size={20}/> Routing through aggregator...</>
          ) : (
            'Swap'
          )}
        </button>

        {/* AI Insight */}
        <div className="mt-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
          <Info size={18} className="text-blue-400 mt-0.5 shrink-0" />
          <div className="text-xs text-blue-300 leading-relaxed">
            <strong>AI Gas Optimization:</strong> Executing this swap via RitualDex will save you 14% on gas fees compared to standard routes.
          </div>
        </div>

      </div>
    </div>
  );
}
