# Chrome Extension Development Guide (Manifest V3)

This guide teaches Chrome extension development for developers new to browser extensions. We'll cover the Manifest V3 architecture, background workers, content scripts, and browser APIs.

---

## Table of Contents

1. [What is a Chrome Extension?](#what-is-a-chrome-extension)
2. [Manifest V3 Overview](#manifest-v3-overview)
3. [Project Structure](#project-structure)
4. [The Manifest File](#the-manifest-file)
5. [Background Service Workers](#background-service-workers)
6. [Popup UI](#popup-ui)
7. [Content Scripts](#content-scripts)
8. [Chrome APIs](#chrome-apis)
9. [Storage API](#storage-api)
10. [Context Menus](#context-menus)
11. [Message Passing](#message-passing)
12. [Permissions](#permissions)
13. [Debugging Extensions](#debugging-extensions)
14. [This Project's Extension](#this-projects-extension)
15. [Practice Exercises](#practice-exercises)

---

## What is a Chrome Extension?

A Chrome extension is a small program that customizes the browser. Extensions can:

- Add buttons to the toolbar
- Modify web pages
- Interact with browser tabs
- Store user preferences
- Communicate with external APIs

### Extension Types

```
┌─────────────────────────────────────────────────────────────────┐
│                    Types of Extensions                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Browser Action (Popup)          Content Script                  │
│  ─────────────────────           ──────────────                  │
│  - Icon in toolbar               - Runs on web pages            │
│  - Shows popup on click          - Can modify page DOM          │
│  - User-initiated actions        - Automatic injection          │
│                                                                  │
│  Background Worker               Options Page                    │
│  ─────────────────               ────────────                    │
│  - Runs in background            - Settings UI                  │
│  - Event-driven                  - User preferences             │
│  - API calls, timers             - Configuration                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Why Build an Extension?

| Use Case | Example |
|----------|---------|
| Save content | Personal OS: Save pages for analysis |
| Enhance pages | Ad blockers, dark mode |
| Integrate services | Password managers, translators |
| Automate tasks | Form fillers, screenshot tools |

---

## Manifest V3 Overview

Manifest V3 (MV3) is the latest extension platform for Chrome. Key changes from MV2:

| Feature | Manifest V2 | Manifest V3 |
|---------|-------------|-------------|
| Background | Persistent pages | Service workers |
| Remote code | Allowed | Not allowed |
| Web requests | Blocking allowed | Use declarativeNetRequest |
| Permissions | All upfront | Request as needed |

### Why Manifest V3?

1. **Security**: No remote code execution
2. **Privacy**: Limited access to user data
3. **Performance**: Service workers unload when idle

---

## Project Structure

### Minimal Extension Structure

```
my-extension/
├── manifest.json          # Required: Extension configuration
├── background.js          # Service worker (event handling)
├── popup.html            # Toolbar popup UI
├── popup.js              # Popup logic
├── options.html          # Settings page
├── options.js            # Settings logic
├── content.js            # Content script (runs on pages)
├── styles.css            # Popup/options styles
└── icons/                # Extension icons
    ├── icon16.png        # 16x16 (favicon)
    ├── icon32.png        # 32x32
    ├── icon48.png        # 48x48 (extensions page)
    └── icon128.png       # 128x128 (Chrome Web Store)
```

### Personal OS Extension Structure

```
extension/
├── manifest.json         # Manifest V3 configuration
├── background.js         # Service worker (context menus, API calls)
├── popup.html           # Quick analyze popup
├── popup.js             # Popup logic
├── options.html         # Settings (API endpoint, model)
└── icons/               # Extension icons
```

---

## The Manifest File

The `manifest.json` is the extension's configuration file. Every extension must have one.

### Minimal Manifest

```json
{
  "manifest_version": 3,
  "name": "My Extension",
  "version": "1.0.0",
  "description": "A simple Chrome extension"
}
```

### Full Manifest Example

```json
{
  "manifest_version": 3,
  "name": "Personal OS - Save to Analyze",
  "version": "1.0.0",
  "description": "Save web pages to Personal OS for AI-powered analysis",

  "permissions": [
    "activeTab",
    "storage",
    "contextMenus"
  ],

  "host_permissions": [
    "http://localhost:8000/*"
  ],

  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "32": "icons/icon32.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },

  "background": {
    "service_worker": "background.js"
  },

  "icons": {
    "16": "icons/icon16.png",
    "32": "icons/icon32.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },

  "options_page": "options.html"
}
```

### Key Manifest Fields

| Field | Description |
|-------|-------------|
| `manifest_version` | Must be `3` for MV3 |
| `name` | Extension name (45 chars max) |
| `version` | Semantic version (X.Y.Z) |
| `permissions` | Chrome APIs to access |
| `host_permissions` | URLs the extension can access |
| `action` | Toolbar button configuration |
| `background` | Service worker file |
| `content_scripts` | Scripts to inject into pages |
| `options_page` | Settings page URL |

---

## Background Service Workers

Service workers handle events in the background. They're event-driven and don't have access to the DOM.

### Basic Service Worker

```javascript
// background.js

// Called when extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed!');
});

// Called when browser starts with extension
chrome.runtime.onStartup.addListener(() => {
  console.log('Browser started!');
});
```

### Service Worker Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                Service Worker Lifecycle                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Extension Load                                                  │
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Service Worker Starts                                    │    │
│  │ - Runs initialization code                              │    │
│  │ - Sets up event listeners                               │    │
│  └─────────────────────────────────────────────────────────┘    │
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Worker Becomes Idle (after ~30 seconds)                 │    │
│  │ - Worker is terminated to save memory                   │    │
│  │ - Event listeners are preserved                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│       │                                                          │
│       │  Event occurs (click, message, alarm, etc.)             │
│       ▼                                                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Worker Wakes Up                                          │    │
│  │ - Runs initialization code again                        │    │
│  │ - Handles the event                                     │    │
│  │ - Returns to idle                                       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Important: Persistent State

Service workers can be terminated at any time. Don't store state in variables:

```javascript
// ❌ WRONG: State will be lost when worker terminates
let count = 0;
chrome.action.onClicked.addListener(() => {
  count++;  // This resets to 0 when worker restarts!
});

// ✓ CORRECT: Use chrome.storage for persistent state
chrome.action.onClicked.addListener(async () => {
  const { count = 0 } = await chrome.storage.local.get(['count']);
  await chrome.storage.local.set({ count: count + 1 });
});
```

---

## Popup UI

The popup is shown when users click the extension icon.

### popup.html

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      width: 300px;
      padding: 15px;
      font-family: -apple-system, system-ui, sans-serif;
    }
    .url {
      font-size: 12px;
      color: #666;
      margin-bottom: 10px;
      word-break: break-all;
    }
    button {
      width: 100%;
      padding: 10px;
      background: #4285f4;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    button:hover {
      background: #3367d6;
    }
  </style>
</head>
<body>
  <div class="url" id="current-url">Loading...</div>
  <button id="analyze-btn">Analyze This Page</button>

  <script src="popup.js"></script>
</body>
</html>
```

### popup.js

```javascript
// Get current tab information
async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });
  return tab;
}

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  const tab = await getCurrentTab();

  // Display current URL
  document.getElementById('current-url').textContent = tab.url;

  // Handle analyze button click
  document.getElementById('analyze-btn').addEventListener('click', async () => {
    const response = await fetch('http://localhost:8000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: tab.url })
    });

    if (response.ok) {
      window.close();  // Close popup after success
    }
  });
});
```

### Popup Limitations

- **No inline JavaScript**: Use external `.js` files
- **No inline styles in JS**: Use CSS files
- **No `eval()` or `new Function()`**: Security restriction
- **Closes on blur**: Popup closes when user clicks away

---

## Content Scripts

Content scripts run in the context of web pages. They can read and modify the DOM.

### manifest.json (Content Scripts)

```json
{
  "content_scripts": [
    {
      "matches": ["https://*.youtube.com/*"],
      "js": ["content.js"],
      "css": ["content.css"],
      "run_at": "document_idle"
    }
  ]
}
```

### content.js

```javascript
// This runs on every matching page

// Read page content
const title = document.title;
const text = document.body.innerText;

// Modify page
const badge = document.createElement('div');
badge.textContent = 'Personal OS Active';
badge.style.cssText = `
  position: fixed;
  bottom: 10px;
  right: 10px;
  background: #4285f4;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  z-index: 9999;
`;
document.body.appendChild(badge);
```

### Content Script Isolation

```
┌─────────────────────────────────────────────────────────────────┐
│                  Content Script Isolation                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Web Page World                Content Script World              │
│  ──────────────────            ─────────────────────            │
│                                                                  │
│  window.myVar = 123;           // Cannot see window.myVar       │
│  $.ajax(...)                   // Cannot use page's jQuery      │
│                                                                  │
│       │                              │                          │
│       │      SHARED DOM              │                          │
│       └──────────┬───────────────────┘                          │
│                  │                                               │
│                  ▼                                               │
│          document.body                                           │
│          document.getElementById()                               │
│          document.querySelector()                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Chrome APIs

Chrome provides many APIs for extensions. Here are the most common:

### Tabs API

```javascript
// Get current tab
const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
console.log(tab.url, tab.title);

// Open new tab
await chrome.tabs.create({ url: 'https://example.com' });

// Update current tab
await chrome.tabs.update(tab.id, { url: 'https://new-url.com' });

// Close tab
await chrome.tabs.remove(tab.id);

// Inject script into tab
await chrome.scripting.executeScript({
  target: { tabId: tab.id },
  func: () => document.title
});
```

### Runtime API

```javascript
// Get extension info
const manifest = chrome.runtime.getManifest();
console.log(manifest.version);

// Open options page
chrome.runtime.openOptionsPage();

// Send message to background
chrome.runtime.sendMessage({ type: 'ANALYZE', url: 'https://...' });

// Listen for messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_DATA') {
    sendResponse({ data: 'here' });
  }
  return true;  // Keep channel open for async response
});
```

### Notifications API

```javascript
// Show notification
chrome.notifications.create({
  type: 'basic',
  iconUrl: 'icons/icon48.png',
  title: 'Personal OS',
  message: 'Analysis complete!'
});
```

---

## Storage API

Chrome provides two storage areas: `local` and `sync`.

### Storage Types

| Storage | Size Limit | Syncs Across Devices |
|---------|------------|---------------------|
| `local` | 10 MB | No |
| `sync` | 100 KB | Yes (with Chrome account) |

### Using Storage

```javascript
// Save data
await chrome.storage.local.set({
  queue: ['url1', 'url2'],
  settings: { theme: 'dark' }
});

// Read data
const { queue = [], settings = {} } = await chrome.storage.local.get(['queue', 'settings']);
console.log(queue);  // ['url1', 'url2']

// Remove data
await chrome.storage.local.remove(['queue']);

// Clear all
await chrome.storage.local.clear();

// Listen for changes
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.queue) {
    console.log('Queue updated:', changes.queue.newValue);
  }
});
```

### Sync vs Local

```javascript
// User preferences - sync across devices
await chrome.storage.sync.set({ preferredModel: 'sonnet' });

// Large data - keep local
await chrome.storage.local.set({ cachedReports: [...largeArray] });
```

---

## Context Menus

Context menus appear when users right-click.

### Creating Context Menus

```javascript
// background.js

// Create on install
chrome.runtime.onInstalled.addListener(() => {
  // Parent menu
  chrome.contextMenus.create({
    id: 'personal-os',
    title: 'Personal OS',
    contexts: ['page', 'link', 'selection']
  });

  // Submenu items
  chrome.contextMenus.create({
    id: 'analyze-now',
    parentId: 'personal-os',
    title: 'Analyze Now',
    contexts: ['page', 'link']
  });

  chrome.contextMenus.create({
    id: 'add-to-queue',
    parentId: 'personal-os',
    title: 'Add to Queue',
    contexts: ['page', 'link']
  });

  chrome.contextMenus.create({
    id: 'analyze-selection',
    parentId: 'personal-os',
    title: 'Analyze Selected Text',
    contexts: ['selection']
  });
});

// Handle clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case 'analyze-now':
      const url = info.linkUrl || info.pageUrl;
      analyzeUrl(url);
      break;

    case 'add-to-queue':
      addToQueue(info.linkUrl || info.pageUrl);
      break;

    case 'analyze-selection':
      analyzeText(info.selectionText);
      break;
  }
});
```

### Context Types

| Context | Description |
|---------|-------------|
| `page` | Right-click on page background |
| `link` | Right-click on a link |
| `selection` | Right-click on selected text |
| `image` | Right-click on an image |
| `video` | Right-click on a video |
| `audio` | Right-click on audio |

---

## Message Passing

Extensions have multiple contexts (popup, background, content scripts) that need to communicate.

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Message Passing                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐                         ┌──────────────────┐      │
│  │  Popup   │◀────────────────────────│  Background      │      │
│  │          │  chrome.runtime          │  Service Worker  │      │
│  └──────────┘  .sendMessage()          └──────────────────┘      │
│                                               ▲                  │
│                                               │                  │
│                                               │ chrome.tabs      │
│                                               │ .sendMessage()   │
│                                               │                  │
│                                        ┌──────────────────┐      │
│                                        │  Content Script  │      │
│                                        │  (on web page)   │      │
│                                        └──────────────────┘      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Popup → Background

```javascript
// popup.js
async function getQueue() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { type: 'GET_QUEUE' },
      (response) => resolve(response.queue)
    );
  });
}

// background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_QUEUE') {
    chrome.storage.local.get(['queue'], (result) => {
      sendResponse({ queue: result.queue || [] });
    });
    return true;  // IMPORTANT: Keeps channel open for async response
  }
});
```

### Background → Content Script

```javascript
// background.js
async function getPageContent(tabId) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(
      tabId,
      { type: 'GET_CONTENT' },
      (response) => resolve(response)
    );
  });
}

// content.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_CONTENT') {
    sendResponse({
      title: document.title,
      text: document.body.innerText,
      url: window.location.href
    });
  }
});
```

### Async Message Handling

```javascript
// IMPORTANT: Return true for async responses
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ASYNC_OPERATION') {
    // This is async
    doAsyncThing().then((result) => {
      sendResponse({ data: result });
    });

    return true;  // Tells Chrome to keep the channel open
  }
});
```

---

## Permissions

Extensions must declare what they need access to.

### Common Permissions

| Permission | Description |
|------------|-------------|
| `activeTab` | Access to active tab when user invokes |
| `storage` | chrome.storage API |
| `contextMenus` | Context menu API |
| `notifications` | Show notifications |
| `tabs` | Full access to tabs API |
| `scripting` | Inject scripts into pages |
| `alarms` | Schedule background tasks |

### Host Permissions

```json
{
  "host_permissions": [
    "https://*.youtube.com/*",      // Match all YouTube URLs
    "http://localhost:8000/*",       // Local development server
    "<all_urls>"                     // All URLs (avoid if possible)
  ]
}
```

### Optional Permissions

```javascript
// Request permission when needed
const granted = await chrome.permissions.request({
  permissions: ['tabs'],
  origins: ['https://example.com/*']
});

if (granted) {
  // User approved - use the API
}
```

---

## Debugging Extensions

### Loading Unpacked Extension

1. Go to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select your extension folder

### Debugging Tools

| What | How |
|------|-----|
| Background script | Click "Service Worker" link in chrome://extensions |
| Popup | Right-click popup → Inspect |
| Content script | DevTools on the page → Sources → Content Scripts |
| Storage | DevTools → Application → Local Storage |

### Common Issues

```javascript
// Issue: "Cannot read property 'sendMessage' of undefined"
// Fix: Check that chrome.runtime is available (not in content script on chrome:// pages)

// Issue: "Unchecked runtime.lastError: The message port closed"
// Fix: Return true from message listener for async responses

// Issue: "Service worker registration failed"
// Fix: Check for syntax errors in background.js

// Issue: Context menu not appearing
// Fix: Make sure contextMenus permission is in manifest
```

---

## This Project's Extension

Personal OS includes a Chrome extension for quick content saving.

### Location: `extension/`

### Key Files

**manifest.json**
```json
{
  "manifest_version": 3,
  "name": "Personal OS - Save to Analyze",
  "version": "1.0.0",
  "permissions": ["activeTab", "storage", "contextMenus"],
  "host_permissions": ["http://localhost:8000/*"],
  "action": { "default_popup": "popup.html" },
  "background": { "service_worker": "background.js" }
}
```

**background.js** - Key Features
```javascript
// Detect content type from URL
function detectContentType(url) {
  if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
    return 'youtube';
  }
  if (url.includes('arxiv.org/abs/')) {
    return 'arxiv';
  }
  return 'article';  // Default
}

// Create context menu on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'personalos-analyze',
    title: 'Analyze Now',
    contexts: ['page', 'link']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const url = info.linkUrl || info.pageUrl;
  const contentType = detectContentType(url);
  const { preferredModel } = await chrome.storage.sync.get(['preferredModel']);

  const response = await fetch(`${API_BASE}/analysis/${contentType}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, model: preferredModel }),
  });

  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon48.png',
    title: 'Personal OS',
    message: response.ok ? 'Analysis started!' : 'Failed to submit'
  });
});
```

**popup.js** - Key Features
```javascript
// Update UI based on current tab
async function updateUI() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const contentType = detectContentType(tab.url);

  document.getElementById('current-url').textContent = tab.url;
  document.getElementById('content-type').textContent = contentType;
}

// Submit analysis
document.getElementById('analyze-btn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const model = document.getElementById('model').value;

  await fetch(`${API_BASE}/analysis/${detectContentType(tab.url)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: tab.url, model }),
  });
});
```

### Installing the Extension

1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `extension/` folder
5. Make sure backend is running on `localhost:8000`

---

## Practice Exercises

### Exercise 1: Page Info Extension

Create an extension that shows page information:

```
Popup shows:
- Page title
- Word count
- Number of images
- Number of links
```

### Exercise 2: Quick Notes

Create an extension that saves notes for each page:

```
Features:
- Textarea in popup
- Save note with chrome.storage
- Key by URL
- Show note when revisiting
```

### Exercise 3: Reading List

Create an extension to save pages for later:

```
Features:
- "Save for Later" button
- List saved pages in popup
- Mark as read
- Delete from list
```

### Exercise 4: Text Highlighter

Create an extension that highlights selected text:

```
Features:
- Context menu "Highlight"
- Content script adds highlight
- Store highlights per page
- Show highlights on revisit
```

---

## Summary

| Concept | Key Points |
|---------|------------|
| Manifest V3 | Latest Chrome extension platform |
| Service Worker | Background script, event-driven |
| Popup | UI shown when clicking extension icon |
| Content Script | Runs in context of web pages |
| Storage | `local` (10MB) vs `sync` (100KB) |
| Messages | Communication between contexts |
| Context Menus | Right-click menu items |

### Extension Architecture

```
manifest.json
     │
     ├── background.js (service worker)
     │        ├── chrome.contextMenus
     │        ├── chrome.storage
     │        └── API calls
     │
     ├── popup.html/js (toolbar button)
     │        └── User interactions
     │
     └── content.js (optional)
              └── Page modifications
```

---

*Learning Guide - Chrome Extension Development*

*Built with [Claude Code](https://claude.ai/code) powered by Claude Opus 4.5*
