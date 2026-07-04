// background.ts - Service worker for the extension
chrome.runtime.onInstalled.addListener(() => {
  console.log("Ritual Wallet Extension installed.");
});

const pendingConnectRequests = new Map();

const openConnectPage = () => {
  const url = chrome.runtime.getURL('index.html?connect=true');
  chrome.tabs.create({ url, active: true });
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || !message.type) {
    return false;
  }

  if (message.type === 'RITUAL_PROVIDER_REQUEST') {
    const { payload, requestId } = message;
    if (!payload || !requestId) {
      sendResponse({ success: false, error: 'Invalid provider request' });
      return;
    }

    if (payload.method === 'eth_requestAccounts') {
      pendingConnectRequests.set(requestId, sendResponse);
      const origin = sender.tab?.url ? new URL(sender.tab.url).hostname : 'Unknown';
      const pending = { requestId, origin, timestamp: Date.now() };
      chrome.storage.local.set({ ritual_pending_connect_request: pending }, () => {
        openConnectPage();
      });
      return true;
    }

    if (payload.method === 'eth_accounts') {
      chrome.storage.local.get(['ritual_active_address'], (result) => {
        const address = result.ritual_active_address;
        sendResponse({ success: true, result: address ? [address] : [] });
      });
      return true;
    }

    if (payload.method === 'eth_chainId') {
      sendResponse({ success: true, result: '0x0' });
      return true;
    }

    if (payload.method === 'net_version') {
      sendResponse({ success: true, result: '0' });
      return true;
    }

    sendResponse({ success: false, error: `Unsupported method: ${payload.method}` });
    return;
  }

  if (message.type === 'RITUAL_PROVIDER_RESPONSE') {
    const { requestId, response } = message;
    const callback = pendingConnectRequests.get(requestId);
    if (callback) {
      callback(response);
      pendingConnectRequests.delete(requestId);
      chrome.storage.local.remove(['ritual_pending_connect_request']);
      sendResponse({ success: true });
      return true;
    }
    sendResponse({ success: false, error: 'Request not found' });
    return;
  }

  return false;
});
