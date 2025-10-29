import { useState, useEffect } from 'react';
import Split from 'react-split';
import { Settings } from 'lucide-react';
import { TwentyFirstToolbar } from '@21st-extension/toolbar-react';
import { ReactPlugin } from '@21st-extension/react';
import { validateApiKey } from './utils/errorHandler';
import PreviewPanel from './components/PreviewPanel';
import CodeEditor from './components/CodeEditor';
import ChatInterface from './components/ChatInterface';
import SettingsModal from './components/SettingsModal';
import CommandPalette from './components/CommandPalette';
import ErrorBoundary from './components/ErrorBoundary';
import { generateAppCode } from './services/geminiService';
import './App.css';
import Topbar from './components/Topbar';
import Sidebar from './components/Sidebar';

function App() {
  const [code, setCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [showSplitView, setShowSplitView] = useState(false);
  const [isCmdOpen, setIsCmdOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsCmdOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

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
    // Early API key validation
    if (!apiKey) {
      const errorMessage = 'API key is not set. Please add your API key in Settings.';
      setError(errorMessage);
      setIsSettingsOpen(true);
      const errorChatMessage = {
        id: Date.now(),
        type: 'error',
        content: errorMessage,
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, errorChatMessage]);
      return;
    }

    try {
      validateApiKey(apiKey);
    } catch (e) {
      const errorMessage = e.message || 'API key appears to be invalid';
      setError(errorMessage);
      setIsSettingsOpen(true);
      const errorChatMessage = {
        id: Date.now(),
        type: 'error',
        content: errorMessage,
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, errorChatMessage]);
      return;
    }

    setIsGenerating(true);
    setError('');
    setShowSplitView(true); // Show split view when generating

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
      const errorMessage = err.message || 'An unknown error occurred';
      setError(errorMessage);
      console.error('Generation error:', err);
      
      // Add error message to chat
      const errorChatMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: errorMessage,
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, errorChatMessage]);
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
    <ErrorBoundary>
      <TwentyFirstToolbar config={{ plugins: [ReactPlugin] }} />
      <div className="app-container">
        <Topbar onOpenSettings={() => setIsSettingsOpen(true)} onOpenCommand={() => setIsCmdOpen(true)} />

        {error && (
          <div className={`error-banner ${error.toLowerCase().includes('rate limit') ? 'rate-limit' : ''}`}>
            <div className="error-content">
              <span>{error}</span>
              {(error.toLowerCase().includes('api key') || error.toLowerCase().includes('authentication')) && (
                <button
                  className="error-action"
                  onClick={() => setIsSettingsOpen(true)}
                  title="Open Settings"
                >
                  Open Settings
                </button>
              )}
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
          <Sidebar
            showSplitView={showSplitView}
            onToggleSplit={() => setShowSplitView((v) => !v)}
            onClearChat={() => setChatMessages([])}
          />
          <div className="content-area">
            {showSplitView ? (
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
                <CodeEditor code={code} onCodeChange={handleCodeChange} isGenerating={isGenerating} />
                <PreviewPanel code={code} isGenerating={isGenerating} />
              </Split>
            ) : (
              <ChatInterface
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                apiKey={apiKey}
                onCodeSelect={handleCodeSelect}
                chatMessages={chatMessages}
                fullScreen={true}
              />
            )}
          </div>
        </div>

        {showSplitView && (
          <ChatInterface
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            apiKey={apiKey}
            onCodeSelect={handleCodeSelect}
            chatMessages={chatMessages}
            fullScreen={false}
          />
        )}

      <CommandPalette
        isOpen={isCmdOpen}
        onClose={() => setIsCmdOpen(false)}
        onToggleSplit={() => setShowSplitView((v) => !v)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onClearChat={() => setChatMessages([])}
      />

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          apiKey={apiKey}
          onApiKeyChange={handleApiKeyChange}
        />
      </div>
    </ErrorBoundary>
  );
}

export default App;
