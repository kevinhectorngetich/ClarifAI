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
            console.log('Processing link request for:', request.url);

            // Fetch content from the linked page
            const response = await chrome.runtime.sendMessage({
                type: 'FETCH_LINK_CONTENT',
                url: request.url
            });

            if (!response.success) {
                console.warn('Direct content fetch failed:', response.error);

                // Provide a more helpful fallback with URL analysis
                return this.generateUrlBasedAnalysis(request.url);
            }

            // Use the Summarizer API directly to generate key points
            const { generateSummary } = await import('./summarizer');

            console.log('Generating key points summary for link:', request.url);

            const summary = await generateSummary(response.content, {
                type: 'key-points',
                format: 'markdown',
                length: 'medium',
                context: `This content is from the link: ${request.url}. Please extract the most important and specific points from this page.`
            });

            return `**Key Points from Link:** ${request.url}\n\n${summary}`;

        } catch (error) {
            console.error('Error processing link request:', error);
            return this.generateUrlBasedAnalysis(request.url);
        }
    }

    /**
     * Generate analysis based on URL patterns and domain knowledge
     */
    private generateUrlBasedAnalysis(url: string): string {
        try {
            const urlObj = new URL(url);
            const domain = urlObj.hostname;
            const path = urlObj.pathname;
            const params = urlObj.searchParams;

            let analysis = `**Link Analysis:** ${url}\n\n`;
            analysis += `I couldn't directly access the content from this link, but I can provide some insights based on the URL:\n\n`;

            // Domain-specific analysis
            if (domain.includes('github.com')) {
                if (path.includes('/issues/')) {
                    const issueNumber = path.split('/issues/')[1]?.split('/')[0];
                    analysis += `📋 **GitHub Issue Analysis:**\n`;
                    analysis += `• This is GitHub issue #${issueNumber}\n`;
                    analysis += `• Repository: ${path.split('/').slice(1, 3).join('/')}\n`;
                    analysis += `• Issues typically contain bug reports, feature requests, or discussions\n`;
                    analysis += `• You can visit the link directly to see the full discussion and comments\n\n`;
                } else if (path.includes('/pull/')) {
                    analysis += `🔄 **GitHub Pull Request**\n`;
                    analysis += `• This appears to be a pull request for code changes\n`;
                } else if (path.includes('/releases')) {
                    analysis += `🚀 **GitHub Release Page**\n`;
                    analysis += `• This shows software releases and changelogs\n`;
                }
            } else if (domain.includes('stackoverflow.com')) {
                analysis += `❓ **Stack Overflow Question**\n`;
                analysis += `• Programming Q&A platform\n`;
                analysis += `• Likely contains technical problem and solutions\n`;
            } else if (domain.includes('medium.com') || domain.includes('dev.to')) {
                analysis += `📝 **Blog Article**\n`;
                analysis += `• Technical blog post or tutorial\n`;
            } else if (domain.includes('wikipedia.org')) {
                analysis += `📚 **Wikipedia Article**\n`;
                analysis += `• Encyclopedia entry with comprehensive information\n`;
            } else if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
                analysis += `🎥 **YouTube Video**\n`;
                analysis += `• Video content - I cannot analyze video content directly\n`;
            }

            analysis += `\n💡 **Suggestions:**\n`;
            analysis += `• Visit the link directly in a new tab for full content\n`;
            analysis += `• Copy and paste specific text from the page into our chat for analysis\n`;
            analysis += `• Try using the page summary feature when you're on the actual page\n\n`;

            analysis += `*Note: This analysis is based on URL patterns. For detailed content analysis, please visit the link or copy the content into our chat.*`;

            return analysis;
        } catch (error) {
            return `I encountered an error while trying to analyze this link: ${url}\n\nPlease try:\n• Opening the link directly\n• Copying content from the page into our chat\n• Using the page summary feature when visiting the page`;
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

            // Prepare content for summarization
            const contentToSummarize = `Title: ${pageContent.title}
Description: ${pageContent.metaDescription}

Main headings:
${pageContent.headings.map((h: any) => `${h.level.toUpperCase()}: ${h.text}`).join('\n')}

Main content:
${pageContent.mainContent}

Key paragraphs:
${pageContent.paragraphs.slice(0, 3).join('\n\n')}`;

            // Use the Summarizer API directly to generate key points
            const { generateSummary } = await import('./summarizer');

            console.log('Generating key points summary for page:', request.pageUrl);

            const summary = await generateSummary(contentToSummarize, {
                type: 'key-points',
                format: 'markdown',
                length: 'medium',
                context: `This is a summary of the webpage: ${request.pageTitle || request.pageUrl}`
            });

            return `**Page Summary:** ${request.pageTitle || request.pageUrl}\n\n${summary}`;

        } catch (error) {
            console.error('Error processing page request:', error);
            // Fallback to basic page summary
            return `I wasn't able to extract detailed content from this page: ${request.pageTitle || request.pageUrl}

This could be due to:
- Dynamic content loading
- Page access restrictions
- Complex page structure

Please try copying and pasting the specific content you'd like analyzed into the chat.`;
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
                return `Extracting key points from: ${request.url}`;
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