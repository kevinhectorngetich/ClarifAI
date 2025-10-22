import React, { useState } from 'react';
import { showToast } from '../utils/toast';

interface CopyButtonProps {
  text: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showToastNotification?: boolean;
}

const CopyButton: React.FC<CopyButtonProps> = ({ 
  text, 
  className = '', 
  size = 'md',
  showToastNotification = true 
}) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const buttonSizeClasses = {
    sm: 'p-1',
    md: 'p-1.5',
    lg: 'p-2'
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      if (showToastNotification) {
        showToast({ message: 'Copied to clipboard!', type: 'success', duration: 2000 });
      }
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopySuccess(true);
        if (showToastNotification) {
          showToast({ message: 'Copied to clipboard!', type: 'success', duration: 2000 });
        }
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (fallbackErr) {
        if (showToastNotification) {
          showToast({ message: 'Failed to copy to clipboard', type: 'error', duration: 3000 });
        }
      }
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`${buttonSizeClasses[size]} rounded-md hover:bg-gray-200 transition-colors duration-200 group ${className}`}
      title="Copy to clipboard"
    >
      {copySuccess ? (
        <svg className={`${sizeClasses[size]} text-green-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className={`${sizeClasses[size]} text-gray-500 group-hover:text-gray-700`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  );
};

export default CopyButton;