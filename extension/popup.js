// Personal OS Browser Extension - Popup Script

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

// Update UI based on current tab
async function updateUI() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = tab.url;
    const contentType = detectContentType(url);

    const urlElement = document.getElementById('current-url');
    const typeElement = document.getElementById('content-type');
    const mainContent = document.getElementById('main-content');
    const notSupported = document.getElementById('not-supported');
    const analyzeBtn = document.getElementById('analyze-btn');
    const queueBtn = document.getElementById('queue-btn');

    // Truncate URL for display
    const displayUrl = url.length > 60 ? url.substring(0, 60) + '...' : url;
    urlElement.textContent = displayUrl;
    urlElement.title = url;

    if (contentType) {
      typeElement.textContent = contentType;
      typeElement.className = `type ${contentType}`;
      mainContent.style.display = 'block';
      notSupported.style.display = 'none';

      // Store URL and type for later
      analyzeBtn.dataset.url = url;
      analyzeBtn.dataset.type = contentType;
      queueBtn.dataset.url = url;
      queueBtn.dataset.type = contentType;
    } else {
      mainContent.style.display = 'none';
      notSupported.style.display = 'block';
    }
  } catch (error) {
    console.error('Failed to get current tab:', error);
  }
}

// Show status message
function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = `status ${type}`;
}

// Submit analysis request
async function submitAnalysis(url, contentType, model) {
  const response = await fetch(`${API_BASE}/analysis/${contentType}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url, model }),
  });

  if (!response.ok) {
    throw new Error('Failed to submit analysis');
  }

  return response.json();
}

// Add to queue (using batch endpoint)
async function addToQueue(url) {
  // For now, we'll use localStorage to store queued items
  // In a full implementation, this would sync with the backend
  const queue = JSON.parse(localStorage.getItem('personalos_queue') || '[]');
  queue.push({ url, addedAt: new Date().toISOString() });
  localStorage.setItem('personalos_queue', JSON.stringify(queue));
  return { success: true, queueLength: queue.length };
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  updateUI();

  // Load saved model preference
  chrome.storage.sync.get(['preferredModel'], (result) => {
    if (result.preferredModel) {
      document.getElementById('model').value = result.preferredModel;
    }
  });

  // Save model preference on change
  document.getElementById('model').addEventListener('change', (e) => {
    chrome.storage.sync.set({ preferredModel: e.target.value });
  });

  // Analyze button
  document.getElementById('analyze-btn').addEventListener('click', async (e) => {
    const btn = e.target;
    const url = btn.dataset.url;
    const contentType = btn.dataset.type;
    const model = document.getElementById('model').value;

    btn.disabled = true;
    btn.textContent = 'Submitting...';
    showStatus('Sending to Personal OS...', 'loading');

    try {
      const result = await submitAnalysis(url, contentType, model);
      showStatus(`Analysis started! Job ID: ${result.job_id}`, 'success');
      btn.textContent = 'Analyze Now';
    } catch (error) {
      showStatus('Failed to submit. Is the backend running?', 'error');
      btn.textContent = 'Analyze Now';
    } finally {
      btn.disabled = false;
    }
  });

  // Queue button
  document.getElementById('queue-btn').addEventListener('click', async (e) => {
    const btn = e.target;
    const url = btn.dataset.url;

    btn.disabled = true;
    btn.textContent = 'Adding...';

    try {
      const result = await addToQueue(url);
      showStatus(`Added to queue (${result.queueLength} items)`, 'success');
      btn.textContent = 'Add to Queue';
    } catch (error) {
      showStatus('Failed to add to queue', 'error');
      btn.textContent = 'Add to Queue';
    } finally {
      btn.disabled = false;
    }
  });
});
