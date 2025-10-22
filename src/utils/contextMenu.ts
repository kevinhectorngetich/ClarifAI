// Context menu integration utilities
// Handles communication between context menus and the popup interface

export interface PendingRequest {
    type: 'link' | 'selection' | 'page' | 'image';
    url?: string;
    text?: string;
    pageUrl?: string;
    pageTitle?: string;
    imageUrl?: string;
    timestamp: number;
}

export interface LinkContent {
    title: string;
    description: string;
    content: string;
    url: string;
}

export class ContextMenuHandler {
    private static instance: ContextMenuHandler;

    private constructor() { }

    static getInstance(): ContextMenuHandler {
        if (!ContextMenuHandler.instance) {
            ContextMenuHandler.instance = new ContextMenuHandler();
        }
        return ContextMenuHandler.instance;
    }

    /**
     * Check if there's a pending context menu request
     */
    async getPendingRequest(): Promise<PendingRequest | null> {
        try {
            const response = await chrome.runtime.sendMessage({ type: 'GET_PENDING_REQUEST' });

            // Check if the request is recent (within 30 seconds)
            if (response && response.timestamp) {
                const age = Date.now() - response.timestamp;
                if (age > 30000) { // 30 seconds
                    await this.clearPendingRequest();
                    return null;
                }
            }

            return response;
        } catch (error) {
            console.error('Error getting pending request:', error);
            return null;
        }
    }

    /**
     * Clear the pending context menu request
     */
    async clearPendingRequest(): Promise<void> {
        try {
            await chrome.runtime.sendMessage({ type: 'CLEAR_PENDING_REQUEST' });
        } catch (error) {
            console.error('Error clearing pending request:', error);
        }
    }

    /**
     * Process a context menu request and generate appropriate prompt
     */
    async processRequest(request: PendingRequest): Promise<string> {
        try {
            switch (request.type) {
                case 'link':
                    return await this.processLinkRequest(request);
                case 'selection':
                    return await this.processSelectionRequest(request);
                case 'page':
                    return await this.processPageRequest(request);
                case 'image':
                    return await this.processImageRequest(request);
                default:
                    throw new Error(`Unknown request type: ${request.type}`);
            }
        } catch (error) {
            console.error('Error processing context menu request:', error);
            throw error;
        }
    }

    private async processLinkRequest(request: PendingRequest): Promise<string> {
        if (!request.url) {
            throw new Error('No URL provided for link request');
        }

        try {
            // Fetch content from the linked page
            const response = await chrome.runtime.sendMessage({
                type: 'FETCH_LINK_CONTENT',
                url: request.url
            });

            if (!response.success) {
                throw new Error(response.error || 'Failed to fetch link content');
            }

            // Generate a prompt for explaining the linked content
            const prompt = `Please explain the content from this link: ${request.url}

Content from the linked page:
${response.content}

Please provide a clear and concise explanation of what this page is about, its main points, and why it might be relevant or interesting. Format your response in a friendly, conversational way.`;

            return prompt;
        } catch (error) {
            console.error('Error processing link request:', error);
            // Fallback to basic URL explanation
            return `Please explain what you can about this link: ${request.url}

I wasn't able to fetch the content from this page, but please provide any general information you might know about this URL or domain, and explain what type of content it might contain.`;
        }
    }

    private async processSelectionRequest(request: PendingRequest): Promise<string> {
        if (!request.text) {
            throw new Error('No text provided for selection request');
        }

        // Get additional context from the content script
        let contextInfo = '';
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab?.id) {
                const response = await chrome.tabs.sendMessage(tab.id, {
                    type: 'GET_SELECTION_CONTEXT'
                });

                if (response?.success && response.context) {
                    const { contextBefore, contextAfter, pageTitle, pageUrl } = response.context;
                    contextInfo = `

Context from the page "${pageTitle}" (${pageUrl}):
Before: "${contextBefore}"
After: "${contextAfter}"`;
                }
            }
        } catch (error) {
            console.error('Could not get selection context:', error);
        }

        const prompt = `Please explain this selected text: "${request.text}"${contextInfo}

Please provide a clear explanation of what this text means, including:
1. The main concept or idea
2. Any technical terms or jargon explained in simple language
3. Why this might be important or relevant
4. Additional context if needed

Format your response in a friendly, educational way that's easy to understand.`;

        return prompt;
    }

    private async processPageRequest(request: PendingRequest): Promise<string> {
        try {
            // Get comprehensive page content from content script
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab?.id) {
                throw new Error('No active tab found');
            }

            const response = await chrome.tabs.sendMessage(tab.id, {
                type: 'GET_PAGE_CONTENT'
            });

            if (!response?.success) {
                throw new Error('Failed to get page content');
            }

            const pageContent = response.content;
            const prompt = `Please provide a comprehensive summary of this webpage:

Title: ${pageContent.title}
URL: ${request.pageUrl}
Description: ${pageContent.metaDescription}

Main headings:
${pageContent.headings.map((h: any) => `${h.level.toUpperCase()}: ${h.text}`).join('\n')}

Main content:
${pageContent.mainContent}

Key paragraphs:
${pageContent.paragraphs.slice(0, 3).join('\n\n')}

Please provide:
1. A concise summary of the main topic and key points
2. The primary purpose or goal of this page
3. Important details or insights
4. Who this content might be most relevant for

Format your response as a clear, well-structured summary that captures the essence of the page.`;

            return prompt;
        } catch (error) {
            console.error('Error processing page request:', error);
            // Fallback to basic page summary
            return `Please provide a summary of this webpage: ${request.pageTitle || request.pageUrl}

I wasn't able to extract detailed content from the page, but please provide a summary based on the title and URL, and explain what type of content or information this page likely contains.`;
        }
    }

    private async processImageRequest(request: PendingRequest): Promise<string> {
        if (!request.imageUrl) {
            throw new Error('No image URL provided for image request');
        }

        try {
            // First check if multimodal capabilities are available
            const { checkMultimodalAvailability, describeFallback } = await import('./promptApi');
            const multimodalAvailability = await checkMultimodalAvailability();

            console.log('Multimodal availability for image:', multimodalAvailability);

            // If multimodal is not available, use fallback
            if (multimodalAvailability === 'unavailable') {
                console.log('Multimodal not available, using fallback description');
                return await describeFallback(request.imageUrl, request.pageTitle, request.pageUrl);
            }

            // Try multimodal approach
            try {
                // Fetch the image as a blob and convert to File
                const response = await chrome.runtime.sendMessage({
                    type: 'FETCH_IMAGE',
                    url: request.imageUrl
                });

                if (!response.success) {
                    throw new Error(response.error || 'Failed to fetch image');
                }

                // Import the image description functionality
                const { describeImage } = await import('./promptApi');

                // Convert the blob data to a File object
                const imageBlob = new Blob([new Uint8Array(response.data)], { type: response.mimeType });
                const imageFile = new File([imageBlob], 'context-menu-image', { type: response.mimeType });

                // Describe the image using the Prompt API
                const description = await describeImage(
                    imageFile,
                    `Please provide a detailed description of this image from the webpage "${request.pageTitle || request.pageUrl}". Include what you see, any text content, colors, composition, and context that might be relevant.`,
                    (progress) => console.log(`Image description progress: ${progress}%`)
                );

                return description;
            } catch (multimodalError) {
                console.warn('Multimodal approach failed, falling back to context-based description:', multimodalError);
                return await describeFallback(request.imageUrl, request.pageTitle, request.pageUrl);
            }
        } catch (error) {
            console.error('Error processing image request:', error);
            throw new Error(`Failed to describe image: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Generate a user-friendly message about what action was taken
     */
    getActionMessage(request: PendingRequest): string {
        switch (request.type) {
            case 'link':
                return `Explaining content from: ${request.url}`;
            case 'selection':
                return `Explaining selected text: "${request.text?.substring(0, 50)}${request.text && request.text.length > 50 ? '...' : ''}"`;
            case 'page':
                return `Summarizing page: ${request.pageTitle || request.pageUrl}`;
            case 'image':
                return `Describing image from: ${request.pageTitle || request.pageUrl}`;
            default:
                return 'Processing your request...';
        }
    }
}