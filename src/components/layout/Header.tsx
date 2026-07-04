import { Menu, ChevronDown } from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';

interface HeaderProps {
  activeAccountIndex: number;
  accountNames: Record<number, string>;
  accountImages: Record<number, string>;
  showAccountMenu: boolean;
  setShowAccountMenu: (val: boolean) => void;
  setRevealSeed: (val: boolean) => void;
  menuRef?: React.RefObject<HTMLDivElement | null>;
}

export function Header({
  activeAccountIndex,
  accountNames,
  accountImages,
  showAccountMenu,
  setShowAccountMenu,
  setRevealSeed,
  menuRef
}: HeaderProps) {
  const setCurrentView = useUIStore(state => state.setCurrentView);

  return (
    <div className="header" ref={menuRef}>
      <div className="flex-row">
        <img src="/logo.png" style={{width: 28, height: 28}} onError={e => e.currentTarget.style.display = 'none'} />
        <button className="header-icon-btn" onClick={() => { setCurrentView('settings'); setRevealSeed(false); }}>
          <Menu size={20}/>
        </button>
      </div>
      
      <div className="account-selector flex-row" style={{gap: 8, padding: '4px 12px'}} onClick={() => setShowAccountMenu(!showAccountMenu)}>
        {accountImages[activeAccountIndex] ? (
          <img src={accountImages[activeAccountIndex]} style={{width: 20, height: 20, borderRadius: '50%', objectFit: 'cover'}} onError={e => e.currentTarget.style.display = 'none'} />
        ) : null}
        <span style={{maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
          {accountNames[activeAccountIndex] || `Account ${activeAccountIndex + 1}`}
        </span>
        <ChevronDown size={16} color="var(--text-muted)"/>
      </div>
      
      <div className="network-indicator" title="Ritual Testnet"></div>
    </div>
  );
}
