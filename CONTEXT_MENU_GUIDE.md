# ClarifAI Context Menu Integration

## Overview

ClarifAI now supports right-click context menu integration, allowing users to easily explain content, links, and selected text directly from any webpage without opening the extension popup first.

## Features

### 1. **Explain Links**

- Right-click on any link → "Explain with ClarifAI"
- Fetches content from the linked page
- Provides comprehensive explanation of what the link contains
- Great for previewing content before clicking

### 2. **Explain Selected Text**

- Highlight any text on a webpage → Right-click → "Explain [selected text] with ClarifAI"
- Contextual explanation of the selected content
- Includes surrounding context for better understanding
- Perfect for technical terms, jargon, or complex concepts

### 3. **Summarize Current Page**

- Right-click anywhere on a page → "Summarize page with ClarifAI"
- Comprehensive page analysis and summary
- Extracts key points, headings, and main content
- Ideal for long articles or complex documentation

## How It Works

### Architecture

```
Right-click → Context Menu → Background Script → Content Script → Popup Interface
```

1. **Context Menu Creation**: Background script creates menu items when extension installs
2. **Event Handling**: Background script processes context menu clicks
3. **Content Extraction**: Content script extracts page content and context
4. **Request Processing**: Context menu handler processes different request types
5. **AI Integration**: Requests are sent to Chrome's Summarizer API via the existing pipeline
6. **Result Display**: Results appear in the popup chat interface

### Request Flow

#### Link Explanation

1. User right-clicks on a link
2. Background script captures the link URL
3. Fetches content from the linked page
4. Processes and cleans the content
5. Generates explanation prompt
6. Opens popup with AI response

#### Text Selection Explanation

1. User selects text and right-clicks
2. Content script captures selection and surrounding context
3. Background script stores the request
4. Generates contextual explanation prompt
5. Opens popup with AI response

#### Page Summary

1. User right-clicks on page
2. Content script extracts comprehensive page content
3. Analyzes headings, paragraphs, links, and structure
4. Generates summary prompt
5. Opens popup with AI response

## Implementation Details

### Files Added/Modified

#### New Files:

- `src/background.ts` - Background service worker
- `src/content.ts` - Content script for page interaction
- `src/utils/contextMenu.ts` - Context menu handling utilities

#### Modified Files:

- `public/manifest.json` - Added permissions and scripts
- `src/App.tsx` - Added context menu request handling
- `vite.config.ts` - Updated build configuration

### Key Components

#### Background Script (`background.ts`)

- Creates context menu items on extension install
- Handles context menu click events
- Fetches content from linked pages
- Manages communication between scripts

#### Content Script (`content.ts`)

- Extracts page content and metadata
- Provides selection context
- Handles text highlighting
- Captures context menu target information

#### Context Menu Handler (`contextMenu.ts`)

- Processes different types of requests
- Generates appropriate prompts for AI
- Manages request lifecycle
- Provides user-friendly action messages

### Security Considerations

- **Content Security Policy**: Properly configured for extension security
- **Permissions**: Minimal required permissions (contextMenus, activeTab, storage)
- **Content Extraction**: Safe DOM manipulation without script injection
- **Cross-Origin Requests**: Handled through background script with proper error handling

## Usage Instructions

### For Users

1. **Install the extension** (if not already installed)
2. **Navigate to any webpage**
3. **Right-click on content you want explained**:
   - **Links**: Right-click directly on the link
   - **Text**: First select/highlight the text, then right-click
   - **Pages**: Right-click anywhere on the page background
4. **Select the ClarifAI option** from the context menu
5. **The popup will open** with your request being processed
6. **View the AI explanation** in the chat interface

### Context Menu Options

- **"Explain with ClarifAI"** - Appears when right-clicking on links
- **"Explain [selected text] with ClarifAI"** - Appears when right-clicking on selected text
- **"Summarize page with ClarifAI"** - Appears when right-clicking on page background

## Technical Features

### Content Extraction

- **Smart Content Detection**: Identifies main content areas using multiple strategies
- **Metadata Extraction**: Captures titles, descriptions, headings, and structure
- **Context Preservation**: Maintains surrounding context for selected text
- **Content Cleaning**: Removes scripts, styles, and irrelevant elements

### Error Handling

- **Fallback Mechanisms**: Graceful degradation when content can't be extracted
- **Timeout Management**: Requests expire after 30 seconds
- **Network Error Recovery**: Handles fetch failures and CORS issues
- **User Feedback**: Clear error messages and retry suggestions

### Performance Optimizations

- **Content Limiting**: Limits extracted content to prevent oversized requests
- **Efficient DOM Traversal**: Uses optimized selectors for content extraction
- **Memory Management**: Proper cleanup of temporary data
- **Background Processing**: Non-blocking operations

## Development Notes

### Building

The project now builds three main outputs:

- `popup.js` - Main React application
- `background.js` - Service worker for context menus
- `content.js` - Content script for page interaction

### Testing Context Menus

1. Build the extension: `npm run build`
2. Load in Chrome as an unpacked extension
3. Navigate to any webpage
4. Right-click to see context menu options
5. Check browser console for debugging information

### Debugging

- Background script logs: Check extension service worker console
- Content script logs: Check webpage console
- Popup logs: Check popup console (open DevTools on popup)

## Future Enhancements

### Potential Features

- **Visual Highlighting**: Highlight explained text on the page
- **Quick Preview**: Show brief explanations in tooltips
- **Batch Processing**: Explain multiple selections at once
- **Custom Context Menus**: User-configurable menu options
- **Integration with Page Actions**: Quick actions for common page types

### API Improvements

- **Smarter Content Extraction**: ML-based content relevance scoring
- **Caching**: Cache explanations for repeated content
- **Progressive Loading**: Stream responses for long explanations
- **Multi-language Support**: Detect and handle different languages

## Troubleshooting

### Common Issues

1. **Context menus not appearing**:

   - Check if extension is properly installed
   - Verify permissions in manifest.json
   - Reload the extension

2. **Content extraction failures**:

   - Check for CORS restrictions
   - Verify content script injection
   - Look for CSP violations

3. **Popup not opening**:
   - Check if popup is blocked
   - Verify background script is running
   - Check for service worker errors

### Debug Commands

```javascript
// Check pending requests
chrome.storage.local.get(["pendingRequest"]);

// Clear pending requests
chrome.storage.local.remove(["pendingRequest"]);

// Check context menu registration
chrome.contextMenus.removeAll();
```

## Browser Compatibility

- **Chrome**: Full support (Manifest V3)
- **Edge**: Full support (Chromium-based)
- **Firefox**: Requires manifest conversion for V2
- **Safari**: Not supported (different extension system)

This context menu integration makes ClarifAI much more accessible and user-friendly, allowing seamless content explanation without interrupting the user's browsing flow.
