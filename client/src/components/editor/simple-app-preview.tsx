import React from 'react';
import { useProject } from '@/contexts/project-context';
import { ProjectFile } from '@/types';

interface SimpleAppPreviewProps {
  className?: string;
}

/**
 * A simple preview component for generated applications that doesn't rely on complex rendering
 */
const SimpleAppPreview: React.FC<SimpleAppPreviewProps> = ({ className = '' }) => {
  const { currentProject, projectFiles } = useProject();
  const [error, setError] = React.useState<string | null>(null);

  // Get all the JS/JSX files
  const jsxFiles = React.useMemo(() => {
    if (!projectFiles || projectFiles.length === 0) return [];
    
    // Get all code files for rendering
    return projectFiles.filter(file => 
      file.name.endsWith('.jsx') || 
      file.name.endsWith('.tsx') || 
      file.name.endsWith('.js') || 
      file.name.endsWith('.ts')
    );
  }, [projectFiles]);
  
  // Get all CSS files for styling
  const cssFiles = React.useMemo(() => {
    if (!projectFiles || projectFiles.length === 0) return [];
    
    return projectFiles.filter(file => 
      file.name.endsWith('.css')
    );
  }, [projectFiles]);

  // Find the main App component if it exists
  const appFile = React.useMemo(() => {
    return jsxFiles.find(file => 
      file.name.toLowerCase() === 'app.jsx' || 
      file.name.toLowerCase() === 'app.js'
    );
  }, [jsxFiles]);

  // Get a list of component files (excluding the main app file)
  const componentFiles = React.useMemo(() => {
    if (!appFile) return jsxFiles;
    return jsxFiles.filter(file => file.id !== appFile.id);
  }, [jsxFiles, appFile]);

  // Clean file content if it contains markdown code blocks
  const cleanContent = (content: string): string => {
    if (!content.startsWith('```')) return content;
    
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

  // Call API to clean code blocks for future renders
  React.useEffect(() => {
    if (!currentProject || !appFile) return;
    
    if (appFile.content.startsWith('```')) {
      console.log('App file has markdown code blocks that need cleaning');
      
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
  }, [currentProject, appFile]);

  // If no project or files, show a message
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
      {error ? (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-700">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-500 mb-2">Preview Error</h3>
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      ) : (
        <div className="p-4 h-full flex flex-col">
          <h2 className="text-xl font-bold mb-4">Generated App Preview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 mb-4">
            {/* Visual Preview Panel */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 font-medium text-sm">
                Visual Preview
              </div>
              
              <div className="bg-white dark:bg-gray-900 overflow-auto">
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                  <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
                    {currentProject.name} Preview
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {/* Generic preview cards */}
                    <div className="p-4 border rounded-lg shadow-sm bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                      <div className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">Component 1</div>
                      <div className="h-24 bg-blue-100 dark:bg-blue-800/20 rounded flex items-center justify-center">
                        <span className="text-blue-500 dark:text-blue-300">Content Area</span>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg shadow-sm bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                      <div className="text-lg font-medium text-green-800 dark:text-green-300 mb-2">Component 2</div>
                      <div className="h-24 bg-green-100 dark:bg-green-800/20 rounded flex items-center justify-center">
                        <span className="text-green-500 dark:text-green-300">Content Area</span>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg shadow-sm bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                      <div className="text-lg font-medium text-purple-800 dark:text-purple-300 mb-2">Component 3</div>
                      <div className="h-24 bg-purple-100 dark:bg-purple-800/20 rounded flex items-center justify-center">
                        <span className="text-purple-500 dark:text-purple-300">Content Area</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">App Components</div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {componentFiles.slice(0, 5).map((file, index) => (
                        <div key={index} className="px-3 py-1 bg-gray-200 dark:bg-gray-600 rounded-full text-xs">
                          {file.name.replace('.jsx', '').replace('.js', '')}
                        </div>
                      ))}
                      {componentFiles.length > 5 && (
                        <div className="px-3 py-1 bg-gray-200 dark:bg-gray-600 rounded-full text-xs">
                          +{componentFiles.length - 5} more
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-6">
                    Static preview - interactive features disabled
                  </div>
                </div>
              </div>
            </div>
            
            {/* Code Preview Panel */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 font-medium text-sm">
                Code View
              </div>
              
              <div className="h-[500px] overflow-hidden">
                {appFile ? (
                  <div className="bg-gray-900 rounded-lg overflow-hidden h-full">
                    <div className="p-4 border-b border-gray-800">
                      <div className="font-mono text-sm text-gray-300">
                        {appFile.path}/{appFile.name}
                      </div>
                    </div>
                    
                    <div className="p-4 overflow-auto h-[500px] font-mono text-sm text-gray-300" style={{ whiteSpace: 'pre-wrap' }}>
                      {cleanContent(appFile.content).split('\n').map((line, index) => (
                        <div key={index} className="py-1 pl-2 border-l-2 border-transparent hover:border-gray-700 hover:bg-gray-800">
                          {line}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-900 text-gray-400">
                    No main App file found
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Project Structure:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
              {projectFiles.map((file, index) => (
                <div key={index} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-md font-mono text-sm flex justify-between">
                  <span className="truncate">{file.path}/{file.name}</span>
                  <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">{file.content.length} bytes</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { SimpleAppPreview };