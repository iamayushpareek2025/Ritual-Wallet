import { ethers } from 'ethers';

const rpcUrl = process.env.RPC_URL || 'https://rpc.ritualfoundation.org';
const provider = new ethers.JsonRpcProvider(rpcUrl);
const TEE_REGISTRY = '0x6D941571d1C9e7a7F1fba65AC0f95C8A9680e55';
const registryAbi = [
  'function getExecutors(uint8 capability) external view returns (address[] memory)'
];

const iface = new ethers.Interface(registryAbi);

(async () => {
  try {
    const data = iface.encodeFunctionData('getExecutors', [1]);
    const bodyObj = { jsonrpc: '2.0', id: 1, method: 'eth_call', params: [{ to: TEE_REGISTRY, data }, 'latest'] };
    const body = JSON.stringify(bodyObj);
    console.log('POST', rpcUrl, 'body:', JSON.stringify({ to: TEE_REGISTRY, data: data.slice(0, 80) + '...' }));
    const resp = await fetch(rpcUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
    const json = await resp.json();
    if (json.error) throw new Error(JSON.stringify(json.error));
    const res = json.result;
    const decoded = iface.decodeFunctionResult('getExecutors', res);
    const executors = decoded[0];
    console.log('rpcUrl=', rpcUrl);
    console.log('found executors count=', executors.length);
    executors.forEach((e, i) => console.log(i, e));
  } catch (e) {
    console.error('error fetching executors:', e.message || e);
    process.exit(1);
  }
})();
