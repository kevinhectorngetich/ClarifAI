// Content extraction utilities for Chrome extension

export interface PageContent {
    title: string;
    url: string;
    text: string;
    selectedText: string;
    metadata: {
        domain: string;
        lastModified?: string;
        description?: string;
    };
}

/**
 * Extract content from the current active tab
 */
export const extractPageContent = async (): Promise<PageContent | null> => {
    try {
        // Check if chrome.scripting is available
        if (!chrome?.scripting) {
            throw new Error('Chrome scripting API not available - extension may not be loaded properly');
        }

        // Get the active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (!tab.id || !tab.url) {
            throw new Error('No active tab found');
        }

        // Check if tab URL is accessible (not chrome:// or extension pages)
        if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('edge://') || tab.url.startsWith('about:')) {
            throw new Error('Cannot access content from this type of page');
        }

        // Inject content script to extract page content
        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: extractContentFromPage,
        });

        if (!results || !results[0] || !results[0].result) {
            throw new Error('Failed to extract content from page');
        }

        const content = results[0].result;

        return {
            title: tab.title || '',
            url: tab.url,
            text: content.text,
            selectedText: content.selectedText,
            metadata: {
                domain: new URL(tab.url).hostname,
                description: content.description,
            }
        };
    } catch (error) {
        console.error('Error extracting page content:', error);
        return null;
    }
};

/**
 * Function to be injected into the page to extract content
 * This runs in the context of the web page
 */
function extractContentFromPage() {
    // Get selected text if any
    const selection = window.getSelection();
    const selectedText = selection ? selection.toString().trim() : '';

    // Extract main content text
    let mainText = '';

    // Try to get content from common article selectors
    const contentSelectors = [
        'article',
        'main',
        '[role="main"]',
        '.content',
        '.post-content',
        '.entry-content',
        '.article-body',
        '.story-body'
    ];

    for (const selector of contentSelectors) {
        const element = document.querySelector(selector) as HTMLElement;
        if (element) {
            mainText = element.innerText || element.textContent || '';
            break;
        }
    }

    // Fallback to body text if no main content found
    if (!mainText) {
        mainText = (document.body as HTMLElement).innerText || document.body.textContent || '';
    }

    // Clean up the text
    mainText = mainText
        .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
        .replace(/\n\s*\n/g, '\n') // Remove empty lines
        .trim();

    // Limit text length to avoid overwhelming the API
    if (mainText.length > 10000) {
        mainText = mainText.substring(0, 10000) + '...';
    }

    // Get page description
    const metaDescription = document.querySelector('meta[name="description"]');
    const description = metaDescription?.getAttribute('content') || '';

    return {
        text: mainText,
        selectedText,
        description
    };
}