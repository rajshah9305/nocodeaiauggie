import { useState, useEffect } from 'react';
import Split from 'react-split';
import { Settings } from 'lucide-react';
import PreviewPanel from './components/PreviewPanel';
import CodeEditor from './components/CodeEditor';
import ChatInterface from './components/ChatInterface';
import SettingsModal from './components/SettingsModal';
import { generateAppCode } from './services/geminiService';
import './App.css';

function App() {
  const [code, setCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const handleApiKeyChange = (newApiKey) => {
    setApiKey(newApiKey);
    localStorage.setItem('gemini_api_key', newApiKey);
  };

  const handleGenerate = async (description) => {
    setIsGenerating(true);
    setError('');

    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: description,
      timestamp: new Date(),
    };
    setChatMessages((prev) => [...prev, userMessage]);

    try {
      const generatedCode = await generateAppCode(description, apiKey);
      setCode(generatedCode);

      // Add assistant message to chat with generated code
      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: 'Generated your application successfully!',
        code: generatedCode,
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(err.message);
      console.error('Generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
  };

  const handleCodeSelect = (selectedCode) => {
    setCode(selectedCode);
  };

  return (
    <div className="app-container">
      <div className="app-header">
        <div className="header-content">
          <div className="header-branding">
            <div className="header-logo">✨</div>
            <div className="header-text">
              <h1 className="app-title">RAJ AI APP BUILDER</h1>
              <p className="app-subtitle">Transform Ideas into Code</p>
            </div>
          </div>
        </div>
        <button
          className="settings-button"
          onClick={() => setIsSettingsOpen(true)}
          title="Settings"
        >
          <Settings size={24} />
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <div className="error-content">
            <span>{error}</span>
            <button
              className="error-close"
              onClick={() => setError('')}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="app-content">
        <Split
          sizes={[50, 50]}
          minSize={300}
          gutterSize={8}
          gutterAlign="center"
          snapOffset={30}
          dragInterval={1}
          direction="horizontal"
          cursor="col-resize"
          className="split-container"
        >
          <CodeEditor code={code} onCodeChange={handleCodeChange} />
          <PreviewPanel code={code} isGenerating={isGenerating} />
        </Split>
      </div>

      <ChatInterface
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
        apiKey={apiKey}
        onCodeSelect={handleCodeSelect}
        chatMessages={chatMessages}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        onApiKeyChange={handleApiKeyChange}
      />
    </div>
  );
}

export default App;
