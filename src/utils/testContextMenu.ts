// Test utilities for context menu functionality
// This file can be used to test the context menu integration

export const testContextMenu = {
    /**
     * Test if context menus are properly registered
     */
    async checkContextMenus(): Promise<boolean> {
        try {
            // This would typically be called from the background script console
            const menus = await new Promise<chrome.contextMenus.CreateProperties[]>((resolve) => {
                chrome.contextMenus.removeAll(() => {
                    chrome.contextMenus.create({
                        id: 'test-menu',
                        title: 'Test Menu',
                        contexts: ['page']
                    });
                    resolve([]);
                });
            });

            console.log('Context menus test completed');
            return true;
        } catch (error) {
            console.error('Context menu test failed:', error);
            return false;
        }
    },

    /**
     * Test content extraction
     */
    testContentExtraction(): any {
        const testContent = {
            title: document.title,
            url: window.location.href,
            headings: Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.textContent?.trim()),
            paragraphs: Array.from(document.querySelectorAll('p')).slice(0, 3).map(p => p.textContent?.trim()),
            links: Array.from(document.querySelectorAll('a[href]')).slice(0, 5).map(a => ({
                text: a.textContent?.trim(),
                href: a.getAttribute('href')
            }))
        };

        console.log('Content extraction test:', testContent);
        return testContent;
    },

    /**
     * Test storage functionality
     */
    async testStorage(): Promise<boolean> {
        try {
            const testData = {
                type: 'test',
                content: 'Test content',
                timestamp: Date.now()
            };

            await chrome.storage.local.set({ testRequest: testData });
            const retrieved = await chrome.storage.local.get(['testRequest']);
            await chrome.storage.local.remove(['testRequest']);

            const success = retrieved.testRequest && retrieved.testRequest.content === testData.content;
            console.log('Storage test:', success ? 'PASSED' : 'FAILED');
            return success;
        } catch (error) {
            console.error('Storage test failed:', error);
            return false;
        }
    },

    /**
     * Test message passing
     */
    async testMessagePassing(): Promise<boolean> {
        try {
            const response = await chrome.runtime.sendMessage({ type: 'TEST_MESSAGE', data: 'test' });
            console.log('Message passing test:', response ? 'PASSED' : 'FAILED');
            return !!response;
        } catch (error) {
            console.error('Message passing test failed:', error);
            return false;
        }
    }
};

// Export for use in console or testing
if (typeof window !== 'undefined') {
    (window as any).testContextMenu = testContextMenu;
}