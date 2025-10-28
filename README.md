# RAJ AI APP BUILDER - No-Code Application Generator

A web-based no-code AI application builder that transforms natural language descriptions into functional web applications using the Gemini API.

## Features

### 1. **Chat-Based Natural Language Interface**
- Conversational chat interface for describing desired applications
- Send button to process descriptions
- Example prompts to guide users (Todo List, Calculator, Weather Dashboard)
- Chat history showing all generated applications and user requests
- Real-time typing indicators during generation

### 2. **Live Preview Window**
- Real-time rendering of generated applications
- Sandboxed iframe for safe preview rendering
- Dynamic updates as code is modified
- Loading states during generation

### 3. **Code Generation & Export**
- Generates complete, functional HTML/CSS/JavaScript code using Gemini API
- Download functionality to export generated code as HTML files
- Copy-to-clipboard functionality for easy code sharing
- Code preview in chat messages with quick copy/download actions

### 4. **Built-in Code Editor**
- Integrated Monaco Editor with syntax highlighting
- Support for HTML, CSS, and JavaScript editing
- Real-time preview updates when code is modified
- Minimap disabled for cleaner interface
- Line numbers and word wrap enabled
- Code copy and download buttons

### 5. **Settings Modal for API Key Management**
- Dedicated settings interface for Gemini API key input
- Secure local storage of API keys (localStorage)
- Security warning about API key storage
- Link to Google AI Studio for API key generation
- About section with version and tech stack information

## Layout & UI Structure

### Two-Panel Split Layout with Chat
1. **Left Panel**: Code Editor with Monaco Editor
2. **Right Panel**: Live Preview Window
3. **Bottom Panel**: Chat Interface for app generation requests

### Responsive Design
- Resizable split panels with drag-to-resize functionality
- Adapts to different screen sizes
- Professional header with branding and settings button

## Design Specifications

### Color Palette
- **Background**: #FFFFFF (white)
- **Text**: #000000 (black)
- **Accent/Primary**: #FF6B35 (orange)
- **Secondary Background**: #F5F5F5 (light grey)
- **Borders**: #E0E0E0 (grey)

### Typography
- **Code**: JetBrains Mono
- **UI Text**: Inter or Roboto

### Design Principles
- Clean, minimal interface with professional appearance
- Clear section divisions with borders and spacing
- Similar to modern development tools (VS Code-like layout)
- Smooth animations and transitions
- Responsive split panels with visual feedback

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd newnocoderaiapp
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173/`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

1. **Configure API Key**:
   - Click the Settings button (⚙️) in the top-right corner
   - Enter your Gemini API key
   - Click "Save Settings"

2. **Describe Your Application**:
   - Type your application description in the chat input at the bottom
   - Example: "Create a todo list app with add, delete, and mark as complete functionality"
   - Use Shift+Enter for multi-line input

3. **Generate Application**:
   - Click the Send button or press Enter
   - Wait for the AI to generate the code
   - View the live preview in the right panel
   - See the generated code in the left panel
   - Chat history shows all generated applications

4. **Edit and Export**:
   - Edit the code in the Monaco Editor (left panel) if needed
   - Changes will update the live preview in real-time
   - Click "Copy" to copy the code to clipboard
   - Click "Download" to download the code as an HTML file
   - You can also copy/download directly from chat messages

## Technical Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Code Editor**: Monaco Editor
- **AI API**: Google Gemini API
- **Styling**: CSS3 with CSS Variables
- **Icons**: Lucide React

## Project Structure

```
src/
├── components/
│   ├── ChatInterface.jsx       # Chat-based input interface
│   ├── ChatInterface.css
│   ├── PreviewPanel.jsx        # Live preview window
│   ├── PreviewPanel.css
│   ├── CodeEditor.jsx          # Monaco code editor component
│   ├── CodeEditor.css
│   ├── SettingsModal.jsx       # API key settings modal
│   ├── SettingsModal.css
│   ├── InputPanel.jsx          # Legacy input panel
│   └── InputPanel.css
├── services/
│   ├── geminiService.js        # Gemini API integration
│   └── githubService.js        # GitHub integration utilities
├── utils/
│   ├── errorHandler.js         # Error handling utilities
│   └── exportFormats.js        # Code export utilities
├── App.jsx                     # Main application component
├── App.css                     # Application layout styles
├── index.css                   # Global styles
└── main.jsx                    # Application entry point
```

## API Integration

The application uses the Google Generative AI API (Gemini) to convert natural language descriptions into functional web applications.

### API Key Security
- API keys are stored locally in the browser's localStorage
- Keys are never sent to any server except Google's Gemini API
- Users should keep their API keys private

### Error Handling
- Invalid API key detection
- Rate limit handling
- Network error management
- User-friendly error messages

## Features Implemented

✅ Chat-based natural language input interface
✅ Live preview window with sandboxed iframe
✅ Code generation using Gemini API (gemini-2.0-flash model)
✅ Built-in Monaco code editor with syntax highlighting
✅ Settings modal for API key management
✅ Code export (download as HTML)
✅ Copy-to-clipboard functionality
✅ Error handling and loading states
✅ Responsive split-panel design with resizable panels
✅ Professional UI with modern design
✅ Chat history with message timestamps
✅ Example prompts for quick start
✅ Real-time code preview updates
✅ API key validation and security warnings

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Future Enhancements

- Support for exporting to multiple frameworks (React, Vue, Angular)
- Application templates and presets
- Version history and undo/redo
- Custom CSS themes
- Application hosting integration
- Collaborative editing
- Code refactoring suggestions

## License

MIT

## Support

For issues or questions, please open an issue on the repository.
