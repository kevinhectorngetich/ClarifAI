// Extension environment validation utilities

/**
 * Check if we're running in a proper Chrome extension context
 */
export const validateExtensionContext = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Check if chrome API is available
    if (typeof chrome === 'undefined') {
        errors.push('Chrome extension API not available');
    }

    // Check specific APIs
    if (!chrome?.runtime) {
        errors.push('chrome.runtime not available');
    }

    if (!chrome?.tabs) {
        errors.push('chrome.tabs not available');
    }

    if (!chrome?.scripting) {
        errors.push('chrome.scripting not available');
    }

    if (!chrome?.permissions) {
        errors.push('chrome.permissions not available');
    }

    // Check if we have an extension ID
    if (!chrome?.runtime?.id) {
        errors.push('Extension ID not available - extension may not be loaded');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Log extension environment info for debugging
 */
export const logExtensionInfo = () => {
    const validation = validateExtensionContext();

    console.log('=== Extension Environment Info ===');
    console.log('Extension ID:', chrome?.runtime?.id || 'Not available');
    console.log('User Agent:', navigator.userAgent);
    console.log('Is valid context:', validation.isValid);

    if (!validation.isValid) {
        console.error('Extension context errors:', validation.errors);
    }

    // Test basic permissions
    chrome?.permissions?.getAll?.((permissions) => {
        console.log('Current permissions:', permissions);
    });

    console.log('=== End Extension Info ===');
};

/**
 * Test if we can access the active tab
 */
export const testTabAccess = async (): Promise<{ success: boolean; error?: string; tab?: any }> => {
    try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });

        if (!tabs || tabs.length === 0) {
            return { success: false, error: 'No active tab found' };
        }

        const tab = tabs[0];

        if (!tab.id) {
            return { success: false, error: 'Active tab has no ID' };
        }

        if (!tab.url) {
            return { success: false, error: 'Active tab has no URL' };
        }

        // Check if URL is accessible
        const restrictedPrefixes = ['chrome://', 'chrome-extension://', 'edge://', 'about:', 'moz-extension://'];
        const isRestricted = restrictedPrefixes.some(prefix => tab.url!.startsWith(prefix));

        if (isRestricted) {
            return {
                success: false,
                error: `Cannot access ${tab.url} - restricted page type`,
                tab: { id: tab.id, url: tab.url, title: tab.title }
            };
        }

        return {
            success: true,
            tab: { id: tab.id, url: tab.url, title: tab.title }
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error accessing tab'
        };
    }
};