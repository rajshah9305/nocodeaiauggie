import { useState, useRef, useEffect } from 'react';
import { Send, Copy, Download, RotateCcw, Edit2, Loader } from 'lucide-react';
import './ChatInterface.css';

const ChatInterface = ({ onGenerate, isGenerating, apiKey, onCodeSelect, chatMessages = [] }) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isTyping]);

  const handleSendMessage = async () => {
    if (!input.trim() || !apiKey || isGenerating) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    // Add user message to parent state via callback
    onGenerate(input);
    setInput('');
    setIsTyping(true);

    // Stop typing indicator after a short delay
    setTimeout(() => {
      setIsTyping(false);
    }, 500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRegenerateMessage = (messageId) => {
    const message = chatMessages.find((m) => m.id === messageId);
    if (message && message.type === 'user') {
      setInput(message.content);
    }
  };

  const handleCopyCode = (code, messageId) => {
    navigator.clipboard.writeText(code);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleDownloadCode = (code) => {
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'app.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSelectMessage = (messageId) => {
    const message = chatMessages.find((m) => m.id === messageId);
    if (message && message.type === 'assistant' && message.code) {
      onCodeSelect(message.code);
    }
  };

  return (
    <div className="chat-interface">
      <div className="chat-messages">
        {chatMessages.length === 0 ? (
          <div className="chat-empty-state">
            <div className="empty-icon">💬</div>
            <h3>Start Creating Apps</h3>
            <p>Describe your application idea and I'll generate the code for you.</p>
            <div className="example-prompts">
              <p className="example-label">Try asking:</p>
              <button
                className="example-button"
                onClick={() => setInput('Create a todo list app with add, delete, and mark complete buttons')}
              >
                "Create a todo list"
              </button>
              <button
                className="example-button"
                onClick={() => setInput('Build a calculator with basic operations')}
              >
                "Build a calculator"
              </button>
              <button
                className="example-button"
                onClick={() => setInput('Make a weather dashboard with city search')}
              >
                "Weather dashboard"
              </button>
            </div>
          </div>
        ) : (
          <>
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`chat-message chat-message-${message.type}`}
                onClick={() => handleSelectMessage(message.id)}
              >
                <div className="message-content">
                  {message.type === 'user' && (
                    <div className="user-message-bubble">
                      <p>{message.content}</p>
                      <span className="message-time">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  )}

                  {message.type === 'assistant' && (
                    <div className="assistant-message-bubble">
                      <div className="code-preview">
                        <div className="code-header">
                          <span className="code-label">Generated Code</span>
                          <div className="code-actions">
                            <button
                              className={`action-button ${copiedMessageId === message.id ? 'copied' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyCode(message.code, message.id);
                              }}
                              title={copiedMessageId === message.id ? 'Copied!' : 'Copy code'}
                            >
                              {copiedMessageId === message.id ? '✓' : <Copy size={16} />}
                            </button>
                            <button
                              className="action-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadCode(message.code);
                              }}
                              title="Download code"
                            >
                              <Download size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="code-snippet">
                          {message.code.substring(0, 200)}...
                        </div>
                      </div>
                      <span className="message-time">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  )}

                  {message.type === 'error' && (
                    <div className="error-message-bubble">
                      <p>⚠️ {message.content}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="chat-message chat-message-typing">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <p className="typing-text">Generating your app...</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="chat-input-area">
        {!apiKey && (
          <div className="api-key-warning">
            ⚠️ Please configure your Gemini API key in Settings before generating an app.
          </div>
        )}
        <div className="chat-input-container">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe your application... (Shift+Enter for new line)"
            className="chat-input"
            disabled={isGenerating || !apiKey}
            rows="3"
          />
          <button
            className="send-button"
            onClick={handleSendMessage}
            disabled={!input.trim() || !apiKey || isGenerating}
            title="Send message"
          >
            {isGenerating ? (
              <Loader size={20} className="spinner" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;

