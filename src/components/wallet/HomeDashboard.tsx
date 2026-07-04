
import { motion } from 'framer-motion';
import { 
  ArrowUpRight, 
  ArrowDownToLine, 
  ArrowRightLeft, 
  ShoppingCart, 
  Coins, 
  Activity, 
  ShieldCheck, 
  Sparkles,
  Copy,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useWalletStore } from '../../stores/useWalletStore';
import { useUIStore } from '../../stores/useUIStore';

export function HomeDashboard() {
  const { balance, usdcBalance, address } = useWalletStore();
  const { triggerToast, setActiveTab, setCurrentView } = useUIStore();

  const totalValue = (parseFloat(balance || "0") * 150) + parseFloat(usdcBalance || "0"); // Mock ritual price $150

  const quickActions = [
    { icon: ArrowUpRight, label: 'Send', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', onClick: () => setCurrentView('send') },
    { icon: ArrowDownToLine, label: 'Receive', color: 'bg-green-500/10 text-green-400 border-green-500/20', onClick: () => setCurrentView('receive') },
    { icon: ArrowRightLeft, label: 'Swap', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', onClick: () => setActiveTab('swap') },
    { icon: ShoppingCart, label: 'Bridge', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20', onClick: () => setCurrentView('bridge') },
  ];

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      triggerToast('Address copied to clipboard');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 scrollbar-hide pb-4">
      
      {/* Hero Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full rounded-[20px] p-5 relative overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg shrink-0"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FFA3] opacity-10 blur-3xl rounded-full" />
        
        <div className="flex justify-between items-start mb-2 relative z-10">
          <span className="text-gray-400 text-sm font-medium">Total Balance</span>
          <div className="flex items-center gap-1 bg-[#00FFA3]/10 px-2 py-0.5 rounded text-[#00FFA3] text-xs font-semibold border border-[#00FFA3]/20">
            <Activity size={12} />
            +5.2%
          </div>
        </div>
        
        <div className="relative z-10 mb-4">
          <div className="text-4xl font-bold tracking-tight text-white">
            ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="relative z-10 inline-flex items-center gap-1">
          <div 
            onClick={copyAddress}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-white/5 hover:bg-black/60 transition cursor-pointer"
          >
            <span className="text-sm text-gray-300 font-mono">
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '0x000...0000'}
            </span>
            <Copy size={14} className="text-gray-500 hover:text-white" />
          </div>
          <button 
            onClick={() => { if(address) window.open(`https://explorer.ritualfoundation.org/address/${address}`, '_blank') }}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-black/40 border border-white/5 hover:bg-black/60 transition cursor-pointer text-gray-500 hover:text-white"
            title="View on Explorer"
          >
            <ExternalLink size={14} />
          </button>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3 shrink-0">
        {quickActions.map((action, i) => (
          <motion.button
            key={i}
            onClick={action.onClick}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center justify-center gap-2"
          >
            <div className={`w-14 h-14 rounded-[16px] flex items-center justify-center border ${action.color} transition-all`}>
              <action.icon size={22} />
            </div>
            <span className="text-xs text-gray-400 font-medium">{action.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-2 gap-3 mt-2 shrink-0">
        {/* AI Insight Widget */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          onClick={() => setActiveTab('ai')}
          className="col-span-2 p-4 rounded-[20px] bg-gradient-to-r from-[#00FFA3]/10 to-transparent border border-[#00FFA3]/20 cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#00FFA3]/20 flex items-center justify-center">
              <Sparkles size={20} className="text-[#00FFA3]" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">AI Suggestion</div>
              <div className="text-xs text-[#00FFA3]">Gas is low right now (12 Gwei)</div>
            </div>
          </div>
          <ChevronRight size={18} className="text-gray-500" />
        </motion.div>

        {/* Tokens Widget */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          onClick={() => setActiveTab('portfolio')}
          className="p-4 rounded-[20px] bg-white/5 border border-white/10 cursor-pointer"
        >
          <Coins size={20} className="text-blue-400 mb-2" />
          <div className="text-lg font-bold text-white">2 Assets</div>
          <div className="text-xs text-gray-400 mt-1">View portfolio</div>
        </motion.div>

        {/* Security Widget */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="p-4 rounded-[20px] bg-white/5 border border-white/10 cursor-pointer"
        >
          <ShieldCheck size={20} className="text-green-400 mb-2" />
          <div className="text-lg font-bold text-white">100% Safe</div>
          <div className="text-xs text-gray-400 mt-1">Security Score</div>
        </motion.div>
      </div>

    </div>
  );
}
