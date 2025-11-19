import { Settings, DEFAULT_SETTINGS, ChatHistory } from '../types/settings';
import { Message } from '../types/chat';

const STORAGE_KEYS = {
    SETTINGS: 'clarifai_settings',
    CHAT_HISTORY: 'clarifai_chat_history',
    CURRENT_CHAT: 'clarifai_current_chat',
} as const;

// Settings operations
export const getSettings = async (): Promise<Settings> => {
    try {
        const result = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
        return result[STORAGE_KEYS.SETTINGS] || DEFAULT_SETTINGS;
    } catch (error) {
        console.error('Error loading settings:', error);
        return DEFAULT_SETTINGS;
    }
};

export const saveSettings = async (settings: Settings): Promise<void> => {
    try {
        await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: settings });
        console.log('Settings saved:', settings);
    } catch (error) {
        console.error('Error saving settings:', error);
        throw error;
    }
};

// Chat history operations
export const getChatHistory = async (): Promise<ChatHistory[]> => {
    try {
        const result = await chrome.storage.local.get(STORAGE_KEYS.CHAT_HISTORY);
        const history = result[STORAGE_KEYS.CHAT_HISTORY] || [];

        // Convert date strings back to Date objects
        return history.map((chat: any) => ({
            ...chat,
            createdAt: new Date(chat.createdAt),
            updatedAt: new Date(chat.updatedAt),
            messages: chat.messages.map((msg: any) => ({
                ...msg,
                timestamp: new Date(msg.timestamp),
            })),
        }));
    } catch (error) {
        console.error('Error loading chat history:', error);
        return [];
    }
};

export const saveChatHistory = async (history: ChatHistory[]): Promise<void> => {
    try {
        await chrome.storage.local.set({ [STORAGE_KEYS.CHAT_HISTORY]: history });
        console.log('Chat history saved:', history.length, 'chats');
    } catch (error) {
        console.error('Error saving chat history:', error);
        throw error;
    }
};

export const saveCurrentChat = async (messages: Message[]): Promise<string> => {
    try {
        const history = await getChatHistory();

        // Get or create current chat ID
        const currentChatResult = await chrome.storage.local.get(STORAGE_KEYS.CURRENT_CHAT);
        let currentChatId = currentChatResult[STORAGE_KEYS.CURRENT_CHAT];

        if (!currentChatId) {
            currentChatId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await chrome.storage.local.set({ [STORAGE_KEYS.CURRENT_CHAT]: currentChatId });
        }

        // Generate a title from the first meaningful AI response (skip the welcome message)
        const assistantMessages = messages.filter(m => m.role === 'assistant' && m.content.length > 10);

        // Skip the first welcome message and use the second AI response if available
        const meaningfulMessage = assistantMessages.length > 1 ? assistantMessages[1] : assistantMessages[0];
        let title = 'New Chat';

        if (meaningfulMessage) {
            // Check if it's the welcome message
            const isWelcomeMessage = meaningfulMessage.content.includes("Hello! I'm ClarifAI");

            if (!isWelcomeMessage) {
                // Try to extract title from markdown headers or first line
                const content = meaningfulMessage.content;

                // Check for patterns like "TEASER Summary:", "TL;DR Summary:", etc.
                const summaryMatch = content.match(/^\*\*([^*]+)\*\*/);
                if (summaryMatch) {
                    title = summaryMatch[1].trim();
                } else {
                    // Extract first meaningful line (skip markdown symbols)
                    const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                    const firstLine = lines[0]?.replace(/^[#*\-_]+\s*/, '').trim();

                    if (firstLine && firstLine.length > 5) {
                        title = firstLine.slice(0, 60) + (firstLine.length > 60 ? '...' : '');
                    } else if (lines[1]) {
                        // Try second line if first is too short
                        title = lines[1].replace(/^[#*\-_]+\s*/, '').trim().slice(0, 60);
                        if (title.length > 60) title += '...';
                    }
                }
            }
        }

        // Find existing chat or create new one
        const existingChatIndex = history.findIndex(chat => chat.id === currentChatId);
        const now = new Date();

        const chatData: ChatHistory = {
            id: currentChatId,
            title,
            messages: messages.map(msg => ({
                ...msg,
                timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp)
            })),
            createdAt: existingChatIndex >= 0
                ? (history[existingChatIndex].createdAt instanceof Date
                    ? history[existingChatIndex].createdAt
                    : new Date(history[existingChatIndex].createdAt))
                : now,
            updatedAt: now,
        };

        if (existingChatIndex >= 0) {
            history[existingChatIndex] = chatData;
        } else {
            history.unshift(chatData); // Add to beginning
        }

        // Keep only last 50 chats
        const limitedHistory = history.slice(0, 50);
        await saveChatHistory(limitedHistory);

        return currentChatId;
    } catch (error) {
        console.error('Error saving current chat:', error);
        throw error;
    }
};

export const loadChatById = async (chatId: string): Promise<Message[] | null> => {
    try {
        const history = await getChatHistory();
        const chat = history.find(c => c.id === chatId);
        return chat ? chat.messages : null;
    } catch (error) {
        console.error('Error loading chat:', error);
        return null;
    }
};

export const deleteChatById = async (chatId: string): Promise<void> => {
    try {
        const history = await getChatHistory();
        const filtered = history.filter(chat => chat.id !== chatId);
        await saveChatHistory(filtered);

        // If deleted chat was current, clear current chat ID
        const currentChatResult = await chrome.storage.local.get(STORAGE_KEYS.CURRENT_CHAT);
        if (currentChatResult[STORAGE_KEYS.CURRENT_CHAT] === chatId) {
            await chrome.storage.local.remove(STORAGE_KEYS.CURRENT_CHAT);
        }
    } catch (error) {
        console.error('Error deleting chat:', error);
        throw error;
    }
};

export const startNewChat = async (): Promise<void> => {
    try {
        await chrome.storage.local.remove(STORAGE_KEYS.CURRENT_CHAT);
        console.log('Started new chat');
    } catch (error) {
        console.error('Error starting new chat:', error);
        throw error;
    }
};

export const clearAllHistory = async (): Promise<void> => {
    try {
        await chrome.storage.local.remove([STORAGE_KEYS.CHAT_HISTORY, STORAGE_KEYS.CURRENT_CHAT]);
        console.log('All chat history cleared');
    } catch (error) {
        console.error('Error clearing history:', error);
        throw error;
    }
};
