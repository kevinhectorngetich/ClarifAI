// Simple logger utility that can be disabled in production
// In a Chrome extension, we can determine dev mode by checking if we're in development
const IS_DEVELOPMENT = !('update_url' in chrome.runtime.getManifest());

export const logger = {
    log: (...args: any[]) => {
        if (IS_DEVELOPMENT) {
            console.log(...args);
        }
    },
    warn: (...args: any[]) => {
        if (IS_DEVELOPMENT) {
            console.warn(...args);
        }
    },
    error: (...args: any[]) => {
        // Always log errors, even in production
        console.error(...args);
    },
    debug: (...args: any[]) => {
        if (IS_DEVELOPMENT) {
            console.debug(...args);
        }
    }
};