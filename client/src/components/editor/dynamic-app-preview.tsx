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
    
    return projectFiles.filter(file => 
      file.name.endsWith('.jsx') || 
      file.name.endsWith('.tsx') || 
      file.name.endsWith('.js') || 
      file.name.endsWith('.ts')
    );
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
      
      // Inject any CSS into the document
      if (cssFiles.length > 0) {
        cssFiles.forEach(cssFile => {
          try {
            // Create style element for each CSS file
            const styleElement = document.createElement('style');
            styleElement.textContent = cssFile.content;
            styleElement.id = `dynamic-style-${cssFile.id}`;
            
            // Remove any existing style with the same ID
            const existingStyle = document.getElementById(`dynamic-style-${cssFile.id}`);
            if (existingStyle) {
              existingStyle.remove();
            }
            
            // Add to document head
            document.head.appendChild(styleElement);
          } catch (err) {
            console.error('Error injecting CSS:', err);
          }
        });
      }
      
      // Create a basic wrapper component that displays the file list and code structure
      return (
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Generated App Preview</h2>
          
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg mb-4 bg-white dark:bg-gray-800">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
              <h3 className="font-medium text-gray-800 dark:text-gray-200">App Content:</h3>
            </div>
            
            <div className="prose dark:prose-invert max-w-none">
              {/* Simplified preview of the generated app content */}
              <div dangerouslySetInnerHTML={{ __html: transformAppContentToHTML(appFile.content) }} />
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Project Structure:</h3>
            <div className="space-y-1">
              {projectFiles.map((file, index) => (
                <div key={index} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-md font-mono text-sm">
                  {file.path}/{file.name}
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
        </div>
      );
    }
  };
  
  // Helper function to convert React component content to regular HTML
  const transformAppContentToHTML = (content: string): string => {
    try {
      // Extract JSX from content - anything between return ( and );
      const returnRegex = /return\s*\(\s*([\s\S]*?)\s*\)\s*;/;
      const match = content.match(returnRegex);
      
      if (!match || !match[1]) {
        return '<p>No renderable content found</p>';
      }
      
      let jsx = match[1];
      
      // Basic transformations to convert JSX to HTML
      // Convert className to class
      jsx = jsx.replace(/className=/g, 'class=');
      
      // Handle JSX self-closing tags
      jsx = jsx.replace(/\/>/g, '></div>');
      
      // Replace {} expressions with placeholders
      jsx = jsx.replace(/\{([^}]+)\}/g, '...');
      
      // Remove React-specific props
      jsx = jsx.replace(/onClick={[^}]+}/g, '');
      jsx = jsx.replace(/onChange={[^}]+}/g, '');
      jsx = jsx.replace(/onSubmit={[^}]+}/g, '');
      
      return jsx;
    } catch (err) {
      console.error('Error transforming JSX to HTML:', err);
      return '<p>Error parsing component content</p>';
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