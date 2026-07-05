import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  EyeOff,
  Bell
} from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';

export function SettingsScreen({ appState }: { appState: any }) {
  const { setCurrentView } = useUIStore();

  const [activeProvider, setActiveProvider] = React.useState(localStorage.getItem('ritual_ai_provider') || 'none');
  const [openAiKey, setOpenAiKey] = React.useState(localStorage.getItem('ritual_openai_key') || '');
  const [openAiModel, setOpenAiModel] = React.useState(localStorage.getItem('ritual_openai_model') || 'gpt-4o-mini');
  const [anthropicKey, setAnthropicKey] = React.useState(localStorage.getItem('ritual_anthropic_key') || '');
  const [anthropicModel, setAnthropicModel] = React.useState(localStorage.getItem('ritual_anthropic_model') || 'claude-3-5-sonnet-20241022');
  const [ollamaUrl, setOllamaUrl] = React.useState(localStorage.getItem('ritual_ollama_url') || 'http://localhost:11434');
  const [ollamaModel, setOllamaModel] = React.useState(localStorage.getItem('ritual_ollama_model') || 'llama3');

  const handleSaveProvider = (provider: string) => {
    setActiveProvider(provider);
    localStorage.setItem('ritual_ai_provider', provider);
  };
  const handleSaveOpenAiKey = (val: string) => {
    setOpenAiKey(val);
    localStorage.setItem('ritual_openai_key', val);
  };
  const handleSaveOpenAiModel = (val: string) => {
    setOpenAiModel(val);
    localStorage.setItem('ritual_openai_model', val);
  };
  const handleSaveAnthropicKey = (val: string) => {
    setAnthropicKey(val);
    localStorage.setItem('ritual_anthropic_key', val);
  };
  const handleSaveAnthropicModel = (val: string) => {
    setAnthropicModel(val);
    localStorage.setItem('ritual_anthropic_model', val);
  };
  const handleSaveOllamaUrl = (val: string) => {
    setOllamaUrl(val);
    localStorage.setItem('ritual_ollama_url', val);
  };
  const handleSaveOllamaModel = (val: string) => {
    setOllamaModel(val);
    localStorage.setItem('ritual_ollama_model', val);
  };
  
  if (!appState) {
    return (
      <div className="flex flex-col flex-1 h-screen w-full bg-[#000000] text-white items-center justify-center p-6 text-center font-sans z-50">
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold mb-2">Settings Temporarily Unavailable</h2>
        <p className="text-xs text-gray-500 mb-6 max-w-xs">The settings configuration context could not be loaded. Please return to the main dashboard.</p>
        <button 
          onClick={() => setCurrentView('main')}
          className="px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/10 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const {
    settingsSubView = 'main',
    setSettingsSubView = () => {},
    vault = null,
    accountNames = {},
    accountImages = {},
    activeAccountIndex = 0,
    addressBook = [],
    connectedApps = [],
    disconnectApp = () => {},
    removeAddressBookEntry = () => {},
    startEditingAddressBook = () => {},
    handleSelectAddressBookContact = () => {},
    addAccount = () => {},
    importAccount = () => {},
    revealSeed = false,
    setRevealSeed = () => {},
    activePassword = '',
    setActivePassword = () => {},
    privateKey = '',
    setPrivateKey = () => {},
    address = '',
    setAddress = () => {},
    setBalance = () => {},
    setAuthState = () => {}
  } = appState || {};

  const handleLockWallet = () => {
    setPrivateKey(null); 
    setAddress(null); 
    setBalance("0.0"); 
    setActivePassword(""); 
    setAuthState('unlock');
    setCurrentView('main');
  };

  const renderMainMenu = () => (
    <div className="flex flex-col flex-1 min-h-0 bg-[#000000] text-white">
      <div className="px-4 pt-6 pb-2 shrink-0 flex justify-between items-center z-10 relative">
        <h1 className="text-xl font-bold tracking-tight">Settings</h1>
        <button onClick={() => setCurrentView('main')} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-24 scrollbar-hide space-y-4 pt-2">
        {/* iOS style user account top card */}
        <div className="p-4 rounded-[20px] bg-white/5 border border-white/10 flex items-center gap-3.5 hover:bg-white/10 transition cursor-pointer" onClick={() => setSettingsSubView('accounts')}>
          <div className="w-11 h-11 rounded-full overflow-hidden border border-white/10 shrink-0">
            {accountImages[activeAccountIndex] ? (
              <img src={accountImages[activeAccountIndex]} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-[#00FFA3] to-[#0A84FF] flex items-center justify-center font-bold text-sm text-black">
                {(accountNames[activeAccountIndex] || `Account 1`).substring(0,2).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-bold text-white">{accountNames[activeAccountIndex] || `Account 1`}</h2>
            <p className="text-[10px] text-gray-500 font-mono mt-0.5">
              {address ? `${address.slice(0, 8)}...${address.slice(-6)}` : '0x000...0000'}
            </p>
          </div>
          <ChevronRight size={16} className="text-gray-600" />
        </div>

        {/* Grouped settings list blocks */}
        <div className="rounded-[20px] bg-white/5 border border-white/10 overflow-hidden divide-y divide-white/5">
          <SettingsItem icon={<User size={16} />} title="General" subtitle="Manage accounts book & sessions" onClick={() => setSettingsSubView('accounts')} />
          <SettingsItem icon={<Book size={16} />} title="Wallet" subtitle="Manage saved contacts" onClick={() => setSettingsSubView('addressBook')} />
          <SettingsItem icon={<Globe size={16} />} title="Network" subtitle="Ritual Testnet switcher" onClick={() => setSettingsSubView('network')} />
          <SettingsItem icon={<Cpu size={16} />} title="AI Settings" subtitle="Configure OpenAI, Ollama endpoints" onClick={() => setSettingsSubView('ai')} />
          <SettingsItem icon={<Shield size={16} />} title="Security" subtitle="Backup phrase & key security" onClick={() => setSettingsSubView('security')} />
          <SettingsItem icon={<Bell size={16} />} title="Notifications" subtitle="Setup triggers & rules" onClick={() => setSettingsSubView('addressBook')} />
          <SettingsItem icon={<Smartphone size={16} />} title="Developer" subtitle="Deploy mock contracts" onClick={() => setSettingsSubView('about')} />
        </div>

        {/* Group 2: About card */}
        <div className="rounded-[20px] bg-white/5 border border-white/10 overflow-hidden">
          <SettingsItem icon={<Sparkles size={16} className="text-[#00FFA3]" />} title="About Ritual Wallet" subtitle="Version 1.0.0" onClick={() => setSettingsSubView('about')} />
        </div>

        <button onClick={handleLockWallet} className="w-full py-3.5 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-500 font-bold flex items-center justify-center gap-2 hover:bg-red-500/10 transition">
          <Lock size={16} /> Lock Wallet
        </button>
      </div>
    </div>
  );

  const renderAbout = () => (
    <div className="flex flex-col flex-1 min-h-0 bg-[#000000] text-white">
      <div className="px-4 pt-6 pb-2 shrink-0 flex items-center gap-3 z-10 relative border-b border-white/5">
        <button onClick={() => setSettingsSubView('main')} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-xl font-bold tracking-tight">About</h1>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-[#00FFA3]/20 to-[#0A84FF]/20 border border-white/10 p-1 mb-5 shadow-2xl relative">
          <div className="w-full h-full bg-[#090909] rounded-[1.25rem] flex items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-tr from-[#00FFA3]/20 to-transparent opacity-50" />
             <Sparkles size={32} className="text-[#00FFA3]" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2 tracking-tight text-white">Ritual Wallet</h2>
        <p className="text-gray-400 text-xs mb-6 leading-relaxed max-w-[240px]">
          The premier AI-native Web3 experience, crafted for the <span className="text-[#00FFA3] font-semibold">Ritual community</span>.
        </p>
        
        <div className="flex flex-col gap-2 w-full max-w-[240px] mb-6">
          <div className="w-full p-3.5 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center text-xs">
            <span className="text-gray-400">Version</span>
            <span className="font-mono font-semibold text-white">1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="flex flex-col flex-1 min-h-0 bg-[#000000] text-white">
      <div className="px-4 pt-6 pb-2 shrink-0 flex items-center gap-3 z-10 relative border-b border-white/5">
        <button onClick={() => setSettingsSubView('main')} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-xl font-bold tracking-tight">Security</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <h3 className="font-semibold text-sm mb-1">{vault?.mnemonic ? 'Secret Recovery Phrase' : 'Private Key'}</h3>
          <p className="text-xs text-gray-400 mb-4">Your backup key is the only way to recover assets. Never share it.</p>
          
          {!revealSeed ? (
            <button onClick={() => setRevealSeed(true)} className="w-full py-2.5 rounded-xl bg-white/10 text-white font-semibold flex items-center justify-center gap-2 hover:bg-white/15 transition">
              <Eye size={14} /> Reveal Private Key
            </button>
          ) : (
            <div className="space-y-4">
               {vault?.mnemonic && (
                 <div>
                   <div className="text-xs text-gray-500 mb-2 font-bold uppercase tracking-wider">Secret Recovery Phrase</div>
                   <div className="grid grid-cols-3 gap-2">
                     {vault.mnemonic.split(' ').map((word: string, i: number) => (
                       <div key={i} className="bg-black/40 border border-white/5 rounded-lg p-2 text-center relative">
                         <span className="absolute top-1 left-1.5 text-[8px] text-gray-600">{i + 1}</span>
                         <span className="text-xs font-mono text-[#00FFA3]">{word}</span>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
               
               <div>
                 <div className="text-xs text-gray-500 mb-2 mt-4 font-bold uppercase tracking-wider">Private Key (Current Account)</div>
                 <div className="bg-black/40 border border-white/5 rounded-lg p-3 text-center break-all text-xs font-mono text-[#00FFA3]">
                   {privateKey}
                 </div>
               </div>
               <button onClick={() => setRevealSeed(false)} className="w-full py-2.5 rounded-xl bg-white/10 text-white font-semibold flex items-center justify-center gap-2 hover:bg-white/15 transition">
                  <EyeOff size={14} /> Hide Key
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAddressBook = () => (
    <div className="flex flex-col flex-1 min-h-0 bg-[#000000] text-white">
      <div className="px-4 pt-6 pb-2 shrink-0 flex items-center gap-3 z-10 relative border-b border-white/5">
        <button onClick={() => setSettingsSubView('main')} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-xl font-bold tracking-tight">Address Book</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
        {(!addressBook || addressBook.length === 0) ? (
          <div className="text-center py-10 text-gray-500 text-xs">No contacts saved.</div>
        ) : (
          addressBook.map((entry: any, i: number) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-1">
              <div className="font-semibold text-xs text-white">{entry.name}</div>
              <div className="text-[10px] text-gray-500 font-mono break-all">{entry.address}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderConnectedApps = () => (
    <div className="flex flex-col flex-1 min-h-0 bg-[#000000] text-white">
      <div className="px-4 pt-6 pb-2 shrink-0 flex items-center gap-3 z-10 relative border-b border-white/5">
        <button onClick={() => setSettingsSubView('main')} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-xl font-bold tracking-tight">Connected Sessions</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
        {(!connectedApps || connectedApps.length === 0) ? (
          <div className="text-center py-10 text-gray-500 text-xs">No apps connected.</div>
        ) : (
          connectedApps.map((app: any, i: number) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center">
              <div>
                <div className="font-semibold text-[#00FFA3] text-xs">{app.domain}</div>
                <div className="text-[10px] text-gray-500 mt-0.5">{app.description}</div>
              </div>
              <button onClick={() => disconnectApp(i)} className="px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-[10px] font-semibold hover:bg-red-500/20 transition">
                Disconnect
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderAccounts = () => (
    <div className="flex flex-col flex-1 min-h-0 bg-[#000000] text-white">
      <div className="px-4 pt-6 pb-2 shrink-0 flex items-center gap-3 z-10 relative border-b border-white/5">
        <button onClick={() => setSettingsSubView('main')} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-xl font-bold tracking-tight">Accounts</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col items-center gap-4">
           <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#00FFA3] to-[#0A84FF] flex items-center justify-center font-bold text-lg text-black">
             {(accountNames[activeAccountIndex] || `Account 1`).substring(0,2).toUpperCase()}
           </div>
           <h2 className="text-base font-bold">{accountNames[activeAccountIndex] || `Account 1`}</h2>
           <div className="px-3.5 py-1.5 bg-black/40 rounded-full font-mono text-[10px] text-gray-400 break-all border border-white/5 text-center">
             {address}
           </div>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <h3 className="font-semibold text-xs text-white mb-1">Private Key</h3>
          <p className="text-[10px] text-gray-500 mb-4">Export key to restore in other enclaves. Protect this value.</p>
          
          {!revealSeed ? (
            <button onClick={() => setRevealSeed(true)} className="w-full py-2.5 rounded-xl bg-white/10 text-white font-semibold flex items-center justify-center gap-2 hover:bg-white/15 transition">
              <Eye size={14} /> Reveal Private Key
            </button>
          ) : (
            <div className="space-y-4">
               <div className="bg-black/40 border border-white/5 rounded-lg p-3 text-center break-all text-xs font-mono text-[#00FFA3]">
                 {appState.privateKey}
               </div>
               <button onClick={() => setRevealSeed(false)} className="w-full py-2.5 rounded-xl bg-white/10 text-white font-semibold flex items-center justify-center gap-2 hover:bg-white/15 transition">
                  <EyeOff size={14} /> Hide Private Key
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderNetwork = () => (
    <div className="flex flex-col flex-1 min-h-0 bg-[#000000] text-white">
      <div className="px-4 pt-6 pb-2 shrink-0 flex items-center gap-3 z-10 relative border-b border-white/5">
        <button onClick={() => setSettingsSubView('main')} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-xl font-bold tracking-tight">Network</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="bg-white/5 border border-[#00FFA3]/30 rounded-2xl p-4 flex justify-between items-center hover:bg-white/10 transition-colors">
          <div>
            <div className="font-bold text-xs text-[#00FFA3]">Ritual Testnet</div>
            <div className="text-[10px] text-gray-500 mt-0.5">rpc.ritualfoundation.org</div>
          </div>
          <div className="w-3.5 h-3.5 rounded-full bg-[#00FFA3] flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[#000000]" />
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center opacity-50 cursor-not-allowed">
          <div>
            <div className="font-bold text-xs text-white">Ritual Mainnet</div>
            <div className="text-[10px] text-gray-500 mt-0.5">mainnet.ritualfoundation.org</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAI = () => (
    <div className="flex flex-col flex-1 min-h-0 bg-[#000000] text-white">
      <div className="px-4 pt-6 pb-2 shrink-0 flex items-center gap-3 z-10 relative border-b border-white/5">
        <button onClick={() => setSettingsSubView('main')} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-xl font-bold tracking-tight">AI Integrations</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
        
        {/* None */}
        <div 
          onClick={() => handleSaveProvider('none')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            activeProvider === 'none' 
              ? 'border-red-500/30 bg-red-500/5' 
              : 'border-white/10 bg-white/5 hover:bg-white/10'
          }`}
        >
          <div className="flex justify-between items-center mb-1">
            <span className="font-semibold text-xs">Disable AI Provider</span>
            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${activeProvider === 'none' ? 'border-red-500' : 'border-gray-500'}`}>
              {activeProvider === 'none' && <div className="w-1.5 h-1.5 rounded-full bg-red-500" />}
            </div>
          </div>
          <p className="text-[10px] text-gray-500 leading-normal">Turns off AI helper integrations. Will show "No AI provider configured." on queries.</p>
        </div>

        {/* Ritual */}
        <div 
          onClick={() => handleSaveProvider('ritual')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            activeProvider === 'ritual' 
              ? 'border-[#00FFA3]/30 bg-[#00FFA3]/5' 
              : 'border-white/10 bg-white/5 hover:bg-white/10'
          }`}
        >
          <div className="flex justify-between items-center mb-1">
            <span className="font-semibold text-xs text-[#00FFA3]">Ritual InferNet (Precompile)</span>
            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${activeProvider === 'ritual' ? 'border-[#00FFA3]' : 'border-gray-500'}`}>
              {activeProvider === 'ritual' && <div className="w-1.5 h-1.5 rounded-full bg-[#00FFA3]" />}
            </div>
          </div>
          <p className="text-[10px] text-gray-500 leading-normal">Queries execute natively on-chain via Ritual precompile address 0x0802. Requires gas fees.</p>
        </div>

        {/* OpenAI */}
        <div 
          className={`p-4 rounded-2xl border transition-all ${
            activeProvider === 'openai' 
              ? 'border-blue-500/30 bg-blue-500/5' 
              : 'border-white/10 bg-white/5 hover:bg-white/10'
          }`}
        >
          <div onClick={() => handleSaveProvider('openai')} className="flex justify-between items-center mb-1 cursor-pointer">
            <span className="font-semibold text-xs">OpenAI (External GPT)</span>
            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${activeProvider === 'openai' ? 'border-blue-500' : 'border-gray-500'}`}>
              {activeProvider === 'openai' && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
            </div>
          </div>
          <p className="text-[10px] text-gray-500 leading-normal mb-3">Uses OpenAI public chat completions endpoint. High speed, API key needed.</p>
          
          {activeProvider === 'openai' && (
            <div className="space-y-3 pt-2 border-t border-white/5">
              <div>
                <label className="block text-[9px] uppercase text-gray-400 mb-1">API Key</label>
                <input 
                  type="password" 
                  value={openAiKey}
                  onChange={(e) => handleSaveOpenAiKey(e.target.value)}
                  placeholder="sk-..." 
                  className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase text-gray-400 mb-1">Model Name</label>
                <input 
                  type="text" 
                  value={openAiModel}
                  onChange={(e) => handleSaveOpenAiModel(e.target.value)}
                  placeholder="gpt-4o-mini" 
                  className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Ollama */}
        <div 
          className={`p-4 rounded-2xl border transition-all ${
            activeProvider === 'ollama' 
              ? 'border-purple-500/30 bg-purple-500/5' 
              : 'border-white/10 bg-white/5 hover:bg-white/10'
          }`}
        >
          <div onClick={() => handleSaveProvider('ollama')} className="flex justify-between items-center mb-1 cursor-pointer">
            <span className="font-semibold text-xs">Ollama (Local LLM)</span>
            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${activeProvider === 'ollama' ? 'border-purple-500' : 'border-gray-500'}`}>
              {activeProvider === 'ollama' && <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />}
            </div>
          </div>
          <p className="text-[10px] text-gray-500 leading-normal mb-3">Runs models locally on your system using Ollama. 100% private, free, no keys.</p>
          
          {activeProvider === 'ollama' && (
            <div className="space-y-3 pt-2 border-t border-white/5">
              <div>
                <label className="block text-[9px] uppercase text-gray-400 mb-1">Ollama Host URL</label>
                <input 
                  type="text" 
                  value={ollamaUrl}
                  onChange={(e) => handleSaveOllamaUrl(e.target.value)}
                  placeholder="http://localhost:11434" 
                  className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase text-gray-400 mb-1">Model Name</label>
                <input 
                  type="text" 
                  value={ollamaModel}
                  onChange={(e) => handleSaveOllamaModel(e.target.value)}
                  placeholder="llama3" 
                  className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full relative z-20 bg-[#000000]">
      {settingsSubView === 'main' && renderMainMenu()}
      {settingsSubView === 'about' && renderAbout()}
      {settingsSubView === 'security' && renderSecurity()}
      {settingsSubView === 'accounts' && renderAccounts()}
      {settingsSubView === 'addressBook' && renderAddressBook()}
      {settingsSubView === 'connectedApps' && renderConnectedApps()}
      {settingsSubView === 'network' && renderNetwork()}
      {settingsSubView === 'ai' && renderAI()}
      {!['main', 'about', 'security', 'accounts', 'addressBook', 'connectedApps', 'network', 'ai'].includes(settingsSubView) && (
        <div className="flex flex-col flex-1 min-h-0 bg-[#000000] text-white">
           <div className="px-4 pt-6 pb-2 shrink-0 flex items-center gap-3 z-10 relative">
            <button onClick={() => setSettingsSubView('main')} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft size={16} />
            </button>
            <h1 className="text-xl font-bold tracking-tight capitalize">{settingsSubView}</h1>
          </div>
          <div className="flex-1 flex items-center justify-center text-gray-500 text-xs">
            Feature in development
          </div>
        </div>
      )}
    </div>
  );
}

const SettingsItem = ({ icon, title, subtitle, onClick }: any) => (
  <div onClick={onClick} className="bg-transparent p-4 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors">
    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-300 border border-white/5 shrink-0">
      {icon}
    </div>
    <div className="flex-1">
      <div className="font-semibold text-xs text-white">{title}</div>
      {subtitle && <div className="text-[10px] text-gray-500 mt-0.5">{subtitle}</div>}
    </div>
    <ChevronRight size={16} className="text-gray-600 shrink-0" />
  </div>
);
