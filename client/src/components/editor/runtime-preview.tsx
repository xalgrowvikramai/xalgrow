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
      // Generate HTML with embedded React and code
      const html = generateHTML();
      
      // Set the iframe content
      if (iframeRef.current) {
        setLoading(true);
        
        // Reset any previous error
        setError(null);
        
        // Create a blob URL for the HTML
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        // Set the src to the blob URL
        iframeRef.current.src = url;
        
        // Cleanup once iframe loads
        iframeRef.current.onload = () => {
          setLoading(false);
          // Free memory by revoking the blob URL
          URL.revokeObjectURL(url);
        };
        
        // Handle iframe errors
        iframeRef.current.onerror = (e) => {
          setError('Failed to load preview');
          setLoading(false);
          console.error('Iframe error:', e);
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

  return (
    <div className={`h-full overflow-auto ${className}`}>
      <div className="p-4 h-full flex flex-col">
        <h2 className="text-xl font-bold mb-4">Live App Preview</h2>
        
        {/* Preview container */}
        <div className="flex-1 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
          {/* Loading state */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
          
          {/* Error state */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-700">
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-500 mb-2">Preview Error</h3>
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}
          
          {/* The actual iframe where the app will run */}
          <iframe
            ref={iframeRef}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-popups allow-forms allow-modals allow-same-origin"
            title="App Preview"
          />
        </div>
        
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          This preview runs your actual React code with limited functionality for security reasons.
        </div>
      </div>
    </div>
  );
};

export { RuntimePreview };