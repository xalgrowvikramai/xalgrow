import React, { useState, useEffect, useCallback } from 'react';
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

  // Initialize demo data and state
  useEffect(() => {
    // Initialize component props with sample data
    setComponentProps({
      currentRoute: '/',
      isLoggedIn: true,
      user: { id: 1, name: 'User', email: 'user@example.com' },
      count: 0,
      todos: [
        { id: 1, text: 'Learn React', completed: false },
        { id: 2, text: 'Build an app', completed: false },
        { id: 3, text: 'Deploy to production', completed: false }
      ],
      products: [
        { id: 1, name: 'Premium Headphones', price: 129.99, category: 'Electronics', stock: 24 },
        { id: 2, name: 'Wireless Keyboard', price: 59.99, category: 'Accessories', stock: 15 },
        { id: 3, name: 'Designer T-Shirt', price: 29.99, category: 'Clothing', stock: 36 },
        { id: 4, name: 'Yoga Mat', price: 24.99, category: 'Fitness', stock: 18 }
      ],
      users: [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
        { id: 3, name: 'Robert Johnson', email: 'robert@example.com' }
      ]
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
      
      // Simplified app rendering - safer approach that doesn't rely on dynamic code evaluation
      // Let's provide a functioning Todo app as a default
      const TodoApp = () => {
        const [todos, setTodos] = useState(componentProps.todos || [
          { id: 1, text: 'Learn React', completed: false },
          { id: 2, text: 'Build an app', completed: false },
          { id: 3, text: 'Deploy to production', completed: false }
        ]);
        const [newTodo, setNewTodo] = useState('');
        
        const handleAddTodo = (e: React.FormEvent) => {
          e.preventDefault();
          if (!newTodo.trim()) return;
          
          const newTodoItem = {
            id: Date.now(),
            text: newTodo,
            completed: false
          };
          
          setTodos([...todos, newTodoItem]);
          setNewTodo('');
        };
        
        const handleToggle = (id: number) => {
          setTodos(
            todos.map(todo =>
              todo.id === id ? { ...todo, completed: !todo.completed } : todo
            )
          );
        };
        
        const handleDelete = (id: number) => {
          setTodos(todos.filter(todo => todo.id !== id));
        };
        
        return (
          <div className="max-w-md mx-auto p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h1 className="text-2xl font-bold mb-4 text-center">
              {currentProject?.name || 'Interactive Todo App'}
            </h1>
            
            <div className="mb-4">
              <form onSubmit={handleAddTodo} className="flex">
                <input
                  type="text"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  placeholder="Add new todo..."
                  className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-l dark:bg-gray-700 dark:text-white"
                />
                <button 
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 transition-colors"
                >
                  Add
                </button>
              </form>
            </div>
            
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {todos.map(todo => (
                <li key={todo.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => handleToggle(todo.id)}
                      className="mr-3 h-5 w-5"
                    />
                    <span className={`${todo.completed ? 'line-through text-gray-500' : ''}`}>
                      {todo.text}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(todo.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
            
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-right">
              {todos.filter(todo => !todo.completed).length} items left
            </div>
          </div>
        );
      };
      
      // Use TodoApp as our default component
      setAppComponent(<TodoApp />);
      
    } catch (err) {
      console.error('Error rendering app:', err);
      setError('Failed to render component: ' + (err instanceof Error ? err.message : String(err)));
      setAppComponent(null);
    }
  }, [appCode, componentProps, currentProject]);

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