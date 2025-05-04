import React, { useState, useEffect, useCallback } from 'react';
import { useI18n } from '@/lib/i18n';
import { useEditor } from '@/contexts/editor-context';
import { Button } from '@/components/ui/button';
import { PreviewDevice } from '@/types';

interface PreviewPanelProps {
  className?: string;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ className = '' }) => {
  const { t } = useI18n();
  const { activeFile, activeFileContent, previewDevice, setPreviewDevice } = useEditor();
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Function to handle refresh button click
  const handleRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  // Function to get preview width based on device
  const getPreviewWidth = () => {
    switch (previewDevice) {
      case 'mobile':
        return 'max-w-[375px]';
      case 'tablet':
        return 'max-w-[768px]';
      case 'desktop':
      default:
        return 'max-w-[1200px]';
    }
  };

  // Function to render preview content based on file type
  const renderPreview = () => {
    if (!activeFile) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
          <p>Select a file to preview</p>
        </div>
      );
    }

    const extension = activeFile.name.split('.').pop()?.toLowerCase();
    
    if (extension === 'html' || extension === 'jsx' || extension === 'tsx') {
      // For HTML and React files, provide an enhanced rendering approach
      try {
        // For React JSX files, we need to transform them properly
        const isReactFile = extension === 'jsx' || extension === 'tsx';
        
        // Create a more comprehensive preview HTML that includes React
        const previewHtml = `<!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
            <style>
              body { font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; padding: 1rem; }
              .component-container { max-width: 100%; margin: 0 auto; }
            </style>
            ${isReactFile ? `
              <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
              <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
              <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
            ` : ''}
          </head>
          <body class="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <div id="root" class="component-container"></div>
            
            ${isReactFile ? `
              <script type="text/babel">
                // Simplified React component rendering
                try {
                  ${activeFileContent}
                  
                  // Auto-detect default export or try to render the component
                  const componentToRender = typeof App !== 'undefined' 
                    ? App 
                    : (typeof default_1 !== 'undefined' 
                      ? default_1 
                      : Object.values(window).find(val => 
                          typeof val === 'function' && 
                          /^\\(?function\\s+[A-Z]|^\\(?class\\s+[A-Z]|=>/.test(val.toString())
                        ));
                  
                  if (componentToRender) {
                    ReactDOM.render(React.createElement(componentToRender), document.getElementById('root'));
                  } else {
                    document.getElementById('root').innerHTML = '<div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded" role="alert"><p class="font-bold">Preview Note</p><p>No React component found to render. Make sure your file exports a component.</p></div>';
                  }
                } catch (e) {
                  document.getElementById('root').innerHTML = '<div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert"><p class="font-bold">Preview Error</p><p>' + e.message + '</p></div>';
                  console.error(e);
                }
              </script>
            ` : `
              <script>
                document.getElementById('root').innerHTML = \`${activeFileContent}\`;
              </script>
            `}
          </body>
          </html>`;
          
        return (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-lg bg-white dark:bg-gray-800 w-full h-full">
            <iframe
              key={`preview-iframe-${refreshKey}`}
              srcDoc={previewHtml}
              className="w-full h-full border-0"
              title="Preview"
              sandbox="allow-scripts allow-modals"
            />
          </div>
        );
      } catch (error: any) {
        return (
          <div className="flex flex-col items-center justify-center h-full text-red-500 p-4">
            <i className="ri-error-warning-line text-2xl mb-2"></i>
            <p className="font-semibold">Error rendering preview</p>
            <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">{error.message || 'Unknown error'}</p>
          </div>
        );
      }
    } else if (extension === 'css') {
      // For CSS, show a styled box
      return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-lg bg-white dark:bg-gray-800 w-full">
          <div className="p-4">
            <h3 className="font-medium mb-2">CSS Preview</h3>
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded">
              <style>{activeFileContent}</style>
              <div className="preview-box" style={{ padding: '20px', borderRadius: '8px', backgroundColor: '#f0f0f0' }}>
                <h4>Sample Element with Your CSS</h4>
                <p>This box shows how your CSS might look when applied to elements.</p>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (extension === 'json') {
      // For JSON, syntax highlight
      try {
        const formattedJson = JSON.stringify(JSON.parse(activeFileContent), null, 2);
        return (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-lg bg-white dark:bg-gray-800 w-full">
            <div className="p-4">
              <h3 className="font-medium mb-2">JSON Preview</h3>
              <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded overflow-auto">
                {formattedJson}
              </pre>
            </div>
          </div>
        );
      } catch (error: any) {
        return (
          <div className="flex items-center justify-center h-full text-red-500 p-4">
            <div className="text-center">
              <i className="ri-error-warning-line text-2xl mb-2"></i>
              <p className="font-semibold">Invalid JSON</p>
              <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">{error.message || 'Could not parse JSON'}</p>
            </div>
          </div>
        );
      }
    } else {
      // For other files, just show plain text
      return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-lg bg-white dark:bg-gray-800 w-full">
          <div className="p-4">
            <h3 className="font-medium mb-2">Preview</h3>
            <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded overflow-auto">
              {activeFileContent}
            </pre>
          </div>
        </div>
      );
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="border-b border-gray-200 dark:border-gray-700 p-2 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-sm">{t('preview')}</h3>
          <div className="flex gap-1 border rounded-md overflow-hidden">
            <button 
              className={`py-1 px-2 text-xs ${previewDevice === 'desktop' 
                ? 'bg-primary-500 text-white' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
              onClick={() => setPreviewDevice('desktop')}
            >
              {t('desktop')}
            </button>
            <button 
              className={`py-1 px-2 text-xs ${previewDevice === 'tablet' 
                ? 'bg-primary-500 text-white' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
              onClick={() => setPreviewDevice('tablet')}
            >
              {t('tablet')}
            </button>
            <button 
              className={`py-1 px-2 text-xs ${previewDevice === 'mobile' 
                ? 'bg-primary-500 text-white' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
              onClick={() => setPreviewDevice('mobile')}
            >
              {t('mobile')}
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleRefresh}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            title={t('refresh preview')}
          >
            <i className="ri-refresh-line"></i>
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            title={t('open in new window')}
          >
            <i className="ri-external-link-line"></i>
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className={`w-full transition-all duration-300 ${getPreviewWidth()}`}>
          {renderPreview()}
        </div>
      </div>
    </div>
  );
};

export { PreviewPanel };
