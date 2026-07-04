import React from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  User, 
  Shield, 
  Globe, 
  Cpu, 
  Info, 
  ChevronRight, 
  ExternalLink,
  Book,
  Smartphone,
  Lock,
  Sparkles,
  ArrowLeft,
  Eye,
  EyeOff
} from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';

export function SettingsScreen({ appState }: { appState: any }) {
  const { setCurrentView } = useUIStore();
  const {
    settingsSubView, setSettingsSubView,
    vault, accountNames, accountImages, activeAccountIndex,
    addressBook, connectedApps,
    disconnectApp, removeAddressBookEntry, startEditingAddressBook, handleSelectAddressBookContact,
    addAccount, importAccount,
    revealSeed, setRevealSeed, activePassword, setActivePassword, 
    setPrivateKey, setAddress, setBalance, setAuthState
  } = appState;

  const handleLockWallet = () => {
    setPrivateKey(null); 
    setAddress(null); 
    setBalance("0.0"); 
    setActivePassword(""); 
    setAuthState('unlock');
    setCurrentView('main');
  };

  const renderMainMenu = () => (
    <div className="flex flex-col flex-1 min-h-0 bg-[#09090b] text-white">
      <div className="px-4 pt-6 pb-4 shrink-0 flex justify-between items-center z-10 relative">
        <h1 className="text-xl font-bold tracking-tight">Settings</h1>
        <button onClick={() => setCurrentView('main')} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-hide">
        {/* Profile Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 mb-6 relative overflow-hidden group hover:border-[#00FFA3]/30 transition-colors cursor-pointer" onClick={() => setSettingsSubView('accounts')}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#00FFA3]/5 to-[#0A84FF]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 relative z-10">
            {accountImages[activeAccountIndex] ? (
              <img src={accountImages[activeAccountIndex]} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-[#00FFA3] to-[#0A84FF] flex items-center justify-center font-bold">
                {(accountNames[activeAccountIndex] || `Account ${activeAccountIndex + 1}`).substring(0,2).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 relative z-10">
            <h2 className="font-semibold text-lg">{accountNames[activeAccountIndex] || `Account ${activeAccountIndex + 1}`}</h2>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#00FFA3]" /> Connected to Ritual
            </p>
          </div>
          <ChevronRight size={18} className="text-gray-500 relative z-10" />
        </div>

        <div className="space-y-2 mb-6">
          <SettingsItem icon={<Book size={18} />} title="Address Book" subtitle="Manage saved contacts" onClick={() => setSettingsSubView('addressBook')} />
          <SettingsItem icon={<Smartphone size={18} />} title="Connected Apps" subtitle="Manage active sessions" onClick={() => setSettingsSubView('connectedApps')} />
        </div>

        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">Security & Network</h3>
        <div className="space-y-2 mb-6">
          <SettingsItem icon={<Shield size={18} />} title="Security & Privacy" subtitle="Backup phrase, clear data" onClick={() => setSettingsSubView('security')} />
          <SettingsItem icon={<Globe size={18} />} title="Network" subtitle="Ritual Testnet" onClick={() => setSettingsSubView('network')} />
          <SettingsItem icon={<Cpu size={18} />} title="AI Integrations" subtitle="LLM endpoints & permissions" onClick={() => setSettingsSubView('ai')} />
        </div>

        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">About</h3>
        <div className="space-y-2 mb-8">
          <SettingsItem icon={<Info size={18} />} title="Help & Support" suffix={<ExternalLink size={16} className="text-gray-500" />} />
          <SettingsItem icon={<Sparkles size={18} className="text-[#00FFA3]" />} title="About Ritual Wallet" onClick={() => setSettingsSubView('about')} />
        </div>

        <button onClick={handleLockWallet} className="w-full py-4 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-500 font-semibold flex items-center justify-center gap-2 hover:bg-red-500/10 transition-colors">
          <Lock size={18} /> Lock Wallet
        </button>
      </div>
    </div>
  );

  const renderAbout = () => (
    <div className="flex flex-col flex-1 min-h-0 bg-[#09090b] text-white">
      <div className="px-4 pt-6 pb-4 shrink-0 flex items-center gap-3 z-10 relative">
        <button onClick={() => setSettingsSubView('main')} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold tracking-tight">About</h1>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-[#00FFA3]/20 to-[#0A84FF]/20 border border-white/10 p-1 mb-6 shadow-2xl relative">
          <div className="w-full h-full bg-[#09090b] rounded-[1.75rem] flex items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-tr from-[#00FFA3]/20 to-transparent opacity-50" />
             <Sparkles size={40} className="text-[#00FFA3] relative z-10" />
          </div>
        </div>
        <h2 className="text-3xl font-bold mb-3 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Ritual Wallet</h2>
        <p className="text-gray-400 mb-8 leading-relaxed max-w-[280px]">
          The premier AI-native Web3 experience, crafted specifically for the <span className="text-white font-semibold">Ritual Community</span>.
        </p>
        
        <div className="flex flex-col gap-3 w-full max-w-[280px] mb-8">
          <div className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 flex justify-between items-center">
            <span className="text-sm text-gray-400">Version</span>
            <span className="text-sm font-mono font-semibold text-white">1.0.0-beta</span>
          </div>
          <div className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 flex justify-between items-center">
            <span className="text-sm text-gray-400">Network</span>
            <span className="text-sm font-semibold text-[#00FFA3] flex items-center gap-1">
               <span className="w-2 h-2 rounded-full bg-[#00FFA3]"></span> Testnet
            </span>
          </div>
        </div>
        
        <div className="text-xs text-gray-600 font-medium">
          Designed & Developed by Ayush
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="flex flex-col flex-1 min-h-0 bg-[#09090b] text-white">
      <div className="px-4 pt-6 pb-4 shrink-0 flex items-center gap-3 z-10 relative">
        <button onClick={() => setSettingsSubView('main')} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold tracking-tight">Security</h1>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <h3 className="font-semibold mb-1">{vault?.mnemonic ? 'Secret Recovery Phrase' : 'Private Key'}</h3>
          <p className="text-xs text-gray-400 mb-4">Your {vault?.mnemonic ? 'phrase' : 'key'} is the only way to recover your wallet. Never share it with anyone.</p>
          
          {!revealSeed ? (
            <button onClick={() => setRevealSeed(true)} className="w-full py-3 rounded-xl bg-white/10 text-white font-semibold flex items-center justify-center gap-2 hover:bg-white/15 transition-colors">
              <Eye size={16} /> Reveal {vault?.mnemonic ? 'Phrase' : 'Private Key'}
            </button>
          ) : (
            <div className="space-y-4">
               {vault?.mnemonic && (
                 <div>
                   <div className="text-sm text-gray-400 mb-2 font-semibold">Secret Recovery Phrase</div>
                   <div className="grid grid-cols-3 gap-2">
                     {vault.mnemonic.split(' ').map((word: string, i: number) => (
                       <div key={i} className="bg-black/40 border border-white/5 rounded-lg p-2 text-center relative">
                         <span className="absolute top-1 left-1.5 text-[10px] text-gray-600">{i + 1}</span>
                         <span className="text-sm font-mono text-[#00FFA3]">{word}</span>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
               
               <div>
                 <div className="text-sm text-gray-400 mb-2 mt-4 font-semibold">Private Key (Current Account)</div>
                 <div className="bg-black/40 border border-white/5 rounded-lg p-4 text-center break-all">
                   <span className="text-sm font-mono text-[#00FFA3]">{appState.privateKey}</span>
                 </div>
               </div>
               <button onClick={() => setRevealSeed(false)} className="w-full py-3 rounded-xl bg-white/10 text-white font-semibold flex items-center justify-center gap-2 hover:bg-white/15 transition-colors">
                  <EyeOff size={16} /> Hide {vault?.mnemonic ? 'Phrase' : 'Private Key'}
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAddressBook = () => (
    <div className="flex flex-col flex-1 min-h-0 bg-[#09090b] text-white">
      <div className="px-4 pt-6 pb-4 shrink-0 flex items-center gap-3 z-10 relative border-b border-white/5">
        <button onClick={() => setSettingsSubView('main')} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold tracking-tight">Address Book</h1>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-hide">
        {(!addressBook || addressBook.length === 0) ? (
          <div className="text-center py-10 text-gray-500">No contacts saved.</div>
        ) : (
          addressBook.map((entry: any, i: number) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-1">
              <div className="font-semibold">{entry.name}</div>
              <div className="text-xs text-gray-400 font-mono break-all">{entry.address}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderConnectedApps = () => (
    <div className="flex flex-col flex-1 min-h-0 bg-[#09090b] text-white">
      <div className="px-4 pt-6 pb-4 shrink-0 flex items-center gap-3 z-10 relative border-b border-white/5">
        <button onClick={() => setSettingsSubView('main')} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold tracking-tight">Connected Apps</h1>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-hide">
        {(!connectedApps || connectedApps.length === 0) ? (
          <div className="text-center py-10 text-gray-500">No apps connected.</div>
        ) : (
          connectedApps.map((app: any, i: number) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-center">
              <div>
                <div className="font-semibold text-[#00FFA3]">{app.domain}</div>
                <div className="text-xs text-gray-400">{app.description}</div>
              </div>
              <button onClick={() => disconnectApp(i)} className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-xs font-semibold hover:bg-red-500/20 transition-colors">
                Disconnect
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderAccounts = () => (
    <div className="flex flex-col flex-1 min-h-0 bg-[#09090b] text-white">
      <div className="px-4 pt-6 pb-4 shrink-0 flex items-center gap-3 z-10 relative border-b border-white/5">
        <button onClick={() => setSettingsSubView('main')} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold tracking-tight">Accounts</h1>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-hide">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-4">
           <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#00FFA3] to-[#0A84FF] flex items-center justify-center font-bold text-2xl">
             {(accountNames[activeAccountIndex] || `Account ${activeAccountIndex + 1}`).substring(0,2).toUpperCase()}
           </div>
           <h2 className="text-xl font-bold">{accountNames[activeAccountIndex] || `Account ${activeAccountIndex + 1}`}</h2>
           <div className="px-4 py-2 bg-black/40 rounded-full font-mono text-xs text-gray-400 break-all border border-white/5 text-center">
             {appState.address}
           </div>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <h3 className="font-semibold mb-2">Private Key</h3>
          <p className="text-xs text-gray-400 mb-4">This is the private key for this specific account. Never share it with anyone.</p>
          
          {!revealSeed ? (
            <button onClick={() => setRevealSeed(true)} className="w-full py-3 rounded-xl bg-white/10 text-white font-semibold flex items-center justify-center gap-2 hover:bg-white/15 transition-colors">
              <Eye size={16} /> Reveal Private Key
            </button>
          ) : (
            <div className="space-y-4">
               <div className="bg-black/40 border border-white/5 rounded-lg p-4 text-center break-all">
                 <span className="text-sm font-mono text-[#00FFA3]">{appState.privateKey}</span>
               </div>
               <button onClick={() => setRevealSeed(false)} className="w-full py-3 rounded-xl bg-white/10 text-white font-semibold flex items-center justify-center gap-2 hover:bg-white/15 transition-colors">
                  <EyeOff size={16} /> Hide Private Key
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderNetwork = () => (
    <div className="flex flex-col flex-1 min-h-0 bg-[#09090b] text-white">
      <div className="px-4 pt-6 pb-4 shrink-0 flex items-center gap-3 z-10 relative border-b border-white/5">
        <button onClick={() => setSettingsSubView('main')} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold tracking-tight">Network</h1>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        <div className="bg-white/5 border border-[#00FFA3]/30 rounded-2xl p-4 flex justify-between items-center cursor-pointer hover:bg-white/10 transition-colors">
          <div>
            <div className="font-semibold text-[#00FFA3]">Ritual Testnet</div>
            <div className="text-xs text-gray-400">rpc.ritualfoundation.org</div>
          </div>
          <div className="w-4 h-4 rounded-full bg-[#00FFA3] flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-[#09090b]" />
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center opacity-50 cursor-not-allowed">
          <div>
            <div className="font-semibold text-white">Ritual Mainnet</div>
            <div className="text-xs text-gray-400">mainnet.ritualfoundation.org (Coming soon)</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAI = () => (
    <div className="flex flex-col flex-1 min-h-0 bg-[#09090b] text-white">
      <div className="px-4 pt-6 pb-4 shrink-0 flex items-center gap-3 z-10 relative border-b border-white/5">
        <button onClick={() => setSettingsSubView('main')} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold tracking-tight">AI Integrations</h1>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        <div className="space-y-2">
          <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider px-2">Default LLM</div>
          <div className="bg-white/5 border border-[#00FFA3]/30 rounded-2xl p-4 flex justify-between items-center cursor-pointer">
            <div>
              <div className="font-semibold text-[#00FFA3]">Ritual InferNet</div>
              <div className="text-xs text-gray-400">On-chain privacy preserving</div>
            </div>
            <div className="w-4 h-4 rounded-full bg-[#00FFA3] flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#09090b]" />
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center cursor-pointer hover:bg-white/10">
            <div>
              <div className="font-semibold text-white">OpenAI GPT-4</div>
              <div className="text-xs text-gray-400">External provider</div>
            </div>
          </div>
        </div>
        <div className="bg-[#00FFA3]/10 border border-[#00FFA3]/20 rounded-xl p-4 flex items-start gap-3">
          <Info size={20} className="text-[#00FFA3] shrink-0 mt-0.5" />
          <p className="text-sm text-[#00FFA3] leading-relaxed">
            By using Ritual InferNet, your prompts and data are processed locally or via trusted enclaves, ensuring maximum privacy.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full relative z-20 bg-[#09090b]">
      {settingsSubView === 'main' && renderMainMenu()}
      {settingsSubView === 'about' && renderAbout()}
      {settingsSubView === 'security' && renderSecurity()}
      {settingsSubView === 'accounts' && renderAccounts()}
      {settingsSubView === 'addressBook' && renderAddressBook()}
      {settingsSubView === 'connectedApps' && renderConnectedApps()}
      {settingsSubView === 'network' && renderNetwork()}
      {settingsSubView === 'ai' && renderAI()}
      {/* Fallback for other subviews to show they are empty/coming soon for now */}
      {!['main', 'about', 'security', 'accounts', 'addressBook', 'connectedApps', 'network', 'ai'].includes(settingsSubView) && (
        <div className="flex flex-col flex-1 min-h-0 bg-[#09090b] text-white">
           <div className="px-4 pt-6 pb-4 shrink-0 flex items-center gap-3 z-10 relative">
            <button onClick={() => setSettingsSubView('main')} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-xl font-bold tracking-tight capitalize">{settingsSubView}</h1>
          </div>
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Feature in development
          </div>
        </div>
      )}
    </div>
  );
}

const SettingsItem = ({ icon, title, subtitle, suffix, onClick }: any) => (
  <div onClick={onClick} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-white/10 transition-colors">
    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-300">
      {icon}
    </div>
    <div className="flex-1">
      <div className="font-semibold text-sm text-white">{title}</div>
      {subtitle && <div className="text-xs text-gray-400 mt-0.5">{subtitle}</div>}
    </div>
    {suffix || <ChevronRight size={18} className="text-gray-500" />}
  </div>
);
