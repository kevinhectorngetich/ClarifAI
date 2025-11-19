import { Language } from '../types/settings';

export interface Translations {
    // Header
    appName: string;
    appDescription: string;

    // Welcome message
    welcomeMessage: string;

    // Chat input
    chatPlaceholder: string;
    chatHint: string;

    // Loading
    thinking: string;

    // Content actions
    summarizeTitle: string;
    keyPointsLabel: string;
    keyPointsDesc: string;
    tldrLabel: string;
    tldrDesc: string;
    teaserLabel: string;
    teaserDesc: string;
    headlineLabel: string;
    headlineDesc: string;
    selectTextHint: string;
    generatingSummary: string;

    // Settings
    settingsTitle: string;
    generalTab: string;
    historyTab: string;
    themeLabel: string;
    lightTheme: string;
    darkTheme: string;
    autoTheme: string;
    languageLabel: string;
    languageHint: string;
    newChatButton: string;
    clearAllButton: string;
    noHistoryTitle: string;
    noHistoryDesc: string;
    messagesCount: string;
    deleteChat: string;

    // Time
    justNow: string;
    minutesAgo: string;
    hoursAgo: string;
    daysAgo: string;

    // Errors
    errorTitle: string;
    permissionNeeded: string;
}

const enTranslations: Translations = {
    appName: 'ClarifAI',
    appDescription: 'AI-powered clarification assistant',
    welcomeMessage: "Hello! I'm ClarifAI. What can I help you with?",
    chatPlaceholder: 'Type your message here...',
    chatHint: 'Press Enter to send, Shift+Enter for new line',
    thinking: 'ClarifAI is thinking...',
    summarizeTitle: '📄 Summarize Current Page',
    keyPointsLabel: 'Key Points',
    keyPointsDesc: 'Main bullet points',
    tldrLabel: 'TL;DR',
    tldrDesc: 'Quick overview',
    teaserLabel: 'Teaser',
    teaserDesc: 'Most interesting parts',
    headlineLabel: 'Headline',
    headlineDesc: 'Main point summary',
    selectTextHint: 'Select text on the page for focused summaries, or get full page summary',
    generatingSummary: 'Generating summary...',
    settingsTitle: 'Settings',
    generalTab: 'General',
    historyTab: 'History',
    themeLabel: 'Theme',
    lightTheme: 'Light',
    darkTheme: 'Dark',
    autoTheme: 'Auto',
    languageLabel: 'Response Language',
    languageHint: 'AI responses will be generated in this language',
    newChatButton: 'New Chat',
    clearAllButton: 'Clear All',
    noHistoryTitle: 'No chat history yet',
    noHistoryDesc: 'Your conversations will appear here',
    messagesCount: 'messages',
    deleteChat: 'Delete chat',
    justNow: 'Just now',
    minutesAgo: 'm ago',
    hoursAgo: 'h ago',
    daysAgo: 'd ago',
    errorTitle: 'Error',
    permissionNeeded: 'Permission needed to access page content',
};

const esTranslations: Translations = {
    appName: 'ClarifAI',
    appDescription: 'Asistente de aclaración con IA',
    welcomeMessage: '¡Hola! Soy ClarifAI. ¿En qué puedo ayudarte?',
    chatPlaceholder: 'Escribe tu mensaje aquí...',
    chatHint: 'Presiona Enter para enviar, Shift+Enter para nueva línea',
    thinking: 'ClarifAI está pensando...',
    summarizeTitle: '📄 Resumir Página Actual',
    keyPointsLabel: 'Puntos Clave',
    keyPointsDesc: 'Puntos principales',
    tldrLabel: 'Resumen',
    tldrDesc: 'Vista rápida',
    teaserLabel: 'Avance',
    teaserDesc: 'Partes más interesantes',
    headlineLabel: 'Titular',
    headlineDesc: 'Resumen del punto principal',
    selectTextHint: 'Selecciona texto en la página para resúmenes enfocados, o obtén un resumen completo',
    generatingSummary: 'Generando resumen...',
    settingsTitle: 'Configuración',
    generalTab: 'General',
    historyTab: 'Historial',
    themeLabel: 'Tema',
    lightTheme: 'Claro',
    darkTheme: 'Oscuro',
    autoTheme: 'Automático',
    languageLabel: 'Idioma de Respuesta',
    languageHint: 'Las respuestas de IA se generarán en este idioma',
    newChatButton: 'Nuevo Chat',
    clearAllButton: 'Borrar Todo',
    noHistoryTitle: 'No hay historial de chat aún',
    noHistoryDesc: 'Tus conversaciones aparecerán aquí',
    messagesCount: 'mensajes',
    deleteChat: 'Eliminar chat',
    justNow: 'Ahora mismo',
    minutesAgo: 'm atrás',
    hoursAgo: 'h atrás',
    daysAgo: 'd atrás',
    errorTitle: 'Error',
    permissionNeeded: 'Se necesita permiso para acceder al contenido de la página',
};

export const translations: Record<Language, Translations> = {
    en: enTranslations,
    es: esTranslations,
    fr: enTranslations, // Can be expanded later
    de: enTranslations,
    it: enTranslations,
    pt: enTranslations,
    ru: enTranslations,
    ja: enTranslations,
    ko: enTranslations,
    zh: enTranslations,
    ar: enTranslations,
    hi: enTranslations,
};

export const getTranslation = (language: Language): Translations => {
    return translations[language] || enTranslations;
};
