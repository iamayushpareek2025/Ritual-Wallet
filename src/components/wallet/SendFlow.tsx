import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Send as SendIcon, 
  ScanLine, 
  User,
  Info,
  Check,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Activity,
  ChevronDown
} from 'lucide-react';
import { useWalletStore } from '../../stores/useWalletStore';
import { useUIStore } from '../../stores/useUIStore';
import { WalletGuard } from '../../security/walletGuard';
import type { SecurityReport } from '../../security/transactionRisk';

interface SendFlowProps {
  onSend: (recipient: string, amount: string, asset: 'RITUAL'|'USDC') => Promise<void>;
  addressBook?: { name: string, address: string }[];
}

export function SendFlow({ onSend, addressBook = [] }: SendFlowProps) {
  const { balance, usdcBalance, transactions } = useWalletStore();
  const { setActiveTab, sendToken, setCurrentView, triggerToast } = useUIStore();
  
  const [step, setStep] = useState(1);
  const [asset, setAsset] = useState<'RITUAL'|'USDC'>(sendToken || 'RITUAL');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [loading, setLoading] = useState(false);
  const [securityReport, setSecurityReport] = useState<SecurityReport | null>(null);
  const [isGuarding, setIsGuarding] = useState(false);
  const [riskAccepted, setRiskAccepted] = useState(false);

  const currentBalance = asset === 'RITUAL' ? balance : usdcBalance;
  const recentContacts = Array.from(new Set(transactions.filter(tx => tx.type === 'send' && tx.to).map(tx => tx.to))).slice(0, 2);

  const handleNext = async () => {
    if (step === 2 && recipient) {
      setIsGuarding(true);
      try {
        const guard = WalletGuard.getInstance();
        const txReq = { to: recipient, value: amount };
        const res = await guard.guardTransaction(txReq as any, useWalletStore.getState().isMainnet);
        setSecurityReport(res.report);
      } catch (e) {
        console.error("Guard error", e);
      } finally {
        setIsGuarding(false);
        setStep(3);
      }
    } else if (step < 3) {
      setStep(step + 1);
    }
  };

  const applyPercent = (percent: number) => {
    const balNum = parseFloat(currentBalance || '0');
    if (balNum <= 0) return;
    setAmount((balNum * percent).toFixed(asset === 'RITUAL' ? 4 : 2));
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[#090909] text-white">
      {/* Header */}
      {step < 4 && (
        <div className="px-4 py-4 sticky top-0 bg-[#090909]/80 backdrop-blur-xl z-10 border-b border-white/5 flex items-center gap-3 shrink-0">
          <button 
            onClick={() => step === 1 ? setCurrentView('main') : setStep(step - 1)}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition border border-white/5"
          >
            <ArrowLeft size={16} className="text-white" />
          </button>
          <h1 className="text-xl font-bold tracking-tight">Send</h1>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 pb-24 scrollbar-hide">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: Token & Amount */}
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex flex-col min-h-[440px] gap-4"
            >
              {/* Token Selector Card */}
              <div className="p-4 rounded-[20px] bg-white/5 border border-white/10 flex justify-between items-center">
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Token</span>
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 cursor-pointer">
                  <img 
                    src={asset === 'RITUAL' ? 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=029' : 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=029'} 
                    className="w-5 h-5 object-contain" 
                    alt={asset} 
                  />
                  <select 
                    value={asset} 
                    onChange={(e) => setAsset(e.target.value as any)}
                    className="bg-transparent text-white font-bold text-xs outline-none cursor-pointer pr-1"
                  >
                    <option className="bg-[#090909] text-white" value="RITUAL">RITUAL</option>
                    <option className="bg-[#090909] text-white" value="USDC">USDC</option>
                  </select>
                </div>
              </div>

              {/* Amount input card */}
              <div className="p-5 rounded-[20px] bg-white/5 border border-white/10 flex flex-col gap-2">
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Amount</span>
                <div className="flex items-center justify-between">
                  <input 
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="bg-transparent text-4xl font-bold text-white w-2/3 outline-none placeholder-gray-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    autoFocus
                  />
                  <span className="text-sm font-semibold text-gray-500">{asset}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-gray-500 font-semibold pt-1">
                  <span>~${(parseFloat(amount || '0') * (asset === 'RITUAL' ? 150 : 1)).toFixed(2)}</span>
                  <span className="cursor-pointer hover:text-gray-300" onClick={() => setAmount(currentBalance || '0')}>
                    Bal: {parseFloat(currentBalance || "0").toLocaleString()} {asset}
                  </span>
                </div>
              </div>

              {/* Percent quick selection pills */}
              <div className="flex gap-2">
                {[0.25, 0.50, 0.75, 1.0].map((p, i) => (
                  <button 
                    key={i} 
                    onClick={() => applyPercent(p)}
                    className="flex-1 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/10 transition"
                  >
                    {p === 1.0 ? 'MAX' : `${p*100}%`}
                  </button>
                ))}
              </div>

              {/* Network select card */}
              <div className="p-4 rounded-[20px] bg-white/5 border border-white/10 flex justify-between items-center mt-2">
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Network</span>
                <span className="text-[#00FFA3] font-bold text-xs bg-[#00FFA3]/10 border border-[#00FFA3]/20 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00FFA3] animate-pulse" />
                  Ritual Testnet
                </span>
              </div>

              {/* Next button */}
              <button 
                disabled={!amount || parseFloat(amount) <= 0}
                onClick={handleNext}
                className="w-full mt-auto py-3.5 rounded-2xl bg-[#00FFA3] text-black font-bold text-base hover:brightness-105 transition disabled:opacity-40 disabled:shadow-none active:scale-99 shadow-[0_0_20px_rgba(0,255,163,0.2)]"
              >
                Review Transaction
              </button>
            </motion.div>
          )}

          {/* STEP 2: Recipient input */}
          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex flex-col min-h-[440px] gap-4"
            >
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Recipient</span>
                <span className="text-[10px] text-[#00FFA3] font-bold uppercase cursor-pointer hover:underline" onClick={() => triggerToast('Address book selected')}>Address Book</span>
              </div>

              <div className="relative">
                <input 
                  type="text" 
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Enter 0x address or ENS name"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#00FFA3]/50 transition text-xs pr-10"
                />
                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition">
                  <ScanLine size={16} />
                </button>
              </div>

              {/* Saved Contacts list */}
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1 mt-2">Saved Contacts</div>
              <div className="flex flex-col gap-2 max-h-[120px] overflow-y-auto scrollbar-hide">
                {addressBook.length > 0 ? (
                  addressBook.map((contact, i) => (
                    <div 
                      key={i}
                      onClick={() => setRecipient(contact.address)}
                      className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3 cursor-pointer hover:bg-white/10 transition active:scale-99"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#00FFA3]/10 border border-[#00FFA3]/20 flex items-center justify-center shrink-0">
                        <User size={14} className="text-[#00FFA3]" />
                      </div>
                      <div>
                        <div className="text-white text-xs font-semibold">{contact.name}</div>
                        <div className="text-gray-500 text-[10px] font-mono mt-0.5">{contact.address.slice(0, 8)}...{contact.address.slice(-6)}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-[10px] italic px-1">No contacts saved.</div>
                )}
              </div>

              {recentContacts.length > 0 && (
                <>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1 mt-2">Recent</div>
                  <div className="flex flex-col gap-2">
                    {recentContacts.map((addr, i) => (
                      <div 
                        key={`recent-${i}`}
                        onClick={() => setRecipient(addr)}
                        className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3 cursor-pointer hover:bg-white/10 transition active:scale-99"
                      >
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 shrink-0">
                          <User size={14} />
                        </div>
                        <div className="text-white text-xs font-mono">{addr.slice(0, 8)}...{addr.slice(-6)}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <button 
                disabled={!recipient || isGuarding}
                onClick={handleNext}
                className="w-full py-3.5 rounded-2xl bg-[#00FFA3] text-black font-bold text-base disabled:opacity-40 disabled:cursor-not-allowed mt-auto hover:brightness-105 transition flex items-center justify-center gap-2 active:scale-98 shadow-[0_0_20px_rgba(0,255,163,0.2)]"
              >
                {isGuarding ? (
                   <>
                     <Activity size={16} className="animate-spin" />
                     Checking attestation...
                   </>
                ) : "Review Transaction"}
              </button>
            </motion.div>
          )}

          {/* STEP 3: Confirm Details */}
          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex flex-col min-h-[440px] gap-4"
            >
              <div className="p-6 rounded-[24px] bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-1.5">
                <span className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider">Sending Amount</span>
                <div className="text-3xl font-bold text-white tracking-tight">
                  {amount} {asset}
                </div>
                <span className="text-gray-500 text-xs font-semibold">
                  ~${(parseFloat(amount) * (asset === 'RITUAL' ? 150 : 1)).toFixed(2)}
                </span>
              </div>

              <div className="p-4 rounded-[20px] bg-white/5 border border-white/10 flex flex-col gap-3 mt-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Recipient Address</span>
                  <span className="text-white font-mono">{recipient.slice(0, 8)}...{recipient.slice(-6)}</span>
                </div>
                <div className="h-px bg-white/5 w-full" />
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Network Fee</span>
                  <div className="flex flex-col items-end">
                    <span className="text-white font-semibold">0.0001 RITUAL</span>
                    <span className="text-gray-500 text-[10px]">~$0.015</span>
                  </div>
                </div>
              </div>

              {securityReport && (
                <div className={`p-4 rounded-xl border flex flex-col gap-2 ${
                  !securityReport.isSafe ? 'bg-red-500/10 border-red-500/30' : 
                  securityReport.score > 70 ? 'bg-orange-500/10 border-orange-500/30' : 
                  'bg-[#00FFA3]/10 border-[#00FFA3]/30'
                }`}>
                   <div className="flex items-center gap-2 mb-1">
                     {!securityReport.isSafe ? <ShieldAlert size={16} className="text-red-500" /> : 
                      securityReport.score > 70 ? <AlertTriangle size={16} className="text-orange-500" /> : 
                      <ShieldCheck size={16} className="text-[#00FFA3]" />}
                     <span className={`font-semibold text-xs ${
                        !securityReport.isSafe ? 'text-red-500' : 
                        securityReport.score > 70 ? 'text-orange-500' : 
                        'text-[#00FFA3]'
                     }`}>
                       TEE Guardian Audit (Score: {securityReport.score}/100)
                     </span>
                   </div>
                   {securityReport.warnings.map((w, i) => (
                      <div key={i} className="text-[10px] text-red-400 font-medium">• {w}</div>
                   ))}
                   {securityReport.explanations.map((e, i) => (
                      <div key={i} className="text-[10px] text-gray-300">• {e}</div>
                   ))}
                   {(!securityReport.isSafe || securityReport.score >= 70) && (
                     <div className="mt-2 flex items-center gap-2 border-t border-white/10 pt-2">
                        <input type="checkbox" id="riskAccept" className="w-4 h-4 rounded bg-white/5 border-white/20 accent-red-500 cursor-pointer" checked={riskAccepted} onChange={(e) => setRiskAccepted(e.target.checked)} />
                        <label htmlFor="riskAccept" className="text-[10px] font-bold text-red-400 cursor-pointer">I understand and confirm the risks.</label>
                     </div>
                   )}
                </div>
              )}

              <button 
                disabled={loading || (securityReport ? (!securityReport.isSafe || securityReport.score >= 70) && !riskAccepted : false)}
                onClick={async () => {
                  setLoading(true);
                  try {
                    await onSend(recipient, amount, asset);
                    setStep(4);
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setLoading(false);
                  }
                }}
                className="w-full py-4 rounded-2xl bg-[#00FFA3] text-black font-bold text-lg mt-auto hover:brightness-105 transition flex items-center justify-center gap-2 disabled:opacity-40 active:scale-99 shadow-[0_0_20px_rgba(0,255,163,0.2)]"
              >
                <SendIcon size={16} />
                {loading ? "Signing Transaction..." : "Confirm & Send"}
              </button>
            </motion.div>
          )}

          {/* STEP 4: Success View */}
          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center h-[55vh] gap-6 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-[#00FFA3]/10 flex items-center justify-center border border-[#00FFA3]/20 shadow-[0_0_30px_rgba(0,255,163,0.25)]">
                <Check size={36} className="text-[#00FFA3]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1.5">Transaction Broadcasted</h3>
                <p className="text-gray-400 text-[11px] max-w-[240px] mx-auto leading-relaxed">
                  Your transfer of <span className="text-white font-semibold">{amount} {asset}</span> has been processed inside the secure enclave node.
                </p>
              </div>
              
              <div className="p-3.5 rounded-[20px] bg-white/5 border border-white/5 w-full text-left space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 font-medium">To Recipient</span>
                  <span className="text-white font-mono">{recipient.slice(0, 8)}...{recipient.slice(-6)}</span>
                </div>
                <div className="h-px bg-white/5 w-full" />
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 font-medium">Asset & Amount</span>
                  <span className="text-white font-semibold">{amount} {asset}</span>
                </div>
              </div>

              <button 
                onClick={() => {
                  setCurrentView('main');
                  setActiveTab('activity');
                }}
                className="w-full py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-semibold transition text-xs border border-white/5"
              >
                Done
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
