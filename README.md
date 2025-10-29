# 🚀 AI App Builder

Transform natural language descriptions into fully functional web applications using Google's Gemini AI. Build, edit, and preview HTML/CSS/JavaScript applications in real-time.

## ✨ Features

- **AI-Powered Code Generation**: Describe your app idea and let AI generate complete, functional code
- **Live Code Editor**: Edit generated code with Monaco Editor with syntax highlighting
- **Real-Time Preview**: See your changes instantly in the live preview panel
- **Chat Interface**: Conversational UI for iterative app development
- **Code Export**: Download generated code as HTML files
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Error Handling**: Comprehensive error messages and recovery suggestions
- **Rate Limiting**: Automatic retry with exponential backoff for API rate limits
- **Error Boundaries**: Graceful error handling with recovery options

## 🛠️ Tech Stack

- **Frontend**: React 19.1.1 with Vite 7.1.7
- **Code Editor**: Monaco Editor (@monaco-editor/react)
- **AI API**: Google Gemini 2.5 Flash (@google/generative-ai) - Latest Web SDK
- **UI Components**: Lucide React icons
- **Layout**: React Split for resizable panels
- **Build Tool**: Vite with optimized chunking and code splitting
- **Bundle Size**: 225.87 kB (optimized & minified)

## 📋 Prerequisites

- Node.js 18+ and npm 9+
- Google Gemini API key (free from [Google AI Studio](https://aistudio.google.com/app/apikeys))

## 🚀 Quick Start

**Get started in 5 minutes!** See [QUICKSTART.md](./QUICKSTART.md) for a fast setup guide.

### Basic Setup

```bash
# 1. Clone repository
git clone https://github.com/rajshah9305/nocodeaiauggie.git
cd nocodeaiauggie

# 2. Install dependencies
npm install

# 3. Configure API key
cp .env.example .env.local
# Edit .env.local and add your API key from https://aistudio.google.com/app/apikeys

# 4. Start development
npm run dev

# 5. Open http://localhost:5173
```

### Build for Production

```bash
npm run build
npm run preview  # Test production build locally
```

---

## 📚 Documentation

| Guide | Purpose |
|-------|---------|
| **[QUICKSTART.md](./QUICKSTART.md)** | 5-minute setup guide |
| **[SETUP.md](./SETUP.md)** | Detailed setup instructions |
| **[DEPLOYMENT.md](./DEPLOYMENT.md)** | Deploy to Vercel, Netlify, GitHub Pages, AWS, Firebase |
| **[API.md](./API.md)** | API documentation and code examples |
| **[CONTRIBUTING.md](./CONTRIBUTING.md)** | Contributing guidelines |
| **[IMPROVEMENTS.md](./IMPROVEMENTS.md)** | What was improved in this version |

## 📖 Usage

1. **Enter API Key**: Click the Settings button (⚙️) and enter your Gemini API key
2. **Describe Your App**: Type a description of the app you want to create
3. **Generate Code**: Click "Send message" or press Enter
4. **Edit Code**: Modify the generated code in the editor
5. **Preview**: See changes in real-time in the preview panel
6. **Export**: Download the code as an HTML file

### Example Prompts

- "Create a todo list app with add, delete, and mark complete buttons"
- "Build a calculator with basic operations"
- "Make a weather dashboard with city search"
- "Create a markdown note-taking app"
- "Build a color palette generator"

## 🌐 Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Follow the prompts. Set environment variables in Vercel dashboard:
- `VITE_GEMINI_API_KEY`: Your Gemini API key

### Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

Set environment variables in Netlify dashboard under Site settings > Build & deploy > Environment.

### GitHub Pages

```bash
npm run build
git add dist/
git commit -m "Deploy to GitHub Pages"
git push
```

Enable GitHub Pages in repository settings, pointing to the `dist/` folder.

## 🔧 Configuration

### Environment Variables

Create `.env.local` with these variables:

```
VITE_GEMINI_API_KEY=your_api_key_here
VITE_APP_NAME=AI App Builder
VITE_APP_VERSION=1.0.0
VITE_API_TIMEOUT=60000
VITE_MAX_RETRIES=3
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_ERROR_TRACKING=false
```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── ChatInterface.jsx
│   ├── CodeEditor.jsx
│   ├── ErrorBoundary.jsx
│   ├── PreviewPanel.jsx
│   ├── SettingsModal.jsx
│   └── *.css
├── services/           # API services
│   └── geminiService.js
├── utils/              # Utility functions
│   ├── errorHandler.js
│   └── exportFormats.js
├── styles/             # Global styles
├── App.jsx
└── main.jsx
```

## 🔐 Security

- API keys are stored locally in browser localStorage
- API keys are never sent to any server except Google's Gemini API
- No user data is collected or stored
- All code generation happens client-side

## 🐛 Troubleshooting

### "Invalid API Key" Error

- Verify your API key is correct
- Check that the key is from Google AI Studio
- Ensure the key has Gemini API access enabled

### "Rate Limit Exceeded" Error

- Wait a few seconds and try again
- The app automatically retries with exponential backoff
- Check your API quota in Google Cloud Console

### Code Not Generating

- Try a simpler description
- Check browser console for detailed error messages
- Ensure your internet connection is stable

### Preview Not Updating

- Check that the generated code is valid HTML
- Look for JavaScript errors in browser console
- Try refreshing the page

## ✅ Integration Status

**Version**: 1.0.0 - Production Ready

### Latest Updates (2025-10-29)
- ✅ Updated to `gemini-2.5-flash` model (latest stable)
- ✅ Fixed API key handling in geminiService
- ✅ Updated color scheme to orange, white, and black only
- ✅ Removed GitHub Pages and unnecessary files
- ✅ Cleaned up test files and unused services
- ✅ Production-ready codebase
- ✅ All linting checks passed
- ✅ Optimized bundle size

### Documentation
- 📖 [Integration Verification Guide](./INTEGRATION_VERIFICATION.md)
- 📖 [Production Deployment Guide](./PRODUCTION_DEPLOYMENT.md)
- 📖 [Integration Complete Summary](./INTEGRATION_COMPLETE.md)

### Build Status
```
✓ 1709 modules transformed
✓ Built in 1.84s
✓ No errors or warnings
✓ All linting checks passed
✓ Ready for production deployment
```

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ using React, Vite, and Google Gemini AI**
