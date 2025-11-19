export type Theme = 'light' | 'dark' | 'auto';

export type Language =
    | 'en' // English
    | 'es' // Spanish
    | 'fr' // French
    | 'de' // German
    | 'it' // Italian
    | 'pt' // Portuguese
    | 'ru' // Russian
    | 'ja' // Japanese
    | 'ko' // Korean
    | 'zh' // Chinese
    | 'ar' // Arabic
    | 'hi'; // Hindi

export interface Settings {
    theme: Theme;
    language: Language;
    languageName?: string;
}

export interface ChatHistory {
    id: string;
    title: string;
    messages: Array<{
        id: string;
        content: string;
        role: 'user' | 'assistant';
        timestamp: Date;
    }>;
    createdAt: Date;
    updatedAt: Date;
}

export const LANGUAGE_OPTIONS: Array<{ code: Language; name: string; nativeName: string }> = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
];

export const DEFAULT_SETTINGS: Settings = {
    theme: 'auto',
    language: 'en',
    languageName: 'English',
};
