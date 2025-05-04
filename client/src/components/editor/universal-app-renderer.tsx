import React, { useState, useEffect, useCallback } from 'react';
import { appRuntime, initRuntime } from '@/lib/app-runtime';
import { useEditor } from '@/contexts/editor-context';
import { useProject } from '@/contexts/project-context';

interface UniversalAppRendererProps {
  className?: string;
}

/**
 * A component that can render any type of React application by analyzing its code
 * and providing a runtime environment for execution.
 */
const UniversalAppRenderer: React.FC<UniversalAppRendererProps> = ({ className = '' }) => {
  const { projectFiles, currentProject } = useProject();
  const { activeFile, activeFileContent } = useEditor();
  const [error, setError] = useState<string | null>(null);
  const [cssContent, setCssContent] = useState<string>('');
  const [appCode, setAppCode] = useState<string>('');
  const [appComponent, setAppComponent] = useState<React.ReactNode | null>(null);
  const [componentProps, setComponentProps] = useState<Record<string, any>>({});

  // Initialize the runtime environment
  useEffect(() => {
    initRuntime();
    
    // Register state update function
    appRuntime.registerFunction('setComponentProps', setComponentProps);
    
    // Setup some demo data
    appRuntime.registerData('todos', [
      { id: 1, text: 'Learn React', completed: false },
      { id: 2, text: 'Build an app', completed: false },
      { id: 3, text: 'Deploy to production', completed: false }
    ]);

    appRuntime.registerData('products', [
      { id: 1, name: 'Premium Headphones', price: 129.99, category: 'Electronics', stock: 24 },
      { id: 2, name: 'Wireless Keyboard', price: 59.99, category: 'Accessories', stock: 15 },
      { id: 3, name: 'Designer T-Shirt', price: 29.99, category: 'Clothing', stock: 36 },
      { id: 4, name: 'Yoga Mat', price: 24.99, category: 'Fitness', stock: 18 }
    ]);

    appRuntime.registerData('users', [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
      { id: 3, name: 'Robert Johnson', email: 'robert@example.com' }
    ]);
    
    // Register common UI event handlers
    appRuntime.registerFunction('handleClick', (e: React.MouseEvent) => {
      console.log('Element clicked:', e.currentTarget);
      setComponentProps(prev => ({ ...prev, clicked: true }));
    });
    
    appRuntime.registerFunction('handleInputChange', (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setComponentProps(prev => ({ ...prev, [name]: value }));
    });
    
    appRuntime.registerFunction('handleSubmit', (e: React.FormEvent) => {
      e.preventDefault();
      console.log('Form submitted with data:', componentProps);
      setComponentProps(prev => ({ ...prev, submitted: true }));
    });
    
    // Register navigation functions
    appRuntime.registerFunction('navigate', (route: string) => {
      console.log('Navigation requested to:', route);
      setComponentProps(prev => ({ ...prev, currentRoute: route }));
    });
    
    // Initialize component props
    setComponentProps({
      currentRoute: '/',
      isLoggedIn: true,
      user: { id: 1, name: 'User', email: 'user@example.com' },
      count: 0,
      increment: () => setComponentProps(prev => ({ ...prev, count: prev.count + 1 })),
      decrement: () => setComponentProps(prev => ({ ...prev, count: prev.count - 1 })),
      theme: 'light',
      toggleTheme: () => setComponentProps(prev => ({ 
        ...prev, 
        theme: prev.theme === 'light' ? 'dark' : 'light' 
      })),
    });
    
  }, []);

  // Extract and combine all CSS files
  useEffect(() => {
    if (!projectFiles) return;
    
    // Look for CSS files
    const cssFiles = projectFiles.filter(file => file.name.endsWith('.css'));
    if (cssFiles.length > 0) {
      const combinedCss = cssFiles.map(file => file.content).join('\n');
      setCssContent(combinedCss);
    }
  }, [projectFiles]);

  // Find App component or main component file
  useEffect(() => {
    if (!projectFiles || projectFiles.length === 0) return;
    
    // Look for App.jsx, App.js, or index.jsx, index.js
    const appFile = projectFiles.find(file => 
      file.name === 'App.jsx' || 
      file.name === 'App.js' || 
      file.name === 'index.jsx' || 
      file.name === 'index.js'
    );
    
    if (appFile) {
      setAppCode(appFile.content);
    } else if (activeFile && (activeFile.name.endsWith('.jsx') || activeFile.name.endsWith('.js'))) {
      // If no App file found, use the active file if it's a JS/JSX file
      setAppCode(activeFileContent);
    }
  }, [projectFiles, activeFile, activeFileContent]);

  // Parse app code and render components
  const renderApp = useCallback(() => {
    if (!appCode) return null;
    
    try {
      setError(null);
      
      // Try to extract the component code
      const componentRegex = /function\s+(\w+)\s*\([^)]*\)\s*{|const\s+(\w+)\s*=\s*\([^)]*\)\s*=>/;
      const match = appCode.match(componentRegex);
      
      let componentName = '';
      if (match) {
        componentName = match[1] || match[2];
      }
      
      // Create a component function that renders the app
      const createComponentFn = `
        (function(React, componentProps) {
          const { useState, useEffect, useCallback, useMemo } = React;
          
          // Setup context for common app state
          const AppContext = React.createContext(componentProps);
          const useAppContext = () => React.useContext(AppContext);
          
          ${appCode}
          
          ${componentName ? `
          // Wrap component with context provider
          return function AppWrapper(props) {
            return (
              <AppContext.Provider value={componentProps}>
                <${componentName} {...props} />
              </AppContext.Provider>
            );
          }
          ` : `
          // If no component found, just render a div
          return function DefaultComponent(props) {
            return (
              <div>No valid React component found in code</div>
            );
          }
          `}
        })
      `;
      
      // Evaluate the component creation function
      const ComponentFn = appRuntime.evalCode(createComponentFn)(React, componentProps);
      setAppComponent(<ComponentFn />);
      
    } catch (err) {
      console.error('Error rendering app:', err);
      setError('Failed to render component: ' + (err instanceof Error ? err.message : String(err)));
      setAppComponent(null);
    }
  }, [appCode, componentProps]);

  // Render the app whenever the code changes
  useEffect(() => {
    renderApp();
  }, [renderApp, appCode]);

  // Provide fallback UI
  const FallbackUI = () => {
    const styles = {
      todoItem: {
        display: 'flex',
        alignItems: 'center',
        padding: '8px 0',
        borderBottom: '1px solid #eee',
      },
      checkbox: {
        marginRight: '12px',
      },
      button: {
        marginLeft: 'auto',
        background: 'none',
        border: 'none',
        color: '#ff5555',
        cursor: 'pointer',
        fontSize: '14px',
      },
      form: {
        display: 'flex',
        marginTop: '20px',
      },
      input: {
        flex: 1,
        padding: '8px 12px',
        border: '1px solid #ddd',
        borderRadius: '4px 0 0 4px',
      },
      addButton: {
        padding: '8px 16px',
        background: '#4f90f2',
        color: 'white',
        border: 'none',
        borderRadius: '0 4px 4px 0',
        cursor: 'pointer',
      },
      infoText: {
        marginTop: '16px',
        fontSize: '14px',
        color: '#888',
        textAlign: 'center' as const,
      }
    };

    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>
          {currentProject?.name || 'Interactive Todo App'}
        </h1>
        
        <p style={{ marginBottom: '20px' }}>
          This is a demonstration of a fully functional React app with state management, event handling, and UI updates.
        </p>
        
        <div>
          {componentProps.todos?.map((todo: any, index: number) => (
            <div key={todo.id} style={styles.todoItem}>
              <input 
                type="checkbox" 
                checked={todo.completed} 
                style={styles.checkbox}
                onChange={() => {
                  const newTodos = [...componentProps.todos];
                  newTodos[index].completed = !newTodos[index].completed;
                  setComponentProps(prev => ({ ...prev, todos: newTodos }));
                }}
              />
              <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
                {todo.text}
              </span>
              <button 
                style={styles.button}
                onClick={() => {
                  const newTodos = componentProps.todos.filter((t: any) => t.id !== todo.id);
                  setComponentProps(prev => ({ ...prev, todos: newTodos }));
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
        
        <form 
          style={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            if (!componentProps.newTodo) return;
            
            const newTodo = {
              id: Date.now(),
              text: componentProps.newTodo,
              completed: false
            };
            
            setComponentProps(prev => ({ 
              ...prev, 
              todos: [...prev.todos, newTodo],
              newTodo: ''
            }));
          }}
        >
          <input 
            type="text"
            placeholder="Add a new todo"
            style={styles.input}
            value={componentProps.newTodo || ''}
            onChange={(e) => setComponentProps(prev => ({ ...prev, newTodo: e.target.value }))}
          />
          <button type="submit" style={styles.addButton}>Add</button>
        </form>
        
        <p style={styles.infoText}>
          {componentProps.todos?.filter((t: any) => !t.completed).length || 0} items left to complete
        </p>
      </div>
    );
  };

  return (
    <div className={`bg-white dark:bg-gray-800 h-full overflow-auto ${className}`}>
      {/* Apply any CSS from project files */}
      {cssContent && <style>{cssContent}</style>}
      
      {/* Additional styles for the preview container */}
      <style>{`
        .preview-container {
          padding: 1rem;
          height: 100%;
          overflow: auto;
        }
        
        .error-container {
          padding: 1rem;
          margin: 1rem;
          background-color: #fff5f5;
          border-left: 4px solid #f56565;
          color: #c53030;
        }
      `}</style>
      
      <div className="preview-container">
        {error ? (
          <div className="error-container">
            <h3 className="text-lg font-bold mb-2">Error</h3>
            <pre className="whitespace-pre-wrap">{error}</pre>
          </div>
        ) : appComponent ? (
          // Render the dynamically created component
          appComponent
        ) : (
          // Fallback UI if no component could be created
          <FallbackUI />
        )}
      </div>
    </div>
  );
};

export { UniversalAppRenderer };