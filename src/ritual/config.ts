import type { NetworkConfig } from './types';

export const RITUAL_TESTNET: NetworkConfig = {
  name: 'Ritual Testnet',
  chainId: 1979,
  rpcUrl: 'https://rpc.ritualfoundation.org',
  explorerUrl: 'https://explorer.ritualfoundation.org',
  isMainnet: false,
};

export const RITUAL_MAINNET: NetworkConfig = {
  name: 'Ritual Mainnet',
  chainId: 80001, // Placeholder
  rpcUrl: 'https://mainnet.ritualfoundation.org',
  explorerUrl: 'https://explorer.ritual.net', // Placeholder
  isMainnet: true,
};

export const DEFAULT_PROVIDER_OPTIONS = {
  timeoutMs: 10000,
  maxRetries: 3,
};
