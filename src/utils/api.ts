import { Message } from '../types/chat';

// Placeholder function for AI response - will be replaced with Chrome Summarizer API
import { extractPageContent, PageContent } from './contentExtraction';
import { generateFeynmanExplanation, generateSummary, checkSummarizerAvailability } from './summarizer';

// Enhanced AI response with Chrome Summarizer API integration
export const fetchAIResponse = async (
    userMessage: string,
    onProgress?: (progress: number) => void
): Promise<string> => {
    try {
        console.log('Starting AI response generation for:', userMessage);

        // Check if Summarizer API is available
        const availability = await checkSummarizerAvailability();
        console.log('Summarizer availability:', availability);

        if (availability === 'unavailable') {
            return getFallbackResponse(userMessage);
        }

        // Extract current page content for context
        console.log('Extracting page content...');
        const pageContent = await extractPageContent();
        console.log('Page content extracted:', pageContent ? 'Success' : 'Failed');

        if (!pageContent) {
            // Try to get basic tab info at least
            try {
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                const basicContext = `Page Title: ${tab?.title || 'Unknown'}\nURL: ${tab?.url || 'Unknown'}\nUser Question: ${userMessage}`;

                console.log('Using basic tab info as context:', basicContext);

                // Try to answer the question with just the basic context
                return await generateSummary(basicContext, {
                    type: 'tldr',
                    format: 'markdown',
                    length: 'medium',
                    context: `Answer this question: "${userMessage}". If you don't have enough context, provide a general explanation of the concept.`
                }, onProgress);
            } catch (fallbackError) {
                console.error('Fallback generation failed:', fallbackError);
                return getFallbackResponse(userMessage, 'Could not extract content from current page and fallback failed');
            }
        }

        // Determine if user is asking for explanation or clarification
        const isExplanationRequest = /\b(explain|clarify|what|how|why|mean|understand|breakdown|simplify)\b/i.test(userMessage);
        const isProgrammingQuestion = /\b(ref|react|javascript|js|css|html|function|component|hook|useState|useEffect|props|state|mounted|render)\b/i.test(userMessage);

        if (isExplanationRequest || isProgrammingQuestion) {
            // For programming questions, use general context or page content
            let context = pageContent.selectedText || pageContent.text;

            // If it's a programming question and we don't have good page content, provide general context
            if (isProgrammingQuestion && (!context || context.length < 100)) {
                context = `Programming Question: ${userMessage}\nGeneral web development and React context.`;
            }

            const topic = userMessage.replace(/^(explain|clarify|what|how|why|what does|what is|how does)\s*/i, '').trim();

            return await generateFeynmanExplanation(topic, context, onProgress);
        } else {
            // Generate a summary-based response
            const context = `
Page: ${pageContent.title}
URL: ${pageContent.url}
Content: ${pageContent.text}
User Question: ${userMessage}
`;

            return await generateSummary(context, {
                type: 'tldr',
                format: 'markdown',
                length: 'medium',
                context: `Answer the user's question about this webpage content: "${userMessage}"`
            }, onProgress);
        }
    } catch (error) {
        console.error('Error fetching AI response:', error);

        // Provide more specific error information
        let errorDetails = '';
        if (error instanceof Error) {
            errorDetails = error.message;
        }

        return getFallbackResponse(userMessage, errorDetails);
    }
};

// Fallback responses when Summarizer API is not available
const getFallbackResponse = (userMessage: string, errorReason?: string): string => {
    // Try to provide basic explanations for common programming/web concepts
    const lowerMessage = userMessage.toLowerCase();

    // Basic concept explanations
    if (lowerMessage.includes('ecmascript') || lowerMessage.includes('javascript')) {
        return "**ECMAScript** is the standard that JavaScript is based on. Think of it as the rules and specifications that define how JavaScript should work. It's like a blueprint that browsers follow to make JavaScript run consistently everywhere. The most common versions you'll hear about are ES5, ES6/ES2015, and newer versions that add new features to make coding easier and more powerful.";
    }

    if (lowerMessage.includes('html')) {
        return "**HTML** (HyperText Markup Language) is the basic building blocks of web pages. It's like the skeleton of a website - it defines the structure and content like headings, paragraphs, links, and images. Think of it as writing the outline of a document, but for web browsers to understand.";
    }

    if (lowerMessage.includes('css')) {
        return "**CSS** (Cascading Style Sheets) is what makes websites look good. If HTML is the skeleton, CSS is the styling - colors, fonts, layouts, animations. It's like the interior designer for your website, making everything look pretty and organized.";
    }

    if (lowerMessage.includes('react')) {
        return "**React** is a JavaScript library for building user interfaces, especially web applications. It's like having pre-built components (like LEGO blocks) that you can combine to create interactive websites. Instead of writing everything from scratch, React helps you build reusable pieces that update automatically when data changes.";
    }

    if (lowerMessage.includes('api')) {
        return "**API** (Application Programming Interface) is like a waiter in a restaurant. You (the application) tell the waiter (API) what you want, the waiter goes to the kitchen (server/database) to get it, and brings back what you ordered. It's how different software applications talk to each other.";
    }

    // Generic fallback
    const errorInfo = errorReason ? `\n\n**Technical Issue:** ${errorReason}` : '';
    return `I'd love to help explain that concept! Unfortunately, Chrome's AI Summarizer API isn't available right now.\n\n**Your question:** "${userMessage}"${errorInfo}\n\nTry asking me directly about common web development concepts, or check that you're using Chrome 115+ with experimental AI features enabled.`;
};

// Function to summarize selected content from current page
export const summarizeSelectedContent = async (
    summaryType: 'key-points' | 'tldr' | 'teaser' | 'headline' = 'key-points',
    onProgress?: (progress: number) => void
): Promise<string> => {
    try {
        const pageContent = await extractPageContent();

        if (!pageContent) {
            throw new Error('Could not extract content from current page');
        }

        const contentToSummarize = pageContent.selectedText || pageContent.text;

        if (!contentToSummarize.trim()) {
            throw new Error('No content found to summarize');
        }

        return await generateSummary(contentToSummarize, {
            type: summaryType,
            format: 'markdown',
            length: 'medium',
            context: `Summarize this content from ${pageContent.metadata.domain}`
        }, onProgress);
    } catch (error) {
        console.error('Error summarizing content:', error);
        throw error;
    }
};

// Check if the extension has proper permissions
export const checkPermissions = async (): Promise<boolean> => {
    try {
        // Check basic permissions first
        const hasBasicPermissions = await chrome.permissions.contains({
            permissions: ['activeTab', 'scripting', 'storage']
        });

        if (!hasBasicPermissions) {
            console.log('Missing basic permissions');
            return false;
        }

        // Try to get current tab to test activeTab permission
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const hasActiveTab = tabs && tabs.length > 0 && tabs[0].id;

        console.log('Permissions check:', { hasBasicPermissions, hasActiveTab: !!hasActiveTab, tabUrl: tabs[0]?.url });
        return !!hasActiveTab;
    } catch (error) {
        console.error('Error checking permissions:', error);
        return false;
    }
};

// Function to simulate Chrome Summarizer API (placeholder)
export const summarizeContent = async (content: string): Promise<string> => {
    // This will be replaced with actual Chrome Summarizer API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    return `Summary: This is a placeholder summary of the content: "${content.substring(0, 50)}..."`;
};

// Utility function to generate unique message IDs
export const generateMessageId = (): string => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};