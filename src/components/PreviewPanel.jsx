import { useEffect, useRef } from 'react';
import { Eye } from 'lucide-react';
import './PreviewPanel.css';

const PreviewPanel = ({ code, isGenerating }) => {
  const iframeRef = useRef(null);

  useEffect(() => {
    if (code && iframeRef.current) {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      
      iframeDoc.open();
      iframeDoc.write(code);
      iframeDoc.close();
    }
  }, [code]);

  return (
    <div className="preview-panel">
      <div className="preview-panel-header">
        <div className="header-content">
          <Eye size={20} />
          <h2>Live Preview</h2>
        </div>
      </div>
      
      <div className="preview-content">
        {isGenerating ? (
          <div className="preview-placeholder">
            <div className="loading-spinner"></div>
            <p>Generating your application...</p>
          </div>
        ) : code ? (
          <iframe
            ref={iframeRef}
            className="preview-iframe"
            title="App Preview"
            sandbox="allow-scripts allow-modals allow-same-origin"
          />
        ) : (
          <div className="preview-placeholder">
            <Eye size={48} strokeWidth={1.5} />
            <h3>No Preview Yet</h3>
            <p>Describe your application and click "Generate Application" to see a live preview here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewPanel;

