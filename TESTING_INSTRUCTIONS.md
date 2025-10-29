# ClarifAI - Testing Instructions

## Prerequisites

- **Chrome Version**: Chrome 127+ (for Summarizer API) or Chrome Canary/Dev (for experimental features)
- **Node.js**: v16 or higher
- **npm**: For dependency management

## Quick Setup & Testing

### 1. **Clone and Build**
```bash
git clone https://github.com/kevinhectorngetich/ClarifAI.git
cd ClarifAI
npm install
npm run build
```

### 2. **Load Extension in Chrome**
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the project root folder (containing manifest.json and dist/)
5. The ClarifAI extension should now appear in your extensions list

### 3. **Basic Feature Testing**

#### **A. Chat Interface Test**
1. Click the ClarifAI icon in Chrome's toolbar
2. Type a question like "What is this page about?"
3. ✅ **Expected**: AI response with page summary
4. ✅ **Copy feature**: Click copy button on any response

#### **B. Context Menu Tests**
1. **Link Explanation**: Right-click any link → "Explain with ClarifAI"
2. **Text Selection**: Highlight text → Right-click → "Explain [text] with ClarifAI"
3. **Page Summary**: Right-click anywhere → "Summarize page with ClarifAI"
4. **Image Description**: Right-click any image → "Describe image with ClarifAI"

#### **C. Summary Types Test**
1. Open the extension popup
2. Click "Page Content" tab
3. Test different summary types:
   - Key Points (•)
   - TL;DR (⚡)
   - Teaser (🎯)
   - Headline (📰)

### 4. **Advanced Testing**

#### **Chrome AI Features Setup** (Optional for enhanced features)
1. Navigate to `chrome://flags/`
2. Search for "experimental web platform features"
3. Enable relevant experimental flags
4. Restart Chrome

#### **Error Handling Test**
1. Test on pages without content (blank pages)
2. ✅ **Expected**: Graceful fallback messages
3. Test without internet connection
4. ✅ **Expected**: Local processing continues to work

### 5. **Performance Testing**
1. Test on complex documentation pages (e.g., React docs, MDN)
2. ✅ **Expected**: Responses within 3-5 seconds
3. Test with large pages
4. ✅ **Expected**: Progress indicators during processing

## Common Issues & Solutions

### **"Extension not working"**
- Ensure you've built the project (`npm run build`)
- Reload the extension in chrome://extensions/
- Check Chrome version compatibility

### **"No AI response"**
- Chrome Summarizer API may not be available in your region
- Try Chrome Canary/Dev with experimental features enabled
- Check browser console for detailed error messages

### **"Context menu not appearing"**
- Reload the webpage
- Check extension permissions in chrome://extensions/
- Ensure extension is enabled

## Test Pages Recommendations

1. **Documentation**: https://reactjs.org/docs/getting-started.html
2. **News Articles**: https://techcrunch.com/ (any article)
3. **Complex Content**: https://developer.mozilla.org/en-US/docs/Web/JavaScript
4. **Image-rich Pages**: https://unsplash.com/

## Expected Results Summary

- ✅ **60-80% faster** content comprehension
- ✅ **Instant summaries** for any webpage
- ✅ **Context-aware explanations** for highlighted text
- ✅ **Image descriptions** with webpage context
- ✅ **Copy-friendly responses** with one-click copying
- ✅ **Graceful fallbacks** when advanced features unavailable

## Support

If you encounter issues during testing:
1. Check browser console for error details
2. Verify Chrome version compatibility
3. Ensure proper extension loading
4. Test on different types of content

---

**Note**: The extension works best with content-rich pages and may have limited functionality on restricted pages (chrome://, file://, etc.)