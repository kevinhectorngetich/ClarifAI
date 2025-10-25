// Background script for ClarifAI extension
// Handles context menu creation and events

chrome.runtime.onInstalled.addListener(() => {
    // Create context menu items
    chrome.contextMenus.create({
        id: 'clarify-link',
        title: 'Explain with ClarifAI',
        contexts: ['link'],
        documentUrlPatterns: ['<all_urls>']
    });

    chrome.contextMenus.create({
        id: 'clarify-selection',
        title: 'Explain "%s" with ClarifAI',
        contexts: ['selection'],
        documentUrlPatterns: ['<all_urls>']
    });

    chrome.contextMenus.create({
        id: 'clarify-page',
        title: 'Summarize page with ClarifAI',
        contexts: ['page'],
        documentUrlPatterns: ['<all_urls>']
    });

    chrome.contextMenus.create({
        id: 'clarify-image',
        title: 'Describe image with ClarifAI',
        contexts: ['image'],
        documentUrlPatterns: ['<all_urls>']
    });

    console.log('ClarifAI context menus created');
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (!tab?.id) return;

    console.log('Context menu clicked:', info.menuItemId, info);

    try {
        switch (info.menuItemId) {
            case 'clarify-link':
                await handleLinkExplanation(info, tab);
                break;
            case 'clarify-selection':
                await handleSelectionExplanation(info, tab);
                break;
            case 'clarify-page':
                await handlePageSummary(info, tab);
                break;
            case 'clarify-image':
                await handleImageDescription(info, tab);
                break;
        }
    } catch (error) {
        console.error('Error handling context menu click:', error);
    }
});

async function handleLinkExplanation(info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab) {
    const linkUrl = info.linkUrl;
    if (!linkUrl) return;

    console.log('Explaining link:', linkUrl);

    // Store the request in storage for the popup to pick up
    await chrome.storage.local.set({
        pendingRequest: {
            type: 'link',
            url: linkUrl,
            text: info.selectionText || '',
            timestamp: Date.now()
        }
    });

    // Open the popup or notify it
    try {
        await chrome.action.openPopup();
    } catch (error) {
        console.warn('Could not open popup (no active window):', error);
        // The pending request is still stored, user can open popup manually
    }
}

async function handleSelectionExplanation(info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab) {
    const selectedText = info.selectionText;
    if (!selectedText) return;

    console.log('Explaining selection:', selectedText);

    // Store the request in storage for the popup to pick up
    await chrome.storage.local.set({
        pendingRequest: {
            type: 'selection',
            text: selectedText,
            pageUrl: tab.url || '',
            pageTitle: tab.title || '',
            timestamp: Date.now()
        }
    });

    // Open the popup or notify it
    try {
        await chrome.action.openPopup();
    } catch (error) {
        console.warn('Could not open popup (no active window):', error);
        // The pending request is still stored, user can open popup manually
    }
}

async function handlePageSummary(info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab) {
    console.log('Summarizing page:', tab.url);

    // Store the request in storage for the popup to pick up
    await chrome.storage.local.set({
        pendingRequest: {
            type: 'page',
            pageUrl: tab.url || '',
            pageTitle: tab.title || '',
            timestamp: Date.now()
        }
    });

    // Open the popup or notify it
    try {
        await chrome.action.openPopup();
    } catch (error) {
        console.warn('Could not open popup (no active window):', error);
        // The pending request is still stored, user can open popup manually
    }
}

async function handleImageDescription(info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab) {
    const imageUrl = info.srcUrl;
    if (!imageUrl) return;

    console.log('Describing image:', imageUrl);

    // Store the request in storage for the popup to pick up
    await chrome.storage.local.set({
        pendingRequest: {
            type: 'image',
            imageUrl: imageUrl,
            pageUrl: tab.url || '',
            pageTitle: tab.title || '',
            timestamp: Date.now()
        }
    });

    // Open the popup or notify it
    try {
        await chrome.action.openPopup();
    } catch (error) {
        console.warn('Could not open popup (no active window):', error);
        // The pending request is still stored, user can open popup manually
    }
}

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Background received message:', message);

    if (message.type === 'FETCH_LINK_CONTENT') {
        fetchLinkContent(message.url)
            .then(content => sendResponse({ success: true, content }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // Keep the message channel open for async response
    }

    if (message.type === 'FETCH_IMAGE') {
        fetchImageContent(message.url)
            .then((result: { data: ArrayBuffer; mimeType: string }) => sendResponse({ success: true, ...result }))
            .catch((error: any) => sendResponse({ success: false, error: error.message }));
        return true; // Keep the message channel open for async response
    }

    if (message.type === 'GET_PENDING_REQUEST') {
        chrome.storage.local.get(['pendingRequest'])
            .then(result => sendResponse(result.pendingRequest || null))
            .catch(error => sendResponse(null));
        return true;
    }

    if (message.type === 'CLEAR_PENDING_REQUEST') {
        chrome.storage.local.remove(['pendingRequest'])
            .then(() => sendResponse({ success: true }))
            .catch(error => sendResponse({ success: false }));
        return true;
    }
});

async function fetchLinkContent(url: string): Promise<string> {
    try {
        console.log('Fetching content from:', url);

        // Try to find if there's already a tab with this URL open
        const tabs = await chrome.tabs.query({ url: url });

        if (tabs.length > 0 && tabs[0].id) {
            console.log('Found existing tab with URL, extracting content...');
            return await extractContentFromTab(tabs[0].id);
        }

        // If no existing tab, create a new one (hidden/background approach)
        console.log('Creating new tab to fetch content...');

        // First, ensure we have an active window to create the tab in
        const windows = await chrome.windows.getAll({ populate: false });
        let targetWindowId: number | undefined;

        if (windows.length === 0) {
            // No windows exist, create a new one
            console.log('No windows found, creating new window...');
            const newWindow = await chrome.windows.create({
                url: url,
                focused: false,
                state: 'minimized'
            });

            if (!newWindow.tabs || !newWindow.tabs[0]?.id) {
                throw new Error('Failed to create window with tab');
            }

            const tab = newWindow.tabs[0];

            // Wait for the page to load
            await waitForTabToLoad(tab.id!);

            // Extract content
            const content = await extractContentFromTab(tab.id!);

            // Close the window we created
            await chrome.windows.remove(newWindow.id!);

            return content;
        } else {
            // Use existing window
            targetWindowId = windows[0].id;
        }

        const tab = await chrome.tabs.create({
            url: url,
            active: false,  // Open in background
            windowId: targetWindowId
        });


        if (!tab.id) {
            throw new Error('Failed to create tab');
        }

        // Wait for the page to load
        await waitForTabToLoad(tab.id);

        // Extract content
        const content = await extractContentFromTab(tab.id);

        // Close the tab we created
        await chrome.tabs.remove(tab.id);

        return content;

    } catch (error) {
        console.error('Error fetching link content:', error);
        throw new Error(`Failed to fetch content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

async function waitForTabToLoad(tabId: number): Promise<void> {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error('Tab loading timeout'));
        }, 10000); // 10 second timeout

        const listener = (updatedTabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
            if (updatedTabId === tabId && changeInfo.status === 'complete') {
                clearTimeout(timeout);
                chrome.tabs.onUpdated.removeListener(listener);
                // Give it a moment for any dynamic content to load
                setTimeout(resolve, 1000);
            }
        };

        chrome.tabs.onUpdated.addListener(listener);
    });
}

async function extractContentFromTab(tabId: number): Promise<string> {
    try {
        // Inject content extraction script
        const results = await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: () => {
                // This function runs in the context of the target page
                try {
                    // Remove script and style elements for cleaner content
                    const scripts = document.querySelectorAll('script, style');
                    scripts.forEach(script => script.remove());

                    // Get basic page info
                    const title = document.querySelector('title')?.textContent || '';
                    const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';

                    // Try to get main content from common selectors
                    const contentSelectors = [
                        'main',
                        'article',
                        '.content',
                        '.post-content',
                        '.entry-content',
                        '.article-content',
                        '#content',
                        '.main-content',
                        '[role="main"]',
                        '.markdown-body', // GitHub specific
                        '.timeline-comment-wrapper', // GitHub issues
                        '.js-discussion' // GitHub discussions
                    ];

                    let mainContent = '';
                    for (const selector of contentSelectors) {
                        const element = document.querySelector(selector);
                        if (element) {
                            mainContent = element.textContent || '';
                            break;
                        }
                    }

                    // Fallback to body if no main content found
                    if (!mainContent) {
                        mainContent = document.body?.textContent || '';
                    }

                    // Clean up the text
                    mainContent = mainContent
                        .replace(/\s+/g, ' ')
                        .trim()
                        .substring(0, 8000); // Increase limit for better content

                    return {
                        title,
                        metaDescription,
                        mainContent,
                        url: window.location.href
                    };
                } catch (error) {
                    return {
                        title: '',
                        metaDescription: '',
                        mainContent: `Error extracting content: ${error}`,
                        url: window.location.href
                    };
                }
            }
        });

        if (!results || results.length === 0 || !results[0].result) {
            throw new Error('Failed to extract content from page');
        }

        const { title, metaDescription, mainContent } = results[0].result;
        const content = `Title: ${title}\n\nDescription: ${metaDescription}\n\nContent: ${mainContent}`;

        console.log('Successfully extracted content, length:', content.length);
        return content;

    } catch (error) {
        console.error('Error extracting content from tab:', error);
        throw new Error(`Failed to extract content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

async function fetchImageContent(url: string): Promise<{ data: ArrayBuffer; mimeType: string }> {
    try {
        console.log('Fetching image from:', url);

        // Fetch the image
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Get the content type
        const mimeType = response.headers.get('content-type') || 'image/png';

        // Validate it's an image
        if (!mimeType.startsWith('image/')) {
            throw new Error(`URL does not point to an image. Content-Type: ${mimeType}`);
        }

        // Get the image data as ArrayBuffer
        const data = await response.arrayBuffer();

        console.log('Successfully fetched image, size:', data.byteLength, 'bytes, type:', mimeType);
        return { data, mimeType };

    } catch (error) {
        console.error('Error fetching image:', error);
        throw new Error(`Failed to fetch image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}