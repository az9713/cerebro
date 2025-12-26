# Personal OS Browser Extension

A Chrome extension to save web content directly to Personal OS for AI-powered analysis.

## Features

- **One-Click Analysis**: Save the current page for immediate AI analysis
- **Queue for Later**: Add pages to a queue for batch processing
- **Right-Click Menu**: Context menu integration for quick access
- **Model Selection**: Choose between Haiku, Sonnet, or Opus

## Supported Content Types

- YouTube videos (`youtube.com`, `youtu.be`)
- arXiv papers (`arxiv.org`)
- Web articles (any HTTP/HTTPS URL)

## Installation

### Development Mode

1. **Add Icons**

   Create PNG icons in the `icons/` folder:
   - `icon16.png` (16x16 pixels)
   - `icon32.png` (32x32 pixels)
   - `icon48.png` (48x48 pixels)
   - `icon128.png` (128x128 pixels)

2. **Load in Chrome**

   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `extension/` folder

3. **Start the Backend**

   Make sure the Personal OS backend is running:
   ```bash
   cd web/backend
   uvicorn main:app --reload --port 8000
   ```

## Usage

### Popup

1. Click the extension icon in your browser toolbar
2. The current page URL will be detected
3. Select your preferred model
4. Click "Analyze Now" or "Add to Queue"

### Right-Click Menu

1. Right-click on any page or link
2. Select "Personal OS" > "Analyze Now" or "Add to Queue"

### Options

1. Right-click the extension icon
2. Select "Options"
3. Configure API URL and default model
4. View and clear queued items

## Configuration

Settings are stored in Chrome's sync storage:

- **Backend URL**: Default is `http://localhost:8000`
- **Preferred Model**: Haiku, Sonnet, or Opus

## Troubleshooting

### "Failed to submit" error

- Make sure the backend is running on `http://localhost:8000`
- Check that the API is accessible from your browser

### URL not supported

- Only YouTube, arXiv, and HTTP/HTTPS URLs are supported
- Internal Chrome pages (chrome://) cannot be analyzed

## Files

```
extension/
├── manifest.json      # Extension configuration
├── popup.html         # Popup interface
├── popup.js           # Popup logic
├── background.js      # Service worker (context menus)
├── options.html       # Settings page
├── icons/             # Extension icons (add PNGs here)
└── README.md          # This file
```
