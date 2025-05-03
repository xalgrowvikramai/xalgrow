import React from 'react';
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
      // For HTML and React files, try to render something
      try {
        return (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-lg bg-white dark:bg-gray-800 w-full h-full">
            <iframe
              srcDoc={`<!DOCTYPE html>
                <html>
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <script src="https://cdn.tailwindcss.com"></script>
                  <style>
                    body { font-family: 'Inter', sans-serif; padding: 1rem; }
                  </style>
                </head>
                <body>
                  <div id="preview">
                    ${activeFileContent}
                  </div>
                </body>
                </html>`}
              className="w-full h-full border-0"
              title="Preview"
              sandbox="allow-scripts"
            />
          </div>
        );
      } catch (error) {
        return (
          <div className="flex items-center justify-center h-full text-red-500">
            <p>Error rendering preview</p>
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
      } catch (error) {
        return (
          <div className="flex items-center justify-center h-full text-red-500">
            <p>Invalid JSON</p>
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
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <i className="ri-refresh-line"></i>
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
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
