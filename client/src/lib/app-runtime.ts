/**
 * Xalgrow Application Runtime System
 * This module handles dynamic code execution and app rendering for the preview panel
 */
import React from 'react';

// Interface for the application state
export interface AppState {
  components: Record<string, any>;
  data: Record<string, any>;
  functions: Record<string, Function>;
}

// App runtime environment
export class AppRuntime {
  private state: AppState;
  private eventHandlers: Record<string, Function[]> = {};

  constructor() {
    this.state = {
      components: {},
      data: {},
      functions: {},
    };
  }

  // Register a component for the runtime
  registerComponent(name: string, component: any): void {
    this.state.components[name] = component;
  }

  // Register data in the runtime state
  registerData(key: string, data: any): void {
    this.state.data[key] = data;
  }

  // Register a function in the runtime
  registerFunction(name: string, fn: Function): void {
    this.state.functions[name] = fn;
  }

  // Get a component by name
  getComponent(name: string): any {
    return this.state.components[name];
  }

  // Get data by key
  getData(key: string): any {
    return this.state.data[key];
  }

  // Execute a function by name with arguments
  executeFunction(name: string, ...args: any[]): any {
    const fn = this.state.functions[name];
    if (typeof fn === 'function') {
      return fn(...args);
    }
    throw new Error(`Function ${name} is not registered in the runtime`);
  }

  // Register an event handler
  on(event: string, handler: Function): void {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(handler);
  }

  // Trigger an event
  emit(event: string, ...args: any[]): void {
    const handlers = this.eventHandlers[event];
    if (handlers) {
      handlers.forEach(handler => handler(...args));
    }
  }

  // Create a React element based on string description
  createElement(type: string, props?: Record<string, any>, ...children: any[]): React.ReactElement {
    props = props || {};
    
    // Handle events by converting string event handlers to functions
    const processedProps: Record<string, any> = {};
    for (const [key, value] of Object.entries(props)) {
      if (key.startsWith('on') && typeof value === 'string') {
        // Convert string event handlers to functions
        processedProps[key] = (...args: any[]) => {
          try {
            // Try to find the function in the runtime
            if (this.state.functions[value]) {
              return this.state.functions[value](...args);
            } else {
              // Execute as code if not found
              const fn = new Function('args', 'runtime', `
                with (runtime.state.data) {
                  return (${value})(...args);
                }
              `);
              return fn(args, this);
            }
          } catch (error) {
            console.error(`Error executing event handler ${value}:`, error);
          }
        };
      } else {
        processedProps[key] = value;
      }
    }

    // Handle component type
    let componentType = type;
    if (typeof type === 'string' && type.charAt(0) === type.charAt(0).toUpperCase()) {
      // Try to find a custom component
      const CustomComponent = this.state.components[type];
      if (CustomComponent) {
        componentType = CustomComponent;
      }
    }

    return React.createElement(componentType, processedProps, ...children);
  }

  // Safely evaluate code in the runtime context
  evalCode(code: string, context?: Record<string, any>): any {
    try {
      const combinedContext = {
        ...this.state.data,
        ...this.state.functions,
        React,
        ...context,
      };
      
      const keys = Object.keys(combinedContext);
      const values = Object.values(combinedContext);
      
      // Create a function with the context variables as parameters
      const fn = new Function(...keys, `
        "use strict";
        try {
          return (${code});
        } catch (error) {
          console.error("Runtime evaluation error:", error);
          return null;
        }
      `);
      
      return fn(...values);
    } catch (error) {
      console.error("Error evaluating code:", error);
      return null;
    }
  }
  
  // Parse JSX-like syntax from string and return React element
  parseJSX(jsxString: string): React.ReactElement | null {
    try {
      // This is a simplified example - in a real implementation,
      // you would need a proper JSX parser/transformer
      const transformedCode = jsxString
        .replace(/className=/g, 'className=')
        .replace(/<([A-Z][a-zA-Z0-9]*)/g, '<components.$1')
        .replace(/<\/([A-Z][a-zA-Z0-9]*)/g, '</components.$1');
        
      const code = `
        (function(React, components, functions, data) {
          return ${transformedCode};
        })(React, this.state.components, this.state.functions, this.state.data)
      `;
      
      return this.evalCode(code);
    } catch (error) {
      console.error("Error parsing JSX:", error);
      return null;
    }
  }
}

// Create and export a singleton instance
export const appRuntime = new AppRuntime();

// Helper function to register standard React components
export function registerReactComponents(runtime: AppRuntime): void {
  // Register standard HTML elements
  const htmlElements = [
    'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'button', 'input', 'form', 'label', 'select', 'option',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'ul', 'ol', 'li', 'a', 'img', 'section', 'main'
  ];
  
  htmlElements.forEach(element => {
    runtime.registerComponent(element, element);
  });
}

// Initialize the runtime with common functions
export function initRuntime(): AppRuntime {
  registerReactComponents(appRuntime);
  
  // Register common state management functions
  appRuntime.registerFunction('useState', React.useState);
  appRuntime.registerFunction('useEffect', React.useEffect);
  appRuntime.registerFunction('useContext', React.useContext);
  appRuntime.registerFunction('useReducer', React.useReducer);
  appRuntime.registerFunction('useCallback', React.useCallback);
  appRuntime.registerFunction('useMemo', React.useMemo);
  appRuntime.registerFunction('useRef', React.useRef);
  
  return appRuntime;
}

export default appRuntime;