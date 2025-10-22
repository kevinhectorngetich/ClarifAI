import React, { useState, useEffect } from 'react';
import { checkSummarizerAvailability } from '../utils/summarizer';
import { checkPermissions } from '../utils/api';
import { testSummarizerAPI, testExtensionContext } from '../utils/testUtils';

const DebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState<{
    permissions: boolean | null;
    summarizerAvailability: string | null;
    chromeVersion: string;
    userAgent: string;
    extensionId: string;
    currentTab: any;
    apiTest?: any;
    contextTest?: any;
  }>({
    permissions: null,
    summarizerAvailability: null,
    chromeVersion: 'Unknown',
    userAgent: navigator.userAgent,
    extensionId: 'Unknown',
    currentTab: null
  });

  const [isTestingAPI, setIsTestingAPI] = useState(false);

  const runAPITests = async () => {
    setIsTestingAPI(true);
    try {
      const apiTest = await testSummarizerAPI();
      const contextTest = await testExtensionContext();
      
      setDebugInfo(prev => ({
        ...prev,
        apiTest,
        contextTest
      }));
    } catch (error) {
      console.error('Error running tests:', error);
    } finally {
      setIsTestingAPI(false);
    }
  };

  useEffect(() => {
    const loadDebugInfo = async () => {
      try {
        // Check permissions
        const hasPermissions = await checkPermissions();
        
        // Check Summarizer availability
        const summarizerStatus = await checkSummarizerAvailability();
        
        // Get Chrome version
        const chromeMatch = navigator.userAgent.match(/Chrome\/([0-9.]+)/);
        const chromeVersion = chromeMatch ? chromeMatch[1] : 'Not Chrome';
        
        // Get extension ID
        const extensionId = chrome.runtime?.id || 'Unknown';
        
        // Get current tab info
        let currentTab = null;
        try {
          const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
          currentTab = tabs[0] ? {
            id: tabs[0].id,
            url: tabs[0].url,
            title: tabs[0].title
          } : null;
        } catch (error) {
          currentTab = { error: error instanceof Error ? error.message : 'Unknown error' };
        }

        setDebugInfo({
          permissions: hasPermissions,
          summarizerAvailability: summarizerStatus,
          chromeVersion,
          userAgent: navigator.userAgent,
          extensionId,
          currentTab
        });
      } catch (error) {
        console.error('Error loading debug info:', error);
      }
    };

    if (isOpen) {
      loadDebugInfo();
    }
  }, [isOpen]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-2 right-2 w-8 h-8 bg-gray-600 text-white rounded-full text-xs hover:bg-gray-700 z-50"
        title="Debug Info"
      >
        🔧
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-96 overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">🔧 Debug Information</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="p-4 space-y-4 text-sm">
          {/* Permissions */}
          <div>
            <h4 className="font-semibold mb-1">Permissions Status</h4>
            <div className={`px-2 py-1 rounded text-xs ${
              debugInfo.permissions === true 
                ? 'bg-green-100 text-green-800' 
                : debugInfo.permissions === false 
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {debugInfo.permissions === true ? '✅ All permissions granted' : 
               debugInfo.permissions === false ? '❌ Missing permissions' : 
               '⏳ Checking permissions...'}
            </div>
          </div>

          {/* Summarizer API */}
          <div>
            <h4 className="font-semibold mb-1">Chrome Summarizer API</h4>
            <div className={`px-2 py-1 rounded text-xs ${
              debugInfo.summarizerAvailability === 'available' 
                ? 'bg-green-100 text-green-800' 
                : debugInfo.summarizerAvailability === 'downloadable'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {debugInfo.summarizerAvailability === 'available' ? '✅ Available' : 
               debugInfo.summarizerAvailability === 'downloadable' ? '📥 Downloadable (needs activation)' : 
               debugInfo.summarizerAvailability === 'unavailable' ? '❌ Unavailable' :
               '⏳ Checking availability...'}
            </div>
          </div>

          {/* Chrome Version */}
          <div>
            <h4 className="font-semibold mb-1">Chrome Version</h4>
            <code className="text-xs bg-gray-100 px-2 py-1 rounded block">
              {debugInfo.chromeVersion}
            </code>
          </div>

          {/* Extension ID */}
          <div>
            <h4 className="font-semibold mb-1">Extension ID</h4>
            <code className="text-xs bg-gray-100 px-2 py-1 rounded block">
              {debugInfo.extensionId}
            </code>
          </div>

          {/* Current Tab */}
          <div>
            <h4 className="font-semibold mb-1">Current Tab</h4>
            <div className="text-xs bg-gray-100 p-2 rounded">
              {debugInfo.currentTab ? (
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(debugInfo.currentTab, null, 2)}
                </pre>
              ) : (
                'Loading...'
              )}
            </div>
          </div>

          {/* API Tests */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold">🧪 API Tests</h4>
              <button
                onClick={runAPITests}
                disabled={isTestingAPI}
                className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {isTestingAPI ? 'Testing...' : 'Run Tests'}
              </button>
            </div>
            
            {debugInfo.apiTest && (
              <div className="text-xs space-y-2">
                <div className={`p-2 rounded ${debugInfo.apiTest.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  <strong>Summarizer API:</strong> {debugInfo.apiTest.success ? '✅ Working' : '❌ Failed'}
                  {debugInfo.apiTest.error && <div>Error: {debugInfo.apiTest.error}</div>}
                  {debugInfo.apiTest.testResult && <div>Test Result: {debugInfo.apiTest.testResult.substring(0, 100)}...</div>}
                </div>
                
                {debugInfo.contextTest && (
                  <div className={`p-2 rounded ${debugInfo.contextTest.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    <strong>Extension Context:</strong> {debugInfo.contextTest.success ? '✅ Valid' : '❌ Invalid'}
                    <div>{debugInfo.contextTest.details}</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2">🚨 Troubleshooting</h4>
            <ul className="text-xs space-y-1 list-disc list-inside">
              <li>Make sure you're using <strong>Chrome Canary</strong> or <strong>Chrome Dev</strong></li>
              <li>Enable flags at <code>chrome://flags/#summarization-api-for-gemini-nano</code></li>
              <li>Check console (F12) for detailed error messages</li>
              <li>Reload the extension after making changes</li>
              <li>Try on different websites (some block extensions)</li>
              <li><strong>Click "Run Tests"</strong> to verify API functionality</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;