import { useEffect, useMemo } from 'react';
import { X, Settings, Split, MessageSquare, Trash2 } from 'lucide-react';
import './CommandPalette.css';

const CommandPalette = ({ isOpen, onClose, onToggleSplit, onOpenSettings, onClearChat }) => {
  const commands = useMemo(
    () => [
      { id: 'settings', label: 'Open Settings', icon: Settings, action: onOpenSettings, kbd: 'S' },
      { id: 'toggle-split', label: 'Toggle Split View', icon: Split, action: onToggleSplit, kbd: 'T' },
      { id: 'clear-chat', label: 'Clear Chat History', icon: Trash2, action: onClearChat, kbd: 'C' },
    ],
    [onOpenSettings, onToggleSplit, onClearChat]
  );

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const letter = e.key?.toUpperCase();
      const cmd = commands.find((c) => c.kbd === letter);
      if (cmd) {
        e.preventDefault();
        cmd.action();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, commands, onClose]);

  if (!isOpen) return null;

  return (
    <div className="cmd-overlay" onClick={onClose}>
      <div className="cmd-container" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="cmd-header">
          <div className="cmd-title">Command Palette</div>
          <button className="cmd-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="cmd-list" role="menu">
          {commands.map(({ id, label, icon: Icon, action, kbd }) => (
            <button key={id} className="cmd-item" role="menuitem" onClick={() => { action(); onClose(); }}>
              <div className="cmd-left">
                <Icon size={16} />
                <span>{label}</span>
              </div>
              <kbd className="cmd-kbd">{kbd}</kbd>
            </button>
          ))}
        </div>
        <div className="cmd-hint">
          Press <kbd>Esc</kbd> to close. Use <kbd>⌘K</kbd>/<kbd>Ctrl K</kbd> to open.
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;


