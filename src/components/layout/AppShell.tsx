import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  PieChart, 
  Sparkles, 
  Compass, 
  Activity, 
  Send,
  ArrowRightLeft,
  Route,
  Settings,
  Copy,
  Globe,
  Shield,
  Hexagon,
  Wifi,
  Bell,
  Scan,
  Menu,
  Maximize2
} from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';
import { useWalletStore } from '../../stores/useWalletStore';
import { useIsDesktop } from '../../hooks/useMediaQuery';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const isDesktop = useIsDesktop();
  const { 
    activeTab, setActiveTab, 
    currentView, setCurrentView,
    showAccountDropdown, setShowAccountDropdown,
    showNotifications, setShowNotifications
  } = useUIStore();
  
  const { 
    transactions, 
    vault, 
    activeAccountIndex, 
    accountNames, 
    accountImages, 
    switchAccountCallback, 
    hasUnreadNotifications,
    setHasUnreadNotifications,
    address
  } = useWalletStore();

  const desktopTabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'portfolio', label: 'Portfolio', icon: PieChart },
    { id: 'ai', label: 'AI', icon: Sparkles },
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'send', label: 'Send', icon: Send, view: 'send' },
    { id: 'swap', label: 'Swap', icon: ArrowRightLeft },
    { id: 'bridge', label: 'Bridge', icon: Route, view: 'bridge' },
    { id: 'settings', label: 'Settings', icon: Settings, view: 'settings' },
  ];

  const mobileTabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'discover', label: 'Explore', icon: Compass },
    { id: 'ai', label: 'AI', icon: Sparkles, isCenter: true },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings, view: 'settings' },
  ];

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      useUIStore.getState().triggerToast('Address copied to clipboard');
    }
  };

  // If in desktop viewport, render desktop shell layout
  if (isDesktop) {
    return (
      <div className="flex w-full h-screen bg-[#09090b] text-white overflow-hidden font-sans">
        {/* DESKTOP SIDEBAR */}
        <aside className="w-64 h-full border-r border-white/5 bg-[#0a0a0c] flex flex-col shrink-0 z-20">
          <div className="h-20 flex items-center px-6 gap-3 border-b border-white/5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center">
               <Hexagon size={28} className="text-[#00FFA3]" strokeWidth={2} />
            </div>
            <span className="font-bold tracking-widest text-sm text-white">RITUAL WALLET</span>
          </div>

          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 scrollbar-hide">
            {desktopTabs.map((tab) => {
              const isReallyActive = tab.view ? (currentView === tab.view) : (activeTab === tab.id && currentView === 'main');
              
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.view) {
                      setCurrentView(tab.view as any);
                      setActiveTab('home'); 
                    } else {
                      setActiveTab(tab.id as any);
                      setCurrentView('main');
                    }
                  }}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all relative ${
                    isReallyActive 
                      ? 'bg-white/5 text-white shadow-[inset_2px_0_0_#00FFA3,0_0_15px_rgba(0,255,163,0.1)] border border-[#00FFA3]/20' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {isReallyActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00FFA3] rounded-r shadow-[0_0_10px_#00FFA3]" />
                  )}
                  <tab.icon 
                    size={20} 
                    className={isReallyActive ? 'text-[#00FFA3]' : ''} 
                    style={isReallyActive ? { filter: 'drop-shadow(0 0 5px rgba(0,255,163,0.5))' } : {}}
                  />
                  <span className="font-semibold text-sm">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/5 mt-auto">
            <div className="p-4 rounded-xl bg-[#0F0F13] border border-white/5 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00FFA3] shadow-[0_0_8px_#00FFA3] animate-pulse" />
                <span className="text-xs font-semibold text-[#00FFA3]">Connected</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-300">
                <div className="flex items-center gap-2 font-medium">
                   Ritual Testnet
                </div>
                <Wifi size={14} className="text-[#00FFA3]" />
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-gray-400">
                <button className="p-2 hover:text-white hover:bg-white/10 rounded-lg transition" onClick={copyAddress}><Copy size={16} /></button>
                <button className="p-2 hover:text-white hover:bg-white/10 rounded-lg transition"><Globe size={16} /></button>
                <button className="p-2 hover:text-white hover:bg-white/10 rounded-lg transition"><Shield size={16} /></button>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 flex flex-col min-h-0 relative z-10 bg-[#09090b]">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#00FFA3] opacity-[0.03] blur-[150px] pointer-events-none rounded-full" />
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView === 'main' ? activeTab : currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col min-h-0 overflow-hidden"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Modals rendered here */}
        {renderModals()}
      </div>
    );
  }

  // Otherwise, render mobile/popup layout
  return (
    <div className="flex flex-col w-full h-screen bg-[#09090b] text-white overflow-hidden font-sans relative">
      
      {/* MOBILE POPUP HEADER */}
      <header className="h-16 border-b border-white/5 px-4 flex items-center justify-between shrink-0 bg-[#0a0a0c]/80 backdrop-blur-md z-20">
        <div className="flex items-center gap-2">
          <Hexagon size={22} className="text-[#00FFA3]" strokeWidth={2.5} />
          <span className="font-bold tracking-widest text-[11px] text-white">RITUAL WALLET</span>
        </div>

        {/* Address Copy Pill */}
        <div 
          onClick={copyAddress}
          className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1 cursor-pointer hover:bg-white/10 transition active:scale-95"
        >
          <span className="text-[10px] font-bold text-gray-300">
            {accountNames?.[activeAccountIndex] || `@starayush`}
          </span>
          <Copy size={10} className="text-gray-400" />
        </div>

        {/* Quick Action Icons */}
        <div className="flex items-center gap-3">
          <button 
            title="Expand to Desktop"
            className="text-gray-400 hover:text-white transition active:scale-90 cursor-pointer" 
            onClick={() => {
              if (typeof chrome !== 'undefined' && chrome.tabs) {
                chrome.tabs.create({ url: chrome.runtime.getURL("index.html") });
              } else {
                window.open(window.location.href, '_blank');
              }
            }}
          >
            <Maximize2 size={16} />
          </button>
          <button className="text-gray-400 hover:text-white transition active:scale-90 relative cursor-pointer" onClick={() => setShowNotifications(true)}>
            <Bell size={18} />
            {hasUnreadNotifications && (
              <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-[#00FFA3] shadow-[0_0_5px_#00FFA3]" />
            )}
          </button>
          <button className="text-gray-400 hover:text-white transition active:scale-90 cursor-pointer" onClick={() => setCurrentView('settings')}>
            <Menu size={18} />
          </button>
        </div>
      </header>

      {/* MOBILE CONTENT AREA */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView === 'main' ? activeTab : currentView}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="flex-1 flex flex-col min-h-0 overflow-hidden"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="w-[92%] mx-[4%] h-[68px] bg-[#0c0d10]/90 border border-white/5 z-20 px-2 flex items-center justify-between shrink-0 fixed bottom-4 rounded-[24px] backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        {mobileTabs.map((tab) => {
          const isActive = tab.view ? (currentView === tab.view) : (activeTab === tab.id && currentView === 'main');
          const isAI = tab.id === 'ai';
          
          if (tab.isCenter) {
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setCurrentView('main');
                }}
                className="flex-1 flex flex-col items-center justify-center relative -translate-y-4"
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all bg-[#0a0a0c] border ${
                  isActive 
                    ? 'border-[#00FFA3] shadow-[0_0_20px_rgba(0,255,163,0.4)] text-[#00FFA3]' 
                    : 'border-white/10 hover:border-white/30 text-gray-400'
                }`}>
                  <Hexagon size={24} className={isActive ? 'animate-pulse' : ''} />
                </div>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.view) {
                  setCurrentView(tab.view as any);
                  setActiveTab('home');
                } else {
                  setActiveTab(tab.id as any);
                  setCurrentView('main');
                }
              }}
              className="flex-1 flex flex-col items-center justify-center gap-1 h-full relative"
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute top-0 w-8 h-0.5 rounded-full bg-white"
                />
              )}
              <tab.icon 
                size={19} 
                className={`transition-all duration-200 ${isActive ? 'text-white' : 'text-gray-500 hover:text-gray-400'}`}
              />
              <span className={`text-[9px] font-bold tracking-wide transition-colors ${isActive ? 'text-white' : 'text-gray-500'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Modals rendered here */}
      {renderModals()}
    </div>
  );

  function renderModals() {
    return (
      <>
        {/* Account Switch Dropdown */}
        <AnimatePresence>
          {showAccountDropdown && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="absolute inset-0" onClick={() => setShowAccountDropdown(false)} />
              
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-sm bg-[#111111] border border-white/10 rounded-2xl p-5 shadow-2xl z-50 space-y-4"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-lg text-white">Switch Profile</h3>
                  <button onClick={() => setShowAccountDropdown(false)} className="text-xs text-gray-500 font-bold uppercase hover:text-white transition-colors">Close</button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-hide">
                  {vault?.accounts.map((_, i) => {
                    const isActive = activeAccountIndex === i;
                    return (
                      <div 
                        key={i} 
                        onClick={() => {
                          if (switchAccountCallback) switchAccountCallback(i);
                          setShowAccountDropdown(false);
                        }}
                        className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                          isActive 
                            ? 'bg-[#00FFA3]/10 border-[#00FFA3]/30 text-white font-semibold' 
                            : 'bg-white/5 border-white/5 hover:bg-white/10 text-gray-400'
                        }`}
                      >
                        {accountImages?.[i] ? (
                          <img src={accountImages[i]} className="w-8 h-8 rounded-full object-cover border border-white/15" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00FFA3] to-[#0A84FF] flex items-center justify-center font-bold text-xs text-black">
                            {(accountNames?.[i] || `Account ${i + 1}`).substring(0,2).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="text-sm font-bold text-white">{accountNames?.[i] || `Account ${i + 1}`}</div>
                          <div className="text-xs text-gray-500 font-mono mt-0.5">{vault.accounts[i].slice(0, 6)}...{vault.accounts[i].slice(-4)}</div>
                        </div>
                        {isActive && (
                          <span className="w-2.5 h-2.5 rounded-full bg-[#00FFA3] shadow-[0_0_8px_#00FFA3] animate-pulse" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Notifications Modal */}
        <AnimatePresence>
          {showNotifications && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="absolute inset-0" onClick={() => setShowNotifications(false)} />
              
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-sm bg-[#111111] border border-white/10 rounded-2xl p-5 shadow-2xl z-50 space-y-4"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-lg text-white">Notifications</h3>
                  <button 
                    onClick={() => {
                      setHasUnreadNotifications(false);
                      setShowNotifications(false);
                    }} 
                    className="text-xs text-red-400 font-bold uppercase hover:underline transition"
                  >
                    Clear All
                  </button>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
                  {transactions.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 text-sm">No notifications yet.</div>
                  ) : (
                    transactions.slice(0, 5).map((tx, i) => (
                      <div 
                        key={i} 
                        onClick={() => {
                          window.open(`https://explorer.ritualfoundation.org/tx/${tx.hash}`, '_blank');
                          setShowNotifications(false);
                        }}
                        className="p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition cursor-pointer"
                      >
                        <div className="text-sm font-bold text-white mb-0.5 capitalize flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full shadow-[0_0_5px_currentColor] ${tx.type === 'receive' ? 'bg-[#00FFA3] text-[#00FFA3]' : 'bg-red-400 text-red-400'}`} />
                          {tx.type === 'receive' ? 'Assets Received' : `Transaction: ${tx.type}`}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {tx.type === 'receive' 
                            ? `You received ${tx.amount} RITUAL.` 
                            : `You sent ${tx.amount} RITUAL to ${tx.to.slice(0, 6)}...`}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </>
    );
  }
}
