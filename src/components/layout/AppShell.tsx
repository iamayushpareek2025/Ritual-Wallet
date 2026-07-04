import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  PieChart, 
  Sparkles, 
  Compass, 
  Activity, 
  Search, 
  Bell, 
  ChevronDown,
  MessageSquare,
  Settings
} from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';
import { useWalletStore } from '../../stores/useWalletStore';


interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { activeTab, setActiveTab, setCurrentView } = useUIStore();
  const { transactions, vault, activeAccountIndex, accountNames, accountImages, switchAccountCallback, hasUnreadNotifications, setHasUnreadNotifications } = useWalletStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'portfolio', label: 'Portfolio', icon: PieChart },
    { id: 'ai', label: 'AI', icon: Sparkles },
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'activity', label: 'Activity', icon: Activity },
  ];

  return (
    <div className="relative w-full h-full flex flex-col bg-[#09090b] text-white overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#00FFA3] opacity-[0.03] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#0A84FF] opacity-[0.03] blur-[100px] pointer-events-none" />

      {/* Top Bar */}
      <header className="flex items-center justify-between p-4 z-50 bg-[#09090b]/80 backdrop-blur-md border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3 relative">
          <div 
            onClick={() => setShowAccountDropdown(!showAccountDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
          >
            {accountImages?.[activeAccountIndex] ? (
              <img src={accountImages[activeAccountIndex]} className="w-4 h-4 rounded-full object-cover" />
            ) : (
              <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#00FFA3] to-[#0A84FF]" />
            )}
            <span className="text-sm font-semibold">{accountNames?.[activeAccountIndex] || `Account ${activeAccountIndex + 1}`}</span>
            <ChevronDown size={14} className="text-gray-400" />
          </div>

          <AnimatePresence>
            {showAccountDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-12 left-0 w-64 bg-[#18181b] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
              >
                <div className="p-3 border-b border-white/5 flex justify-between items-center">
                  <h3 className="font-semibold text-white text-sm">Switch Account</h3>
                </div>
                <div className="max-h-60 overflow-y-auto scrollbar-hide py-2">
                  {vault?.accounts.map((_, i) => (
                    <div 
                      key={i} 
                      className={`px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors cursor-pointer ${activeAccountIndex === i ? 'bg-white/5 border-l-2 border-[#00FFA3]' : 'border-l-2 border-transparent'}`}
                      onClick={() => {
                        if (switchAccountCallback) switchAccountCallback(i);
                        setShowAccountDropdown(false);
                      }}
                    >
                      {accountImages?.[i] ? (
                        <img src={accountImages[i]} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00FFA3] to-[#0A84FF] flex items-center justify-center font-bold text-xs">
                          {(accountNames?.[i] || `Account ${i + 1}`).substring(0,2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-white">{accountNames?.[i] || `Account ${i + 1}`}</div>
                        <div className="text-[10px] text-gray-500">{activeAccountIndex === i ? 'Active' : ''}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
            <Search size={18} />
          </button>
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) setHasUnreadNotifications(false);
            }}
            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors relative"
          >
            {hasUnreadNotifications && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF453A]" />}
            <Bell size={18} />
          </button>
          <button 
            onClick={() => setCurrentView('settings')}
            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Settings size={18} />
          </button>
        </div>

        {/* Notifications Dropdown */}
        <AnimatePresence>
          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-16 right-4 w-80 bg-[#18181b] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-white/5 flex justify-between items-center">
                <h3 className="font-semibold text-white">Notifications</h3>
                <div className="flex items-center gap-3">
                  <button onClick={() => setHasUnreadNotifications(false)} className="text-xs text-[#00FFA3] hover:text-white transition-colors">Clear</button>
                  <button onClick={() => setShowNotifications(false)} className="text-xs text-gray-500 hover:text-white transition-colors">Close</button>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto scrollbar-hide">
                {transactions.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 text-sm">No new notifications</div>
                ) : (
                  transactions.slice(0, 5).map((tx, i) => (
                    <div 
                      key={i} 
                      className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer" 
                      onClick={() => {
                        window.open(`https://explorer.ritualfoundation.org/tx/${tx.hash}`, '_blank');
                        setShowNotifications(false);
                      }}
                    >
                      <div className="text-sm text-white font-medium mb-1 capitalize flex items-center gap-2">
                        {tx.type === 'receive' ? <div className="w-2 h-2 rounded-full bg-green-400" /> : <div className="w-2 h-2 rounded-full bg-blue-400" />}
                        {tx.type === 'receive' ? 'Asset Received' : `Transaction: ${tx.type}`}
                      </div>
                      <div className="text-xs text-gray-400">
                        {tx.type === 'receive' 
                          ? `You received ${tx.amount} RITUAL.` 
                          : `You sent ${tx.amount} to ${tx.to.slice(0, 6)}...`}
                      </div>
                      <div className="text-[10px] text-gray-600 mt-2">
                        {new Date(tx.date).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-0 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col min-h-0"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>



      {/* Bottom Navigation */}
      <nav className="w-full h-[70px] bg-[#09090b]/80 backdrop-blur-xl border-t border-white/5 z-20 px-2 flex items-center justify-between shrink-0">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isAI = tab.id === 'ai';
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className="flex-1 flex flex-col items-center justify-center gap-1 h-full relative"
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute top-0 w-8 h-1 rounded-full"
                  style={{ background: isAI ? '#00FFA3' : '#fff', boxShadow: isAI ? '0 0 10px #00FFA3' : 'none' }}
                />
              )}
              <tab.icon 
                size={isActive ? 22 : 20} 
                className={`transition-all duration-300 ${isActive ? (isAI ? 'text-[#00FFA3]' : 'text-white') : 'text-gray-500 hover:text-gray-400'}`}
                style={isActive && isAI ? { filter: 'drop-shadow(0 0 8px rgba(0,255,163,0.6))' } : {}}
              />
              <span className={`text-[10px] font-medium transition-colors ${isActive ? (isAI ? 'text-[#00FFA3]' : 'text-white') : 'text-gray-500'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
