import { Search, Settings, Command, Sparkles } from 'lucide-react';
import './Topbar.css';

const Topbar = ({ onOpenSettings, onOpenCommand }) => {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="brand">
          <span className="brand-logo">✨</span>
          <div className="brand-text">
            <h1>RAJ AI</h1>
            <span>App Builder</span>
          </div>
        </div>
      </div>
      <div className="topbar-center">
        <div className="searchbar" role="search">
          <Search size={16} />
          <input placeholder="Search commands, actions, or help…" aria-label="Search" />
          <kbd>⌘K</kbd>
        </div>
      </div>
      <div className="topbar-right">
        <button className="topbar-btn" onClick={onOpenCommand} title="Command Palette (⌘K)">
          <Command size={18} />
        </button>
        <button className="topbar-btn primary" onClick={onOpenSettings} title="Settings">
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
};

export default Topbar;


