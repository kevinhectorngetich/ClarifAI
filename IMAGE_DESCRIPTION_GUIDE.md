# Image Description Feature Guide

## Overview

The ClarifAI extension now includes image description functionality using Chrome's built-in Prompt API with multimodal capabilities. This feature allows users to:

- Upload images and get detailed descriptions
- Generate accessibility-friendly alt text
- Use custom prompts for specific image analysis needs

## Prerequisites

### Chrome Requirements

- **Chrome Version**: Chrome 129+ (stable) or Chrome Canary/Dev with experimental features enabled
- **Experimental Features**: The Prompt API with multimodal capabilities may require enabling experimental AI features in Chrome
- **Origin Trial**: This feature uses the Prompt API which is currently in origin trial for Chrome Extensions

### Enabling Experimental Features

1. Open Chrome and navigate to `chrome://flags/`
2. Search for "experimental web platform features" or "AI features"
3. Enable relevant experimental flags
4. Restart Chrome

## Features

### 1. Image Description

- Upload any image file (PNG, JPG, GIF, up to 10MB)
- Get detailed descriptions including:
  - Main elements and objects
  - Colors and composition
  - Text content (if any)
  - Setting and context
  - Notable details

### 2. Alt Text Generation

- Generate concise, accessibility-friendly alt text
- Optimized for screen readers
- Follows web accessibility guidelines
- Brief but descriptive (1-2 sentences)

### 3. Custom Prompts

- Use custom prompts for specific analysis needs
- Examples:
  - "Describe the emotions shown in this image"
  - "What text can you see in this image?"
  - "Analyze the composition and artistic elements"
  - "Describe this for someone who has never seen it"

## Usage

### Basic Usage

1. Open the ClarifAI extension popup
2. Click on the "🖼️ Image Description" tab
3. Click the upload area or drag and drop an image
4. Choose either:
   - **Describe Image**: Get a detailed description
   - **Generate Alt Text**: Get accessibility-focused alt text
5. Results appear in the chat tab and can be copied to clipboard

### Custom Prompts

1. Upload an image
2. Enter your custom prompt in the text area
3. Click "Describe Image" to process with your custom prompt
4. The AI will analyze the image according to your specific instructions

### Integration with Chat

- All image descriptions automatically appear in the chat history
- Switch between tabs to see previous results
- Results are timestamped and saved in the current session

## Technical Details

### API Used

- **Chrome Prompt API**: `window.LanguageModel`
- **Model**: Gemini Nano (downloaded locally)
- **Capabilities**: Multimodal (text + image input)

### File Limitations

- **Maximum File Size**: 10MB
- **Supported Formats**: PNG, JPG, JPEG, GIF, WebP
- **Processing**: All processing is done locally on device

### Privacy

- Images are processed locally using Chrome's built-in AI
- No data is sent to external servers
- Images are not stored after processing

## Error Handling

### Common Issues

1. **"Prompt API not available"**

   - Chrome version too old
   - Experimental features not enabled
   - Solution: Update Chrome or enable experimental AI features

2. **"Image file too large"**

   - File exceeds 10MB limit
   - Solution: Compress image or use smaller file

3. **"Invalid image format"**

   - Unsupported file type
   - Solution: Convert to supported format (PNG, JPG, GIF)

4. **Model downloading**
   - First use requires model download
   - Requires user interaction (click/tap)
   - May take time depending on connection

## Development Notes

### Architecture

```
src/utils/promptApi.ts     # Core Prompt API functionality
src/components/ImageDescription.tsx  # UI component
src/App.tsx               # Tab integration
```

### Key Functions

- `checkPromptApiAvailability()`: Check if API is available
- `createPromptSession()`: Create session with image capabilities
- `describeImage()`: Main image description function
- `generateAltText()`: Accessibility-focused alt text generation

### Future Enhancements

- Multiple image analysis and comparison
- Audio description capabilities
- Batch image processing
- Integration with page image detection
- Custom model parameters tuning

## Testing

### Manual Testing

1. Test with different image types and sizes
2. Verify error handling for unsupported files
3. Test custom prompts with various instructions
4. Check accessibility of generated alt text
5. Verify chat integration works correctly

### Browser Compatibility

- Chrome 129+ (recommended)
- Chrome Canary/Dev with flags enabled
- Not supported in other browsers

## Troubleshooting

### If Images Won't Upload

1. Check file size (must be under 10MB)
2. Verify file format is supported
3. Try a different image

### If Descriptions Don't Generate

1. Check Chrome version and experimental flags
2. Ensure user interaction occurred (click/tap)
3. Wait for model download on first use
4. Check browser console for errors

### Performance Issues

1. Large images may take longer to process
2. First use requires model download
3. Close other resource-intensive tabs
4. Restart Chrome if issues persist
