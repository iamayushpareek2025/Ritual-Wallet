import { ActivityScreen } from './components/activity/ActivityScreen';
import { SettingsScreen } from './components/settings/SettingsScreen';
import { useState, useEffect, useRef } from 'react';

import CryptoJS from 'crypto-js';
import { USDC, STAKING } from './contracts';
import { 
  ArrowDownToLine, ArrowUpRight, ArrowRightLeft, Plus, Check, ArrowLeft, 
  Menu, Copy, Activity, Image as ImageIcon, ShieldCheck,
  ChevronDown, Sparkles, Send as SendIcon, PieChart,
  ChevronRight, Wallet, Lock, Globe, BookOpen, TrendingUp, Info, ExternalLink, Code, User, Sliders, Zap
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './index.css';
import { useUIStore } from './stores/useUIStore';
import { useAIStore, setGlobalExecuteAiCommand } from './stores/useAIStore';
import { useWalletStore } from './stores/useWalletStore';
import { AIEngine, getLivePortfolioContext } from './ai';
import { AppShell } from './components/layout/AppShell';
import { HomeDashboard } from './components/wallet/HomeDashboard';
import { PortfolioScreen } from './components/portfolio/PortfolioScreen';
import { SendFlow } from './components/wallet/SendFlow';
import { WalletService } from './services/wallet.service';
import { BalanceService } from './services/balance.service';
import { TransactionService } from './services/transaction.service';
import { PortfolioService } from './services/portfolio.service';
import { TokenService } from './services/token.service';
import { NetworkService } from './services/network.service';
import { SwapScreen } from './components/swap/SwapScreen';
import { BridgeScreen } from './components/bridge/BridgeScreen';
import { AIWorkspace } from './components/ai/AIWorkspace';
import { DiscoverScreen } from './components/social/DiscoverScreen';
import { ReceiveScreen } from './components/wallet/ReceiveScreen';

// Global config removed for dynamic rpcUrl

// Storage Wrapper
const storage = {
  get: (keys: string[], callback: (result: any) => void) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(keys, callback);
    } else {
      const result: any = {};
      keys.forEach(k => {
        const val = localStorage.getItem(k);
        if (val) {
          try { result[k] = JSON.parse(val); } catch (e) { result[k] = val; }
        }
      });
      callback(result);
    }
  },
  set: (obj: any, callback?: () => void) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      if (callback) chrome.storage.local.set(obj, callback);
      else chrome.storage.local.set(obj);
    } else {
      Object.keys(obj).forEach(k => {
        localStorage.setItem(k, typeof obj[k] === 'string' ? obj[k] : JSON.stringify(obj[k]));
      });
      if (callback) callback();
    }
  },
  remove: (keys: string[], callback?: () => void) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      if (callback) chrome.storage.local.remove(keys, callback);
      else chrome.storage.local.remove(keys);
    } else {
      keys.forEach(k => localStorage.removeItem(k));
      if (callback) callback();
    }
  },
  clear: (callback?: () => void) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      if (callback) chrome.storage.local.clear(callback);
      else chrome.storage.local.clear();
    } else {
      localStorage.clear();
      if (callback) callback();
    }
  }
};

type TxRecord = { hash: string; to: string; amount: string; date: number; type: string; };
type Vault = { mnemonic: string | null; accounts: string[]; };
type AuthState = 'loading' | 'welcome' | 'unlock' | 'setup_password' | 'show_seed' | 'import_seed' | 'unlocked';
type TabState = 'tokens' | 'nfts' | 'swap' | 'health' | 'activity' | 'ai';
type SettingsView = 'main'|'accounts'|'security'|'networks'|'about'|'profile'|'preferences'|'addressBook'|'connectedApps';
type AgentRule = { id: string; label: string; condition: 'gas_below'; threshold: string; action: 'send'; to: string; amount: string; enabled: boolean; lastTriggered?: number; };

type AddressBookEntry = { name: string; address: string; };
type ConnectedApp = { domain: string; description: string; connectedAt: number; };

// Gas estimate helper - returns estimated gas cost in RITUAL as string
const estimateGasCost = async (isMainnet: boolean): Promise<string> => {
  try {
    const est = await TransactionService.estimateNativeSend(isMainnet, '0x0000000000000000000000000000000000000000', '0');
    return est.totalCostEther;
  } catch {
    return '0.0001';
  }
};

function App() {
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [passwordInput, setPasswordInput] = useState("");
  const [authImportInput, setAuthImportInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [tempVault, setTempVault] = useState<Vault | null>(null);
  const [activePassword, setActivePassword] = useState("");
  
  const [vault, setVault] = useState<Vault | null>(null);
  const [activeAccountIndex, setActiveAccountIndex] = useState(0);
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("0.0");
  
  const { 
    activeTab, setActiveTab, 
    currentView, setCurrentView, 
    loading, setLoading, 
    toastMessage: toastMsg, triggerToast 
  } = useUIStore();

  const { setWallet: setGlobalWallet, setBalances: setGlobalBalances, setNetwork: setGlobalNetwork } = useWalletStore();
  
  const [copied, setCopied] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  
  const [txHistory, setTxHistory] = useState<TxRecord[]>([]);
  const [nfts, setNfts] = useState<{name: string, url: string}[]>([]);
  const [sendTo, setSendTo] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [sendToken, setSendToken] = useState<'RITUAL'|'USDC'>('RITUAL');
  const [_sendError, setSendError] = useState("");
  const [revealSeed, setRevealSeed] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [swapAmount, setSwapAmount] = useState("");
  
  // AI Agent State
  const [aiInput, setAiInput] = useState("");
  const chatHistory = useAIStore(state => state.chatHistory);
  const setChatHistory = useAIStore(state => state.setChatHistory);
  const isAiLoading = useAIStore(state => state.isAiLoading);
  const setIsAiLoading = (loading: boolean) => useAIStore.getState().setLoading(loading);
  const [showAiFeePopup, setShowAiFeePopup] = useState(false);
  const [pendingAiPrompt, setPendingAiPrompt] = useState("");
  const [showMintFeePopup, setShowMintFeePopup] = useState(false);
  const [pendingMintUrl, setPendingMintUrl] = useState("");

  const [isRevoking, setIsRevoking] = useState(false);
  const [approvalsRevoked, setApprovalsRevoked] = useState(false);

  // Simulated Balances for Demo
  const [usdcBalance, setUsdcBalance] = useState("0.00");
  const [_stakedRitual, setStakedRitual] = useState("0.0000");
  const [stakedUsdc, setStakedUsdc] = useState("0.00");

  useEffect(() => {
    if (privateKey && address) {
      setGlobalWallet(privateKey, address);
    } else {
      useWalletStore.getState().clearWallet();
    }
  }, [privateKey, address, setGlobalWallet]);

  useEffect(() => {
    setGlobalBalances(balance, usdcBalance, stakedUsdc);
  }, [balance, usdcBalance, stakedUsdc, setGlobalBalances]);



  const [deployedUsdcAddress, setDeployedUsdcAddress] = useState("");
  const [deployedStakingAddress, setDeployedStakingAddress] = useState("");

  const [stakeInput, setStakeInput] = useState("");
  const [swapDirection, setSwapDirection] = useState<'RITUAL_TO_USDC' | 'USDC_TO_RITUAL'>('RITUAL_TO_USDC');

  // Send Fee Confirmation Popup State
  const [showSendFeePopup, setShowSendFeePopup] = useState(false);
  const [estimatedSendFee, setEstimatedSendFee] = useState("0.0001");
  const [estimatedAiFee, setEstimatedAiFee] = useState("0.001");

  // Settings State
  const [settingsSubView, setSettingsSubView] = useState<SettingsView>('main');
  const [editingAccountIndex, setEditingAccountIndex] = useState<number | null>(null);
  const [accountSection, setAccountSection] = useState<'list'|'edit'>('list');
  const [editAddressBookIndex, setEditAddressBookIndex] = useState<number | null>(null);
  const [addressBookValidationError, setAddressBookValidationError] = useState("");
  const [displayLanguage, setDisplayLanguage] = useState("English");
  const [preferredCurrency, setPreferredCurrency] = useState("United States Dollar");
  const [preferredExplorer, setPreferredExplorer] = useState("Ritual Explorer");
  const [username, setUsername] = useState("@starayush");
  const [profileImage, setProfileImage] = useState("https://api.dicebear.com/7.x/bottts/svg?seed=Ayush");
  const [editingProfileImage, setEditingProfileImage] = useState(false);
  const [profileImageInput, setProfileImageInput] = useState(profileImage);
  const [editingUsername, setEditingUsername] = useState(false);
  const [usernameInput, setUsernameInput] = useState(username);
  const [editingExecutor, setEditingExecutor] = useState(false);
  const [executorInput, setExecutorInput] = useState<string | null>(typeof window !== 'undefined' ? (localStorage.getItem('ritual_executor_address') || '') : '');
  const [editingAccountImageIndex, setEditingAccountImageIndex] = useState<number | null>(null);
  const [accountImageInput, setAccountImageInput] = useState("");
  const [authFactors, _setAuthFactors] = useState(1);
  const [profilePrivacy, setProfilePrivacy] = useState("Public");
  const [autoLockTimer, setAutoLockTimer] = useState(15);
  const [showShortcuts, setShowShortcuts] = useState(true);
  const [shareAnalytics, setShareAnalytics] = useState(true);
  const [securitySection, setSecuritySection] = useState<'menu'|'change_password'|'autolock'|'recovery'>('menu');
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountNames, setAccountNames] = useState<Record<number, string>>({});
  const [accountImages, setAccountImages] = useState<Record<number, string>>({});
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showImportAccountModal, setShowImportAccountModal] = useState(false);

  useEffect(() => {
    useWalletStore.getState().setVaultData(vault, activeAccountIndex, accountNames, accountImages);
  }, [vault, activeAccountIndex, accountNames, accountImages]);
  const [importAccountInput, setImportAccountInput] = useState("");
  const [showPrivateKeyModal, setShowPrivateKeyModal] = useState(false);
  const [privateKeyConfirmInput, setPrivateKeyConfirmInput] = useState("");
  const [privateKeyVerified, setPrivateKeyVerified] = useState(false);
  const [confirmRemoveAccountIndex, setConfirmRemoveAccountIndex] = useState<number | null>(null);
  const [addressBook, setAddressBook] = useState<AddressBookEntry[]>([]);
  const [connectedApps, setConnectedApps] = useState<ConnectedApp[]>([]);
  const [showAddressBookModal, setShowAddressBookModal] = useState(false);
  const [addressBookName, setAddressBookName] = useState("");
  const [addressBookAddress, setAddressBookAddress] = useState("");
  const [showAppModal, setShowAppModal] = useState(false);
  const [appDomain, setAppDomain] = useState("");
  const [appDescription, setAppDescription] = useState("");
  const [lastActive, setLastActive] = useState(Date.now());
  const [showConnectPrompt, setShowConnectPrompt] = useState(false);
  const [pendingConnectRequest, setPendingConnectRequest] = useState<{requestId:string; origin:string; timestamp:number} | null>(null);
  const [isMainnet, setIsMainnet] = useState(false);
  const [networkBlock, setNetworkBlock] = useState<number | null>(null);
  // Voice + Agent
  const [isListening, setIsListening] = useState(false);
  const [agentRules, setAgentRules] = useState<AgentRule[]>([]);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [ruleLabel, setRuleLabel] = useState('');
  const [ruleGasThreshold, setRuleGasThreshold] = useState('0.0001');
  const [ruleSendTo, setRuleSendTo] = useState('');
  const [ruleSendAmount, setRuleSendAmount] = useState('0.1');
  const [_recipientCheck, setRecipientCheck] = useState<{isContract: boolean} | null>(null);
  const [_isCheckingRecipient, setIsCheckingRecipient] = useState(false);
  // Note: rpc.ritualfoundation.org is the official Testnet. Mainnet is currently a placeholder.
  const rpcUrl = isMainnet ? "https://mainnet.ritualfoundation.org" : "https://rpc.ritualfoundation.org";

  const menuRef = useRef<HTMLDivElement>(null);
  const balanceRef = useRef<string>("0.0");
  const recognitionRef = useRef<any>(null);

  const showToast = (msg: string) => {
    triggerToast(msg);
  };

  // — Voice input helpers —
  const speakText = (text: string) => {
    try {
      window.speechSynthesis.cancel();
      const clean = text.replace(/[*#`_\[\]()|>!]/g, '').substring(0, 220);
      const utt = new SpeechSynthesisUtterance(clean);
      utt.rate = 1.05; utt.pitch = 1;
      window.speechSynthesis.speak(utt);
    } catch {}
  };

  const startVoiceInput = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { showToast('Voice not supported'); return; }
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }
    const rec = new SR();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e: any) => {
      const t = e.results[0][0].transcript;
      setAiInput(t);
      setIsListening(false);
    };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    recognitionRef.current = rec;
    rec.start();
    setIsListening(true);
  };

  useEffect(() => {
    storage.get(['ritual_wallet_encrypted', 'ritual_nfts', 'ritual_txs', 'ritual_names', 'ritual_images', 'ritual_mainnet', 'ritual_temp_pass', 'ritual_last_active', 'ritual_chat_history', 'ritual_profile_image', 'ritual_username', 'ritual_profile_privacy', 'ritual_executor_address', 'ritual_address_book', 'ritual_connected_apps', 'ritual_display_language', 'ritual_preferred_currency', 'ritual_preferred_explorer', 'ritual_shortcuts', 'ritual_analytics', 'ritual_autolock', 'ritual_usdc', 'ritual_staked_ritual', 'ritual_staked_usdc', 'ritual_usdc_contract', 'ritual_staking_contract', 'ritual_agent_rules'], (result: any) => {
      let shouldAutoUnlock = false;
      if (result.ritual_temp_pass && result.ritual_last_active) {
        if (Date.now() - result.ritual_last_active < 10 * 60 * 1000) {
          shouldAutoUnlock = true;
          storage.set({ ritual_last_active: Date.now() });
        } else {
          storage.remove(['ritual_temp_pass', 'ritual_last_active']);
        }
      }

      if (result.ritual_wallet_encrypted) {
        if (shouldAutoUnlock) {
          try {
            const bytes = CryptoJS.AES.decrypt(result.ritual_wallet_encrypted, result.ritual_temp_pass);
            const decryptedStr = bytes.toString(CryptoJS.enc.Utf8);
            if (!decryptedStr) throw new Error('Empty decryption');
            let parsedVault: Vault;
            try { parsedVault = JSON.parse(decryptedStr); } 
            catch { parsedVault = { mnemonic: null, accounts: [decryptedStr] }; }
            // Validate the private key before proceeding
            const firstKey = parsedVault.accounts[0];
            if (!firstKey || !/^0x[0-9a-fA-F]{64}$/.test(firstKey)) throw new Error('Invalid key in vault');
            setActivePassword(result.ritual_temp_pass);
            setVault(parsedVault);
            setupWallet(parsedVault.accounts[0]);
            setActiveAccountIndex(0);
            setAuthState('unlocked');
          } catch (e) { 
            storage.remove(['ritual_temp_pass', 'ritual_last_active']);
            setAuthState('unlock'); 
          }
        } else {
          setAuthState('unlock');
        }
      } else {
        setAuthState('welcome');
      }

      if (result.ritual_txs) {
        setTxHistory(result.ritual_txs);
        useWalletStore.getState().setTransactions(result.ritual_txs as any);
      }
      if (result.ritual_nfts) setNfts(result.ritual_nfts);
      else setNfts([]);
      
      if (result.ritual_names) setAccountNames(result.ritual_names);
      if (result.ritual_images) setAccountImages(result.ritual_images);
      if (result.ritual_mainnet !== undefined) setIsMainnet(result.ritual_mainnet);
      if (result.ritual_chat_history) setChatHistory(result.ritual_chat_history);
      if (result.ritual_profile_image) setProfileImage(result.ritual_profile_image);
      if (result.ritual_username) setUsername(result.ritual_username);
      if (result.ritual_profile_privacy) setProfilePrivacy(result.ritual_profile_privacy);
      if (result.ritual_executor_address) localStorage.setItem('ritual_executor_address', result.ritual_executor_address);
      if (result.ritual_address_book) setAddressBook(result.ritual_address_book);
      if (result.ritual_connected_apps) setConnectedApps(result.ritual_connected_apps);
      
      if (result.ritual_usdc) setUsdcBalance(result.ritual_usdc);
      if (result.ritual_staked_ritual) setStakedRitual(result.ritual_staked_ritual);
      if (result.ritual_staked_usdc) setStakedUsdc(result.ritual_staked_usdc);

      if (result.ritual_usdc_contract) setDeployedUsdcAddress(result.ritual_usdc_contract);
      if (result.ritual_staking_contract) setDeployedStakingAddress(result.ritual_staking_contract);
      // Load agent rules
      if (result.ritual_agent_rules) setAgentRules(result.ritual_agent_rules);

      if (result.ritual_pending_connect_request) {
        setPendingConnectRequest(result.ritual_pending_connect_request);
        setShowConnectPrompt(true);
      }
      if (result.ritual_display_language) setDisplayLanguage(result.ritual_display_language);
      if (result.ritual_preferred_currency) setPreferredCurrency(result.ritual_preferred_currency);
      if (result.ritual_preferred_explorer) setPreferredExplorer(result.ritual_preferred_explorer);
      if (result.ritual_shortcuts !== undefined) setShowShortcuts(result.ritual_shortcuts);
      if (result.ritual_analytics !== undefined) setShareAnalytics(result.ritual_analytics);
      if (result.ritual_autolock !== undefined) setAutoLockTimer(result.ritual_autolock);
      if (result.ritual_last_active) setLastActive(result.ritual_last_active);
    });

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowAccountMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

    // Polling for incoming transactions
  useEffect(() => {
    let interval: any;
    if (authState === 'unlocked' && address) {
      interval = setInterval(async () => {
        try {
          const currentBalStr = await BalanceService.getNativeBalance(address, isMainnet);
          if (balanceRef.current !== "0" && Number(currentBalStr) > Number(balanceRef.current)) {
            triggerToast("You received RITUAL!");
            const diff = Number(currentBalStr) - Number(balanceRef.current);
            const newTx = {
              hash: `incoming-${Date.now()}`,
              to: address,
              amount: diff.toFixed(6),
              date: Date.now(),
              type: 'receive'
            };
            const updatedHist = [newTx, ...txHistory];
            setTxHistory(updatedHist);
            storage.set({ ritual_txs: updatedHist });
          }
          balanceRef.current = currentBalStr;
          setBalance(currentBalStr);
        } catch {}
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [authState, address, txHistory, isMainnet]);

    // Fetch live network block number for health tab
  useEffect(() => {
    if (authState !== 'unlocked') return;
    let mounted = true;
    const fetchBlock = async () => {
      try {
        const block = await NetworkService.getBlockNumber(isMainnet);
        if (mounted) setNetworkBlock(block);
      } catch {}
    };
    fetchBlock();
    const blockInterval = setInterval(fetchBlock, 15000);
    return () => { mounted = false; clearInterval(blockInterval); };
  }, [authState, isMainnet]);

    // — Gas-Conditional Autonomous Agent polling (every 30s) —
  useEffect(() => {
    if (authState !== 'unlocked' || agentRules.length === 0 || !privateKey) return;
    const checkRules = async () => {
      for (const rule of agentRules) {
        if (!rule.enabled) continue;
        if (rule.lastTriggered && Date.now() - rule.lastTriggered < 60_000) continue;
        try {
          if (rule.condition === 'gas_below') {
            const est = await TransactionService.estimateNativeSend(isMainnet, rule.to, rule.amount);
            const gasCostEther = parseFloat(est.totalCostEther);
            if (gasCostEther < parseFloat(rule.threshold)) {
              if (rule.action === 'send' && WalletService.isValidAddress(rule.to) && parseFloat(rule.amount) > 0) {
                showToast(`⚡ Agent: "${rule.label}" executing...`);
                const result = await TransactionService.sendNative(privateKey, rule.to, rule.amount, isMainnet);
                if (!result.success) throw new Error(result.error);
                const tx = { hash: result.hash || '' };
                const updated = agentRules.map(r => r.id === rule.id ? {...r, lastTriggered: Date.now()} : r);
                setAgentRules(updated);
                storage.set({ ritual_agent_rules: updated });
                const hist = [{ hash: tx.hash, to: rule.to, amount: rule.amount, date: Date.now(), type: 'send' }, ...txHistory];
                setTxHistory(hist as any);
                storage.set({ ritual_txs: hist });
                showToast(`Success! Tx: ${tx.hash.slice(0, 10)}...`);
              }
            }
          }
        } catch (err) {
          console.error("Agent execution error:", err);
        }
      }
    };
    const interval = setInterval(checkRules, 30000);
    return () => clearInterval(interval);
  }, [authState, agentRules, privateKey, isMainnet, txHistory]);

    // — Address Safety Check (debounced on sendTo change) —
  useEffect(() => {
    if (!sendTo || !WalletService.isValidAddress(sendTo)) { setRecipientCheck(null); return; }
    setIsCheckingRecipient(true);
    const timer = setTimeout(async () => {
      try {
        const isContract = await WalletService.isContractAddress(sendTo, isMainnet);
        setRecipientCheck({ isContract });
      } catch {} finally { setIsCheckingRecipient(false); }
    }, 800);
    return () => clearTimeout(timer);
  }, [sendTo, isMainnet]);

  const handleUnlock = () => {
    setAuthError("");
    setLoading(true);
    storage.get(['ritual_wallet_encrypted'], (result: any) => {
      try {
        const bytes = CryptoJS.AES.decrypt(result.ritual_wallet_encrypted, passwordInput);
        const decryptedStr = bytes.toString(CryptoJS.enc.Utf8);
        if (!decryptedStr) throw new Error("Invalid password");
        let parsedVault: Vault;
        try { parsedVault = JSON.parse(decryptedStr); } 
        catch { parsedVault = { mnemonic: null, accounts: [decryptedStr] }; }
        setActivePassword(passwordInput);
        setVault(parsedVault);
        setupWallet(parsedVault.accounts[0]);
        setActiveAccountIndex(0);
        setAuthState('unlocked');
        storage.set({ ritual_temp_pass: passwordInput, ritual_last_active: Date.now() });
        setPasswordInput("");
      } catch (e) {
        setAuthError("Incorrect password");
      } finally {
        setLoading(false);
      }
    });
  };

  const lockWallet = () => {
    setAuthState('unlock');
    setPrivateKey(null);
    setAddress(null);
    setBalance('0.0');
    setActivePassword('');
    setVault(null);
    setCurrentView('main');
    storage.remove(['ritual_temp_pass', 'ritual_last_active', 'ritual_active_address']);
    showToast('Wallet locked due to inactivity');
  };

  const refreshLastActive = () => {
    const now = Date.now();
    setLastActive(now);
    storage.set({ ritual_last_active: now });
  };

    const setupWallet = async (pk: string) => {
    setLoading(true);
    try {
      if (!pk || !/^0x[0-9a-fA-F]{64}$/.test(pk)) {
        throw new Error(`Invalid private key format: ${pk?.slice(0, 10)}`);
      }
      const { address: walletAddress } = WalletService.importFromPrivateKey(pk);
      setPrivateKey(pk);
      setAddress(walletAddress);
      storage.set({ ritual_active_address: walletAddress });
      
      const { native, usdc, staked } = await BalanceService.getAllBalances(walletAddress, deployedUsdcAddress, deployedStakingAddress, isMainnet);
      balanceRef.current = native;
      setBalance(native);
      setUsdcBalance(usdc);
      setStakedUsdc(staked);
      storage.set({ ritual_usdc: usdc, ritual_staked_usdc: staked });
    } catch (e) {
      console.error('setupWallet error:', e);
      storage.remove(['ritual_temp_pass', 'ritual_last_active', 'ritual_active_address']);
    }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
      const handleStorageChange = (changes: any, area: string) => {
        if (area !== 'local') return;
        if (changes.ritual_connected_apps) {
          setConnectedApps(changes.ritual_connected_apps.newValue || []);
        }
        if (changes.ritual_active_address && changes.ritual_active_address.newValue) {
          setAddress(changes.ritual_active_address.newValue);
        }
        if (changes.ritual_pending_connect_request) {
          const request = changes.ritual_pending_connect_request.newValue;
          if (request) {
            setPendingConnectRequest(request);
            setShowConnectPrompt(true);
          } else {
            setPendingConnectRequest(null);
            setShowConnectPrompt(false);
          }
        }
      };
      chrome.storage.onChanged.addListener(handleStorageChange);
      return () => chrome.storage.onChanged.removeListener(handleStorageChange);
    }
  }, []);

  useEffect(() => {
    if (authState !== 'unlocked') return;
    if (autoLockTimer <= 0) return;

    const checkInactivity = () => {
      if (Date.now() - lastActive > autoLockTimer * 60 * 1000) {
        lockWallet();
      }
    };

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart'];
    activityEvents.forEach(event => window.addEventListener(event, refreshLastActive));
    const interval = setInterval(checkInactivity, 10000);

    return () => {
      activityEvents.forEach(event => window.removeEventListener(event, refreshLastActive));
      clearInterval(interval);
    };
  }, [authState, autoLockTimer, lastActive]);

    const handleCreateWalletStart = () => {
    const randomWallet = WalletService.createRandomWallet();
    setTempVault({ mnemonic: randomWallet.mnemonic, accounts: [randomWallet.privateKey] });
    setAuthState('show_seed');
  };

    const handleImportSubmit = () => {
    setAuthError("");
    const input = authImportInput.trim();
    if (!input) { setAuthError("Cannot be empty"); return; }
    try {
      if (input.split(" ").length === 12 || input.split(" ").length === 24) {
        const wallet = WalletService.importFromMnemonic(input);
        setTempVault({ mnemonic: input, accounts: [wallet.privateKey] });
      } else {
        const wallet = WalletService.importFromPrivateKey(input);
        setTempVault({ mnemonic: null, accounts: [wallet.privateKey] });
      }
      setAuthState('setup_password');
    } catch (e) { setAuthError("Invalid Phrase or Key"); }
  };

  const handleSetupPasswordSubmit = () => {
    if (passwordInput.length < 8) { setAuthError("Minimum 8 chars"); return; }
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(tempVault), passwordInput).toString();
    storage.set({ ritual_wallet_encrypted: encrypted }, () => {
      setActivePassword(passwordInput);
      setVault(tempVault);
      setupWallet(tempVault!.accounts[0]);
      setActiveAccountIndex(0);
      setAuthState('unlocked');
      storage.set({ ritual_temp_pass: passwordInput, ritual_last_active: Date.now() });
      setPasswordInput("");
      setTempVault(null);
    });
  };

  const switchAccount = (index: number) => {
    if (!vault || !vault.accounts[index]) return;
    setActiveAccountIndex(index);
    setupWallet(vault.accounts[index]);
  };

  useEffect(() => {
    useWalletStore.getState().setSwitchAccountCallback(switchAccount);
  }, [vault]);



  useEffect(() => {
    setGlobalExecuteAiCommand(handleAiCommand);
    return () => {
      setGlobalExecuteAiCommand(undefined);
    };
  }, [chatHistory, aiInput, isMainnet, balance, address, privateKey, txHistory]);

  // Check pre-filled inputs for send screen
  useEffect(() => {
    if (currentView === 'send') {
      const prefilledTo = localStorage.getItem('ritual_prefilled_send_to');
      const prefilledAmount = localStorage.getItem('ritual_prefilled_send_amount');
      const prefilledToken = localStorage.getItem('ritual_prefilled_send_token');
      if (prefilledTo) {
        setSendTo(prefilledTo);
        localStorage.removeItem('ritual_prefilled_send_to');
      }
      if (prefilledAmount) {
        setSendAmount(prefilledAmount);
        localStorage.removeItem('ritual_prefilled_send_amount');
      }
      if (prefilledToken) {
        setSendToken(prefilledToken as any);
        localStorage.removeItem('ritual_prefilled_send_token');
      }
    }
  }, [currentView]);

    const addAccount = () => {
    if (!vault || !vault.mnemonic) {
      showToast("Cannot derive accounts from a private key-only wallet. Import a seed phrase to add accounts.");
      return;
    }
    const nextIndex = vault.accounts.length;
    const derived = WalletService.deriveAccount(vault.mnemonic, nextIndex);
    const newVault = { ...vault, accounts: [...vault.accounts, derived.privateKey] };
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(newVault), activePassword).toString();
    storage.set({ ritual_wallet_encrypted: encrypted }, () => {
      setVault(newVault);
      switchAccount(nextIndex);
    });
  };

  const importAccount = () => {
    if (!vault) return;
    setImportAccountInput("");
    setShowImportAccountModal(true);
  };

  const validateAddressBookEntry = (name: string, address: string) => {
    if (!name.trim()) return 'Name cannot be empty.';
    if (!address.trim()) return 'Address cannot be empty.';
    if (!WalletService.isValidAddress(address.trim())) return 'Invalid Ethereum address.';
    return '';
  };

    const handleDeployContracts = async () => {
    if (!privateKey) return;
    setLoading(true);
    showToast("Deploying MockUSDC... Please wait.");
    try {
      const usdcAddr = await TokenService.deployMockUsdc(privateKey, isMainnet);
      if (!usdcAddr) throw new Error("MockUSDC deployment failed");
      
      showToast("Deploying Staking... Please wait.");
      const stakingAddr = await TokenService.deployMockStaking(privateKey, usdcAddr, isMainnet);
      if (!stakingAddr) throw new Error("Staking deployment failed");

      setDeployedUsdcAddress(usdcAddr);
      setDeployedStakingAddress(stakingAddr);
      storage.set({ 
        ritual_usdc_contract: usdcAddr,
        ritual_staking_contract: stakingAddr 
      });

      // Add to activity
      const newHistory = [
        { hash: '0x...', to: "Deploy Contracts", amount: "Gas", date: Date.now(), type: 'send' },
        ...txHistory
      ];
      setTxHistory(newHistory);
      storage.set({ ritual_txs: newHistory });

      showToast("Contracts Deployed Successfully!");
    } catch (e: any) {
      console.error(e);
      showToast("Deployment failed: " + (e.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const saveAddressBookEntry = () => {
    const validation = validateAddressBookEntry(addressBookName, addressBookAddress);
    if (validation) {
      setAddressBookValidationError(validation);
      return;
    }
    const cleanedAddress = WalletService.formatAddress(addressBookAddress.trim());
    const newEntry = { name: addressBookName.trim(), address: cleanedAddress };
    const updated = editAddressBookIndex !== null && editAddressBookIndex >= 0 && editAddressBookIndex < addressBook.length
      ? addressBook.map((entry, idx) => idx === editAddressBookIndex ? newEntry : entry)
      : [newEntry, ...addressBook];
    setAddressBook(updated);
    storage.set({ ritual_address_book: updated });
    setShowAddressBookModal(false);
    setEditAddressBookIndex(null);
    setAddressBookName("");
    setAddressBookAddress("");
    setAddressBookValidationError("");
    showToast(editAddressBookIndex !== null ? 'Contact updated' : 'Contact added');
  };

  const removeAddressBookEntry = (index: number) => {
    const updated = addressBook.filter((_, i) => i !== index);
    setAddressBook(updated);
    storage.set({ ritual_address_book: updated });
    showToast('Contact removed from Address Book');
  };

  const startEditingAddressBook = (index: number) => {
    const entry = addressBook[index];
    setEditAddressBookIndex(index);
    setAddressBookName(entry.name);
    setAddressBookAddress(entry.address);
    setAddressBookValidationError("");
    setShowAddressBookModal(true);
  };

  const openNewAddressBookModal = () => {
    setEditAddressBookIndex(null);
    setAddressBookName("");
    setAddressBookAddress("");
    setAddressBookValidationError("");
    setShowAddressBookModal(true);
  };

  const saveConnectedApp = () => {
    if (!appDomain.trim() || !appDescription.trim()) {
      showToast('Domain and description required');
      return;
    }
    const newApp = { domain: appDomain.trim(), description: appDescription.trim(), connectedAt: Date.now() };
    const updated = [newApp, ...connectedApps];
    setConnectedApps(updated);
    storage.set({ ritual_connected_apps: updated });
    setShowAppModal(false);
    setAppDomain("");
    setAppDescription("");
    showToast('Connected app saved');
  };

  const disconnectApp = (index: number) => {
    const updated = connectedApps.filter((_, i) => i !== index);
    setConnectedApps(updated);
    storage.set({ ritual_connected_apps: updated });
    showToast('App disconnected');
  };

  const handleSelectAddressBookContact = (entry: AddressBookEntry) => {
    setSendTo(entry.address);
    setCurrentView('send');
    showToast(`Prepared transfer to ${entry.name}`);
  };

  const confirmImportAccount = async () => {
    if (!vault) return;
    try {
      let formattedPk = importAccountInput.trim();
      if (!formattedPk.startsWith('0x')) formattedPk = '0x' + formattedPk;
      if (formattedPk.length !== 66) throw new Error('Invalid Private Key length');
      const walletInfo = WalletService.importFromPrivateKey(formattedPk);
      const newVault = { ...vault, accounts: [...vault.accounts, walletInfo.privateKey] };
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify(newVault), activePassword).toString();
      storage.set({ ritual_wallet_encrypted: encrypted }, () => {
        setVault(newVault);
        switchAccount(vault.accounts.length);
        setShowImportAccountModal(false);
        showToast('Account imported successfully.');
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Invalid Private Key.';
      showToast(msg);
    }
  };

  const confirmResetWallet = () => {
    storage.clear(() => {
      setPrivateKey(null);
      setAddress(null);
      setBalance('0.0');
      setActivePassword('');
      setVault(null);
      setTxHistory([]);
      setChatHistory([{role:'system',content:'You are Ritual AI...'}]);
      setAccountNames({});
      setAccountImages({});
      setNfts([]);
      setAuthState('welcome');
      setShowResetConfirm(false);
    });
  };

  const cancelResetWallet = () => {
    setShowResetConfirm(false);
  };

  const confirmRemoveAccount = () => {
    if (confirmRemoveAccountIndex === null || !vault) return;
    const newAccounts = vault.accounts.filter((_, i) => i !== confirmRemoveAccountIndex);
    const newVault = { ...vault, accounts: newAccounts };
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(newVault), activePassword).toString();
    storage.set({ ritual_wallet_encrypted: encrypted }, () => {
      setVault(newVault);
      setAccountSection('list');
      setEditingAccountIndex(null);
      setConfirmRemoveAccountIndex(null);
      switchAccount(0);
      showToast('Account removed successfully');
    });
  };

  const cancelRemoveAccount = () => {
    setConfirmRemoveAccountIndex(null);
  };

  const verifyPrivateKeyPassword = () => {
    if (privateKeyConfirmInput === activePassword) {
      setPrivateKeyVerified(true);
    } else {
      showToast('Incorrect password');
    }
  };

  const renderModals = () => (
    <>
      {showImportAccountModal && (
        <div className="flex-center" style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.7)',backdropFilter:'blur(8px)',zIndex:120}}>
          <div className="glass-panel" style={{width:'90%', maxWidth: 420}}>
            <h3 className="text-h2">Import Account</h3>
            <p className="text-muted" style={{fontSize:'0.9rem', marginBottom:12}}>Enter your private key to import a new account.</p>
            <input
              value={importAccountInput}
              onChange={e => setImportAccountInput(e.target.value)}
              placeholder="Private Key"
              className="input-field"
              style={{marginBottom: 12}}
            />
            <div className="flex-row" style={{gap: 8}}>
              <button className="outline-btn" style={{flex: 1}} onClick={() => setShowImportAccountModal(false)}>Cancel</button>
              <button className="primary-btn" style={{flex: 1}} onClick={confirmImportAccount}>Import</button>
            </div>
          </div>
        </div>
      )}

      {showAddressBookModal && (
        <div className="flex-center" style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.7)',backdropFilter:'blur(8px)',zIndex:120}}>
          <div className="glass-panel" style={{width:'90%', maxWidth: 460}}>
            <h3 className="text-h2">{editAddressBookIndex !== null ? 'Edit Contact' : 'Add Contact'}</h3>
            <p className="text-muted" style={{fontSize:'0.9rem', marginBottom:12}}>Keep trusted recipients handy for faster sends.</p>
            <input
              value={addressBookName}
              onChange={e => setAddressBookName(e.target.value)}
              placeholder="Contact Name"
              className="input-field"
              style={{marginBottom: 12}}
            />
            <input
              value={addressBookAddress}
              onChange={e => setAddressBookAddress(e.target.value)}
              placeholder="Ethereum Address"
              className="input-field"
              style={{marginBottom: 12}}
            />
            {addressBookValidationError && <div className="error-text" style={{marginBottom: 12}}>{addressBookValidationError}</div>}
            <div className="flex-row" style={{gap: 8}}>
              <button className="outline-btn" style={{flex: 1}} onClick={() => { setShowAddressBookModal(false); setEditAddressBookIndex(null); setAddressBookValidationError(''); }}>Cancel</button>
              <button className="primary-btn" style={{flex: 1}} onClick={saveAddressBookEntry}>{editAddressBookIndex !== null ? 'Save' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}

      {showAppModal && (
        <div className="flex-center" style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.7)',backdropFilter:'blur(8px)',zIndex:120}}>
          <div className="glass-panel" style={{width:'90%', maxWidth: 460}}>
            <h3 className="text-h2">Add Connected App</h3>
            <p className="text-muted" style={{fontSize:'0.9rem', marginBottom:12}}>Simulate apps connected to your wallet for trusted sessions.</p>
            <input
              value={appDomain}
              onChange={e => setAppDomain(e.target.value)}
              placeholder="App Domain"
              className="input-field"
              style={{marginBottom: 12}}
            />
            <input
              value={appDescription}
              onChange={e => setAppDescription(e.target.value)}
              placeholder="Description"
              className="input-field"
              style={{marginBottom: 12}}
            />
            <div className="flex-row" style={{gap: 8}}>
              <button className="outline-btn" style={{flex: 1}} onClick={() => setShowAppModal(false)}>Cancel</button>
              <button className="primary-btn" style={{flex: 1}} onClick={saveConnectedApp}>Save</button>
            </div>
          </div>
        </div>
      )}

      {showConnectPrompt && pendingConnectRequest && (
        <div className="flex-center" style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.7)',backdropFilter:'blur(8px)',zIndex:130}}>
          <div className="glass-panel" style={{width:'90%', maxWidth: 460}}>
            <h3 className="text-h2">Website Connection Request</h3>
            <p className="text-muted" style={{fontSize:'0.9rem', marginBottom:12}}>
              <strong>{pendingConnectRequest.origin}</strong> wants to connect to your Ritual Wallet.
            </p>
            <div className="input-label mb-sm">Connected address</div>
            <div className="glass-panel" style={{padding:12, wordBreak:'break-all', fontFamily:'monospace', marginBottom:16}}>{address || 'No active account'}</div>
            <div className="flex-row" style={{gap: 8}}>
              <button className="outline-btn" style={{flex: 1}} onClick={async () => {
                if (!pendingConnectRequest) return;
                const response = { success: false, error: 'User rejected connection' };
                chrome.runtime.sendMessage({ type: 'RITUAL_PROVIDER_RESPONSE', requestId: pendingConnectRequest.requestId, response }, () => {});
                setShowConnectPrompt(false);
                setPendingConnectRequest(null);
                chrome.storage.local.remove(['ritual_pending_connect_request']);
              }}>Reject</button>
              <button className="primary-btn" style={{flex: 1}} onClick={async () => {
                if (!pendingConnectRequest) return;
                const currentAddress = address ? [address] : [];
                const response = { success: true, result: currentAddress };
                chrome.runtime.sendMessage({ type: 'RITUAL_PROVIDER_RESPONSE', requestId: pendingConnectRequest.requestId, response }, () => {});
                setConnectedApps([{ domain: pendingConnectRequest.origin, description: 'Connected via website', connectedAt: Date.now() }, ...connectedApps]);
                storage.set({ ritual_connected_apps: [{ domain: pendingConnectRequest.origin, description: 'Connected via website', connectedAt: Date.now() }, ...connectedApps] });
                setShowConnectPrompt(false);
                setPendingConnectRequest(null);
                chrome.storage.local.remove(['ritual_pending_connect_request']);
              }}>Connect</button>
            </div>
          </div>
        </div>
      )}

      {showResetConfirm && (
        <div className="flex-center" style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.7)',backdropFilter:'blur(8px)',zIndex:120}}>
          <div className="glass-panel" style={{width:'90%', maxWidth: 420}}>
            <h3 className="text-h2">Reset Wallet</h3>
            <p className="text-muted" style={{fontSize:'0.9rem', marginBottom:12}}>This will delete your wallet data from this extension. Make sure you have backed up your seed phrase.</p>
            <div className="flex-row" style={{gap: 8}}>
              <button className="outline-btn" style={{flex: 1}} onClick={cancelResetWallet}>Cancel</button>
              <button className="primary-btn" style={{flex: 1}} onClick={confirmResetWallet}>Confirm Reset</button>
            </div>
          </div>
        </div>
      )}

      {confirmRemoveAccountIndex !== null && (
        <div className="flex-center" style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.7)',backdropFilter:'blur(8px)',zIndex:120}}>
          <div className="glass-panel" style={{width:'90%', maxWidth: 420}}>
            <h3 className="text-h2">Remove Account</h3>
            <p className="text-muted" style={{fontSize:'0.9rem', marginBottom:12}}>Removing this account will delete it from the wallet. This cannot be undone unless you have the seed phrase or private key.</p>
            <div className="flex-row" style={{gap: 8}}>
              <button className="outline-btn" style={{flex: 1}} onClick={cancelRemoveAccount}>Cancel</button>
              <button className="primary-btn" style={{flex: 1}} onClick={confirmRemoveAccount}>Remove</button>
            </div>
          </div>
        </div>
      )}

      {showPrivateKeyModal && (
        <div className="flex-center" style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.7)',backdropFilter:'blur(8px)',zIndex:120}}>
          <div className="glass-panel" style={{width:'90%', maxWidth: 420}}>
            <h3 className="text-h2">Confirm Password</h3>
            <p className="text-muted" style={{fontSize:'0.9rem', marginBottom:12}}>Enter your wallet password to reveal the private key.</p>
            <input
              value={privateKeyConfirmInput}
              onChange={e => setPrivateKeyConfirmInput(e.target.value)}
              type="password"
              placeholder="Password"
              className="input-field"
              style={{marginBottom: 12}}
            />
            <div className="flex-row" style={{gap: 8}}>
              <button className="outline-btn" style={{flex: 1}} onClick={() => setShowPrivateKeyModal(false)}>Cancel</button>
              <button className="primary-btn" style={{flex: 1}} onClick={verifyPrivateKeyPassword}>Verify</button>
            </div>
            {privateKeyVerified && (
              <div style={{marginTop: 16}}>
                <div className="text-muted" style={{fontSize:'0.9rem', marginBottom:8}}>Private Key</div>
                <div className="glass-panel" style={{padding:12, wordBreak:'break-all', fontFamily:'monospace'}}>{vault?.accounts[editingAccountIndex!]}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );

  const saveTx = (hash: string, to: string, amount: string, type: string) => {
    const newTx = { hash, to, amount, date: Date.now(), type };
    const newHistory = [newTx, ...txHistory].slice(0, 20);
    setTxHistory(newHistory);
    storage.set({ ritual_txs: newHistory });
  };

  // Step 1: Validate inputs & show fee popup
  // @ts-ignore
  const handleSendClick = async () => {
    if (!sendTo || !sendAmount) return;
    setSendError("");
    if (!WalletService.isValidAddress(sendTo)) { setSendError("Invalid recipient address."); return; }
    try { BalanceService.parseEther(sendAmount); } catch { setSendError("Invalid amount."); return; }
    // Estimate gas
    const fee = await estimateGasCost(isMainnet);
    setEstimatedSendFee(Number(fee).toFixed(6));
    setShowSendFeePopup(true);
  };

  // Step 2: Actually send after user confirms
    const handleSendToken = async () => {
    setShowSendFeePopup(false);
    try {
      setLoading(true); setSendError("");
      let result;
      if (sendToken === 'USDC' && deployedUsdcAddress) {
        result = await TransactionService.sendUsdc(privateKey!, sendTo, sendAmount, deployedUsdcAddress, isMainnet);
      } else {
        result = await TransactionService.sendNative(privateKey!, sendTo, sendAmount, isMainnet);
      }
      if (!result.success) throw new Error(result.error);
      
      saveTx(result.hash || '', sendTo, sendAmount, 'send');
      setupWallet(privateKey!);
      setSendTo(""); setSendAmount("");
      setCurrentView('main');
      setActiveTab('activity');
    } catch (e: unknown) { 
      const errorMsg = e instanceof Error ? e.message : "Failed to send transaction";
      setSendError(errorMsg); 
      showToast(errorMsg.length > 50 ? "Transaction Failed" : errorMsg);
    } 
    finally { setLoading(false); }
  };

    const handleSimulateSwap = async () => {
    if (!swapAmount || Number(swapAmount) <= 0) return;
    
    if (deployedUsdcAddress && privateKey) {
      setLoading(true);
      showToast("Swapping on Ritual Testnet...");
      try {
        let result;
        if (swapDirection === 'RITUAL_TO_USDC') {
          result = await TokenService.swapRitualForUsdc(privateKey, swapAmount, deployedUsdcAddress, isMainnet);
        } else {
          result = await TokenService.swapUsdcForRitual(privateKey, swapAmount, deployedUsdcAddress, isMainnet);
        }
        if (!result.success) throw new Error(result.error);
        
        const newUsdcBalance = swapDirection === 'RITUAL_TO_USDC'
          ? (Number(usdcBalance) + Number(swapAmount)).toFixed(2)
          : (Number(usdcBalance) - Number(swapAmount)).toFixed(2);
        setUsdcBalance(newUsdcBalance);
        storage.set({ ritual_usdc: newUsdcBalance });
        
        const label = swapDirection === 'RITUAL_TO_USDC' ? `Swap ${swapAmount} RITUAL` : `Swap ${swapAmount} USDC`;
        const dest = swapDirection === 'RITUAL_TO_USDC' ? "USDC Token" : "Ritual Network";
        const newHistory = [{ hash: result.hash || '', to: dest, amount: label, date: Date.now(), type: 'send' }, ...txHistory];
        setTxHistory(newHistory);
        storage.set({ ritual_txs: newHistory });
        
        showToast("Swap successful!");
      } catch (e: any) {
        console.error(e);
        showToast("Swap failed: " + (e.message || "Unknown error"));
      } finally {
        setLoading(false);
      }
    } else {
      showToast("No active AI-routed DEX paths found for this pair.");
    }
    setSwapAmount("");
  };

    const handleStakeUsdc = async () => {
    if (!stakeInput || Number(stakeInput) <= 0) return;
    if (!deployedUsdcAddress || !deployedStakingAddress || !privateKey) {
      showToast("Please deploy Demo Contracts from Settings first.");
      return;
    }
    setLoading(true);
    showToast("Approving & Staking USDC...");
    try {
      const result = await TokenService.stakeUsdc(privateKey, stakeInput, deployedUsdcAddress, deployedStakingAddress, isMainnet);
      if (!result.success) throw new Error(result.error);
      
      const newStaked = (Number(stakedUsdc) + Number(stakeInput)).toFixed(2);
      const newBalance = (Number(usdcBalance) - Number(stakeInput)).toFixed(2);
      
      setStakedUsdc(newStaked);
      setUsdcBalance(newBalance);
      storage.set({ ritual_staked_usdc: newStaked, ritual_usdc: newBalance });
      
      const newHistory = [{ hash: result.hash || '', to: "Staking Contract", amount: `Stake ${stakeInput} USDC`, date: Date.now(), type: 'send' }, ...txHistory];
      setTxHistory(newHistory);
      storage.set({ ritual_txs: newHistory });

      showToast("Staking successful!");
      setStakeInput("");
    } catch (e: any) {
      console.error(e);
      showToast("Staking failed: " + (e.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

    const scanBlockchainHistory = async () => {
    if (!address) return;
    try {
      setIsScanning(true);
      const newRecords = await PortfolioService.scanBlockchainHistory(address, isMainnet);
      if (newRecords.length > 0) {
        showToast(`Found ${newRecords.length} transfers! Check Activity.`);
        const newHistory = [...txHistory];
        newRecords.forEach((record: any) => {
          if (!newHistory.find(t => t.hash === record.hash)) {
            newHistory.push(record as any);
          }
        });
        setTxHistory(newHistory as any);
        storage.set({ ritual_txs: newHistory });
      } else {
        showToast("No new transfers found.");
      }
    } catch (e) {
      showToast("Scan failed");
    } finally {
      setIsScanning(false);
    }
  };


    const handleRevoke = async () => {
    if (!deployedUsdcAddress || !privateKey) {
      showToast("No active token approvals found.");
      return;
    }
    setIsRevoking(true);
    try {
      const result = await TokenService.revokeApprovals(privateKey, deployedUsdcAddress, "0x000000000000000000000000000000000000dEaD", isMainnet);
      if (!result.success) throw new Error(result.error);
      
      setApprovalsRevoked(true);
      showToast("All risky approvals revoked on-chain!");
    } catch (e: any) {
      showToast("Revoke failed: " + (e.message || "Unknown error"));
    } finally {
      setIsRevoking(false);
    }
  };

  const downloadImage = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `ritual-ai-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      showToast("Failed to download image");
    }
  };

  const handleMintClick = (url: string) => {
    if (!privateKey) {
      showToast("Wallet not unlocked");
      return;
    }
    setPendingMintUrl(url);
    setShowMintFeePopup(true);
  };

    const confirmMint = async () => {
    setShowMintFeePopup(false);
    const url = pendingMintUrl;
    
    setLoading(true);
    showToast("Minting on Ritual Chain...");
    try {
      const result = await TokenService.mintNft(privateKey!, url, isMainnet);
      if (!result.success) throw new Error(result.error);

      const newNft = { name: `Ritual AI #${Math.floor(Math.random() * 10000)}`, url };
      const updatedNfts = [newNft, ...nfts];
      setNfts(updatedNfts);
      storage.set({ ritual_nfts: updatedNfts });

      // Add to Activity history
      const newHistory = [{ hash: result.hash || '', to: "Mint Contract", amount: "NFT", date: Date.now(), type: 'send' }, ...txHistory];
      setTxHistory(newHistory);
      storage.set({ ritual_txs: newHistory });

      showToast("Successfully minted on-chain! Check NFTs tab.");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Transaction Failed";
      showToast("Minting failed: " + msg);
    } finally {
      setLoading(false);
    }
  };

  const handleAiCommand = async (text?: string) => {
    const userMsg = (text !== undefined ? text : aiInput).trim();
    if (!userMsg) return;
    setAiInput("");

    const newHistory = [...chatHistory, { role: "user", content: userMsg }];
    setChatHistory(newHistory);
    storage.set({ ritual_chat_history: newHistory });

    const activeProviderName = AIEngine.getInstance().getActiveProviderName();
    const lowerQuery = userMsg.toLowerCase();
    const isLocalQuery = lowerQuery.includes('balance') || lowerQuery.includes('how much') || lowerQuery.includes('portfolio') || lowerQuery.includes('funds') ||
                         lowerQuery.includes('address') || lowerQuery.includes('wallet address') || lowerQuery.includes('my address') ||
                         lowerQuery.includes('generate') || lowerQuery.includes('draw') || lowerQuery.includes('create an image') || lowerQuery.includes('paint') || lowerQuery.includes('picture of') || lowerQuery.includes('image of') ||
                         (lowerQuery.includes('send') && (lowerQuery.includes('ritual') || lowerQuery.includes('token') || lowerQuery.includes('0x'))) ||
                         lowerQuery.includes('swap') || lowerQuery.includes('bridge') || lowerQuery.includes('security') || lowerQuery.includes('safe') || lowerQuery.includes('audit');

    if (activeProviderName === 'none' && !isLocalQuery) {
      const finalHist = [...newHistory, { role: 'assistant', content: "No AI Provider Configured. Please go to Settings to configure a provider (OpenAI, Anthropic, or Ollama) or use local queries like 'balance' or 'address'." }];
      setChatHistory(finalHist);
      storage.set({ ritual_chat_history: finalHist });
      return;
    }

    if (activeProviderName !== 'ritual' && activeProviderName !== 'none' && !isLocalQuery) {
      setIsAiLoading(true);
      try {
        const context = await getLivePortfolioContext();
        const response = await AIEngine.getInstance().processPrompt(userMsg, context);
        const botReply = `${response.content}\n\n*Response Source: [${response.source}]*`;
        
        const finalHist = [...newHistory, { role: 'assistant', content: botReply }];
        setChatHistory(finalHist);
        storage.set({ ritual_chat_history: finalHist });
      } catch (e: any) {
        const finalHist = [...newHistory, { role: 'assistant', content: `AI Provider Error: ${e.message || e}` }];
        setChatHistory(finalHist);
        storage.set({ ritual_chat_history: finalHist });
      } finally {
        setIsAiLoading(false);
      }
      return;
    }

    // ── LOCAL INTELLIGENCE (no gas needed) ────────────────────────────
    const lower = userMsg.toLowerCase();
    // 1. Balance / portfolio queries
    if (lower.includes('balance') || lower.includes('how much') || lower.includes('portfolio') || lower.includes('funds')) {
      const reply = `Your current balance is **${Number(balance).toFixed(6)} RITUAL** on Ritual Testnet.\n\nAddress: \`${address}\``;
      const finalHist = [...newHistory, { role: 'assistant', content: reply }];
      setChatHistory(finalHist);
      storage.set({ ritual_chat_history: finalHist });
      return;
    }

    // 2. Address queries
    if (lower.includes('address') || lower.includes('wallet address') || lower.includes('my address')) {
      const reply = `Your wallet address is:\n\`${address}\`\n\nTap the address pill on the dashboard to copy it.`;
      const finalHist = [...newHistory, { role: 'assistant', content: reply }];
      setChatHistory(finalHist);
      storage.set({ ritual_chat_history: finalHist });
      return;
    }

    // 3. Image generation via Pollinations.ai (free, no API key)
    if (lower.includes('generate') || lower.includes('draw') || lower.includes('create an image') || lower.includes('paint') || lower.includes('picture of') || lower.includes('image of')) {
      setIsAiLoading(true);
      try {
        // Extract the image subject from the prompt
        const prompt = userMsg.replace(/generate|draw|create|paint|image of|picture of|an image|a picture/gi, '').trim() || userMsg;
        const encodedPrompt = encodeURIComponent(prompt + ', digital art, ultra detailed, cinematic lighting');
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&nologo=true&seed=${Date.now()}`;

        // Pre-load the image
        await new Promise((res, rej) => {
          const img = new Image();
          img.onload = res;
          img.onerror = rej;
          img.src = imageUrl;
        });

        const finalHist = [...newHistory, { role: 'assistant', content: `✨ Here's your image for: *"${prompt}"*`, imageUrl }];
        setChatHistory(finalHist);
        storage.set({ ritual_chat_history: finalHist });
      } catch {
        const finalHist = [...newHistory, { role: 'assistant', content: '⚠️ Image generation failed. Please try again with a different prompt.' }];
        setChatHistory(finalHist);
        storage.set({ ritual_chat_history: finalHist });
      } finally {
        setIsAiLoading(false);
      }
      return;
    }

    // 4. Send token intent
    if (lower.includes('send') && (lower.includes('ritual') || lower.includes('token') || lower.includes('0x'))) {
      const amtMatch = userMsg.match(/(\d+\.?\d*)\s*(ritual|token)?/i);
      const addrMatch = userMsg.match(/0x[0-9a-fA-F]{40}/i);
      if (addrMatch && amtMatch) {
        setSendTo(addrMatch[0]);
        setSendAmount(amtMatch[1]);
        const reply = `I've pre-filled the Send form with **${amtMatch[1]} RITUAL** → \`${addrMatch[0].slice(0,8)}...${addrMatch[0].slice(-4)}\`. Switch to the **Send** tab or tap the Send button to review and confirm.`;
        const finalHist = [...newHistory, { role: 'assistant', content: reply }];
        setChatHistory(finalHist);
        storage.set({ ritual_chat_history: finalHist });
        return;
      }
    }

    // 5. Staking / yield questions
    if (lower.includes('stake') || lower.includes('yield') || lower.includes('earn') || lower.includes('apy')) {
      const reply = `**Staking on Ritual Testnet**\n\nRitual is currently in testnet phase. Native staking is not yet live, but you can:\n- 🔁 Explore the **Earn** tab for upcoming yield opportunities\n- 📊 Monitor your assets while mainnet launches\n- 🤖 Use the AI tab to query on-chain LLM executors\n\nMainnet staking with RITUAL tokens is expected to launch with the full protocol.`;
      const finalHist = [...newHistory, { role: 'assistant', content: reply }];
      setChatHistory(finalHist);
      storage.set({ ritual_chat_history: finalHist });
      return;
    }

    // 6. What is Ritual? (Catch-all for Ritual queries if not caught by above intents)
    if (lower.includes('what is ritual') || lower.includes('about ritual') || lower.includes('ritual network') || lower === 'ritual' || lower.includes('what can you do') || lower.includes('who are you') || lower.includes('tell me about ritual')) {
      const reply = `**Ritual** is the first on-chain AI network.\n\n🧠 It allows smart contracts to call **AI models directly on-chain** via precompiles like \`0x0802\`.\n\n🔗 Built on a sovereign L1 with:\n- TEE-secured LLM execution\n- On-chain inference with ZK proofs\n- Native DeFi + AI composability\n\nI am your **Ritual AI Agent**, built directly into the wallet. I connect natively to the Ritual testnet to help you send transactions, check balances, generate images, and query on-chain AI models!`;
      const finalHist = [...newHistory, { role: 'assistant', content: reply }];
      setChatHistory(finalHist);
      storage.set({ ritual_chat_history: finalHist });
      return;
    }

    // 7. Generic chat (Time, Date, Greetings)
    if (lower.includes('time') || lower.includes('date') || lower === 'hi' || lower === 'hello' || lower === 'hey') {
      let reply = "Hello! I am the Ritual Wallet AI Agent.";
      if (lower.includes('time') || lower.includes('date')) {
        reply = `The current local time is **${new Date().toLocaleTimeString()}** on ${new Date().toLocaleDateString()}.`;
      } else {
        reply = "Hello! 👋 I'm your on-chain AI assistant. I can help you check your balance, generate images, simulate swaps, or answer questions about the Ritual Network.";
      }
      const finalHist = [...newHistory, { role: 'assistant', content: reply }];
      setChatHistory(finalHist);
      storage.set({ ritual_chat_history: finalHist });
      return;
    }

    // ── ON-CHAIN LLM (requires gas) ────────────────────────────────────
    setPendingAiPrompt(userMsg);
    const fee = await estimateGasCost(isMainnet);
    const aiFeeEst = (Number(fee) * 25).toFixed(5);
    setEstimatedAiFee(aiFeeEst);
    setShowAiFeePopup(true);
    // Restore history state with the user message already added
    // (confirmAiFee will re-add it, so we need to roll back one step)
    setChatHistory(chatHistory); // reset to pre-user-message state, confirmAiFee handles it
    storage.set({ ritual_chat_history: chatHistory });
  };

    const confirmAiFee = async () => {
    setShowAiFeePopup(false);
    const userPrompt = pendingAiPrompt;
    const newHistory = [...chatHistory, { role: "user", content: userPrompt }];
    setChatHistory(newHistory);
    storage.set({ ritual_chat_history: newHistory });
    setIsAiLoading(true);

    try {
      if (!privateKey) throw new Error("Wallet not found");
      
      const systemPrompt = `You are the AI Assistant for the Ritual Wallet. 
You are friendly, highly casual, and speak exactly like a human Web3 user (a bit of a degen but very helpful).
DO NOT use robotic phrases like "As an AI", "Here is a list", or "I can help with that". Keep your answers super concise and natural.
CURRENT STATE: Address: ${address}, Balance: ${balance} RITUAL.
CRITICAL: If the user explicitly asks to SEND tokens, you MUST reply ONLY with JSON:
{"action": "send", "amount": "<amount>", "to": "<ethereum_address>"}
CRITICAL: If the user asks to SWAP or EXCHANGE tokens, you MUST reply ONLY with JSON:
{"action": "swap"}
CRITICAL: If the user asks about SECURITY, RISKS, WALLET HEALTH, or if something is SAFE, you MUST reply ONLY with JSON:
{"action": "health"}
CRITICAL: If the user asks where to INVEST, EARN, STAKE, or YIELD, you MUST reply ONLY with JSON:
{"action": "yield"}
CRITICAL: If the user asks to GENERATE AN IMAGE, DRAW, or CREATE A PICTURE, you MUST reply ONLY with JSON:
{"action": "generate_image", "prompt": "<detailed visual description of the image>"}`;

      console.log("Calling Ritual On-Chain LLM Precompile (0x0802)...");
      
      let executorAddress = await NetworkService.getLlmExecutor(isMainnet);
      await NetworkService.depositToRitualWallet(privateKey, isMainnet);

      const llmResult = await NetworkService.sendLlmQuery(privateKey, executorAddress, systemPrompt, newHistory, isMainnet);
      if (!llmResult.success) {
        const em = llmResult.error;
        if (em && em.toLowerCase().includes('not registered') && em.toLowerCase().includes('executor')) {
          showToast('On-chain executor temporarily offline.');
          const finalHist = [...newHistory, {role: 'assistant', content: `Oops! My on-chain LLM node is currently syncing with the Ritual testnet. 🚧\n\nI can still help you with your **balance**, **wallet address**, **simulating swaps**, or **generating images** right now!`}];
          setChatHistory(finalHist);
          storage.set({ ritual_chat_history: finalHist });
          setIsAiLoading(false);
          return;
        }
        throw new Error(llmResult.error);
      }

      const tx = { hash: llmResult.hash || '' };
      const receipt = llmResult.data;

      // Log tx to activity
      const newTx = { hash: tx.hash, to: "0x0000000000000000000000000000000000000802", amount: "LLM Query", date: Date.now(), type: "AI On-Chain Query" };
      const updatedTxs = [newTx, ...txHistory];
      setTxHistory(updatedTxs);
      storage.set({ ritual_txs: updatedTxs });

      // Update balance
      const newBalStr = await BalanceService.getNativeBalance(address!, isMainnet);
      setBalance(newBalStr);

      let botReply = "";
      
      // Try decoding from receipt logs first
      const receiptLogs = receipt?.logs || [];
      for (const log of receiptLogs) {
        if (log.data && log.data.length > 10) {
          const decodedText = NetworkService.decodeLlmLog(log.data);
          if (decodedText) {
            botReply = decodedText;
            break;
          }
        }
      }

      if (!botReply) {
        const maxAttempts = 40; // poll every 4.5s for up to ~3 mins
        let attempts = 0;
        
        while (attempts < maxAttempts) {
          await new Promise(r => setTimeout(r, 4500));
          attempts++;
          
          try {
            const pollRes = await NetworkService.pollInferenceResult(tx.hash, isMainnet);
            if (pollRes.ready) {
              botReply = pollRes.result;
              break;
            }
          } catch (e) {
            console.warn("poll err", e);
          }
        }
      }

      if (!botReply) {
        botReply = "Query sent! Ritual node is processing. Response will show in logs.";
      }

      const taggedReply = `${botReply}\n\n*Response Source: [Live AI]*`;
      const finalHist = [...newHistory, { role: 'assistant', content: taggedReply }];
      setChatHistory(finalHist);
      storage.set({ ritual_chat_history: finalHist });

    } catch (e: any) {
      console.error(e);
      showToast("LLM Query failed: " + (e.message || "Unknown error"));
      const taggedReply = `Sorry, I couldn't reach the Ritual on-chain network. Please try again.\n\n*Response Source: [Unavailable]*`;
      const finalHist = [...newHistory, { role: 'assistant', content: taggedReply }];
      setChatHistory(finalHist);
      storage.set({ ritual_chat_history: finalHist });
    } finally {
      setIsAiLoading(false);
    }
  };;

  const resetWallet = () => {
    setShowResetConfirm(true);
  };

  // ---------------------------------------------------------
  // RENDER AUTHENTICATION
  // ---------------------------------------------------------
  if (authState === 'loading') {
    return (
      <div className="flex flex-col h-screen w-full bg-[#000000] text-white items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#00FFA3] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Common wrapper for all auth screens
  const renderAuthWrapper = (children: React.ReactNode) => (
    <div className="flex flex-col h-screen w-full bg-[#000000] text-white overflow-hidden relative font-sans">
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
        <div className="w-2 h-2 rounded-full bg-[#00FFA3] animate-pulse shadow-[0_0_8px_#00FFA3]" />
        <span className="text-xs font-semibold tracking-wide text-white/80">Ritual Testnet</span>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col relative z-10 p-6 scrollbar-hide">
        {/* Decorative Orbs */}
        <div className="fixed top-[-10%] left-[-10%] w-[300px] h-[300px] bg-[#00FFA3]/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="fixed bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-[#0A84FF]/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm mx-auto relative z-10">
          {children}
        </div>
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">⚠️ Reset Wallet</h3>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              This will permanently delete your wallet from this device. Make sure you have your seed phrase backed up before continuing.
            </p>
            <div className="flex flex-col gap-3">
              <button className="w-full py-3 rounded-xl bg-red-500/10 text-red-500 font-semibold hover:bg-red-500/20 transition-colors" onClick={confirmResetWallet}>Confirm Reset</button>
              <button className="w-full py-3 rounded-xl bg-white/5 text-white font-semibold hover:bg-white/10 transition-colors" onClick={() => setShowResetConfirm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (authState === 'welcome') return renderAuthWrapper(
    <>
      <div className="mb-8">
        <img src="/logo.png" className="w-20 h-20 drop-shadow-[0_0_20px_rgba(0,255,163,0.8)] animate-pulse" onError={e => e.currentTarget.style.display = 'none'} />
      </div>
      <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Ritual</h1>
      <p className="text-gray-400 text-center mb-10 text-sm leading-relaxed">A secure, AI-native interface for Web3.</p>
      
      <div className="w-full space-y-4">
        <button className="w-full py-4 rounded-2xl bg-[#00FFA3] text-black font-bold text-lg hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,255,163,0.3)]" onClick={handleCreateWalletStart}>
          Create a new wallet
        </button>
        <button className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-colors" onClick={() => setAuthState('import_seed')}>
          I already have a wallet
        </button>
      </div>
    </>
  );

  if (authState === 'unlock') return renderAuthWrapper(
    <>
      <div className="mb-8">
        <img src="/logo.png" className="w-20 h-20 drop-shadow-[0_0_20px_rgba(0,255,163,0.8)]" onError={e => e.currentTarget.style.display = 'none'} />
      </div>
      <h1 className="text-3xl font-bold text-white mb-8 tracking-tight">Welcome Back</h1>
      
      <div className="w-full space-y-4">
        <input 
          type="password" 
          className={`w-full bg-white/5 border ${authError ? 'border-red-500' : 'border-white/10'} rounded-2xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#00FFA3]/50 transition-colors`}
          placeholder="Password" 
          value={passwordInput} 
          onChange={e => setPasswordInput(e.target.value)} 
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleUnlock();
            }
          }}
        />
        {authError && <div className="text-red-500 text-sm font-medium">{authError}</div>}
        
        <button 
          className="w-full py-4 rounded-2xl bg-[#0A84FF] text-white font-bold text-lg hover:brightness-110 transition-all shadow-[0_0_20px_rgba(10,132,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed" 
          onClick={handleUnlock} 
          disabled={loading || !passwordInput}
        >
          {loading ? "Unlocking..." : "Unlock"}
        </button>
      </div>
      <button className="mt-8 text-gray-500 text-sm hover:text-white transition-colors" onClick={() => setShowResetConfirm(true)}>
        Reset secret recovery phrase
      </button>
    </>
  );

  if (authState === 'show_seed' && tempVault?.mnemonic) return renderAuthWrapper(
    <>
      <div className="mb-6">
        <img src="/logo.png" className="w-16 h-16 drop-shadow-[0_0_20px_rgba(0,255,163,0.8)]" onError={e => e.currentTarget.style.display = 'none'} />
      </div>
      <h1 className="text-2xl font-bold text-white mb-2 tracking-tight text-center">Secret Recovery Phrase</h1>
      <p className="text-gray-400 text-sm mb-8 text-center">Save these 12 words in a safe place.</p>
      
      <div className="grid grid-cols-3 gap-3 w-full mb-8">
        {tempVault.mnemonic.split(' ').map((word, i) => (
          <div key={i} className="bg-black/40 border border-white/10 rounded-xl p-3 flex flex-col items-center justify-center relative group">
            <span className="absolute top-1 left-2 text-[10px] text-gray-500">{i + 1}</span>
            <span className="text-sm font-mono text-[#00FFA3] mt-1">{word}</span>
          </div>
        ))}
      </div>
      
      <div className="w-full mt-auto pt-4">
        <button className="w-full py-4 rounded-2xl bg-[#00FFA3] text-black font-bold text-lg hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,255,163,0.3)]" onClick={() => setAuthState('setup_password')}>
          I Saved It
        </button>
      </div>
    </>
  );

  if (authState === 'import_seed') return renderAuthWrapper(
    <>
      <button className="absolute top-6 left-6 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors text-white z-20" onClick={() => setAuthState('welcome')}>
        <ArrowLeft size={20} />
      </button>
      <div className="mb-6">
        <img src="/logo.png" className="w-16 h-16 drop-shadow-[0_0_20px_rgba(0,255,163,0.8)]" onError={e => e.currentTarget.style.display = 'none'} />
      </div>
      <h1 className="text-2xl font-bold text-white mb-8 tracking-tight">Import Wallet</h1>
      
      <div className="w-full space-y-4 flex-1 flex flex-col">
        <textarea 
          value={authImportInput} 
          className={`w-full bg-white/5 border ${authError ? 'border-red-500' : 'border-white/10'} rounded-2xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#0A84FF]/50 transition-colors resize-none h-32`} 
          placeholder="Secret phrase or private key..." 
          onChange={e => setAuthImportInput(e.target.value)} 
        />
        {authError && <div className="text-red-500 text-sm font-medium">{authError}</div>}
        
        <div className="mt-auto pt-4">
          <button className="w-full py-4 rounded-2xl bg-[#0A84FF] text-white font-bold text-lg hover:brightness-110 transition-all shadow-[0_0_20px_rgba(10,132,255,0.3)]" onClick={handleImportSubmit}>
            Import
          </button>
        </div>
      </div>
    </>
  );

  if (authState === 'setup_password') return renderAuthWrapper(
    <>
      <div className="mb-6">
        <img src="/logo.png" className="w-16 h-16 drop-shadow-[0_0_20px_rgba(0,255,163,0.8)]" onError={e => e.currentTarget.style.display = 'none'} />
      </div>
      <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Create Password</h1>
      <p className="text-gray-400 text-sm mb-8 text-center">This protects your wallet on this device.</p>
      
      <div className="w-full space-y-4 flex-1 flex flex-col">
        <input 
          type="password" 
          className={`w-full bg-white/5 border ${authError ? 'border-red-500' : 'border-white/10'} rounded-2xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#00FFA3]/50 transition-colors`} 
          placeholder="Password" 
          value={passwordInput} 
          onChange={e => setPasswordInput(e.target.value)} 
        />
        {authError && <div className="text-red-500 text-sm font-medium">{authError}</div>}
        
        <div className="mt-auto pt-4">
          <button className="w-full py-4 rounded-2xl bg-[#00FFA3] text-black font-bold text-lg hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,255,163,0.3)]" onClick={handleSetupPasswordSubmit}>
            Save & Continue
          </button>
        </div>
      </div>
    </>
  );

  // ---------------------------------------------------------
  // RENDER MAIN WALLET
  // ---------------------------------------------------------
  if (authState === 'unlocked' && address) {
    if (currentView === 'send') {
      const executeSend = async (recipient: string, amount: string, asset: 'RITUAL'|'USDC') => {
        let result;
        if (asset === 'USDC' && deployedUsdcAddress) {
          result = await TransactionService.sendUsdc(privateKey!, recipient, amount, deployedUsdcAddress, isMainnet);
        } else {
          result = await TransactionService.sendNative(privateKey!, recipient, amount, isMainnet);
        }
        if (!result.success) throw new Error(result.error);
        
        saveTx(result.hash || '', recipient, amount, 'send');
        setupWallet(privateKey!);
      };
      
      return (
        <AppShell>
          <SendFlow onSend={executeSend} addressBook={addressBook} />
        </AppShell>
      );
    }
    if (currentView === 'bridge') return <AppShell><BridgeScreen /></AppShell>;
    if (currentView === 'receive') {
      return (
        <AppShell>
          <ReceiveScreen
            address={address!}
            onBack={() => setCurrentView('main')}
            showToast={showToast}
          />
        </AppShell>
      );
    }


    if (['home', 'portfolio', 'discover', 'swap', 'ai', 'activity'].includes(activeTab) && currentView === 'main') {
      return (
        <AppShell>
          {activeTab === 'home' && <HomeDashboard />}
          {activeTab === 'discover' && <DiscoverScreen />}
          {activeTab === 'portfolio' && <PortfolioScreen />}
          {activeTab === 'swap' && <SwapScreen />}
          {activeTab === 'ai' && <AIWorkspace />}
          {activeTab === 'activity' && <ActivityScreen />}
        </AppShell>
      );
    }

    if (currentView === 'settings') {
      const appState = {
        settingsSubView, setSettingsSubView,
        vault, accountNames, accountImages, activeAccountIndex,
        addressBook, connectedApps,
        disconnectApp, removeAddressBookEntry, startEditingAddressBook, handleSelectAddressBookContact,
        addAccount, importAccount,
        revealSeed, setRevealSeed, activePassword, setActivePassword, 
        privateKey, setPrivateKey, address, setAddress, setBalance, setAuthState
      };
      return <AppShell><SettingsScreen appState={appState} /></AppShell>;
    }

  }

  return null;
}

export default App;
