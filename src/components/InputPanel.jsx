import { useState } from 'react';
import { Settings, Wand2 } from 'lucide-react';
import './InputPanel.css';

const InputPanel = ({ onGenerate, isGenerating, apiKey, onApiKeyChange }) => {
  const [description, setDescription] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(apiKey || '');

  const handleGenerate = () => {
    if (description.trim() && apiKey) {
      onGenerate(description);
    }
  };

  const handleSaveApiKey = () => {
    onApiKeyChange(tempApiKey);
    setShowSettings(false);
  };

  return (
    <div className="input-panel">
      <div className="input-panel-header">
        <h2>AI App Builder</h2>
        <button 
          className="icon-button"
          onClick={() => setShowSettings(!showSettings)}
          title="Settings"
        >
          <Settings size={20} />
        </button>
      </div>

      {showSettings ? (
        <div className="settings-section">
          <h3>Settings</h3>
          <div className="settings-content">
            <label htmlFor="api-key">Gemini API Key</label>
            <input
              id="api-key"
              type="password"
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              placeholder="Enter your Gemini API key"
              className="api-key-input"
            />
            <p className="settings-note">
              Your API key is stored locally in your browser and never sent to any server except Google's Gemini API.
            </p>
            <button 
              className="primary-button"
              onClick={handleSaveApiKey}
            >
              Save API Key
            </button>
            <a 
              href="https://makersuite.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="api-link"
            >
              Get API Key from Google AI Studio
            </a>
          </div>
        </div>
      ) : (
        <div className="input-section">
          <h3>Describe Your Application</h3>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Example: Create a todo list app with add, delete, and mark as complete functionality. Use a clean modern design with a gradient background."
            className="description-input"
            disabled={isGenerating}
          />
          
          {!apiKey && (
            <div className="warning-message">
              ⚠️ Please configure your Gemini API key in Settings before generating an app.
            </div>
          )}
          
          <button
            className="generate-button"
            onClick={handleGenerate}
            disabled={!description.trim() || !apiKey || isGenerating}
          >
            <Wand2 size={20} />
            {isGenerating ? 'Generating...' : 'Generate Application'}
          </button>

          <div className="examples-section">
            <h4>Example Prompts:</h4>
            <ul>
              <li>Create a calculator with basic operations</li>
              <li>Build a weather dashboard with city search</li>
              <li>Make a simple drawing canvas app</li>
              <li>Create a countdown timer with start/stop/reset</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default InputPanel;

