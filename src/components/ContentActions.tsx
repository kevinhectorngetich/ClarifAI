import React, { useState } from 'react';
import { summarizeSelectedContent, checkPermissions } from '../utils/api';

interface ContentActionsProps {
  onSummaryGenerated: (summary: string) => void;
}

const ContentActions: React.FC<ContentActionsProps> = ({ onSummaryGenerated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hasPermissions, setHasPermissions] = useState<boolean | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  React.useEffect(() => {
    checkPermissions().then(setHasPermissions);
  }, []);

  const handleSummarize = async (type: 'key-points' | 'tldr' | 'teaser' | 'headline') => {
    if (!hasPermissions) {
      setError('Extension needs permission to access page content');
      return;
    }

    setIsLoading(true);
    setError(null);
    setProgress(0);

    try {
      const summary = await summarizeSelectedContent(type, (progressValue) => {
        setProgress(progressValue);
      });
      
      onSummaryGenerated(`**${type.toUpperCase()} Summary:**\n\n${summary}`);
      
      // Auto-collapse the summary options after successful generation
      setTimeout(() => {
        setIsExpanded(false);
      }, 800);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate summary';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  const summaryTypes = [
    { key: 'key-points' as const, label: 'Key Points', icon: '•', description: 'Main bullet points' },
    { key: 'tldr' as const, label: 'TL;DR', icon: '⚡', description: 'Quick overview' },
    { key: 'teaser' as const, label: 'Teaser', icon: '🎯', description: 'Most interesting parts' },
    { key: 'headline' as const, label: 'Headline', icon: '📰', description: 'Main point summary' }
  ];

  if (hasPermissions === false) {
    return (
      <div className="border-t border-gray-200 p-4 bg-yellow-50">
        <div className="flex items-center space-x-2 text-yellow-800">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">Permission needed to access page content</span>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200 bg-gray-50">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center justify-between text-left hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <span className="text-sm font-semibold text-gray-700">📄 Summarize Current Page</span>
          {!hasPermissions && hasPermissions !== null && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">⚠️</span>
          )}
        </div>
        <svg 
          className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4">
          {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
              {error}
            </div>
          )}

          {isLoading && (
            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-blue-700">Generating summary...</span>
              </div>
              {progress > 0 && (
                <div className="mt-2">
                  <div className="w-full bg-blue-200 rounded-full h-1">
                    <div 
                      className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">{Math.round(progress)}% complete</p>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            {summaryTypes.map(({ key, label, icon, description }) => (
              <button
                key={key}
                onClick={() => handleSummarize(key)}
                disabled={isLoading || !hasPermissions}
                className="flex flex-col items-center p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors group"
              >
                <span className="text-lg mb-1 group-hover:scale-110 transition-transform">{icon}</span>
                <span className="text-xs font-medium text-gray-900">{label}</span>
                <span className="text-xs text-gray-500 text-center">{description}</span>
              </button>
            ))}
          </div>

          <p className="text-xs text-gray-500 mt-3 text-center">
            Select text on the page for focused summaries, or get full page summary
          </p>
        </div>
      )}
    </div>
  );
};

export default ContentActions;