// Personal OS Browser Extension - Background Service Worker

const API_BASE = 'http://localhost:8000/api';

// Detect content type from URL
function detectContentType(url) {
  if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
    return 'youtube';
  }
  if (url.includes('arxiv.org/abs/') || url.includes('arxiv.org/pdf/')) {
    return 'arxiv';
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return 'article';
  }
  return null;
}

// Create context menu on install
chrome.runtime.onInstalled.addListener(() => {
  // Create parent menu item
  chrome.contextMenus.create({
    id: 'personalos-parent',
    title: 'Personal OS',
    contexts: ['page', 'link']
  });

  // Analyze now submenu
  chrome.contextMenus.create({
    id: 'personalos-analyze',
    parentId: 'personalos-parent',
    title: 'Analyze Now',
    contexts: ['page', 'link']
  });

  // Add to queue submenu
  chrome.contextMenus.create({
    id: 'personalos-queue',
    parentId: 'personalos-parent',
    title: 'Add to Queue',
    contexts: ['page', 'link']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const url = info.linkUrl || info.pageUrl;
  const contentType = detectContentType(url);

  if (!contentType) {
    // Show notification that URL is not supported
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'Personal OS',
      message: 'This URL type is not supported for analysis.'
    });
    return;
  }

  if (info.menuItemId === 'personalos-analyze') {
    // Get preferred model from storage
    const { preferredModel = 'sonnet' } = await chrome.storage.sync.get(['preferredModel']);

    try {
      const response = await fetch(`${API_BASE}/analysis/${contentType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, model: preferredModel }),
      });

      if (response.ok) {
        const result = await response.json();
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: 'Personal OS',
          message: `Analysis started! Job ID: ${result.job_id}`
        });
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Personal OS',
        message: 'Failed to submit. Is the backend running?'
      });
    }
  } else if (info.menuItemId === 'personalos-queue') {
    // Add to local queue
    const { queue = [] } = await chrome.storage.local.get(['queue']);
    queue.push({ url, contentType, addedAt: new Date().toISOString() });
    await chrome.storage.local.set({ queue });

    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'Personal OS',
      message: `Added to queue (${queue.length} items)`
    });
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_QUEUE') {
    chrome.storage.local.get(['queue'], (result) => {
      sendResponse({ queue: result.queue || [] });
    });
    return true; // Keep channel open for async response
  }

  if (message.type === 'CLEAR_QUEUE') {
    chrome.storage.local.set({ queue: [] }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});
