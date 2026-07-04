import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Send as SendIcon, 
  ScanLine, 
  User,
  Info
} from 'lucide-react';
import { useWalletStore } from '../../stores/useWalletStore';
import { useUIStore } from '../../stores/useUIStore';

interface SendFlowProps {
  onSend: (recipient: string, amount: string, asset: 'RITUAL'|'USDC') => Promise<void>;
  addressBook?: { name: string, address: string }[];
}

export function SendFlow({ onSend, addressBook = [] }: SendFlowProps) {
  const { balance, usdcBalance } = useWalletStore();
  const { setActiveTab, sendToken, setCurrentView } = useUIStore();
  
  const [step, setStep] = useState(1);
  const [asset, setAsset] = useState<'RITUAL'|'USDC'>(sendToken || 'RITUAL');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [loading, setLoading] = useState(false);

  const currentBalance = asset === 'RITUAL' ? balance : usdcBalance;

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[#09090b]">
      {/* Header */}
      <div className="px-4 py-4 sticky top-0 bg-[#09090b]/80 backdrop-blur-xl z-10 border-b border-white/5 flex items-center gap-3">
        <button 
          onClick={() => step === 1 ? setCurrentView('main') : setStep(step - 1)}
          className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>
        <h1 className="text-xl font-semibold text-white tracking-tight">Send {asset}</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-4">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: Amount */}
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col min-h-full"
            >
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <img 
                      src={asset === 'RITUAL' ? 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=029' : 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=029'} 
                      className="w-6 h-6" 
                      alt={asset} 
                    />
                    <select 
                      value={asset} 
                      onChange={(e) => setAsset(e.target.value as any)}
                      className="bg-transparent text-white font-semibold text-lg outline-none cursor-pointer"
                    >
                      <option className="bg-[#09090b] text-white" value="RITUAL">RITUAL</option>
                      <option className="bg-[#09090b] text-white" value="USDC">USDC</option>
                    </select>
                  </div>
                </div>

                <input 
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full text-center text-6xl font-bold text-white bg-transparent outline-none placeholder-gray-700"
                  autoFocus
                />
                
                <div className="mt-8 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-400 flex items-center gap-2 cursor-pointer hover:bg-white/10 transition">
                  Balance: {parseFloat(currentBalance || "0").toLocaleString()} {asset}
                  <span className="text-[#00FFA3] font-semibold" onClick={() => setAmount(currentBalance || "0")}>MAX</span>
                </div>
              </div>
              
              <button 
                disabled={!amount || parseFloat(amount) <= 0}
                onClick={handleNext}
                className="w-full py-4 rounded-2xl bg-[#0A84FF] text-white font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed mt-auto hover:brightness-110 transition"
              >
                Next
              </button>
            </motion.div>
          )}

          {/* STEP 2: Recipient */}
          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col min-h-full gap-4"
            >
              <div className="relative">
                <input 
                  type="text" 
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Enter address or ENS name"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#0A84FF] transition"
                />
                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition">
                  <ScanLine size={20} />
                </button>
              </div>

              <div className="text-sm font-semibold text-gray-400 mt-2 px-2">Saved Contacts</div>
              
              <div className="flex flex-col gap-2">
                {addressBook.length > 0 ? (
                  addressBook.map((contact, i) => (
                    <div 
                      key={i}
                      onClick={() => setRecipient(contact.address)}
                      className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3 cursor-pointer hover:bg-white/10 transition"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#00FFA3]/10 border border-[#00FFA3]/20 flex items-center justify-center">
                        <User size={18} className="text-[#00FFA3]" />
                      </div>
                      <div>
                        <div className="text-white font-medium">{contact.name}</div>
                        <div className="text-gray-500 text-xs font-mono">{contact.address.length > 20 ? `${contact.address.slice(0, 8)}...${contact.address.slice(-6)}` : contact.address}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500 text-sm">
                    No saved contacts found.<br/> Add contacts in Settings.
                  </div>
                )}
              </div>

              <button 
                disabled={!recipient}
                onClick={handleNext}
                className="w-full py-4 rounded-2xl bg-[#0A84FF] text-white font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed mt-auto hover:brightness-110 transition"
              >
                Review Transaction
              </button>
            </motion.div>
          )}

          {/* STEP 3: Review */}
          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col min-h-full gap-4"
            >
              <div className="p-6 rounded-[24px] bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-2">
                <div className="text-gray-400 text-sm font-medium">You are sending</div>
                <div className="text-4xl font-bold text-white tracking-tighter">
                  {amount} {asset}
                </div>
                <div className="text-gray-500 text-sm">
                  ~${(parseFloat(amount) * (asset === 'RITUAL' ? 150 : 1)).toFixed(2)}
                </div>
              </div>

              <div className="p-4 rounded-[20px] bg-white/5 border border-white/10 flex flex-col gap-4 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">To</span>
                  <span className="text-white font-mono text-sm">{recipient.slice(0, 6)}...{recipient.slice(-4)}</span>
                </div>
                <div className="h-px bg-white/5 w-full" />
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Network Fee</span>
                  <div className="flex flex-col items-end">
                    <span className="text-white font-medium text-sm">0.0001 RITUAL</span>
                    <span className="text-gray-500 text-xs">~$0.015</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#0A84FF]/10 border border-[#0A84FF]/20 flex items-start gap-3 mt-2">
                <Info size={18} className="text-[#0A84FF] mt-0.5 shrink-0" />
                <div className="text-xs text-[#0A84FF] leading-relaxed">
                  <span className="font-semibold block mb-0.5">Testnet Simulator Mode</span>
                  This transaction is simulated locally for UI testing. Real network fees and transfers apply on Mainnet.
                </div>
              </div>

              <button 
                disabled={loading}
                onClick={async () => {
                  setLoading(true);
                  try {
                    await onSend(recipient, amount, asset);
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setLoading(false);
                  }
                }}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#00FFA3] to-[#0A84FF] text-black font-bold text-lg mt-auto hover:brightness-110 transition shadow-[0_0_20px_rgba(0,255,163,0.3)] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <SendIcon size={20} />
                {loading ? "Sending..." : "Confirm & Send"}
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
