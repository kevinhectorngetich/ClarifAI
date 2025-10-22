# Testing Image Description Context Menu

## Overview

The image description feature is now integrated into the context menu system. Users can right-click on any image on a webpage and select "Describe image with ClarifAI" to get an AI-powered description.

## How to Test

### Prerequisites

1. **Chrome Version**: Chrome 129+ or Chrome Canary/Dev with experimental features
2. **Extension Loaded**: Ensure the ClarifAI extension is loaded in developer mode
3. **API Availability**: The Prompt API with multimodal capabilities must be available

### Testing Steps

#### 1. Basic Image Description

1. Navigate to any webpage with images (e.g., Wikipedia, news sites, blogs)
2. Right-click on any image
3. Select "Describe image with ClarifAI" from the context menu
4. The extension popup should open automatically
5. You should see a "Processing your request..." message
6. After processing, you should get a detailed description of the image

#### 2. Different Image Types

Test with various image types:

- **Photographs**: People, landscapes, objects
- **Diagrams**: Technical diagrams, flowcharts
- **Screenshots**: UI screenshots, code snippets
- **Artwork**: Paintings, illustrations, logos
- **Charts/Graphs**: Data visualizations
- **Text Images**: Images containing text content

#### 3. Different Image Sources

Test images from various sources:

- **Static Images**: Regular `<img>` tags
- **Background Images**: CSS background images (may not work)
- **Inline SVGs**: Vector graphics
- **Data URLs**: Base64-encoded images
- **External URLs**: Images from different domains

### Expected Behavior

#### Success Case

1. Context menu appears with "Describe image with ClarifAI" option
2. Clicking the option opens the extension popup
3. Processing message appears in chat
4. Detailed image description is generated and displayed
5. Description includes:
   - Main objects and subjects
   - Colors and composition
   - Text content (if any)
   - Setting and context
   - Relevant details

#### Error Cases

1. **API Not Available**: Warning message about Chrome AI features
2. **Image Fetch Failed**: Error message about unable to access image
3. **Unsupported Format**: Error about unsupported image type
4. **Network Issues**: Error about unable to download image

### Testing Different Scenarios

#### 1. Local Images

- Images hosted on the same domain
- Should work without CORS issues

#### 2. Cross-Origin Images

- Images from different domains
- May have CORS restrictions
- Should show appropriate error messages

#### 3. Large Images

- Test with high-resolution images
- Should handle processing time gracefully
- Progress indicators should appear

#### 4. Small Images

- Icons, thumbnails, small graphics
- Should still provide meaningful descriptions

### Console Testing

You can also test the underlying functionality in the browser console:

```javascript
// Test Prompt API availability
await window.testPromptApiAvailability();

// Test image description with a test image
await window.testImageDescription();

// Run all tests
await window.testPromptApi();
```

### Debugging

#### Check Extension Permissions

1. Go to `chrome://extensions/`
2. Find ClarifAI extension
3. Ensure it has permission for "All sites"

#### Check Context Menu Creation

1. Open browser console on any webpage
2. Right-click anywhere and check if context menu appears
3. Look for "Describe image with ClarifAI" option when right-clicking images

#### Check Background Script Logs

1. Go to `chrome://extensions/`
2. Click "Inspect views: background page" for ClarifAI
3. Check console for any errors during context menu creation

#### Check Popup Logs

1. Right-click on an image and select the ClarifAI option
2. When popup opens, right-click in popup and select "Inspect"
3. Check console for processing logs and any errors

### Known Limitations

1. **CORS Restrictions**: Some images may not be accessible due to cross-origin policies
2. **Large Images**: Very large images may take longer to process
3. **Browser Support**: Only works in Chrome with Prompt API support
4. **First Run**: Model download required on first use (may take time)

### Troubleshooting

#### "Prompt API not available"

- Ensure Chrome 129+ or enable experimental features in chrome://flags/
- Look for "experimental web platform features" or AI-related flags

#### "Failed to fetch image"

- Image may have CORS restrictions
- Image URL may be invalid or inaccessible
- Network connectivity issues

#### Context Menu Not Appearing

- Extension may not be loaded properly
- Check extension permissions
- Reload the webpage and try again

#### Processing Takes Too Long

- Large images require more processing time
- First use requires model download
- Check network connection for model download

### Success Indicators

✅ Context menu appears on all images
✅ Popup opens when menu item is clicked
✅ Processing message shows in chat
✅ Detailed descriptions are generated
✅ Error handling works for failed cases
✅ Different image types are supported
✅ Performance is acceptable for typical use

### Performance Expectations

- **Small images** (< 1MB): 3-10 seconds
- **Medium images** (1-5MB): 10-30 seconds
- **Large images** (5-10MB): 30-60 seconds
- **First use**: Additional 1-5 minutes for model download
