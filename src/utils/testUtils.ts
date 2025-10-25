// Test utilities for Chrome Summarizer API

/**
 * Simple test to verify Chrome Summarizer API is working
 */
export const testSummarizerAPI = async (): Promise<{
    success: boolean;
    availability: string;
    testResult?: string;
    error?: string;
}> => {
    try {
        // Check if Summarizer API exists
        if (!window.Summarizer) {
            return {
                success: false,
                availability: 'unavailable',
                error: 'window.Summarizer is not defined'
            };
        }

        // Check availability
        const availability = await window.Summarizer.availability();

        if (availability === 'unavailable') {
            return {
                success: false,
                availability,
                error: 'Summarizer API is unavailable'
            };
        }

        // Test with a simple text
        const testText = 'React is a JavaScript library for building user interfaces. It uses components to create reusable UI elements.';

        // Check user activation (required for create)
        if (!navigator.userActivation?.isActive) {
            return {
                success: false,
                availability,
                error: 'User activation required - try clicking first'
            };
        }

        // Try to create a summarizer
        const summarizer = await window.Summarizer.create({
            type: 'tldr',
            format: 'plain-text',
            length: 'short',
            outputLanguage: 'en-US',
            expectedInputLanguages: ['en-US']
        });

        if (!summarizer) {
            return {
                success: false,
                availability,
                error: 'Failed to create summarizer instance'
            };
        }

        // Test summarization
        const result = await summarizer.summarize(testText);

        // Clean up
        summarizer.destroy();

        return {
            success: true,
            availability,
            testResult: result
        };

    } catch (error) {
        return {
            success: false,
            availability: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};

/**
 * Test if we're in a valid extension context and can access tabs
 */
export const testExtensionContext = async (): Promise<{
    success: boolean;
    details: string;
    tabInfo?: any;
}> => {
    try {
        // Check chrome APIs
        if (!chrome?.runtime?.id) {
            return {
                success: false,
                details: 'Extension not loaded or invalid context'
            };
        }

        // Check tab access
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const activeTab = tabs[0];

        if (!activeTab) {
            return {
                success: false,
                details: 'No active tab found'
            };
        }

        return {
            success: true,
            details: 'Extension context is valid',
            tabInfo: {
                id: activeTab.id,
                url: activeTab.url,
                title: activeTab.title
            }
        };

    } catch (error) {
        return {
            success: false,
            details: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};