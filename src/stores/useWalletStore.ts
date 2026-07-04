import { create } from 'zustand';
import { RITUAL_MAINNET, RITUAL_TESTNET } from '../ritual';

interface TxRecord {
  hash: string;
  to: string;
  amount: string;
  type: 'send' | 'swap' | 'stake' | 'receive' | 'bridge';
  date: string | number;
}

export interface Vault {
  mnemonic: string | null;
  accounts: string[]; // array of private keys
}

interface WalletState {
  privateKey: string | null;
  address: string | null;
  balance: string;
  usdcBalance: string;
  stakedUsdc: string;
  transactions: TxRecord[];
  isMainnet: boolean;
  rpcUrl: string;
  hasUnreadNotifications: boolean;
  
  vault: Vault | null;
  activeAccountIndex: number;
  accountNames: Record<number, string>;
  accountImages: Record<number, string>;
  
  setWallet: (pk: string, addr: string) => void;
  setBalances: (native: string, usdc: string, staked: string) => void;
  addTransaction: (tx: TxRecord) => void;
  setTransactions: (txs: TxRecord[]) => void;
  setNetwork: (isMainnet: boolean) => void;
  setHasUnreadNotifications: (unread: boolean) => void;
  
  setVaultData: (vault: Vault | null, activeIndex: number, names: Record<number, string>, images: Record<number, string>) => void;
  setActiveAccountIndex: (index: number) => void;
  switchAccountCallback?: (index: number) => void;
  setSwitchAccountCallback: (cb: (index: number) => void) => void;

  clearWallet: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  privateKey: null,
  address: null,
  balance: '0.0',
  usdcBalance: '0.00',
  stakedUsdc: '0.00',
  transactions: [],
  isMainnet: false,
  rpcUrl: RITUAL_TESTNET.rpcUrl,
  hasUnreadNotifications: false,
  
  vault: null,
  activeAccountIndex: 0,
  accountNames: {},
  accountImages: {},

  setWallet: (pk, addr) => set({ privateKey: pk, address: addr }),
  setBalances: (native, usdc, staked) => set({ balance: native, usdcBalance: usdc, stakedUsdc: staked }),
  addTransaction: (tx) => set((state) => ({ transactions: [tx, ...state.transactions], hasUnreadNotifications: true })),
  setTransactions: (txs) => set({ transactions: txs }),
  setNetwork: (isMainnet) => set({ 
    isMainnet, 
    rpcUrl: isMainnet ? RITUAL_MAINNET.rpcUrl : RITUAL_TESTNET.rpcUrl 
  }),
  setHasUnreadNotifications: (unread) => set({ hasUnreadNotifications: unread }),
  
  setVaultData: (vault, activeIndex, names, images) => set({ vault, activeAccountIndex: activeIndex, accountNames: names, accountImages: images }),
  setActiveAccountIndex: (index) => set({ activeAccountIndex: index }),
  setSwitchAccountCallback: (cb) => set({ switchAccountCallback: cb }),

  clearWallet: () => set({ privateKey: null, address: null, balance: '0.0', usdcBalance: '0.00', stakedUsdc: '0.00', transactions: [], vault: null, activeAccountIndex: 0 })
}));
