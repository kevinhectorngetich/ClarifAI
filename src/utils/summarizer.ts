// Chrome Summarizer API integration

export interface SummarizerOptions {
    sharedContext?: string;
    type?: 'key-points' | 'tldr' | 'teaser' | 'headline';
    format?: 'markdown' | 'plain-text';
    length?: 'short' | 'medium' | 'long';
    language?: 'en-US' | 'es-ES' | 'ja-JP';
    outputLanguage?: 'en-US' | 'es-ES' | 'ja-JP'; // Chrome API expects this property with locale
    expectedInputLanguages?: string[]; // From MDN docs
}

export interface SummarizerInstance {
    summarize: (text: string, options?: { context?: string }) => Promise<string>;
    destroy: () => void;
}

declare global {
    interface Window {
        Summarizer?: {
            availability: () => Promise<'available' | 'unavailable' | 'downloadable'>;
            create: (options?: {
                sharedContext?: string;
                type?: 'key-points' | 'tldr' | 'teaser' | 'headline';
                format?: 'markdown' | 'plain-text';
                length?: 'short' | 'medium' | 'long';
                language?: 'en-US' | 'es-ES' | 'ja-JP';
                outputLanguage?: 'en-US' | 'es-ES' | 'ja-JP';
                expectedInputLanguages?: string[];
                monitor?: (monitor: EventTarget) => void;
            }) => Promise<SummarizerInstance>;
        };
    }
}

/**
 * Check if the Chrome Summarizer API is available
 */
export const checkSummarizerAvailability = async (): Promise<'available' | 'unavailable' | 'downloadable'> => {
    try {
        if (!window.Summarizer) {
            return 'unavailable';
        }

        return await window.Summarizer.availability();
    } catch (error) {
        console.error('Error checking summarizer availability:', error);
        return 'unavailable';
    }
};

/**
 * Create a Chrome Summarizer instance
 */
export const createSummarizer = async (
    options: SummarizerOptions = {},
    onProgress?: (progress: number) => void
): Promise<SummarizerInstance | null> => {
    try {
        if (!window.Summarizer) {
            throw new Error('Summarizer API not available');
        }

        const availability = await checkSummarizerAvailability();

        if (availability === 'unavailable') {
            throw new Error('Summarizer API is unavailable');
        }

        // Check for user activation before creating the summarizer
        // Note: Context menu actions may not always have user activation, so we'll try anyway
        if (!navigator.userActivation?.isActive) {
            console.warn('User activation not detected, attempting to create summarizer anyway');
        }

        const summarizerOptions: SummarizerOptions & { monitor?: (monitor: EventTarget) => void } = {
            type: 'key-points',
            format: 'markdown',
            length: 'medium',
            language: 'en-US', // Default to US English
            outputLanguage: 'en-US', // Chrome API requires this for output language
            ...options
        };        // Add progress monitoring if callback provided
        if (onProgress) {
            summarizerOptions.monitor = (monitor: EventTarget) => {
                monitor.addEventListener('downloadprogress', (e: Event) => {
                    const progressEvent = e as any;
                    if (progressEvent.loaded !== undefined) {
                        onProgress(progressEvent.loaded * 100);
                    }
                });
            };
        }

        console.log('Attempting to create summarizer with options:', summarizerOptions);
        const summarizer = await window.Summarizer.create({
            type: summarizerOptions.type || 'key-points',
            format: summarizerOptions.format || 'markdown',
            length: summarizerOptions.length || 'medium',
            outputLanguage: summarizerOptions.outputLanguage || 'en-US',
            expectedInputLanguages: summarizerOptions.expectedInputLanguages || ['en-US'],
            monitor: summarizerOptions.monitor
        } as any);
        console.log('Summarizer created successfully');
        return summarizer;
    } catch (error) {
        console.error('Error creating summarizer:', error);

        // Try with minimal options as fallback
        if (window.Summarizer) {
            try {
                console.log('Trying to create summarizer with minimal options');
                const fallbackSummarizer = await window.Summarizer.create({
                    type: 'key-points',
                    format: 'plain-text',
                    length: 'short',
                    outputLanguage: 'en-US',
                    expectedInputLanguages: ['en-US']
                } as any);
                console.log('Fallback summarizer created successfully');
                return fallbackSummarizer;
            } catch (fallbackError) {
                console.error('Fallback summarizer creation also failed:', fallbackError);
            }
        }
        return null;
    }
};

/**
 * Generate a summary using the Chrome Summarizer API
 */
export const generateSummary = async (
    text: string,
    options: SummarizerOptions & { context?: string } = {},
    onProgress?: (progress: number) => void
): Promise<string> => {
    try {
        console.log('Creating summarizer with options:', { ...options, outputLanguage: options.outputLanguage || 'en-US' });

        const summarizer = await createSummarizer({
            language: 'en-US',
            outputLanguage: 'en-US',
            ...options
        }, onProgress);

        if (!summarizer) {
            throw new Error('Failed to create summarizer - Chrome AI may not be available');
        }

        console.log('Generating summary for text length:', text.length);
        const summary = await summarizer.summarize(text, {
            context: options.context
        });

        console.log('Summary generated successfully:', summary.length, 'characters');

        // Clean up the summarizer
        summarizer.destroy();

        return summary;
    } catch (error) {
        console.error('Error generating summary:', error);
        if (error instanceof Error) {
            throw new Error(`Summary generation failed: ${error.message}`);
        }
        throw error;
    }
};

/**
 * Generate explanation using Feynman Technique approach
 */
export const generateFeynmanExplanation = async (
    topic: string,
    context: string,
    onProgress?: (progress: number) => void
): Promise<string> => {
    try {
        console.log('Generating Feynman explanation for topic:', topic);
        console.log('Using context length:', context.length);

        // For programming questions, create a direct explanation context
        const isProgrammingTopic = /\b(ref|react|javascript|js|css|html|function|component|hook|useState|useEffect|props|state|mounted|render|api|code|programming)\b/i.test(topic);

        let explanationContext;
        if (isProgrammingTopic && context.length < 200) {
            // For programming questions with minimal context, provide a comprehensive explanation request
            explanationContext = `
Topic to explain: ${topic}

Instructions: Provide a comprehensive explanation of this programming concept:
1. What it is and its purpose
2. How it works in simple terms
3. Common use cases and examples
4. Best practices
5. Common misconceptions or pitfalls

Use markdown formatting and make it beginner-friendly but thorough.
`;
        } else {
            // Use the context-rich approach for other topics
            explanationContext = `
Context: ${context}

Topic to explain: ${topic}

Instructions: Explain this topic using clear, simple language:
1. What it means in simple terms
2. Why it's important or useful  
3. Provide concrete examples
4. Break down any complex parts
5. Use analogies where helpful

Make it engaging and easy to understand.
`;
        }

        const explanation = await generateSummary(explanationContext, {
            type: 'tldr',
            format: 'markdown',
            length: 'long',
            context: 'This should be an educational explanation using simple terms and examples'
        }, onProgress);

        return explanation;
    } catch (error) {
        console.error('Error generating Feynman explanation:', error);
        throw error;
    }
};