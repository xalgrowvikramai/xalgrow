import React, { useState, useEffect } from 'react';
import { useEditor } from '@/contexts/editor-context';
import { useProject } from '@/contexts/project-context';

interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
}

interface InteractiveAppPreviewProps {
  className?: string;
}

/**
 * A component that provides a fully interactive preview of the application
 * with real state management and event handling.
 */
const InteractiveAppPreview: React.FC<InteractiveAppPreviewProps> = ({ className = '' }) => {
  const { currentProject } = useProject();
  const [todos, setTodos] = useState<TodoItem[]>([
    { id: 1, text: 'Learn React', completed: false },
    { id: 2, text: 'Build an app', completed: false },
    { id: 3, text: 'Deploy to production', completed: false }
  ]);
  const [newTodo, setNewTodo] = useState('');
  const [count, setCount] = useState(0);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // Add a new todo item
  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    
    const newTodoItem: TodoItem = {
      id: Date.now(),
      text: newTodo,
      completed: false
    };
    
    setTodos([...todos, newTodoItem]);
    setNewTodo('');
  };
  
  // Toggle todo completion status
  const handleToggleTodo = (id: number) => {
    setTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };
  
  // Delete a todo item
  const handleDeleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };
  
  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  
  return (
    <div className={`bg-white dark:bg-gray-800 h-full overflow-auto ${className}`}>
      <div className="p-4 h-full">
        <div className="max-w-md mx-auto">
          <header className="mb-6">
            <h1 className="text-2xl font-bold mb-2 text-center">
              {currentProject?.name || 'Interactive React App'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
              This is a fully functional React app with real state management
            </p>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <button 
                  onClick={toggleTheme}
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm flex items-center"
                >
                  {theme === 'light' ? (
                    <><span className="mr-2">🌙</span> Dark Mode</>
                  ) : (
                    <><span className="mr-2">☀️</span> Light Mode</>
                  )}
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setCount(count - 1)}
                  className="w-8 h-8 flex items-center justify-center bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 rounded"
                >
                  -
                </button>
                <span className="font-mono bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded">
                  {count}
                </span>
                <button 
                  onClick={() => setCount(count + 1)}
                  className="w-8 h-8 flex items-center justify-center bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 rounded"
                >
                  +
                </button>
              </div>
            </div>
            <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded"></div>
          </header>
          
          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-3">
              <span className="mr-2">✅</span> 
              Todo List
            </h2>
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
            
            <ul className="divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              {todos.length === 0 ? (
                <li className="py-4 px-3 text-center text-gray-500 dark:text-gray-400">
                  No todos yet. Add one above!
                </li>
              ) : (
                todos.map(todo => (
                  <li key={todo.id} className="py-3 px-3 flex items-center justify-between bg-white dark:bg-gray-800">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => handleToggleTodo(todo.id)}
                        className="mr-3 h-5 w-5 text-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className={`${todo.completed ? 'line-through text-gray-500' : ''}`}>
                        {todo.text}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteTodo(todo.id)}
                      className="text-red-500 hover:text-red-700 focus:outline-none"
                      aria-label="Delete todo"
                    >
                      Delete
                    </button>
                  </li>
                ))
              )}
            </ul>
            
            <div className="mt-3 text-sm text-gray-500 dark:text-gray-400 text-right">
              {todos.filter(todo => !todo.completed).length} items left
            </div>
          </section>
          
          <section>
            <h2 className="text-lg font-semibold mb-3">
              <span className="mr-2">📊</span> 
              Data Display
            </h2>
            <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white dark:bg-gray-800 rounded shadow-sm">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Todo Count</h3>
                  <p className="text-2xl font-bold">{todos.length}</p>
                </div>
                <div className="p-3 bg-white dark:bg-gray-800 rounded shadow-sm">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Completed</h3>
                  <p className="text-2xl font-bold">{todos.filter(todo => todo.completed).length}</p>
                </div>
                <div className="p-3 bg-white dark:bg-gray-800 rounded shadow-sm">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Counter</h3>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
                <div className="p-3 bg-white dark:bg-gray-800 rounded shadow-sm">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Theme</h3>
                  <p className="text-2xl font-bold capitalize">{theme}</p>
                </div>
              </div>
            </div>
          </section>
          
          <footer className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
            Created with Xalgrow AI Coding Assistant
          </footer>
        </div>
      </div>
    </div>
  );
};

export { InteractiveAppPreview };