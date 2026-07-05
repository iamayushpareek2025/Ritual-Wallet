import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ArrowDownToLine, ArrowRightLeft, ShieldCheck, Search, HelpCircle } from 'lucide-react';
import { useWalletStore } from '../../stores/useWalletStore';

export function ActivityScreen() {
  const { transactions } = useWalletStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'send' | 'swap' | 'stake' | 'receive' | 'bridge'>('all');

  const getTxIcon = (type: string) => {
    switch (type) {
      case 'send': return <ArrowUpRight size={15} className="text-blue-400" />;
      case 'swap': return <ArrowRightLeft size={15} className="text-purple-400" />;
      case 'stake': return <ShieldCheck size={15} className="text-[#00FFA3]" />;
      case 'bridge': return <ArrowUpRight size={15} className="text-orange-400 rotate-45" />;
      default: return <ArrowDownToLine size={15} className="text-green-400" />;
    }
  };

  const getTxColor = (type: string) => {
    switch (type) {
      case 'send': return 'bg-blue-500/10 border-blue-500/20';
      case 'swap': return 'bg-purple-500/10 border-purple-500/20';
      case 'stake': return 'bg-[#00FFA3]/10 border-[#00FFA3]/20';
      case 'bridge': return 'bg-orange-500/10 border-orange-500/20';
      default: return 'bg-green-500/10 border-green-500/20';
    }
  };

  // Filter and search calculations
  const filteredTxs = transactions.filter(tx => {
    if (activeFilter !== 'all' && tx.type !== activeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const toMatch = tx.to.toLowerCase();
      const typeMatch = tx.type.toLowerCase();
      const amtMatch = tx.amount.toString().toLowerCase();
      if (!toMatch.includes(q) && !typeMatch.includes(q) && !amtMatch.includes(q)) return false;
    }
    return true;
  });

  // Group by Date
  const groupTransactions = (txList: typeof filteredTxs) => {
    const groups: { [key: string]: typeof filteredTxs } = {};
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

    txList.forEach(tx => {
      const txDate = new Date(tx.date);
      const dateStr = txDate.toDateString();
      let key = 'Older';
      if (dateStr === today) {
        key = 'Today';
      } else if (dateStr === yesterday) {
        key = 'Yesterday';
      } else {
        key = txDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(tx);
    });

    return groups;
  };

  const grouped = groupTransactions(filteredTxs);

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[#000000] relative overflow-hidden">
      
      {/* Header Area */}
      <div className="px-4 pt-6 pb-2 shrink-0 relative z-10 bg-[#000000]">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          Activity
        </h1>
        
        {/* Search Input */}
        <div className="flex gap-2 mt-4 mb-3">
          <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 flex items-center gap-2 focus-within:border-[#00FFA3]/50 transition-colors">
            <Search size={16} className="text-gray-500" />
            <input 
              type="text" 
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-gray-500"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-2 border-b border-white/5">
          {['all', 'send', 'receive', 'swap', 'stake', 'bridge'].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f as any)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors border ${
                activeFilter === f 
                  ? 'bg-[#00FFA3]/10 text-[#00FFA3] border-[#00FFA3]/20' 
                  : 'bg-white/5 text-gray-400 border-white/5 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 scrollbar-hide relative z-10">
        <AnimatePresence mode="popLayout">
          {filteredTxs.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="flex flex-col items-center justify-center py-20 text-center bg-white/5 border border-white/5 rounded-2xl p-6"
            >
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                <HelpCircle size={20} className="text-gray-500" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">No transactions yet</h3>
              <p className="text-xs text-gray-500 max-w-[200px]">Any on-chain operations or transfers will show up here.</p>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-4">
              {Object.keys(grouped).map((groupName) => (
                <div key={groupName} className="space-y-2">
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">{groupName}</div>
                  <div className="space-y-2">
                    {grouped[groupName].map((tx, idx) => (
                      <motion.div 
                        key={tx.hash || idx}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: idx * 0.03 }}
                        onClick={() => window.open(`https://explorer.ritualfoundation.org/tx/${tx.hash}`, '_blank')}
                        className="p-4 rounded-[20px] bg-white/5 border border-white/5 flex items-center justify-between group hover:bg-white/10 hover:border-white/10 hover:shadow-xl hover:-translate-y-[1px] transition-all duration-200 cursor-pointer active:scale-98"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center border ${getTxColor(tx.type)}`}>
                            {getTxIcon(tx.type)}
                          </div>
                          <div>
                            <div className="text-white font-bold text-xs capitalize">{tx.type}</div>
                            <div className="text-gray-500 text-[10px] mt-0.5 font-mono">
                              {tx.to.startsWith('0x') ? `To: ${tx.to.slice(0, 6)}...${tx.to.slice(-4)}` : tx.to}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-bold text-xs">{tx.amount}</div>
                          <div className="text-gray-500 text-[10px] mt-0.5">
                            {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
