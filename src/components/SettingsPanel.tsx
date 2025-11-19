import React, { useState, useEffect } from "react";
import {
  Settings,
  LANGUAGE_OPTIONS,
  Theme,
  Language,
  ChatHistory,
} from "../types/settings";
import {
  getSettings,
  saveSettings,
  getChatHistory,
  deleteChatById,
  clearAllHistory,
} from "../utils/storage";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange: (settings: Settings) => void;
  onLoadChat: (chatId: string) => void;
  onNewChat: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  onSettingsChange,
  onLoadChat,
  onNewChat,
}) => {
  const [activeTab, setActiveTab] = useState<"general" | "history">("general");
  const [settings, setSettings] = useState<Settings>({
    theme: "auto",
    language: "en",
    languageName: "English",
  });
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
      loadHistory();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    const savedSettings = await getSettings();
    setSettings(savedSettings);
  };

  const loadHistory = async () => {
    const history = await getChatHistory();
    setChatHistory(history);
  };

  const handleThemeChange = async (theme: Theme) => {
    const newSettings = { ...settings, theme };
    setSettings(newSettings);
    await saveSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const handleLanguageChange = async (language: Language) => {
    const languageOption = LANGUAGE_OPTIONS.find(
      (opt) => opt.code === language
    );
    const newSettings = {
      ...settings,
      language,
      languageName: languageOption?.name || "English",
    };
    setSettings(newSettings);
    await saveSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete this chat?")) {
      setIsLoading(true);
      try {
        await deleteChatById(chatId);
        await loadHistory();
      } catch (error) {
        console.error("Error deleting chat:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleClearAllHistory = async () => {
    if (confirm("Clear all chat history? This cannot be undone.")) {
      setIsLoading(true);
      try {
        await clearAllHistory();
        setChatHistory([]);
        onNewChat();
      } catch (error) {
        console.error("Error clearing history:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Settings
        </h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Close settings"
        >
          <svg
            className="w-5 h-5 text-gray-600 dark:text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <button
          onClick={() => setActiveTab("general")}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "general"
              ? "text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
        >
          General
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "history"
              ? "text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
        >
          History ({chatHistory.length})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "general" ? (
          <div className="p-4 space-y-6">
            {/* Theme Setting */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Theme
              </label>
              <div className="space-y-2">
                {(["light", "dark", "auto"] as Theme[]).map((theme) => (
                  <button
                    key={theme}
                    onClick={() => handleThemeChange(theme)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-all ${
                      settings.theme === theme
                        ? "border-primary-500 bg-primary-500/10 dark:bg-primary-500/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {theme === "light" && (
                        <svg
                          className={`w-5 h-5 ${
                            settings.theme === theme
                              ? "text-primary-600 dark:text-primary-400"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                      )}
                      {theme === "dark" && (
                        <svg
                          className={`w-5 h-5 ${
                            settings.theme === theme
                              ? "text-primary-600 dark:text-primary-400"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                          />
                        </svg>
                      )}
                      {theme === "auto" && (
                        <svg
                          className={`w-5 h-5 ${
                            settings.theme === theme
                              ? "text-primary-600 dark:text-primary-400"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                          />
                        </svg>
                      )}
                      <span
                        className={`text-sm font-medium capitalize ${
                          settings.theme === theme
                            ? "text-primary-700 dark:text-primary-300"
                            : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {theme}
                      </span>
                    </div>
                    {settings.theme === theme && (
                      <svg
                        className="w-5 h-5 text-primary-600 dark:text-primary-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Language Setting */}
            <div>
              <label
                htmlFor="language"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3"
              >
                Response Language
              </label>
              <select
                id="language"
                value={settings.language}
                onChange={(e) =>
                  handleLanguageChange(e.target.value as Language)
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {LANGUAGE_OPTIONS.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.nativeName} ({lang.name})
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                AI responses will be generated in this language
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4">
            {chatHistory.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p className="text-gray-500 dark:text-gray-400">
                  No chat history yet
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Your conversations will appear here
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={onNewChat}
                    className="flex items-center space-x-2 px-3 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <span>New Chat</span>
                  </button>
                  {chatHistory.length > 0 && (
                    <button
                      onClick={handleClearAllHistory}
                      disabled={isLoading}
                      className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {chatHistory.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => {
                        onLoadChat(chat.id);
                        onClose();
                      }}
                      className="group flex items-start justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-all"
                    >
                      <div className="flex-1 min-w-0 mr-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {chat.title}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(chat.updatedAt)}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            •
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {chat.messages.length} messages
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteChat(chat.id, e)}
                        disabled={isLoading}
                        className="opacity-0 group-hover:opacity-100 p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all disabled:opacity-50"
                        aria-label="Delete chat"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPanel;
