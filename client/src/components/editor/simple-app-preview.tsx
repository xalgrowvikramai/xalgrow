import React from 'react';
import { useProject } from '@/contexts/project-context';
import { ProjectFile } from '@/types';

interface SimpleAppPreviewProps {
  className?: string;
}

interface UiComponent {
  type: string;
  name: string;
  props: Record<string, any>;
  children: UiComponent[];
}

/**
 * A simple preview component for generated applications that shows actual UI elements
 */
const SimpleAppPreview: React.FC<SimpleAppPreviewProps> = ({ className = '' }) => {
  const { currentProject, projectFiles } = useProject();
  const [error, setError] = React.useState<string | null>(null);
  const [uiTree, setUiTree] = React.useState<UiComponent[]>([]);
  const [appStructure, setAppStructure] = React.useState<Record<string, any>>({});
  const [cssStyles, setCssStyles] = React.useState<string>('');

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

  // Parse JSX to extract UI components
  const parseComponentTree = (content: string): UiComponent[] => {
    try {
      // Clean the content first
      const cleanedContent = cleanContent(content);
      
      // Get the returned JSX from the component
      const returnMatch = cleanedContent.match(/return\s*\(\s*([\s\S]*?)\s*\)\s*;/);
      if (!returnMatch || !returnMatch[1]) return [];
      
      const jsxContent = returnMatch[1];
      
      // Find the top-level components
      const components: UiComponent[] = [];
      
      // Parse for specific UI patterns
      
      // Pattern for Nav/Header components
      const headerMatch = jsxContent.match(/<(Header|Nav|Navbar)[^>]*>([\s\S]*?)<\/(Header|Nav|Navbar)>/i);
      if (headerMatch) {
        components.push({
          type: 'header',
          name: headerMatch[1],
          props: {},
          children: []
        });
      }
      
      // Pattern for main content area
      const mainMatch = jsxContent.match(/<(main|div|section)[^>]*className="[^"]*main[^"]*"[^>]*>([\s\S]*?)<\/(main|div|section)>/i);
      if (mainMatch) {
        components.push({
          type: 'main',
          name: mainMatch[1],
          props: { className: 'main-content' },
          children: []
        });
      }
      
      // Pattern for footer
      const footerMatch = jsxContent.match(/<(Footer|footer)[^>]*>([\s\S]*?)<\/(Footer|footer)>/i);
      if (footerMatch) {
        components.push({
          type: 'footer',
          name: footerMatch[1],
          props: {},
          children: []
        });
      }
      
      // If no specific components found, create a generic one
      if (components.length === 0) {
        components.push({
          type: 'container',
          name: 'div',
          props: { className: 'container' },
          children: []
        });
      }
      
      return components;
      
    } catch (err) {
      console.error('Error parsing component tree:', err);
      return [];
    }
  };
  
  // Extract color scheme from CSS
  const extractColorScheme = (css: string): { 
    primary: string, 
    secondary: string, 
    background: string, 
    text: string 
  } => {
    const defaultColors = {
      primary: '#3b82f6', // blue-500
      secondary: '#10b981', // green-500
      background: '#ffffff',
      text: '#333333'
    };
    
    try {
      const colorMatches = {
        primary: css.match(/--(?:primary|main|brand|accent)(?:-color)?:\s*(#[0-9a-f]{3,8}|rgba?\([^)]+\))/i),
        secondary: css.match(/--(?:secondary|second)(?:-color)?:\s*(#[0-9a-f]{3,8}|rgba?\([^)]+\))/i),
        background: css.match(/--(?:background|bg)(?:-color)?:\s*(#[0-9a-f]{3,8}|rgba?\([^)]+\))/i),
        text: css.match(/--(?:text|font)(?:-color)?:\s*(#[0-9a-f]{3,8}|rgba?\([^)]+\))/i)
      };
      
      return {
        primary: colorMatches.primary?.[1] || defaultColors.primary,
        secondary: colorMatches.secondary?.[1] || defaultColors.secondary,
        background: colorMatches.background?.[1] || defaultColors.background,
        text: colorMatches.text?.[1] || defaultColors.text
      };
    } catch (err) {
      console.error('Error extracting color scheme:', err);
      return defaultColors;
    }
  };
  
  // Extract layout information
  const analyzeAppStructure = () => {
    try {
      // Get info from component files
      const componentTypes = componentFiles.map(file => {
        const name = file.name.replace('.jsx', '').replace('.js', '');
        const content = cleanContent(file.content);
        
        // Try to determine component type
        let type = 'unknown';
        if (/nav|header|menu/i.test(name)) {
          type = 'navigation';
        } else if (/card|item|product|post/i.test(name)) {
          type = 'item';
        } else if (/list|grid|results/i.test(name)) {
          type = 'list';
        } else if (/form|input|search/i.test(name)) {
          type = 'form';
        } else if (/footer/i.test(name)) {
          type = 'footer';
        } else if (/detail|page|view/i.test(name)) {
          type = 'page';
        } else if (/button|btn/i.test(name)) {
          type = 'button';
        }
        
        // Check content for clues
        if (content) {
          if (/<form/i.test(content)) type = 'form';
          if (/<input|<textarea|<select/i.test(content)) type = 'input';
          if (/<button/i.test(content)) type = 'button';
          if (/<img/i.test(content)) type = 'media';
          if (/<ul|<li|<ol|array\.map/i.test(content)) type = 'list';
          if (/<table|<tr|<td/i.test(content)) type = 'table';
        }
        
        return { name, type };
      });
      
      // Count component types
      const typeCounts = componentTypes.reduce((acc, { type }) => {
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Determine app type
      let appType = 'generic';
      if (typeCounts['item'] > 0 && typeCounts['list'] > 0) {
        appType = 'listing';
      }
      if (typeCounts['form'] > 1) {
        appType = 'form-based';
      }
      
      // Build app structure
      setAppStructure({
        appType,
        hasNavigation: typeCounts['navigation'] > 0,
        hasFooter: typeCounts['footer'] > 0,
        hasForms: typeCounts['form'] > 0,
        hasLists: typeCounts['list'] > 0,
        componentTypes: componentTypes,
        typeCounts
      });
      
    } catch (err) {
      console.error('Error analyzing app structure:', err);
    }
  };

  // Call API to clean code blocks and process app structure
  React.useEffect(() => {
    if (!currentProject || !projectFiles.length) return;
    
    // Clean files if needed
    const filesToClean = projectFiles.filter(f => f.content.startsWith('```'));
    if (filesToClean.length > 0) {
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
    
    // Combine CSS styles
    const combinedCSS = cssFiles.map(file => cleanContent(file.content)).join('\n');
    setCssStyles(combinedCSS);
    
    // Parse app UI structure
    if (appFile) {
      const tree = parseComponentTree(appFile.content);
      setUiTree(tree);
    }
    
    // Analyze overall app structure
    analyzeAppStructure();
    
  }, [currentProject, projectFiles, appFile, componentFiles, cssFiles]);

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
  
  // Extract colors from CSS
  const colors = extractColorScheme(cssStyles);
  
  // Generate a more accurate app preview based on the structure
  const renderVisualPreview = () => {
    const hasNavbar = appStructure.hasNavigation;
    const hasFooter = appStructure.hasFooter;
    const appType = appStructure.appType || 'generic';
    
    // Inline styles for preview elements based on extracted colors
    const styles = {
      primaryBg: { backgroundColor: colors.primary },
      primaryText: { color: colors.primary },
      secondaryBg: { backgroundColor: colors.secondary },
      secondaryText: { color: colors.secondary },
      mainBg: { backgroundColor: colors.background },
      mainText: { color: colors.text }
    };
    
    return (
      <div className="browser-frame w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700" 
           style={{ ...styles.mainBg, ...styles.mainText }}>
        {/* Browser chrome */}
        <div className="browser-chrome flex items-center p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
          <div className="flex gap-1.5 mr-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="flex-1 text-center">
            <div className="px-4 py-1 mx-auto rounded-full bg-white dark:bg-gray-700 text-xs text-gray-800 dark:text-gray-200 max-w-xs truncate">
              {currentProject.name} - Live Preview
            </div>
          </div>
        </div>
        
        {/* App content */}
        <div className="browser-content" style={{ minHeight: '400px' }}>
          {/* Navbar if app has one */}
          {hasNavbar && (
            <div className="app-navbar p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700" 
                 style={styles.primaryBg}>
              <div className="text-white font-bold text-lg">{currentProject.name}</div>
              <div className="flex gap-4">
                {['Home', 'About', 'Contact'].map((item, i) => (
                  <div key={i} className="text-white hover:underline cursor-pointer">{item}</div>
                ))}
              </div>
            </div>
          )}
          
          {/* Main content area based on app type */}
          <div className="app-main p-4">
            {appType === 'listing' && (
              <>
                <div className="mb-4">
                  <div className="text-2xl font-bold mb-3">{currentProject.name.split(' ')[0]} Listings</div>
                  <div className="flex items-center mb-4">
                    <div className="flex-1 mr-2 p-2 border rounded-md" style={{ borderColor: colors.primary }}>
                      <input type="text" placeholder="Search..." className="w-full bg-transparent outline-none" />
                    </div>
                    <button className="px-4 py-2 rounded-md text-white" style={styles.primaryBg}>Search</button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="border rounded-lg overflow-hidden shadow-sm" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
                        <div className="h-40 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <div className="text-gray-400 dark:text-gray-500">Image {i+1}</div>
                        </div>
                        <div className="p-3">
                          <div className="font-bold mb-1">Item {i+1}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Description text</div>
                          <div className="flex justify-between items-center">
                            <div className="font-medium" style={styles.primaryText}>$19.99</div>
                            <button className="px-2 py-1 text-xs rounded text-white" style={styles.secondaryBg}>Add to Cart</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
            
            {appType === 'form-based' && (
              <div className="max-w-md mx-auto p-4 border rounded-lg shadow-sm">
                <h2 className="text-xl font-bold mb-4" style={styles.primaryText}>User Login</h2>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input type="text" 
                         className="w-full p-2 border rounded-md outline-none focus:ring-2" 
                         style={{ borderColor: colors.primary, outlineColor: colors.primary }} />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input type="password" 
                         className="w-full p-2 border rounded-md outline-none focus:ring-2" 
                         style={{ borderColor: colors.primary, outlineColor: colors.primary }} />
                </div>
                <button className="w-full py-2 rounded-md text-white" style={styles.primaryBg}>Sign In</button>
              </div>
            )}
            
            {appType === 'generic' && (
              <div className="flex flex-col items-center mb-8">
                <h1 className="text-3xl font-bold mb-4" style={styles.primaryText}>{currentProject.name}</h1>
                <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                  {currentProject.description || 'Welcome to our application.'}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} 
                         className="p-4 rounded-lg shadow-sm border" 
                         style={{ borderColor: i === 0 ? colors.primary : i === 1 ? colors.secondary : '#ccc' }}>
                      <div className="text-lg font-medium mb-2" 
                           style={{ color: i === 0 ? colors.primary : i === 1 ? colors.secondary : colors.text }}>
                        Feature {i+1}
                      </div>
                      <div className="text-sm">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Footer if app has one */}
          {hasFooter && (
            <div className="app-footer p-4 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-600 dark:text-gray-400">
              &copy; {new Date().getFullYear()} {currentProject.name} - All rights reserved.
            </div>
          )}
        </div>
      </div>
    );
  };

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
              
              <div className="bg-white dark:bg-gray-900 overflow-auto p-4">
                {renderVisualPreview()}
                
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
                  Static preview based on app structure - interactive features disabled
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
            <h3 className="text-lg font-medium mb-2">Project Structure: {appStructure.appType || 'Generic'} App</h3>
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