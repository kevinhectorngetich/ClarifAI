import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types/chat';
import CopyButton from './CopyButton';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
          isUser 
            ? 'bg-primary-500 text-white ml-2' 
            : 'bg-gray-200 text-gray-600 mr-2'
        }`}>
          {isUser ? 'U' : 'AI'}
        </div>
        
        {/* Message bubble */}
        <div className={`relative px-4 py-2 rounded-lg ${
          isUser 
            ? 'bg-primary-500 text-white rounded-br-sm' 
            : 'bg-gray-100 text-gray-800 rounded-bl-sm'
        }`}>
          {/* Copy button for assistant messages */}
          {isAssistant && (
            <div className="absolute top-2 right-2">
              <CopyButton 
                text={message.content} 
                size="md"
                className="hover:bg-gray-200"
              />
            </div>
          )}
          
          <div className="text-sm leading-relaxed pr-8"> {/* Add right padding to avoid overlap with copy button */}
            {isAssistant ? (
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown 
                  components={{
                    // Custom styling for markdown elements
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                    li: ({ children }) => <li className="text-sm">{children}</li>,
                    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                    em: ({ children }) => <em className="italic">{children}</em>,
                    code: ({ children }) => (
                      <code className="bg-gray-200 text-gray-800 px-1 py-0.5 rounded text-xs font-mono">
                        {children}
                      </code>
                    ),
                    h1: ({ children }) => <h1 className="text-base font-bold mb-2">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-sm font-bold mb-2">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-sm font-semibold mb-1">{children}</h3>,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            ) : (
              <p>{message.content}</p>
            )}
          </div>
          <p className={`text-xs mt-2 ${
            isUser ? 'text-blue-100' : 'text-gray-500'
          }`}>
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;