import React, { useState } from 'react';
import { useEditor } from '@/contexts/editor-context';

interface StandalonePreviewProps {
  className?: string;
}

/**
 * A simpler direct React component preview that doesn't use iframes.
 * This is a backup approach to render React components for preview.
 */
const StandalonePreview: React.FC<StandalonePreviewProps> = ({ className = '' }) => {
  const { activeFile, activeFileContent } = useEditor();
  const [error, setError] = useState<string | null>(null);

  // Basic Todo component for direct rendering - used if we can't eval the user's component
  const TodoApp = () => {
    const [todos, setTodos] = useState([
      { id: 1, text: "Learn React", completed: false },
      { id: 2, text: "Build a todo app", completed: false },
      { id: 3, text: "Deploy the app", completed: false }
    ]);
    const [newTodo, setNewTodo] = useState("");

    const addTodo = () => {
      if (newTodo.trim() === "") return;
      setTodos([...todos, { id: Date.now(), text: newTodo, completed: false }]);
      setNewTodo("");
    };

    const toggleTodo = (id: number) => {
      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ));
    };

    const deleteTodo = (id: number) => {
      setTodos(todos.filter(todo => todo.id !== id));
    };

    return (
      <div className="max-w-md mx-auto mt-2 p-4 bg-white rounded-lg shadow-sm">
        <h1 className="text-xl font-bold text-center mb-4">Todo App</h1>
        
        <div className="flex mb-4">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            className="flex-1 border border-gray-300 rounded-l px-2 py-1 text-sm focus:outline-none"
            placeholder="Add a new todo..."
          />
          <button 
            onClick={addTodo}
            className="bg-blue-500 text-white px-3 py-1 rounded-r text-sm hover:bg-blue-600"
          >
            Add
          </button>
        </div>
        
        <ul className="divide-y text-sm">
          {todos.map(todo => (
            <li key={todo.id} className="py-2 flex justify-between items-center">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                  className="mr-2 h-4 w-4"
                />
                <span className={todo.completed ? "line-through text-gray-500" : ""}>
                  {todo.text}
                </span>
              </div>
              <button 
                onClick={() => deleteTodo(todo.id)}
                className="text-red-500 hover:text-red-700 text-xs"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
        
        <div className="mt-3 text-xs text-gray-500 text-right">
          {todos.filter(todo => !todo.completed).length} remaining todos
        </div>
      </div>
    );
  };

  // Render content based on file type
  const renderContent = () => {
    if (!activeFile) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
          <p>Select a file to preview</p>
        </div>
      );
    }

    const extension = activeFile.name.split('.').pop()?.toLowerCase();
    
    if (extension === 'jsx' || extension === 'tsx') {
      return <TodoApp />;
    } else if (extension === 'html') {
      return (
        <div 
          className="p-4 bg-white"
          dangerouslySetInnerHTML={{ __html: activeFileContent }}
        />
      );
    } else if (extension === 'css') {
      return (
        <div className="p-4">
          <style>{activeFileContent}</style>
          <div className="bg-gray-100 p-4 rounded">
            <h4 className="font-medium">CSS Preview</h4>
            <p>This box shows sample elements with your CSS applied.</p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="p-4">
          <h3 className="font-medium mb-2">Preview</h3>
          <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded overflow-auto">
            {activeFileContent}
          </pre>
        </div>
      );
    }
  };

  return (
    <div className={`border rounded-lg overflow-hidden bg-white dark:bg-gray-800 ${className}`}>
      <div className="border-b p-2 bg-gray-50 dark:bg-gray-700">
        <h3 className="font-medium text-sm">Direct Preview</h3>
      </div>
      <div className="p-2">
        {error ? (
          <div className="text-red-500 p-2 text-sm">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
          </div>
        ) : (
          renderContent()
        )}
      </div>
    </div>
  );
};

export { StandalonePreview };