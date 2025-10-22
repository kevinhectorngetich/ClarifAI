// Content script for ClarifAI extension
// Handles page-level interactions and context detection

console.log('ClarifAI content script loaded');

// Listen for messages from background script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Content script received message:', message);

    switch (message.type) {
        case 'GET_PAGE_CONTENT':
            getPageContent()
                .then(content => sendResponse({ success: true, content }))
                .catch(error => sendResponse({ success: false, error: error.message }));
            return true; // Keep the message channel open for async response

        case 'GET_SELECTION_CONTEXT':
            getSelectionContext()
                .then(context => sendResponse({ success: true, context }))
                .catch(error => sendResponse({ success: false, error: error.message }));
            return true;

        case 'HIGHLIGHT_TEXT':
            highlightText(message.text)
                .then(result => sendResponse({ success: true, result }))
                .catch(error => sendResponse({ success: false, error: error.message }));
            return true;
    }
});

async function getPageContent(): Promise<any> {
    try {
        // Extract comprehensive page content
        const content = {
            title: document.title,
            url: window.location.href,
            metaDescription: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
            headings: Array.from(document.querySelectorAll('h1, h2, h3')).map(h => ({
                level: h.tagName.toLowerCase(),
                text: h.textContent?.trim() || ''
            })).filter(h => h.text),
            paragraphs: Array.from(document.querySelectorAll('p')).map(p => p.textContent?.trim() || '').filter(text => text && text.length > 20),
            links: Array.from(document.querySelectorAll('a[href]')).map(a => ({
                text: a.textContent?.trim() || '',
                href: a.getAttribute('href') || '',
                title: a.getAttribute('title') || ''
            })).filter(link => link.text && link.href),
            images: Array.from(document.querySelectorAll('img[alt]')).map(img => ({
                alt: img.getAttribute('alt') || '',
                src: img.getAttribute('src') || '',
                title: img.getAttribute('title') || ''
            })).filter(img => img.alt),
            mainContent: getMainContent()
        };

        return content;
    } catch (error) {
        console.error('Error extracting page content:', error);
        throw error;
    }
}

function getMainContent(): string {
    // Try to find main content using various strategies
    const contentSelectors = [
        'main',
        'article',
        '[role="main"]',
        '.content',
        '.post-content',
        '.entry-content',
        '.article-content',
        '#content',
        '.main-content',
        '.page-content'
    ];

    for (const selector of contentSelectors) {
        const element = document.querySelector(selector);
        if (element) {
            return cleanText(element.textContent || '');
        }
    }

    // Fallback: try to get the largest text block
    const allParagraphs = Array.from(document.querySelectorAll('p, div'))
        .map(el => el.textContent?.trim() || '')
        .filter(text => text.length > 50)
        .sort((a, b) => b.length - a.length);

    return allParagraphs.slice(0, 5).join('\n\n');
}

async function getSelectionContext(): Promise<any> {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
        return null;
    }

    const range = selection.getRangeAt(0);
    const selectedText = selection.toString().trim();

    if (!selectedText) {
        return null;
    }

    // Get surrounding context
    const container = range.commonAncestorContainer;
    const parentElement = container.nodeType === Node.TEXT_NODE ? container.parentElement : container as Element;

    let contextBefore = '';
    let contextAfter = '';

    if (parentElement) {
        const fullText = parentElement.textContent || '';
        const selectedIndex = fullText.indexOf(selectedText);

        if (selectedIndex !== -1) {
            contextBefore = fullText.substring(Math.max(0, selectedIndex - 200), selectedIndex);
            contextAfter = fullText.substring(selectedIndex + selectedText.length, selectedIndex + selectedText.length + 200);
        }
    }

    return {
        selectedText,
        contextBefore: contextBefore.trim(),
        contextAfter: contextAfter.trim(),
        parentTag: parentElement?.tagName?.toLowerCase() || '',
        pageTitle: document.title,
        pageUrl: window.location.href
    };
}

async function highlightText(text: string): Promise<boolean> {
    try {
        // Simple text highlighting function
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null
        );

        const textNodes: Text[] = [];
        let node;
        while (node = walker.nextNode()) {
            if (node.textContent?.includes(text)) {
                textNodes.push(node as Text);
            }
        }

        textNodes.forEach(textNode => {
            const parent = textNode.parentNode;
            if (parent && textNode.textContent) {
                const highlightedHTML = textNode.textContent.replace(
                    new RegExp(escapeRegExp(text), 'gi'),
                    `<mark style="background-color: #ffeb3b; padding: 2px 4px; border-radius: 2px;">$&</mark>`
                );

                const wrapper = document.createElement('span');
                wrapper.innerHTML = highlightedHTML;
                parent.replaceChild(wrapper, textNode);
            }
        });

        return textNodes.length > 0;
    } catch (error) {
        console.error('Error highlighting text:', error);
        return false;
    }
}

function cleanText(text: string): string {
    return text
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 3000); // Limit text length
}

function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Optional: Add visual feedback when context menu is used
document.addEventListener('contextmenu', (event) => {
    const target = event.target as Element;

    // Store information about the context menu target
    chrome.storage.local.set({
        lastContextTarget: {
            tagName: target.tagName,
            className: target.className,
            id: target.id,
            href: target.getAttribute('href'),
            textContent: target.textContent?.substring(0, 100) || '',
            timestamp: Date.now()
        }
    });
});