import React, { useState, useEffect, useMemo } from 'react';
import { useProject } from '@/contexts/project-context';
import { ProjectFile } from '@/types';
import { FacebookAppPreview } from './facebook-app-preview';
import { InteractiveAppPreview } from './interactive-app-preview';
import { PhotoGalleryPreview } from './photo-gallery-preview';

interface DynamicAppPreviewProps {
  className?: string;
}

/**
 * A component that dynamically renders the actual project files
 * This is the core preview component for the Xalgrow app
 */
const DynamicAppPreview: React.FC<DynamicAppPreviewProps> = ({ className = '' }) => {
  const { currentProject, projectFiles } = useProject();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // We'll use this to consolidate all the JS/JSX code for rendering
  const [renderedComponent, setRenderedComponent] = useState<React.ReactNode | null>(null);
  
  // Get all the components that should be included in our runtime
  const jsxFiles = useMemo(() => {
    if (!projectFiles || projectFiles.length === 0) return [];
    
    // Get all code files for rendering
    const files = projectFiles.filter(file => 
      file.name.endsWith('.jsx') || 
      file.name.endsWith('.tsx') || 
      file.name.endsWith('.js') || 
      file.name.endsWith('.ts')
    );
    
    // Debug log to see what files we have
    console.log('JSX Files for rendering:', 
      files.map(f => `${f.path}/${f.name}`));
    
    return files;
  }, [projectFiles]);
  
  // Get all CSS files for styling
  const cssFiles = useMemo(() => {
    if (!projectFiles || projectFiles.length === 0) return [];
    
    return projectFiles.filter(file => 
      file.name.endsWith('.css')
    );
  }, [projectFiles]);
  
  // Function to safely attempt to render the component
  const renderDynamicComponent = () => {
    // If no files, render fallback based on project description
    if (jsxFiles.length === 0) {
      return renderFallbackPreview();
    }
    
    try {
      // Find the main entry component (usually App.jsx)
      const appFile = jsxFiles.find(file => 
        file.name.toLowerCase() === 'app.jsx' || 
        file.name.toLowerCase() === 'app.js'
      );
      
      if (!appFile) {
        // If no App.jsx found, try to use any other JSX file
        if (jsxFiles.length > 0) {
          return (
            <div className="p-4">
              <h2 className="text-xl font-bold mb-4">Generated Project Files:</h2>
              <div className="space-y-2">
                {projectFiles.map((file, index) => (
                  <div key={index} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
                    <div className="font-mono text-sm text-gray-800 dark:text-gray-200">
                      {file.path}/{file.name}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border border-yellow-200 dark:border-yellow-700">
                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-500 mb-2">Preview Not Available</h3>
                <p className="text-yellow-700 dark:text-yellow-400">
                  No main App component found to render. Please go to the Code view to see the generated files.
                </p>
              </div>
            </div>
          );
        }
        
        return renderFallbackPreview();
      }
      
      // Process any cleanup needed on the app file content
      let processedAppContent = appFile.content;
      
      // Clean up markdown code blocks if necessary
      if (processedAppContent.startsWith('```')) {
        console.log('App file has markdown code blocks that need cleaning');
        
        // Extract content between code block markers
        const codeBlockRegex = /```(?:jsx|js|tsx|ts|html|css)?\n([\s\S]*?)```$/;
        const match = processedAppContent.match(codeBlockRegex);
        
        if (match && match[1]) {
          console.log('Successfully cleaned markdown code blocks locally');
          processedAppContent = match[1];
        } else {
          // If no match, try removing just the markers
          processedAppContent = processedAppContent
            .replace(/^```(?:jsx|js|tsx|ts|html|css)?\n/, '')
            .replace(/```$/, '');
          console.log('Cleaned using simple regex replacement');
        }
        
        // Also trigger server cleanup for future renders
        fetch(`/api/projects/${currentProject?.id}/clean-files`, {
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
      
      // Get all component files to include in the sandbox
      const componentFiles = jsxFiles.filter(file => file.id !== appFile.id);
      
      // Get all CSS content
      const cssContent = cssFiles.map(file => file.content).join('\n');
      
      // Create a sandbox iframe to run the React code
      const iframeSrcDoc = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>App Preview</title>
            <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
            <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
            <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
            <style>
              body {
                font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                margin: 0;
                padding: 0;
              }
              
              /* Include all project CSS */
              ${cssContent}
            </style>
          </head>
          <body>
            <div id="root"></div>
            
            <script type="text/babel">
              // Component imports would normally go here
              
              // Include any supporting component files
              ${componentFiles.map(file => `
                // ${file.path}/${file.name}
                ${file.content.startsWith('```') 
                  ? file.content.replace(/^```(?:jsx|js|tsx|ts|html|css)?\n/, '').replace(/```$/, '')
                  : file.content}
              `).join('\n\n')}
              
              // Main App component
              ${processedAppContent}
              
              // Render the app
              try {
                const rootElement = document.getElementById('root');
                const root = ReactDOM.createRoot(rootElement);
                root.render(React.createElement(App));
                console.log('Successfully rendered the app!');
              } catch (err) {
                console.error('Error rendering React app:', err);
                document.getElementById('root').innerHTML = 
                  '<div style="color: red; padding: 20px; border: 1px solid red;">' +
                  '<h3>Error Rendering App</h3>' +
                  '<p>' + err.message + '</p>' +
                  '</div>';
              }
            </script>
          </body>
        </html>
      `;
      
      // Return the component with the sandbox iframe
      return (
        <div className="p-4 h-full flex flex-col">
          <h2 className="text-xl font-bold mb-4">Generated App Preview</h2>
          
          <div className="flex-1 border border-gray-200 dark:border-gray-700 rounded-lg mb-4 overflow-hidden">
            <iframe
              title="App Preview"
              sandbox="allow-scripts"
              className="w-full h-full border-0 bg-white dark:bg-gray-50"
              srcDoc={iframeSrcDoc}
            />
          </div>
          
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Project Structure:</h3>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {projectFiles.map((file, index) => (
                <div key={index} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-md font-mono text-sm flex justify-between">
                  <span className="truncate">{file.path}/{file.name}</span>
                  <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">{file.content.length} bytes</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    } catch (err: any) {
      console.error('Error rendering dynamic component:', err);
      setError(err.message || 'Failed to render component');
      return (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-700">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-500 mb-2">Rendering Error</h3>
          <p className="text-red-700 dark:text-red-400">{err.message || 'An error occurred while rendering the preview'}</p>
          <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-900 text-xs overflow-auto rounded">
            {err.stack || 'No stack trace available'}
          </pre>
        </div>
      );
    }
  };
  
  // Helper function to convert React component content to regular HTML
  const transformAppContentToHTML = (content: string): string => {
    try {
      // Clean up markdown code blocks if they exist
      let cleanContent = content;
      
      // Log the start of the content for debugging
      console.log("Content start:", content.substring(0, 30));
      
      // First check if the content has markdown code blocks
      if (content.startsWith('```')) {
        console.log("Content has code block markers");
        
        // Extract content between code block markers
        const codeBlockRegex = /```(?:jsx|js|tsx|ts|html|css)?\n([\s\S]*?)```$/;
        const match = content.match(codeBlockRegex);
        
        if (match && match[1]) {
          cleanContent = match[1];
          console.log("Successfully cleaned content from code blocks");
        } else {
          // If no match, try removing just the markers
          cleanContent = content.replace(/^```(?:jsx|js|tsx|ts|html|css)?\n/, '').replace(/```$/, '');
          console.log("Cleaned content using regex replacement");
        }
      }
      
      // Extract JSX from content - anything between return ( and );
      const returnRegex = /return\s*\(\s*([\s\S]*?)\s*\)\s*;/;
      const match = cleanContent.match(returnRegex);
      
      if (!match || !match[1]) {
        // If no return statement found, try to display the content as is
        const simpleContent = cleanContent
          .replace(/import[\s\S]*?from\s+['"].*?['"]\s*;/g, '') // Remove imports
          .replace(/export\s+default\s+\w+\s*;?/g, '') // Remove exports
          .replace(/const\s+\w+\s*=\s*\(\s*\)\s*=>\s*{/g, '') // Remove function declarations
          .replace(/};?\s*$/g, ''); // Remove closing braces
        
        return `<div class="p-4 bg-white dark:bg-gray-800 rounded-lg">
          <h3 class="text-lg font-medium mb-3">File Content Preview</h3>
          <pre class="bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-auto text-sm">${
            simpleContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')
          }</pre>
        </div>`;
      }
      
      let jsx = match[1];
      
      // Basic transformations to convert JSX to HTML
      // Convert className to class
      jsx = jsx.replace(/className=/g, 'class=');
      
      // Handle JSX self-closing tags
      jsx = jsx.replace(/\/>/g, '></div>');
      
      // Replace dynamic content with placeholders
      jsx = jsx.replace(/\{isLoading.*?\}/g, '');
      jsx = jsx.replace(/\{items\.map\(.*?\}\)}/g, '<div class="sample-item">Sample Item</div>');
      jsx = jsx.replace(/\{.*?\.map\(.*?\}\)}/g, '<div class="sample-item">Sample Item</div>');
      
      // More specific placeholders for common patterns
      jsx = jsx.replace(/\{currentProject\.name\}/g, 'Project Name');
      jsx = jsx.replace(/\{description\}/g, 'Description');
      jsx = jsx.replace(/\{project\.name\}/g, 'Project Name');
      jsx = jsx.replace(/\{project\.description\}/g, 'Project Description');
      
      // Replace remaining {} expressions with placeholders
      jsx = jsx.replace(/\{([^}]+)\}/g, '');
      
      // Remove React-specific props
      jsx = jsx.replace(/onClick={[^}]+}/g, '');
      jsx = jsx.replace(/onChange={[^}]+}/g, '');
      jsx = jsx.replace(/onSubmit={[^}]+}/g, '');
      jsx = jsx.replace(/key={[^}]+}/g, '');
      
      // Convert JSX comments
      jsx = jsx.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
      
      // Remove other React/JSX specific syntax
      jsx = jsx.replace(/<>/g, '<div class="fragment">');
      jsx = jsx.replace(/<\/>/g, '</div>');
      
      // Clean up any double quotes or single quotes
      jsx = jsx.replace(/(\w+)=["']([^"']+)["']/g, '$1="$2"');
      
      return `<div class="p-4 bg-white dark:bg-gray-800 rounded-lg">${jsx}</div>`;
    } catch (err) {
      console.error('Error transforming JSX to HTML:', err);
      return `<div class="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg">
        <h3 class="text-lg font-medium text-red-600 dark:text-red-400 mb-2">Error parsing component</h3>
        <p>The component could not be rendered. Please check the code editor to view the raw content.</p>
      </div>`;
    }
  };
  
  // Fallback preview based on project description
  const renderFallbackPreview = () => {
    if (!currentProject || !currentProject.description) {
      return <InteractiveAppPreview className={className} />;
    }
    
    const description = currentProject.description.toLowerCase();
    
    // Detect app type from description for fallback
    if (description.includes('facebook') || description.includes('social')) {
      return <FacebookAppPreview className={className} />;
    } else if (description.includes('gallery') || description.includes('photo') || description.includes('image')) {
      return <PhotoGalleryPreview className={className} />;
    } else {
      return <InteractiveAppPreview className={className} />;
    }
  };
  
  useEffect(() => {
    // Attempt to render the component whenever files change
    const component = renderDynamicComponent();
    setRenderedComponent(component);
    
    // Cleanup function to remove any injected styles
    return () => {
      cssFiles.forEach(cssFile => {
        const styleElement = document.getElementById(`dynamic-style-${cssFile.id}`);
        if (styleElement) {
          styleElement.remove();
        }
      });
    };
  }, [projectFiles, currentProject]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className={`h-full overflow-auto ${className}`}>
      {error ? (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-700">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-500 mb-2">Preview Error</h3>
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      ) : renderedComponent}
    </div>
  );
};

export { DynamicAppPreview };