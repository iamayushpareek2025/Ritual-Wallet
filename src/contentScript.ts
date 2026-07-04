const INJECTED_SCRIPT = `
(function() {
  const REQUEST_SOURCE = 'ritual-wallet-page';
  const RESPONSE_SOURCE = 'ritual-wallet-extension';

  function generateRequestId() {
    return 'ritual-' + Math.random().toString(36).slice(2) + '-' + Date.now();
  }

  class RitualProvider {
    constructor() {
      this.isRitualWallet = true;
      this.isMetaMask = true;
      this.isConnected = false;
      this._selectedAddress = null;
      this.chainId = '0x0';
      this.networkVersion = '0';
      this.autoRefreshOnNetworkChange = true;
      this._listeners = {};
      this.providers = [this];
    }

    _sendRequest(payload) {
      const requestId = generateRequestId();
      return new Promise((resolve, reject) => {
        const handleResponse = (event) => {
          if (event.source !== window || !event.data || event.data.source !== RESPONSE_SOURCE || event.data.requestId !== requestId) {
            return;
          }
          window.removeEventListener('message', handleResponse);
          const response = event.data.response;
          if (!response) {
            reject(new Error('No response from Ritual Wallet'));
            return;
          }
          if (response.success) {
            if (payload.method === 'eth_requestAccounts' || payload.method === 'wallet_connect') {
              this.isConnected = true;
            }
            if (Array.isArray(response.result) && response.result.length > 0) {
              this._selectedAddress = response.result[0];
            }
            resolve(response.result);
          } else {
            reject(new Error(response.error || 'Ritual Wallet request failed'));
          }
        };

        window.addEventListener('message', handleResponse);
        window.postMessage({ source: REQUEST_SOURCE, requestId, payload }, '*');
      });
    }

    async request(payload) {
      if (typeof payload === 'string') {
        return this._sendRequest({ method: payload, params: [] });
      }
      return this._sendRequest(payload);
    }

    async enable() {
      return this.request({ method: 'eth_requestAccounts', params: [] });
    }

    get selectedAddress() {
      return this._selectedAddress;
    }

    get selectedProvider() {
      return this;
    }

    addListener(eventName, listener) {
      return this.on(eventName, listener);
    }

    onConnect(listener) {
      return this.on('connect', listener);
    }

    onDisconnect(listener) {
      return this.on('disconnect', listener);
    }

    send(payload, callback) {
      this._sendRequest(payload)
        .then((result) => callback(null, { result, error: null }))
        .catch((error) => callback(error, null));
    }

    sendAsync(payload, callback) {
      return this.send(payload, callback);
    }

    on(eventName, listener) {
      if (!this._listeners[eventName]) this._listeners[eventName] = [];
      this._listeners[eventName].push(listener);
    }

    removeListener(eventName, listener) {
      if (!this._listeners[eventName]) return;
      this._listeners[eventName] = this._listeners[eventName].filter((l) => l !== listener);
    }
  }

  const provider = new RitualProvider();
  Object.defineProperty(window, 'ethereum', {
    value: provider,
    writable: false,
    configurable: false,
    enumerable: true,
  });
  Object.defineProperty(window, 'ritualWallet', {
    value: provider,
    writable: false,
    configurable: false,
    enumerable: true,
  });
  Object.defineProperty(window, 'web3', {
    value: { currentProvider: provider },
    writable: false,
    configurable: false,
    enumerable: true,
  });
  window.ethereum = provider;

  window.dispatchEvent(new Event('ethereum#initialized'));
})();
`;

function injectProvider() {
  const script = document.createElement('script');
  script.textContent = INJECTED_SCRIPT;
  document.documentElement.appendChild(script);
  script.remove();
}

function handlePageMessage(event: MessageEvent) {
  if (event.source !== window || !event.data || event.data.source !== 'ritual-wallet-page') {
    return;
  }

  const { requestId, payload } = event.data;
  if (!requestId || !payload) {
    return;
  }

  chrome.runtime.sendMessage({ type: 'RITUAL_PROVIDER_REQUEST', requestId, payload }, (response) => {
    window.postMessage({ source: 'ritual-wallet-extension', requestId, response }, '*');
  });
}

injectProvider();
window.addEventListener('message', handlePageMessage);
