import { Home, LayoutPanelTop, History, Sparkles, Code2, Eye, Trash2 } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ showSplitView, onToggleSplit, onClearChat }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <button className="side-item active" title="Home">
          <Home size={18} />
          <span>Home</span>
        </button>
        <button className="side-item" onClick={onToggleSplit} title="Toggle Split View">
          {showSplitView ? <Eye size={18} /> : <LayoutPanelTop size={18} />}
          <span>{showSplitView ? 'Preview' : 'Split View'}</span>
        </button>
        <button className="side-item" title="Generate">
          <Sparkles size={18} />
          <span>Generate</span>
        </button>
      </div>

      <div className="sidebar-section">
        <div className="side-label">Workspace</div>
        <button className="side-item" title="Code">
          <Code2 size={18} />
          <span>Code</span>
        </button>
        <button className="side-item" title="History">
          <History size={18} />
          <span>History</span>
        </button>
        <button className="side-item danger" onClick={onClearChat} title="Clear Chat">
          <Trash2 size={18} />
          <span>Clear Chat</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;


