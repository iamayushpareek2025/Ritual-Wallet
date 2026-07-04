import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownToLine, ArrowRightLeft, ShieldCheck, Search, Filter } from 'lucide-react';
import { useWalletStore } from '../../stores/useWalletStore';

export function ActivityScreen() {
  const { transactions } = useWalletStore();

  const getTxIcon = (type: string) => {
    switch (type) {
      case 'send': return <ArrowUpRight size={16} className="text-blue-400" />;
      case 'swap': return <ArrowRightLeft size={16} className="text-purple-400" />;
      case 'stake': return <ShieldCheck size={16} className="text-[#00FFA3]" />;
      default: return <ArrowDownToLine size={16} className="text-green-400" />;
    }
  };

  const getTxColor = (type: string) => {
    switch (type) {
      case 'send': return 'bg-blue-500/10 border-blue-500/20';
      case 'swap': return 'bg-purple-500/10 border-purple-500/20';
      case 'stake': return 'bg-[#00FFA3]/10 border-[#00FFA3]/20';
      default: return 'bg-green-500/10 border-green-500/20';
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[#09090b] relative overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 shrink-0 relative z-10">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          Activity
        </h1>
        
        <div className="flex gap-2 mt-4">
          <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 flex items-center gap-2 focus-within:border-white/30 transition-colors">
            <Search size={16} className="text-gray-500" />
            <input 
              type="text" 
              placeholder="Search transactions..."
              className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-gray-500"
            />
          </div>
          <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
            <Filter size={16} />
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-hide relative z-10">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <Search size={24} className="text-gray-500" />
            </div>
            <h3 className="text-white font-medium mb-1">No Activity Yet</h3>
            <p className="text-gray-400 text-sm">Your transactions will appear here.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {transactions.map((tx, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => window.open(`https://explorer.ritualfoundation.org/tx/${tx.hash}`, '_blank')}
                className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between group hover:bg-white/10 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${getTxColor(tx.type)}`}>
                    {getTxIcon(tx.type)}
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm capitalize">{tx.type}</div>
                    <div className="text-gray-500 text-xs mt-0.5 font-mono">
                      To: {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold text-sm">{tx.amount}</div>
                  <div className="text-gray-500 text-xs mt-0.5">
                    {new Date(tx.date).toLocaleDateString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
