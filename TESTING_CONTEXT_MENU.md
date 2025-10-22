# Testing ClarifAI Context Menu Integration

## Quick Start Testing Guide

### 1. Build and Load Extension

```bash
# Build the extension
npm run build

# Load in Chrome:
# 1. Open Chrome and go to chrome://extensions/
# 2. Enable "Developer mode" (top right toggle)
# 3. Click "Load unpacked"
# 4. Select the /dist folder from your project
```

### 2. Test Context Menu Options

#### A. Test Link Explanation

1. Navigate to any webpage with links (e.g., Wikipedia, news site)
2. Right-click on any link
3. Look for "Explain with ClarifAI" in the context menu
4. Click it - the popup should open and start processing
5. Wait for AI explanation of the linked content

#### B. Test Text Selection Explanation

1. On any webpage, select/highlight some text
2. Right-click on the selected text
3. Look for "Explain [selected text] with ClarifAI"
4. Click it - the popup should open with contextual explanation

#### C. Test Page Summary

1. On any webpage, right-click on empty space (not on text or links)
2. Look for "Summarize page with ClarifAI"
3. Click it - should provide comprehensive page summary

### 3. Debugging

#### Check Background Script

```javascript
// Open Chrome DevTools > Extensions > ClarifAI > background page
// Or go to chrome://extensions/ > ClarifAI > "Inspect views: background page"

// In console, check if context menus are registered:
chrome.contextMenus.removeAll(() => {
  console.log("Context menus cleared for testing");
});
```

#### Check Content Script

```javascript
// Open DevTools on any webpage (F12)
// In console, test content extraction:
testContextMenu.testContentExtraction();

// Test storage:
testContextMenu.testStorage();
```

#### Check Communication

```javascript
// In popup DevTools console:
chrome.storage.local.get(["pendingRequest"]).then(console.log);

// Clear any stuck requests:
chrome.storage.local.remove(["pendingRequest"]);
```

### 4. Expected Behavior

#### Successful Flow:

1. Right-click → Context menu appears with ClarifAI options
2. Click ClarifAI option → Extension popup opens automatically
3. Popup shows "🎯 Processing your request..." message
4. AI processes the request and shows explanation
5. Request is cleared from storage

#### Error Scenarios:

- **No context menu**: Check extension permissions, reload extension
- **Popup doesn't open**: Check popup blocker, try manual popup open
- **No AI response**: Check Chrome AI availability, network connection
- **"Processing..." stuck**: Check browser console for errors

### 5. Test Cases

#### Comprehensive Test Scenarios:

**Test Case 1: News Article Link**

- Find a news article link
- Right-click → "Explain with ClarifAI"
- Should fetch and explain the article content

**Test Case 2: Technical Term**

- Select technical jargon or complex term
- Right-click → "Explain [term] with ClarifAI"
- Should provide simple explanation with context

**Test Case 3: Long Article**

- On a long blog post or article
- Right-click background → "Summarize page with ClarifAI"
- Should provide structured summary with key points

**Test Case 4: Foreign Link**

- Right-click on link to foreign language content
- Should handle gracefully, might explain in English

**Test Case 5: Protected Content**

- Try on pages with restricted content (login required)
- Should provide fallback explanation

### 6. Performance Testing

#### Load Testing:

- Test with very long pages
- Test with pages having many links
- Test with complex content (tables, forms, etc.)

#### Speed Testing:

- Measure time from right-click to response
- Should be under 10 seconds for most content
- Background processing should not block UI

### 7. Browser Compatibility

#### Chrome Requirements:

- Chrome 88+ (Manifest V3 support)
- Chrome 115+ (for full Summarizer API features)
- Enabled experimental features if using dev build

#### Testing Different Chrome Versions:

- Test on stable Chrome
- Test on Chrome Canary (for latest AI features)
- Test on Chromium-based browsers (Edge)

### 8. Common Issues & Solutions

| Issue                    | Likely Cause               | Solution                          |
| ------------------------ | -------------------------- | --------------------------------- |
| No context menu          | Extension not loaded       | Reload extension                  |
| Menu items missing       | Permissions issue          | Check manifest.json permissions   |
| Popup doesn't open       | Background script error    | Check background script console   |
| No AI response           | Summarizer API unavailable | Check Chrome version and flags    |
| "Processing" forever     | Request timeout            | Clear storage and retry           |
| Content extraction fails | CORS/CSP restrictions      | Expected for some protected sites |

### 9. Feature Validation Checklist

- [ ] Context menu appears on right-click
- [ ] All three menu options available (link, selection, page)
- [ ] Menu text updates with selected content
- [ ] Popup opens automatically when clicked
- [ ] Background processing works correctly
- [ ] AI responses are relevant and helpful
- [ ] Error handling works gracefully
- [ ] Storage cleanup happens properly
- [ ] Multiple requests can be processed
- [ ] Works across different websites

### 10. Advanced Testing

#### Custom Test Page:

Create a simple HTML page with various elements to test:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>ClarifAI Context Menu Test Page</title>
  </head>
  <body>
    <h1>Test Page for ClarifAI</h1>
    <p>
      This is a test paragraph with <strong>bold text</strong> and
      <em>italic text</em>.
    </p>
    <a href="https://example.com">Test External Link</a>
    <p>
      Select this text to test selection explanation: quantum computing
      algorithms
    </p>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
  </body>
</html>
```

#### Automated Testing:

```javascript
// Console script to test multiple scenarios
async function runAutomatedTests() {
  const tests = [
    () => testContextMenu.testContentExtraction(),
    () => testContextMenu.testStorage(),
    () => testContextMenu.testMessagePassing(),
  ];

  for (const test of tests) {
    try {
      await test();
      console.log("✅ Test passed");
    } catch (error) {
      console.log("❌ Test failed:", error);
    }
  }
}
```

This testing guide should help ensure your context menu integration works perfectly across different scenarios and use cases!
