# ClarifAI Chrome Extension

A Chrome Extension built with React, TypeScript, and Tailwind CSS that provides a chat-style interface for AI interactions. This extension integrates with Chrome's built-in AI APIs for content clarification, explanation, and image description.

## Features

### Core AI Capabilities

- 🤖 **Chrome Summarizer API Integration** - Uses Chrome's built-in AI for explanations
- 🖼️ **Image Description** - Context-based image analysis using web content
- 💬 **Smart Chat Interface** - Contextual responses using current page content
- 📄 **Page Content Summarization** - Key points, TL;DR, headlines, and teasers
- 🧠 **Feynman Technique Explanations** - Complex topics broken down simply

### Image Description Features

- �️ **Right-click Image Description** - Context menu integration for any web image
- 📄 **Comprehensive Analysis** - Detailed descriptions including objects, colors, composition, and text
- � **Web-native Integration** - Works with images on any webpage without uploading
- 🔄 **Chat Integration** - Image descriptions appear directly in chat history
- � **Smart Context** - Analysis includes webpage context and relevant details

### User Interface Features

- 🖱️ **Context Menu Integration** - Right-click to explain links, text, pages, or images
- 📋 **Copy to Clipboard** - One-click copying of AI responses with visual feedback
- ⚡ **Real-time Progress Tracking** - Download and processing indicators
- 🎨 **Beautiful UI** - Clean design with Tailwind CSS
- 🔒 **Chrome Extension Manifest V3** - Modern security standards
- 📱 **Responsive Design** - Optimized for popup window

### Context Menu Features

- **Explain Links**: Right-click any link → "Explain with ClarifAI"
- **Explain Selected Text**: Highlight text → Right-click → "Explain [text] with ClarifAI"
- **Summarize Pages**: Right-click anywhere → "Summarize page with ClarifAI"
- **Describe Images**: Right-click any image → "Describe image with ClarifAI"

### Copy Feature

- **Easy Sharing**: Copy button on every AI response
- **Visual Feedback**: Toast notifications and icon changes
- **Universal Compatibility**: Works across all browsers with fallback support

```
ClarifAI/
├── src/
│   ├── components/
│   │   ├── ChatMessage.tsx       # Individual message display
│   │   ├── ChatInput.tsx         # User input component
│   │   ├── ImageDescription.tsx  # Image description UI component
│   │   └── ContentActions.tsx    # Page content actions
│   ├── types/
│   │   └── chat.ts              # TypeScript interfaces
│   ├── utils/
│   │   ├── api.ts               # API utilities
│   │   ├── summarizer.ts        # Chrome Summarizer API integration
│   │   ├── promptApi.ts         # Chrome Prompt API integration
│   │   └── testPromptApi.ts     # Testing utilities for Prompt API
│   ├── App.tsx                  # Main app component with tab navigation
│   ├── main.tsx                 # React app entry point
│   └── index.css                # Tailwind CSS imports
├── public/
│   ├── manifest.json            # Chrome extension manifest
│   └── icons/                   # Extension icons
├── popup.html                   # Extension popup page
└── dist/                        # Built extension files
```

## Installation & Setup

### Prerequisites

- **Chrome Version**: Chrome 127+ (for Summarizer API) or Chrome Canary/Dev (for experimental features)
- Node.js (v16 or higher)
- npm or yarn

### Chrome AI Features Setup

For advanced image description functionality, you may need to enable experimental features in Chrome Canary/Dev:

1. Navigate to `chrome://flags/`
2. Search for "experimental web platform features" or "AI features"
3. Enable relevant experimental flags
4. Restart Chrome

**Note**: Basic image description works using context analysis without experimental features.

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Extension

```bash
npm run build
```

This creates a `dist/` folder with the compiled extension files.

### 3. Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the project root folder (containing manifest.json and dist/)
5. The ClarifAI extension should now appear in your extensions list

### 4. Using the Extension

#### Chat Interface

1. Click the ClarifAI icon in Chrome's toolbar
2. Use the chat interface for text-based interactions
3. Ask questions, request summaries, or get explanations
4. Use context menu options for quick page analysis

#### Image Description

1. Navigate to any webpage with images
2. Right-click on any image
3. Select "Describe image with ClarifAI" from the context menu
4. The popup will open and process the image
5. Get detailed descriptions including objects, colors, text, and context
6. Results appear in the chat history and can be copied

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview built extension
- `npm run lint` - Run ESLint

### Development Mode

```bash
npm run dev
```

For development, you can load the extension using the root folder. After making changes, rebuild with `npm run build` and reload the extension in Chrome.

## Chrome Extension Integration

### Manifest V3 Features

- Uses action API for popup interface
- Secure content security policy
- Storage permissions for chat history (future)
- Active tab permissions for content interaction (future)

### Future API Integration

The extension includes placeholder functions in `src/utils/api.ts` ready for:

- Chrome's built-in Summarizer API
- Content extraction and summarization
- Real AI-powered responses

## Component Architecture

### App.tsx

Main application component managing:

- Chat state and message history
- Message sending/receiving logic
- Loading states and error handling

### ChatMessage.tsx

Displays individual messages with:

- User/AI message styling
- Timestamps
- Avatar indicators
- Responsive bubble layout

### ChatInput.tsx

Handles user input with:

- Auto-resizing textarea
- Send button with loading states
- Keyboard shortcuts (Enter to send)
- Input validation

## Styling

Built with Tailwind CSS for:

- Consistent design system
- Responsive layouts
- Smooth animations
- Clean message bubbles
- Professional color scheme

## Security

- Content Security Policy compliant
- No external script loading
- Secure manifest permissions
- TypeScript for type safety

## Browser Compatibility

- Chrome (Manifest V3)
- Edge (Chromium-based)
- Other Chromium browsers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test the extension in Chrome
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## How It Works

### 🧠 **AI-Powered Explanations**

1. **Context Extraction**: Automatically reads current webpage content
2. **Smart Processing**: Uses Chrome's Summarizer API for understanding
3. **Feynman Technique**: Breaks down complex topics into simple explanations
4. **Interactive Chat**: Natural conversation with context awareness

### �️ **Image Analysis & Description**

1. **Context-based Analysis**: Uses webpage context and content analysis for image descriptions
2. **Local Processing**: Text-based analysis happens locally on your device
3. **Accessibility Focus**: Generates alt text suitable for screen readers
4. **Smart Context**: Analysis includes webpage context and relevant details
5. **Privacy First**: No external image uploads required

### �📊 **Summary Types Available**

- **Key Points** (•): Main bullet points from content
- **TL;DR** (⚡): Quick overview and summary
- **Teaser** (🎯): Most interesting parts to draw attention
- **Headline** (📰): Main point in article headline format

### 🔧 **Chrome AI Requirements**

#### For Text Summarization:

- Chrome Canary or Dev channel (version 127+)
- Summarizer API enabled in chrome://flags
- API availability varies by region

#### For Image Description:

- Chrome 127+ (basic context-based analysis)
- Chrome Canary/Dev with experimental features (advanced multimodal analysis)
- Context menu integration (no special requirements)
- Analysis based on webpage context and image metadata

### 🧪 **Testing Features**

You can test the core functionality using the browser console:

```javascript
// Test Summarizer API availability
console.log("Testing Summarizer API...");

// Test basic features (no experimental requirements)
// Context menu image description works without special setup
```

## Roadmap

- [x] ✅ Chrome Summarizer API integration
- [x] ✅ Content extraction from webpages
- [x] ✅ Feynman Technique explanations
- [x] ✅ Multiple summary formats
- [x] ✅ Image description with context analysis
- [x] ✅ Context menu image description
- [x] ✅ Web-native image integration
- [x] ✅ Message persistence and history
- [x] ✅ Chat history with save/load/delete
- [x] ✅ Enhanced conversation context
- [x] ✅ Settings and preferences (theme, language, avatar)
- [x] ✅ Dark mode support
- [x] ✅ Multi-language support (8 languages)
- [x] ✅ Customizable user avatars
- [ ] 🔄 Advanced multimodal image analysis (waiting for Chrome stable API)
- [ ] 🔄 Advanced AI model selection

---

**Note**: This extension uses Chrome's AI APIs (primarily the Summarizer API). Image description works through context analysis and doesn't require experimental features. Advanced multimodal capabilities are available in Chrome Canary/Dev but are not required for core functionality.

## Documentation

- [Image Context Menu Testing Guide](./IMAGE_CONTEXT_MENU_TEST_GUIDE.md) - How to test the image description context menu
- [Context Menu Testing Guide](./TESTING_CONTEXT_MENU.md) - How to test context menu features
- [Quick Test Guide](./QUICK_TEST_GUIDE.md) - Quick testing checklist

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
