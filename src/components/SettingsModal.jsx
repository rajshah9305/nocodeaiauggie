import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import './SettingsModal.css';

const SettingsModal = ({ isOpen, onClose, apiKey, onApiKeyChange }) => {
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setTempApiKey(apiKey);
  }, [apiKey]);

  const handleSave = () => {
    onApiKeyChange(tempApiKey);
    setShowSuccess(true);
    // Auto-close the modal after showing success message
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 1500);
  };

  const handleReset = () => {
    setTempApiKey(apiKey);
  };

  if (!isOpen) return null;

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Settings</h2>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-content">
          <div className="settings-section">
            <label htmlFor="api-key" className="setting-label">
              Gemini API Key
            </label>
            <p className="setting-description">
              Get your free API key from{' '}
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="api-link"
              >
                Google AI Studio
              </a>
            </p>
            <input
              id="api-key"
              type="password"
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              placeholder="Enter your Gemini API key"
              className="api-key-input"
            />
            <p className="security-note">
              🔒 Your API key is stored locally in your browser and never sent to any server except Google's Gemini API.
            </p>
          </div>

          <div className="settings-section">
            <h3 className="section-title">About</h3>
            <div className="about-info">
              <p>
                <strong>AI App Builder</strong> v1.0.0
              </p>
              <p>Transform natural language into functional web applications using AI.</p>
              <p className="tech-stack">
                Built with React, Vite, Monaco Editor, and Google Gemini API
              </p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          {showSuccess && <div className="success-message">✓ Settings saved successfully!</div>}
          <div className="button-group">
            <button className="button button-secondary" onClick={handleReset}>
              Reset
            </button>
            <button className="button button-primary" onClick={handleSave}>
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;

