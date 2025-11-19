import React, { useState, useEffect, useRef } from "react";
import ChatMessage from "./components/ChatMessage";
import ChatInput from "./components/ChatInput";
import ContentActions from "./components/ContentActions";
import DebugPanel from "./components/DebugPanel";
import SettingsPanel from "./components/SettingsPanel";
import { Message, ChatState } from "./types/chat";
import { Settings, Theme } from "./types/settings";
import {
  fetchAIResponse,
  generateMessageId,
  checkPermissions,
} from "./utils/api";
import { logExtensionInfo } from "./utils/extensionValidator";
import { ContextMenuHandler } from "./utils/contextMenu";
import {
  getSettings,
  saveCurrentChat,
  loadChatById,
  startNewChat,
} from "./utils/storage";
import { useTranslation } from "./hooks/useTranslation";

const App: React.FC = () => {
  const { t } = useTranslation();

  const [chatState, setChatState] = useState<ChatState>({
    messages: [
      {
        id: generateMessageId(),
        content: t.welcomeMessage,
        role: "assistant",
        timestamp: new Date(),
      },
    ],
    isLoading: false,
  });

  const [hasPermissions, setHasPermissions] = useState<boolean | null>(null);
  const [settings, setSettings] = useState<Settings>({
    theme: "auto",
    language: "en",
    languageName: "English",
    avatar: "man",
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages]);

  useEffect(() => {
    // Log extension info for debugging
    logExtensionInfo();

    // Check permissions on component mount
    checkPermissions().then(setHasPermissions);

    // Load saved settings
    loadSettings();

    // Check for pending context menu requests
    handlePendingContextMenuRequests();
  }, []);

  useEffect(() => {
    // Apply theme
    applyTheme(settings.theme);
  }, [settings.theme]);

  useEffect(() => {
    // Save current chat to history when messages change
    if (chatState.messages.length > 1) {
      // Don't save just the welcome message
      saveCurrentChat(chatState.messages).catch((error) => {
        console.error("Error saving chat:", error);
      });
    }
  }, [chatState.messages]);

  const loadSettings = async () => {
    const savedSettings = await getSettings();
    setSettings(savedSettings);
  };

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
    } else {
      // Auto mode - use system preference
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      if (prefersDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  };

  const handlePendingContextMenuRequests = async () => {
    try {
      const contextMenuHandler = ContextMenuHandler.getInstance();
      const pendingRequest = await contextMenuHandler.getPendingRequest();

      if (pendingRequest) {
        console.log("Found pending context menu request:", pendingRequest);

        // Add a message showing what action was triggered
        const actionMessage: Message = {
          id: generateMessageId(),
          content: `🎯 **${contextMenuHandler.getActionMessage(
            pendingRequest
          )}**\n\nProcessing your request...`,
          role: "assistant",
          timestamp: new Date(),
        };

        setChatState((prev) => ({
          ...prev,
          messages: [...prev.messages, actionMessage],
          isLoading: true,
        }));

        try {
          // Process the request and generate response
          const response = await contextMenuHandler.processRequest(
            pendingRequest
          );

          // Clear the pending request
          await contextMenuHandler.clearPendingRequest();

          // For some request types (like links and pages with key points), the response is already final
          // For others, it might be a prompt that needs further AI processing
          let finalResponse: string;

          if (
            pendingRequest.type === "link" ||
            pendingRequest.type === "page" ||
            pendingRequest.type === "image"
          ) {
            // These return final responses from Summarizer/Prompt APIs
            finalResponse = response;
          } else {
            // These return prompts that need further AI processing (like selection)
            finalResponse = await fetchAIResponse(response, (progress) => {
              console.log(`Context menu AI processing: ${progress}%`);
            });
          }

          const assistantMessage: Message = {
            id: generateMessageId(),
            content: finalResponse,
            role: "assistant",
            timestamp: new Date(),
          };

          setChatState((prev) => ({
            ...prev,
            messages: [...prev.messages.slice(0, -1), assistantMessage], // Replace the "Processing..." message
            isLoading: false,
          }));
        } catch (error) {
          console.error("Error processing context menu request:", error);

          const errorMessage: Message = {
            id: generateMessageId(),
            content: `Sorry, I encountered an error while processing your context menu request: ${
              error instanceof Error ? error.message : "Unknown error"
            }\n\nPlease try again or ask your question directly in the chat.`,
            role: "assistant",
            timestamp: new Date(),
          };

          setChatState((prev) => ({
            ...prev,
            messages: [...prev.messages.slice(0, -1), errorMessage], // Replace the "Processing..." message
            isLoading: false,
          }));
        }
      }
    } catch (error) {
      console.error("Error checking for pending context menu requests:", error);
    }
  };

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: generateMessageId(),
      content,
      role: "user",
      timestamp: new Date(),
    };

    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
    }));

    try {
      // Fetch AI response with progress tracking and language settings
      const aiResponse = await fetchAIResponse(
        content,
        (progress) => {
          // Could update loading state with progress if needed
          console.log(`AI processing: ${progress}%`);
        },
        settings
      );

      const assistantMessage: Message = {
        id: generateMessageId(),
        content: aiResponse,
        role: "assistant",
        timestamp: new Date(),
      };

      setChatState((prev) => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error fetching AI response:", error);

      const errorMessage: Message = {
        id: generateMessageId(),
        content:
          "Sorry, I encountered an error while processing your request. This might be because:\n\n• Chrome's AI features aren't available\n• The page content couldn't be accessed\n• Network connectivity issues\n\nPlease try again or check if you're using a compatible Chrome version.",
        role: "assistant",
        timestamp: new Date(),
      };

      setChatState((prev) => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
        isLoading: false,
      }));
    }
  };

  const handleSummaryGenerated = (summary: string) => {
    const summaryMessage: Message = {
      id: generateMessageId(),
      content: summary,
      role: "assistant",
      timestamp: new Date(),
    };

    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, summaryMessage],
    }));
  };

  const handleSettingsChange = (newSettings: Settings) => {
    setSettings(newSettings);
  };

  const handleLoadChat = async (chatId: string) => {
    const messages = await loadChatById(chatId);
    if (messages) {
      setChatState({
        messages,
        isLoading: false,
      });
    }
  };

  const handleNewChat = async () => {
    await startNewChat();
    setChatState({
      messages: [
        {
          id: generateMessageId(),
          content: "Hello! I'm ClarifAI. What can I help you with?",
          role: "assistant",
          timestamp: new Date(),
        },
      ],
      isLoading: false,
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">AI</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              ClarifAI
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t.appDescription}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Settings"
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
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
        </div>
      </div>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {chatState.messages.map((message) => (
          <ChatMessage key={message.id} message={message} userAvatar={settings.avatar} />
        ))}

        {/* Loading indicator */}
        {chatState.isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {t.thinking}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Content Actions */}
      <ContentActions onSummaryGenerated={handleSummaryGenerated} />

      {/* Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={chatState.isLoading}
      />

      {/* Debug Panel */}
      <DebugPanel />

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsChange={handleSettingsChange}
        onLoadChat={handleLoadChat}
        onNewChat={handleNewChat}
      />
    </div>
  );
};

export default App;
