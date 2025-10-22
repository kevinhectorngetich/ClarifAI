// Chrome Prompt API integration for multimodal capabilities

export interface PromptApiOptions {
    temperature?: number;
    topK?: number;
    initialPrompts?: Array<{
        role: 'system' | 'user' | 'assistant';
        content: string | Array<{
            type: 'text' | 'image' | 'audio';
            value?: string | File;
        }>;
        prefix?: boolean;
    }>;
    expectedInputs?: Array<{
        type: 'text' | 'image' | 'audio';
        languages?: string[];
    }>;
    expectedOutputs?: Array<{
        type: 'text';
        languages?: string[];
    }>;
}

export interface PromptSession {
    prompt: (input: string | Array<{
        role: 'user' | 'assistant';
        content: string | Array<{
            type: 'text' | 'image' | 'audio';
            value?: string | File;
        }>;
        prefix?: boolean;
    }>) => Promise<string>;
    promptStreaming: (input: string) => ReadableStream;
    append: (messages: Array<{
        role: 'user' | 'assistant';
        content: string | Array<{
            type: 'text' | 'image' | 'audio';
            value?: string | File;
        }>;
    }>) => Promise<void>;
    destroy: () => void;
}

declare global {
    interface Window {
        LanguageModel?: {
            availability: (options?: PromptApiOptions) => Promise<'available' | 'unavailable' | 'downloadable' | 'downloading'>;
            create: (options?: PromptApiOptions & {
                signal?: AbortSignal;
                monitor?: (monitor: EventTarget) => void;
            }) => Promise<PromptSession>;
            params: () => Promise<{
                defaultTopK: number;
                maxTopK: number;
                defaultTemperature: number;
                maxTemperature: number;
            }>;
        };
    }
}

/**
 * Check if the Chrome Prompt API is available
 */
export const checkPromptApiAvailability = async (options?: PromptApiOptions): Promise<'available' | 'unavailable' | 'downloadable' | 'downloading'> => {
    try {
        if (!window.LanguageModel) {
            console.log('LanguageModel not found in window object');
            return 'unavailable';
        }

        console.log('Checking Prompt API availability with options:', options);
        const result = await window.LanguageModel.availability(options);
        console.log('Prompt API availability result:', result);
        return result;
    } catch (error) {
        console.error('Error checking Prompt API availability:', error);
        return 'unavailable';
    }
};

/**
 * Check specifically if multimodal (image) capabilities are available
 */
export const checkMultimodalAvailability = async (): Promise<'available' | 'unavailable' | 'downloadable' | 'downloading'> => {
    try {
        if (!window.LanguageModel) {
            return 'unavailable';
        }

        // Test specifically for image input capabilities
        const multimodalOptions = {
            expectedInputs: [{ type: 'image' as const }, { type: 'text' as const }],
            expectedOutputs: [{ type: 'text' as const, languages: ['en'] }]
        };

        console.log('Checking multimodal availability...');
        const result = await window.LanguageModel.availability(multimodalOptions);
        console.log('Multimodal availability result:', result);
        return result;
    } catch (error) {
        console.error('Error checking multimodal availability:', error);
        return 'unavailable';
    }
};

/**
 * Get Prompt API model parameters
 */
export const getPromptApiParams = async () => {
    try {
        if (!window.LanguageModel) {
            throw new Error('Prompt API not available');
        }

        return await window.LanguageModel.params();
    } catch (error) {
        console.error('Error getting Prompt API params:', error);
        throw error;
    }
};

/**
 * Create a Chrome Prompt API session
 */
export const createPromptSession = async (
    options: PromptApiOptions = {},
    onProgress?: (progress: number) => void,
    signal?: AbortSignal
): Promise<PromptSession | null> => {
    try {
        if (!window.LanguageModel) {
            throw new Error('Prompt API not available');
        }

        const availability = await checkPromptApiAvailability(options);

        if (availability === 'unavailable') {
            throw new Error('Prompt API is unavailable');
        }

        // Check for user activation before creating the session
        if (!navigator.userActivation?.isActive) {
            console.warn('User activation not detected, attempting to create session anyway');
        }

        // Get default parameters if not provided
        const params = await getPromptApiParams();

        const sessionOptions: PromptApiOptions & {
            signal?: AbortSignal;
            monitor?: (monitor: EventTarget) => void;
        } = {
            temperature: options.temperature || params.defaultTemperature,
            topK: options.topK || params.defaultTopK,
            expectedInputs: options.expectedInputs || [{ type: 'text' }],
            expectedOutputs: options.expectedOutputs || [{ type: 'text' }],
            ...options,
            signal
        };

        // Add progress monitoring if callback provided
        if (onProgress) {
            sessionOptions.monitor = (monitor: EventTarget) => {
                monitor.addEventListener('downloadprogress', (e: Event) => {
                    const progressEvent = e as any;
                    if (progressEvent.loaded !== undefined) {
                        onProgress(progressEvent.loaded * 100);
                    }
                });
            };
        }

        console.log('Attempting to create Prompt API session with options:', sessionOptions);
        const session = await window.LanguageModel.create(sessionOptions);
        console.log('Prompt API session created successfully');
        return session;
    } catch (error) {
        console.error('Error creating Prompt API session:', error);
        return null;
    }
};

/**
 * Describe an image using the Chrome Prompt API
 */
export const describeImage = async (
    imageFile: File,
    customPrompt?: string,
    onProgress?: (progress: number) => void
): Promise<string> => {
    try {
        console.log('Starting image description for file:', imageFile.name, 'size:', imageFile.size);

        // First check if multimodal capabilities are available
        const multimodalAvailability = await checkMultimodalAvailability();
        console.log('Multimodal availability check:', multimodalAvailability);

        if (multimodalAvailability === 'unavailable') {
            throw new Error('Chrome Prompt API with image support is not available. This feature requires Chrome with experimental AI features enabled or Chrome Canary/Dev channel.');
        }

        if (multimodalAvailability === 'downloading') {
            console.log('Model is currently downloading, this may take some time...');
        }

        // Create session with image input capabilities
        const sessionOptions = {
            initialPrompts: [
                {
                    role: 'system' as const,
                    content: 'You are a helpful assistant that provides detailed, accurate descriptions of images. Focus on the main elements, colors, composition, and any text or important details visible in the image.'
                }
            ],
            expectedInputs: [{ type: 'image' as const }, { type: 'text' as const }],
            expectedOutputs: [{ type: 'text' as const, languages: ['en'] }]
        };

        console.log('Creating session with options:', sessionOptions);
        const session = await createPromptSession(sessionOptions, onProgress);

        if (!session) {
            throw new Error('Failed to create Prompt API session for image description');
        }

        const prompt = customPrompt || 'Please describe this image in detail, including what you see, the setting, colors, and any notable elements or text.';

        console.log('Sending image description request with prompt:', prompt);
        const description = await session.prompt([
            {
                role: 'user' as const,
                content: [
                    { type: 'text' as const, value: prompt },
                    { type: 'image' as const, value: imageFile }
                ]
            }
        ]);

        console.log('Image description generated successfully:', description.length, 'characters');

        // Clean up the session
        session.destroy();

        return description;
    } catch (error) {
        console.error('Error describing image:', error);

        // Provide more specific error messages
        if (error instanceof Error) {
            if (error.message.includes('NotSupportedError') || error.message.includes('not supported')) {
                throw new Error(`Multimodal image description is not supported in this Chrome version. Please use Chrome Canary/Dev with experimental features enabled, or wait for this feature to be available in Chrome Stable.`);
            }
            if (error.message.includes('quota') || error.message.includes('rate limit')) {
                throw new Error(`Rate limit reached for AI features. Please wait a moment and try again.`);
            }
            throw new Error(`Image description failed: ${error.message}`);
        }
        throw error;
    }
};

/**
 * Provide a fallback text-based description when multimodal isn't available
 */
export const describeFallback = async (
    imageUrl: string,
    pageTitle?: string,
    pageUrl?: string
): Promise<string> => {
    try {
        console.log('Using fallback description for image:', imageUrl);

        // Check if basic text-only Prompt API is available
        const textAvailability = await checkPromptApiAvailability({
            expectedInputs: [{ type: 'text' }],
            expectedOutputs: [{ type: 'text', languages: ['en'] }]
        });

        if (textAvailability === 'unavailable') {
            throw new Error('Chrome Prompt API is not available');
        }

        const session = await createPromptSession({
            expectedInputs: [{ type: 'text' }],
            expectedOutputs: [{ type: 'text', languages: ['en'] }]
        });

        if (!session) {
            throw new Error('Failed to create text-only Prompt API session');
        }

        // Extract information from the image URL and context
        const imageExtension = imageUrl.split('.').pop()?.toLowerCase() || 'unknown';
        const imageName = imageUrl.split('/').pop() || 'image';
        const domain = pageUrl ? new URL(pageUrl).hostname : 'unknown site';

        const prompt = `I found an image on a webpage but cannot directly analyze it. Here's what I know:

Image URL: ${imageUrl}
Image file: ${imageName}
File type: ${imageExtension}
Source page: ${pageTitle || 'Unknown page'}
Website: ${domain}

Based on this context and the source website, please provide:
1. What this image might contain based on the page context
2. The likely purpose of this image on this type of website
3. General characteristics common to images in this context
4. Suggestions for what the user might want to know about this image

Please be helpful while acknowledging that I cannot directly see the image content.`;

        const description = await session.prompt(prompt);
        session.destroy();

        return `**Image Analysis (Context-based)**\n\n${description}\n\n*Note: This description is based on context clues since direct image analysis requires Chrome with experimental AI features enabled.*`;

    } catch (error) {
        console.error('Error in fallback description:', error);
        throw new Error(`Fallback description failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

/**
 * Generate alt text for an image
 */
export const generateAltText = async (
    imageFile: File,
    onProgress?: (progress: number) => void
): Promise<string> => {
    try {
        console.log('Generating alt text for image:', imageFile.name);

        const session = await createPromptSession({
            initialPrompts: [
                {
                    role: 'system',
                    content: 'You are an accessibility expert. Generate concise, descriptive alt text for images that would be helpful for screen readers. Focus on the essential visual information in 1-2 sentences.'
                }
            ],
            expectedInputs: [{ type: 'image' }],
            expectedOutputs: [{ type: 'text', languages: ['en'] }]
        }, onProgress);

        if (!session) {
            throw new Error('Failed to create Prompt API session for alt text generation');
        }

        const altText = await session.prompt([
            {
                role: 'user',
                content: [
                    {
                        type: 'text',
                        value: 'Generate concise alt text for this image suitable for screen readers. Keep it brief but descriptive.'
                    },
                    { type: 'image', value: imageFile }
                ]
            }
        ]);

        console.log('Alt text generated successfully');

        // Clean up the session
        session.destroy();

        return altText;
    } catch (error) {
        console.error('Error generating alt text:', error);
        if (error instanceof Error) {
            throw new Error(`Alt text generation failed: ${error.message}`);
        }
        throw error;
    }
};

/**
 * Analyze multiple images for patterns or comparisons
 */
export const analyzeMultipleImages = async (
    images: File[],
    analysisPrompt: string,
    onProgress?: (progress: number) => void
): Promise<string> => {
    try {
        console.log('Analyzing multiple images:', images.length);

        const session = await createPromptSession({
            initialPrompts: [
                {
                    role: 'system',
                    content: 'You are a skilled analyst who correlates patterns across multiple images. Provide detailed analysis comparing and contrasting the images.'
                }
            ],
            expectedInputs: [{ type: 'image' }, { type: 'text' }],
            expectedOutputs: [{ type: 'text', languages: ['en'] }]
        }, onProgress);

        if (!session) {
            throw new Error('Failed to create Prompt API session for multi-image analysis');
        }

        // Append each image to the session
        for (let i = 0; i < images.length; i++) {
            await session.append([
                {
                    role: 'user',
                    content: [
                        { type: 'text', value: `Image ${i + 1} of ${images.length}:` },
                        { type: 'image', value: images[i] }
                    ]
                }
            ]);
        }

        // Now ask for analysis
        const analysis = await session.prompt(analysisPrompt);

        console.log('Multi-image analysis completed');

        // Clean up the session
        session.destroy();

        return analysis;
    } catch (error) {
        console.error('Error analyzing multiple images:', error);
        if (error instanceof Error) {
            throw new Error(`Multi-image analysis failed: ${error.message}`);
        }
        throw error;
    }
};