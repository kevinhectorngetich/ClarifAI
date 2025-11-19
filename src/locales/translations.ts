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
    avatarLabel: string;
    avatarHint: string;
    manAvatar: string;
    womanAvatar: string;
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
    avatarLabel: 'Your Avatar',
    avatarHint: 'Choose how you appear in chats',
    manAvatar: 'Man',
    womanAvatar: 'Woman',
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
    avatarLabel: 'Tu Avatar',
    avatarHint: 'Elige cómo apareces en los chats',
    manAvatar: 'Hombre',
    womanAvatar: 'Mujer',
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

const frTranslations: Translations = {
    appName: 'ClarifAI',
    appDescription: 'Assistant de clarification IA',
    welcomeMessage: 'Bonjour! Je suis ClarifAI. Comment puis-je vous aider?',
    chatPlaceholder: 'Tapez votre message ici...',
    chatHint: 'Appuyez sur Entrée pour envoyer, Shift+Entrée pour une nouvelle ligne',
    thinking: 'ClarifAI réfléchit...',
    summarizeTitle: '📄 Résumer la Page Actuelle',
    keyPointsLabel: 'Points Clés',
    keyPointsDesc: 'Points principaux',
    tldrLabel: 'Résumé',
    tldrDesc: 'Aperçu rapide',
    teaserLabel: 'Teaser',
    teaserDesc: 'Parties les plus intéressantes',
    headlineLabel: 'Titre',
    headlineDesc: 'Résumé du point principal',
    selectTextHint: 'Sélectionnez du texte sur la page pour des résumés ciblés, ou obtenez un résumé complet',
    generatingSummary: 'Génération du résumé...',
    settingsTitle: 'Paramètres',
    generalTab: 'Général',
    historyTab: 'Historique',
    themeLabel: 'Thème',
    lightTheme: 'Clair',
    darkTheme: 'Sombre',
    autoTheme: 'Auto',
    languageLabel: 'Langue de Réponse',
    languageHint: 'Les réponses de l\'IA seront générées dans cette langue',
    avatarLabel: 'Votre Avatar',
    avatarHint: 'Choisissez comment vous apparaissez dans les discussions',
    manAvatar: 'Homme',
    womanAvatar: 'Femme',
    newChatButton: 'Nouveau Chat',
    clearAllButton: 'Tout Effacer',
    noHistoryTitle: 'Pas encore d\'historique',
    noHistoryDesc: 'Vos conversations apparaîtront ici',
    messagesCount: 'messages',
    deleteChat: 'Supprimer le chat',
    justNow: 'À l\'instant',
    minutesAgo: 'm',
    hoursAgo: 'h',
    daysAgo: 'j',
    errorTitle: 'Erreur',
    permissionNeeded: 'Permission nécessaire pour accéder au contenu de la page',
};

const deTranslations: Translations = {
    appName: 'ClarifAI',
    appDescription: 'KI-gestützter Klärungsassistent',
    welcomeMessage: 'Hallo! Ich bin ClarifAI. Wie kann ich helfen?',
    chatPlaceholder: 'Geben Sie Ihre Nachricht hier ein...',
    chatHint: 'Enter zum Senden, Shift+Enter für neue Zeile',
    thinking: 'ClarifAI denkt nach...',
    summarizeTitle: '📄 Aktuelle Seite Zusammenfassen',
    keyPointsLabel: 'Hauptpunkte',
    keyPointsDesc: 'Wichtigste Punkte',
    tldrLabel: 'Zusammenfassung',
    tldrDesc: 'Schneller Überblick',
    teaserLabel: 'Teaser',
    teaserDesc: 'Interessanteste Teile',
    headlineLabel: 'Überschrift',
    headlineDesc: 'Hauptpunkt-Zusammenfassung',
    selectTextHint: 'Wählen Sie Text auf der Seite für fokussierte Zusammenfassungen oder erhalten Sie eine vollständige Zusammenfassung',
    generatingSummary: 'Erstelle Zusammenfassung...',
    settingsTitle: 'Einstellungen',
    generalTab: 'Allgemein',
    historyTab: 'Verlauf',
    themeLabel: 'Design',
    lightTheme: 'Hell',
    darkTheme: 'Dunkel',
    autoTheme: 'Auto',
    languageLabel: 'Antwortsprache',
    languageHint: 'KI-Antworten werden in dieser Sprache generiert',
    avatarLabel: 'Ihr Avatar',
    avatarHint: 'Wählen Sie, wie Sie in Chats erscheinen',
    manAvatar: 'Mann',
    womanAvatar: 'Frau',
    newChatButton: 'Neuer Chat',
    clearAllButton: 'Alles Löschen',
    noHistoryTitle: 'Noch kein Chat-Verlauf',
    noHistoryDesc: 'Ihre Gespräche werden hier angezeigt',
    messagesCount: 'Nachrichten',
    deleteChat: 'Chat löschen',
    justNow: 'Gerade eben',
    minutesAgo: 'Min',
    hoursAgo: 'Std',
    daysAgo: 'T',
    errorTitle: 'Fehler',
    permissionNeeded: 'Berechtigung zum Zugriff auf Seiteninhalte erforderlich',
};

const itTranslations: Translations = {
    appName: 'ClarifAI',
    appDescription: 'Assistente di chiarimento AI',
    welcomeMessage: 'Ciao! Sono ClarifAI. Come posso aiutarti?',
    chatPlaceholder: 'Scrivi il tuo messaggio qui...',
    chatHint: 'Premi Invio per inviare, Shift+Invio per nuova riga',
    thinking: 'ClarifAI sta pensando...',
    summarizeTitle: '📄 Riassumi Pagina Corrente',
    keyPointsLabel: 'Punti Chiave',
    keyPointsDesc: 'Punti principali',
    tldrLabel: 'Riassunto',
    tldrDesc: 'Panoramica rapida',
    teaserLabel: 'Anteprima',
    teaserDesc: 'Parti più interessanti',
    headlineLabel: 'Titolo',
    headlineDesc: 'Riepilogo punto principale',
    selectTextHint: 'Seleziona il testo sulla pagina per riassunti mirati o ottieni un riassunto completo',
    generatingSummary: 'Generazione riassunto...',
    settingsTitle: 'Impostazioni',
    generalTab: 'Generale',
    historyTab: 'Cronologia',
    themeLabel: 'Tema',
    lightTheme: 'Chiaro',
    darkTheme: 'Scuro',
    autoTheme: 'Auto',
    languageLabel: 'Lingua di Risposta',
    languageHint: 'Le risposte dell\'IA saranno generate in questa lingua',
    avatarLabel: 'Il Tuo Avatar',
    avatarHint: 'Scegli come appari nelle chat',
    manAvatar: 'Uomo',
    womanAvatar: 'Donna',
    newChatButton: 'Nuova Chat',
    clearAllButton: 'Cancella Tutto',
    noHistoryTitle: 'Nessuna cronologia ancora',
    noHistoryDesc: 'Le tue conversazioni appariranno qui',
    messagesCount: 'messaggi',
    deleteChat: 'Elimina chat',
    justNow: 'Adesso',
    minutesAgo: 'min',
    hoursAgo: 'h',
    daysAgo: 'g',
    errorTitle: 'Errore',
    permissionNeeded: 'Permesso necessario per accedere al contenuto della pagina',
};

const ptTranslations: Translations = {
    appName: 'ClarifAI',
    appDescription: 'Assistente de esclarecimento com IA',
    welcomeMessage: 'Olá! Sou ClarifAI. Como posso ajudar?',
    chatPlaceholder: 'Digite sua mensagem aqui...',
    chatHint: 'Pressione Enter para enviar, Shift+Enter para nova linha',
    thinking: 'ClarifAI está pensando...',
    summarizeTitle: '📄 Resumir Página Atual',
    keyPointsLabel: 'Pontos-Chave',
    keyPointsDesc: 'Pontos principais',
    tldrLabel: 'Resumo',
    tldrDesc: 'Visão rápida',
    teaserLabel: 'Prévia',
    teaserDesc: 'Partes mais interessantes',
    headlineLabel: 'Manchete',
    headlineDesc: 'Resumo do ponto principal',
    selectTextHint: 'Selecione texto na página para resumos focados ou obtenha um resumo completo',
    generatingSummary: 'Gerando resumo...',
    settingsTitle: 'Configurações',
    generalTab: 'Geral',
    historyTab: 'Histórico',
    themeLabel: 'Tema',
    lightTheme: 'Claro',
    darkTheme: 'Escuro',
    autoTheme: 'Auto',
    languageLabel: 'Idioma de Resposta',
    languageHint: 'As respostas da IA serão geradas neste idioma',
    avatarLabel: 'Seu Avatar',
    avatarHint: 'Escolha como você aparece nos chats',
    manAvatar: 'Homem',
    womanAvatar: 'Mulher',
    newChatButton: 'Novo Chat',
    clearAllButton: 'Limpar Tudo',
    noHistoryTitle: 'Ainda sem histórico de chat',
    noHistoryDesc: 'Suas conversas aparecerão aqui',
    messagesCount: 'mensagens',
    deleteChat: 'Excluir chat',
    justNow: 'Agora mesmo',
    minutesAgo: 'min',
    hoursAgo: 'h',
    daysAgo: 'd',
    errorTitle: 'Erro',
    permissionNeeded: 'Permissão necessária para acessar o conteúdo da página',
};

const jaTranslations: Translations = {
    appName: 'ClarifAI',
    appDescription: 'AI搭載説明アシスタント',
    welcomeMessage: 'こんにちは！ClarifAIです。どのようにお手伝いできますか？',
    chatPlaceholder: 'ここにメッセージを入力...',
    chatHint: 'Enterで送信、Shift+Enterで改行',
    thinking: 'ClarifAIが考えています...',
    summarizeTitle: '📄 現在のページを要約',
    keyPointsLabel: '要点',
    keyPointsDesc: '主なポイント',
    tldrLabel: '概要',
    tldrDesc: '簡単な概要',
    teaserLabel: 'ティーザー',
    teaserDesc: '最も興味深い部分',
    headlineLabel: '見出し',
    headlineDesc: '主要ポイントの要約',
    selectTextHint: 'ページ上のテキストを選択して焦点を絞った要約を取得するか、ページ全体の要約を取得します',
    generatingSummary: '要約を生成中...',
    settingsTitle: '設定',
    generalTab: '一般',
    historyTab: '履歴',
    themeLabel: 'テーマ',
    lightTheme: 'ライト',
    darkTheme: 'ダーク',
    autoTheme: '自動',
    languageLabel: '応答言語',
    languageHint: 'AIの応答はこの言語で生成されます',
    avatarLabel: 'あなたのアバター',
    avatarHint: 'チャットでの表示を選択',
    manAvatar: '男性',
    womanAvatar: '女性',
    newChatButton: '新しいチャット',
    clearAllButton: 'すべてクリア',
    noHistoryTitle: 'まだチャット履歴がありません',
    noHistoryDesc: '会話はここに表示されます',
    messagesCount: 'メッセージ',
    deleteChat: 'チャットを削除',
    justNow: 'たった今',
    minutesAgo: '分前',
    hoursAgo: '時間前',
    daysAgo: '日前',
    errorTitle: 'エラー',
    permissionNeeded: 'ページコンテンツにアクセスするには権限が必要です',
};

const zhTranslations: Translations = {
    appName: 'ClarifAI',
    appDescription: 'AI驱动的澄清助手',
    welcomeMessage: '你好！我是ClarifAI。我能帮你什么？',
    chatPlaceholder: '在此输入您的消息...',
    chatHint: '按Enter发送，Shift+Enter换行',
    thinking: 'ClarifAI正在思考...',
    summarizeTitle: '📄 总结当前页面',
    keyPointsLabel: '要点',
    keyPointsDesc: '主要要点',
    tldrLabel: '摘要',
    tldrDesc: '快速概览',
    teaserLabel: '预览',
    teaserDesc: '最有趣的部分',
    headlineLabel: '标题',
    headlineDesc: '要点摘要',
    selectTextHint: '在页面上选择文本以获得重点摘要，或获得完整页面摘要',
    generatingSummary: '正在生成摘要...',
    settingsTitle: '设置',
    generalTab: '常规',
    historyTab: '历史',
    themeLabel: '主题',
    lightTheme: '浅色',
    darkTheme: '深色',
    autoTheme: '自动',
    languageLabel: '响应语言',
    languageHint: 'AI响应将以该语言生成',
    avatarLabel: '您的头像',
    avatarHint: '选择您在聊天中的显示方式',
    manAvatar: '男性',
    womanAvatar: '女性',
    newChatButton: '新对话',
    clearAllButton: '全部清除',
    noHistoryTitle: '还没有聊天历史',
    noHistoryDesc: '您的对话将显示在这里',
    messagesCount: '条消息',
    deleteChat: '删除聊天',
    justNow: '刚刚',
    minutesAgo: '分钟前',
    hoursAgo: '小时前',
    daysAgo: '天前',
    errorTitle: '错误',
    permissionNeeded: '需要权限才能访问页面内容',
};

export const translations: Record<Language, Translations> = {
    en: enTranslations,
    es: esTranslations,
    fr: frTranslations,
    de: deTranslations,
    it: itTranslations,
    pt: ptTranslations,
    ru: enTranslations,
    ja: jaTranslations,
    ko: enTranslations,
    zh: zhTranslations,
    ar: enTranslations,
    hi: enTranslations,
};

export const getTranslation = (language: Language): Translations => {
    return translations[language] || enTranslations;
};
