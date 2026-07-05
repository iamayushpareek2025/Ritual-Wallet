import { create } from 'zustand';

export type TabState = 'home' | 'portfolio' | 'tokens' | 'nfts' | 'swap' | 'health' | 'activity' | 'ai' | 'discover' | 'bridge';
export type ViewState = 'main' | 'send' | 'receive' | 'settings' | 'yield' | 'bridge';

interface UIState {
  activeTab: TabState;
  currentView: ViewState;
  loading: boolean;
  showToast: boolean;
  toastMessage: string;
  sendToken: 'RITUAL' | 'USDC';
  showAccountDropdown: boolean;
  showNotifications: boolean;
  setActiveTab: (tab: TabState) => void;
  setCurrentView: (view: ViewState) => void;
  setLoading: (loading: boolean) => void;
  setSendToken: (token: 'RITUAL' | 'USDC') => void;
  triggerToast: (msg: string) => void;
  setShowAccountDropdown: (show: boolean) => void;
  setShowNotifications: (show: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: 'home',
  currentView: 'main',
  loading: false,
  showToast: false,
  toastMessage: '',
  sendToken: 'RITUAL',
  showAccountDropdown: false,
  showNotifications: false,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setCurrentView: (view) => set({ currentView: view }),
  setLoading: (loading) => set({ loading }),
  setSendToken: (token) => set({ sendToken: token }),
  triggerToast: (msg) => {
    set({ showToast: true, toastMessage: msg });
    setTimeout(() => set({ showToast: false, toastMessage: '' }), 3000);
  },
  setShowAccountDropdown: (show) => set({ showAccountDropdown: show }),
  setShowNotifications: (show) => set({ showNotifications: show })
}));
