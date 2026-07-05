import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Code, 
  ExternalLink, 
  Globe, 
  Info, 
  MessageSquare, 
  Sparkles, 
  Terminal,
  Grid,
  Cpu,
  Layers,
  HelpCircle
} from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';

interface EcosystemLink {
  title: string;
  description: string;
  url: string;
  icon: any;
  category: 'docs' | 'community' | 'developer';
}

const OFFICIAL_LINKS: EcosystemLink[] = [
  {
    title: 'Ritual Documentation',
    description: 'docs.ritual.net',
    url: 'https://docs.ritual.net/',
    icon: BookOpen,
    category: 'docs'
  },
  {
    title: 'Ritual GitHub',
    description: 'github.com/ritual-net',
    url: 'https://github.com/ritual-net',
    icon: Code,
    category: 'developer'
  },
  {
    title: 'Ritual Website',
    description: 'ritual.net',
    url: 'https://ritual.net/',
    icon: Globe,
    category: 'docs'
  },
  {
    title: 'Community Discord',
    description: 'discord.gg/ritual',
    url: 'https://discord.gg/ritual-net',
    icon: MessageSquare,
    category: 'community'
  }
];

export const DiscoverScreen: React.FC = () => {
  const categories = [
    { label: 'Projects', icon: Layers },
    { label: 'Agents', icon: Cpu },
    { label: 'Docs', icon: BookOpen },
    { label: 'Tutorials', icon: Terminal }
  ];

  return (
    <div className="flex flex-col flex-1 h-full bg-[#000000] text-white overflow-hidden">
      
      {/* Sticky Header Banner */}
      <div className="p-4 border-b border-white/5 shrink-0 sticky top-0 bg-[#000000]/80 backdrop-blur-xl z-10 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Discover</h2>
          <p className="text-[11px] text-gray-500 mt-0.5">Explore the AI-native future on Ritual.</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#00FFA3]/10 border border-[#00FFA3]/20 flex items-center justify-center text-[#00FFA3]">
          <Sparkles size={14} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5 pb-24 scrollbar-hide">
        
        {/* Glowing Holographic Cube Illustration Card */}
        <div className="flex justify-center items-center py-6 bg-gradient-to-b from-[#00FFA3]/5 to-transparent border border-white/5 rounded-3xl p-4 shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-[#00FFA3]/5 blur-2xl pointer-events-none rounded-full" />
          
          <svg className="w-24 h-24 animate-pulse relative z-10" viewBox="0 0 100 100" fill="none">
            {/* Cube wireframe lines */}
            <path d="M50,15 L85,35 L85,75 L50,95 L15,75 L15,35 Z" stroke="#00FFA3" strokeWidth="1.5" strokeOpacity="0.4" />
            <path d="M50,15 L50,55 M50,55 L85,75 M50,55 L15,75" stroke="#00FFA3" strokeWidth="2" strokeOpacity="0.7" />
            <path d="M50,30 L72,43 L72,67 L50,80 L28,67 L28,43 Z" stroke="#00FFA3" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.5" />
            <circle cx="50" cy="55" r="4" fill="#00FFA3" />
          </svg>
        </div>

        {/* 1x4 Categories Horizontal Action Pills */}
        <div className="space-y-2">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Ecosystem</div>
          <div className="grid grid-cols-4 gap-2">
            {categories.map((c, i) => {
              const Icon = c.icon;
              return (
                <button 
                  key={i} 
                  onClick={() => useUIStore.getState().triggerToast(`${c.label} section coming soon!`)}
                  className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition active:scale-95 cursor-pointer"
                >
                  <Icon size={16} className="text-[#00FFA3] mb-1" />
                  <span className="text-[10px] text-gray-400 font-semibold">{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Official Links list */}
        <div className="space-y-2">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Official Links</div>
          <div className="flex flex-col gap-2.5">
            {OFFICIAL_LINKS.map((link, idx) => {
              const Icon = link.icon;
              return (
                <motion.a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-4 rounded-[20px] bg-white/5 border border-white/5 hover:border-[#00FFA3]/20 hover:bg-white/10 transition-all duration-150 flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#00FFA3] shrink-0">
                      <Icon size={14} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white">{link.title}</h3>
                      <p className="text-[10px] text-gray-500 font-mono mt-0.5">{link.description}</p>
                    </div>
                  </div>
                  <ExternalLink size={11} className="text-gray-500 shrink-0" />
                </motion.a>
              );
            })}
          </div>
        </div>

        {/* Empty Updates Alert */}
        <div className="p-3.5 rounded-[18px] bg-white/5 border border-white/10 flex items-start gap-2.5 shrink-0 mt-2">
          <Info size={14} className="text-gray-400 mt-0.5 shrink-0" />
          <div className="text-[10px] text-gray-400 leading-relaxed">
            No official ecosystem updates available. Check the verified links above to browse documentation.
          </div>
        </div>

      </div>
    </div>
  );
};
