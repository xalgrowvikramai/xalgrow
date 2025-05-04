import React, { useState, useEffect, useRef } from 'react';
import { useProject } from '@/contexts/project-context';

interface RuntimePreviewProps {
  className?: string;
}

/**
 * A preview component that actually runs the code in an isolated environment
 */
const RuntimePreview: React.FC<RuntimePreviewProps> = ({ className = '' }) => {
  const { currentProject, projectFiles } = useProject();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  
  // Clean file content if it contains markdown code blocks
  const cleanContent = (content: string): string => {
    if (!content || !content.startsWith('```')) return content;
    
    // Extract content between code block markers
    const codeBlockRegex = /```(?:jsx|js|tsx|ts|html|css)?\n([\s\S]*?)```$/;
    const match = content.match(codeBlockRegex);
    
    if (match && match[1]) {
      return match[1];
    } else {
      // If no match, try removing just the markers
      return content
        .replace(/^```(?:jsx|js|tsx|ts|html|css)?\n/, '')
        .replace(/```$/, '');
    }
  };

  // Fallback preview component for when iframes don't work
  const renderFallbackPreview = () => {
    if (!projectFiles || projectFiles.length === 0) return null;
    
    // Find App.jsx or main component
    const appFile = projectFiles.find(file => 
      file.name.toLowerCase() === 'app.jsx' || 
      file.name.toLowerCase() === 'app.js'
    );
    
    const cssFiles = projectFiles.filter(file => file.name.endsWith('.css'));
    const jsxFiles = projectFiles.filter(file => 
      file.name.endsWith('.jsx') || 
      file.name.endsWith('.js')
    );
    
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium mb-4 text-center">App Structure Preview</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {jsxFiles.slice(0, 4).map((file, index) => (
            <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
              <div className="font-medium mb-2 text-blue-600 dark:text-blue-400">{file.name}</div>
              <div className="text-xs overflow-hidden text-gray-600 dark:text-gray-300 font-mono" style={{maxHeight: '100px'}}>
                {cleanContent(file.content).slice(0, 200)}...
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Direct preview unavailable - app structure shown instead
        </div>
      </div>
    );
  };

  // Function to generate full HTML with embedded React
  const generateHTML = () => {
    if (!projectFiles || projectFiles.length === 0) return '';
    
    // Find HTML, CSS, and JS files
    const htmlFile = projectFiles.find(file => file.name.endsWith('.html'));
    const cssFiles = projectFiles.filter(file => file.name.endsWith('.css'));
    const jsFiles = projectFiles.filter(file => 
      file.name.endsWith('.js') || 
      file.name.endsWith('.jsx')
    );
    
    // Clean file contents
    const cssContents = cssFiles.map(file => cleanContent(file.content)).join('\n');
    const jsContents = jsFiles.map(file => cleanContent(file.content)).join('\n');
    
    let htmlContent = '';
    
    if (htmlFile) {
      htmlContent = cleanContent(htmlFile.content);
    } else {
      // Create basic HTML structure if no HTML file exists
      htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${currentProject?.name || 'App Preview'}</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>`;
    }
    
    // Inject React, ReactDOM, and Babel for JSX support
    const finalHTML = htmlContent.replace('</head>', `
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>${cssContents}</style>
</head>`);

    // Inject the app's JavaScript
    const finalHTMLWithJS = finalHTML.replace('</body>', `
  <script type="text/babel">
    // Polyfill for missing browser APIs
    window.global = window;
    
    // Error boundary to catch runtime errors
    class ErrorBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
      }
      
      static getDerivedStateFromError(error) {
        return { hasError: true, error };
      }
      
      render() {
        if (this.state.hasError) {
          return (
            <div style={{ 
              padding: '20px', 
              margin: '20px', 
              border: '1px solid #f56565', 
              borderRadius: '5px',
              backgroundColor: '#fff5f5',
              color: '#c53030'
            }}>
              <h2 style={{ marginTop: 0 }}>Rendering Error</h2>
              <p>{this.state.error?.message || 'An unknown error occurred'}</p>
            </div>
          );
        }
        
        return this.props.children;
      }
    }
    
    // App code
    try {
      ${jsContents}
      
      // Find the app component
      const appComponent = window.App || null;
      
      if (appComponent) {
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(
          <ErrorBoundary>
            <React.StrictMode>
              {React.createElement(appComponent)}
            </React.StrictMode>
          </ErrorBoundary>
        );
      } else {
        document.getElementById('root').innerHTML = 
          '<div style="padding: 20px; color: #555;">No App component found. Make sure you have an exported App component.</div>';
      }
    } catch (err) {
      document.getElementById('root').innerHTML = 
        '<div style="padding: 20px; color: #e53e3e; border: 1px solid #e53e3e; border-radius: 5px; margin: 20px;">' + 
        '<h2>JavaScript Error</h2><p>' + (err.message || 'Unknown error') + '</p></div>';
      console.error('Runtime error:', err);
    }
  </script>
</body>`);

    return finalHTMLWithJS;
  };

  // Method to directly write to the iframe document instead of using blob URLs
  const writeToIframe = (html: string) => {
    if (!iframeRef.current) return;
    
    try {
      const iframeDoc = iframeRef.current.contentDocument || 
                       (iframeRef.current.contentWindow?.document);
      
      if (!iframeDoc) {
        console.error('Cannot access iframe document');
        setError('Cannot access iframe document - possible security restriction');
        return;
      }
      
      // Write the HTML directly to the document
      iframeDoc.open();
      iframeDoc.write(html);
      iframeDoc.close();
      
      setLoading(false);
    } catch (err: any) {
      console.error('Error writing to iframe:', err);
      setError(err.message || 'Error rendering preview');
      setLoading(false);
    }
  };

  // Alternative method using srcdoc which may work better in some browsers
  const useSrcDoc = (html: string) => {
    if (!iframeRef.current) return;
    try {
      // Use srcdoc attribute which is more broadly supported for this use case
      iframeRef.current.srcdoc = html;
      setLoading(false);
    } catch (err: any) {
      console.error('Error setting srcdoc:', err);
      setError(err.message || 'Error rendering preview');
      setLoading(false);
    }
  };

  // Update the iframe content when files change
  useEffect(() => {
    if (!projectFiles || projectFiles.length === 0) {
      setLoading(false);
      return;
    }
    
    // Clean files if needed
    const filesToClean = projectFiles.filter(f => f.content.startsWith('```'));
    if (filesToClean.length > 0 && currentProject) {
      console.log(`${filesToClean.length} files have markdown code blocks that need cleaning`);
      
      // Trigger server cleanup
      fetch(`/api/projects/${currentProject.id}/clean-files`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(res => res.json())
      .then(data => {
        console.log('Files cleaned via API:', data);
      })
      .catch(err => console.error('Error cleaning files via API:', err));
    }
    
    try {
      setLoading(true);
      
      // Reset any previous error
      setError(null);
      
      // Generate HTML with embedded React and code
      const html = generateHTML();
      
      // Try multiple approaches for maximum compatibility
      if (iframeRef.current) {
        // First attempt: Use srcdoc (most compatible)
        useSrcDoc(html);
        
        // Add fallback for error handling
        iframeRef.current.onerror = (e) => {
          console.error('Iframe error with srcdoc:', e);
          // If srcdoc fails, try direct document writing
          writeToIframe(html);
        };
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate preview');
      setLoading(false);
      console.error('Preview generation error:', err);
    }
  }, [projectFiles, currentProject]);

  if (!currentProject || projectFiles.length === 0) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="text-center p-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h3 className="text-lg font-medium mb-2">No Project Files</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Generate code or create files to see a preview.
          </p>
        </div>
      </div>
    );
  }

  const [showFallback, setShowFallback] = useState(false);

  return (
    <div className={`h-full overflow-auto ${className}`}>
      <div className="p-4 h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Live App Preview</h2>
          <button 
            onClick={() => setShowFallback(!showFallback)}
            className="px-3 py-1 text-sm rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
          >
            {showFallback ? "Try Live Preview" : "Use Fallback Preview"}
          </button>
        </div>
        
        {/* Preview container */}
        <div className="flex-1 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
          {/* Loading state */}
          {loading && !showFallback && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
          
          {/* Error state */}
          {error && !showFallback && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-700">
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-500 mb-2">Preview Error</h3>
              <p className="text-red-700 dark:text-red-400">{error}</p>
              <button 
                onClick={() => setShowFallback(true)} 
                className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Use Fallback Preview
              </button>
            </div>
          )}
          
          {/* Choose between iframe and fallback */}
          {showFallback ? (
            <div className="p-4 h-full overflow-auto">
              {renderFallbackPreview()}
            </div>
          ) : (
            <iframe
              ref={iframeRef}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-popups allow-forms allow-modals allow-same-origin allow-downloads"
              allow="fullscreen; clipboard-read; clipboard-write;"
              title="App Preview"
            />
          )}
        </div>
        
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          {showFallback 
            ? "Using fallback preview - showing app structure instead of live rendering"
            : "This preview runs your actual React code with limited functionality for security reasons."
          }
        </div>
      </div>
    </div>
  );
};

export { RuntimePreview };