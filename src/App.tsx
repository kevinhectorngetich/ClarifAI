import React, { useState, useEffect, useRef } from 'react';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import ContentActions from './components/ContentActions';
import DebugPanel from './components/DebugPanel';
import { Message, ChatState } from './types/chat';
import { fetchAIResponse, generateMessageId, checkPermissions } from './utils/api';
import { logExtensionInfo } from './utils/extensionValidator';
import { ContextMenuHandler } from './utils/contextMenu';

const App: React.FC = () => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [
      {
        id: generateMessageId(),
        content: "Hello! I'm ClarifAI. What can I help you with?",
        role: 'assistant',
        timestamp: new Date()
      }
    ],
    isLoading: false
  });

  const [hasPermissions, setHasPermissions] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages]);

  useEffect(() => {
    // Log extension info for debugging
    logExtensionInfo();
    
    // Check permissions on component mount
    checkPermissions().then(setHasPermissions);

    // Check for pending context menu requests
    handlePendingContextMenuRequests();
  }, []);

  const handlePendingContextMenuRequests = async () => {
    try {
      const contextMenuHandler = ContextMenuHandler.getInstance();
      const pendingRequest = await contextMenuHandler.getPendingRequest();
      
      if (pendingRequest) {
        console.log('Found pending context menu request:', pendingRequest);
        
        // Add a message showing what action was triggered
        const actionMessage: Message = {
          id: generateMessageId(),
          content: `🎯 **${contextMenuHandler.getActionMessage(pendingRequest)}**\n\nProcessing your request...`,
          role: 'assistant',
          timestamp: new Date()
        };

        setChatState(prev => ({
          ...prev,
          messages: [...prev.messages, actionMessage],
          isLoading: true
        }));

        try {
          // Process the request and generate appropriate prompt
          const prompt = await contextMenuHandler.processRequest(pendingRequest);
          
          // Clear the pending request
          await contextMenuHandler.clearPendingRequest();
          
          // Fetch AI response
          const aiResponse = await fetchAIResponse(prompt, (progress) => {
            console.log(`Context menu AI processing: ${progress}%`);
          });
          
          const assistantMessage: Message = {
            id: generateMessageId(),
            content: aiResponse,
            role: 'assistant',
            timestamp: new Date()
          };

          setChatState(prev => ({
            ...prev,
            messages: [...prev.messages.slice(0, -1), assistantMessage], // Replace the "Processing..." message
            isLoading: false
          }));

        } catch (error) {
          console.error('Error processing context menu request:', error);
          
          const errorMessage: Message = {
            id: generateMessageId(),
            content: `Sorry, I encountered an error while processing your context menu request: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again or ask your question directly in the chat.`,
            role: 'assistant',
            timestamp: new Date()
          };

          setChatState(prev => ({
            ...prev,
            messages: [...prev.messages.slice(0, -1), errorMessage], // Replace the "Processing..." message
            isLoading: false
          }));
        }
      }
    } catch (error) {
      console.error('Error checking for pending context menu requests:', error);
    }
  };

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: generateMessageId(),
      content,
      role: 'user',
      timestamp: new Date()
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true
    }));

    try {
      // Fetch AI response with progress tracking
      const aiResponse = await fetchAIResponse(content, (progress) => {
        // Could update loading state with progress if needed
        console.log(`AI processing: ${progress}%`);
      });
      
      const assistantMessage: Message = {
        id: generateMessageId(),
        content: aiResponse,
        role: 'assistant',
        timestamp: new Date()
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false
      }));
    } catch (error) {
      console.error('Error fetching AI response:', error);
      
      const errorMessage: Message = {
        id: generateMessageId(),
        content: "Sorry, I encountered an error while processing your request. This might be because:\n\n• Chrome's AI features aren't available\n• The page content couldn't be accessed\n• Network connectivity issues\n\nPlease try again or check if you're using a compatible Chrome version.",
        role: 'assistant',
        timestamp: new Date()
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
        isLoading: false
      }));
    }
  };

  const handleSummaryGenerated = (summary: string) => {
    const summaryMessage: Message = {
      id: generateMessageId(),
      content: summary,
      role: 'assistant',
      timestamp: new Date()
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, summaryMessage]
    }));
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">AI</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">ClarifAI</h1>
            <p className="text-xs text-gray-500">AI-powered clarification assistant</p>
          </div>
        </div>
        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
      </div>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {chatState.messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {/* Loading indicator */}
        {chatState.isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-xs text-gray-500">ClarifAI is thinking...</span>
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
    </div>
  );
};

export default App;