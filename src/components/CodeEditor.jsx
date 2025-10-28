import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Code2, Download, Copy, Check, FileJson } from 'lucide-react';
import { downloadCode, copyCodeToClipboard } from '../utils/exportFormats';
import './CodeEditor.css';

const CodeEditor = ({ code, onCodeChange, isGenerating }) => {
  const [copied, setCopied] = useState(false);
  const [exportFormat, setExportFormat] = useState('html');
  const [showFormatMenu, setShowFormatMenu] = useState(false);

  const handleEditorChange = (value) => {
    onCodeChange(value);
  };

  const handleDownload = () => {
    if (!code) return;

    try {
      downloadCode(code, exportFormat, 'app');
    } catch (err) {
      console.error('Failed to download:', err);
      alert('Failed to download code');
    }
  };

  const handleCopy = async () => {
    if (!code) return;

    try {
      const success = await copyCodeToClipboard(code, exportFormat);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        alert('Failed to copy code');
      }
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy code');
    }
  };

  const exportFormats = [
    { value: 'html', label: 'HTML', icon: '🌐' },
    { value: 'react', label: 'React', icon: '⚛️' },
    { value: 'vue', label: 'Vue', icon: '💚' },
    { value: 'angular', label: 'Angular', icon: '🅰️' },
    { value: 'javascript', label: 'JavaScript', icon: '📜' },
    { value: 'typescript', label: 'TypeScript', icon: '📘' },
  ];

  return (
    <div className="code-editor">
      <div className="code-editor-header">
        <div className="header-content">
          <Code2 size={20} />
          <h2>Code Editor</h2>
        </div>
        <div className="header-actions">
          <div className="format-selector">
            <button
              className="format-button"
              onClick={() => setShowFormatMenu(!showFormatMenu)}
              title="Select export format"
            >
              <FileJson size={18} />
              <span>{exportFormat.toUpperCase()}</span>
            </button>
            {showFormatMenu && (
              <div className="format-menu">
                {exportFormats.map((fmt) => (
                  <button
                    key={fmt.value}
                    className={`format-option ${exportFormat === fmt.value ? 'active' : ''}`}
                    onClick={() => {
                      setExportFormat(fmt.value);
                      setShowFormatMenu(false);
                    }}
                  >
                    <span className="format-icon">{fmt.icon}</span>
                    <span>{fmt.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            className="icon-button"
            onClick={handleCopy}
            disabled={!code}
            title="Copy code"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>
          <button
            className="icon-button"
            onClick={handleDownload}
            disabled={!code}
            title={`Download as ${exportFormat.toUpperCase()}`}
          >
            <Download size={18} />
          </button>
        </div>
      </div>
      
      <div className="editor-content">
        {isGenerating ? (
          <div className="editor-placeholder">
            <div className="loading-spinner"></div>
            <p>Generating code...</p>
          </div>
        ) : code ? (
          <Editor
            height="100%"
            defaultLanguage="html"
            value={code}
            onChange={handleEditorChange}
            theme="vs-light"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'on',
              fontFamily: 'JetBrains Mono, monospace',
            }}
          />
        ) : (
          <div className="editor-placeholder">
            <Code2 size={48} strokeWidth={1.5} />
            <h3>No Code Yet</h3>
            <p>Generated code will appear here. You can edit it and see changes in real-time.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeEditor;

