import React, { useState } from 'react';
import { ArrowLeft, Copy, Check, QrCode } from 'lucide-react';

interface ReceiveScreenProps {
  address: string;
  onBack: () => void;
  showToast: (msg: string) => void;
}

export function ReceiveScreen({ address, onBack, showToast }: ReceiveScreenProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    showToast("Address copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(address)}&color=ffffff&bgcolor=18181b`;

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[#09090b]">
      {/* Header */}
      <div className="px-4 py-4 sticky top-0 bg-[#09090b]/80 backdrop-blur-xl z-10 border-b border-white/5 flex items-center gap-3">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>
        <h1 className="text-xl font-semibold text-white tracking-tight">Receive Assets</h1>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6 overflow-y-auto">
        <div className="p-6 rounded-[28px] bg-white/5 border border-white/10 flex flex-col items-center gap-4 relative overflow-hidden shadow-2xl backdrop-blur-md">
          {/* Glass glows */}
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#00FFA3] opacity-[0.05] blur-[50px] pointer-events-none" />
          
          <div className="w-48 h-48 bg-[#18181b] rounded-2xl flex items-center justify-center border border-white/10 p-4 shadow-inner relative z-10">
            {address ? (
              <img 
                src={qrUrl} 
                className="w-full h-full object-contain rounded-lg filter invert" 
                alt="Wallet QR Code" 
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <QrCode size={64} className="text-gray-500 animate-pulse" />
            )}
          </div>
          <div className="text-xs text-gray-400 font-medium text-center max-w-[200px]">
            Scan this QR code from another wallet to send funds to this address.
          </div>
        </div>

        {/* Address Pill */}
        <div className="w-full max-w-sm p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Your Ritual Address</span>
            <span className="text-sm font-mono text-white truncate max-w-[240px] mt-0.5">{address}</span>
          </div>
          <button 
            onClick={handleCopy}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all shrink-0 border border-white/5"
          >
            {copied ? <Check size={18} className="text-[#00FFA3]" /> : <Copy size={18} />}
          </button>
        </div>

        {/* Warning label */}
        <div className="text-xs text-center text-gray-500 max-w-[280px]">
          Only send <span className="text-white font-semibold">RITUAL</span> or mock tokens on the Ritual chain to this address.
        </div>
      </div>
    </div>
  );
}
