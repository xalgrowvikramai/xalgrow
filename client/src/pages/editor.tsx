import React, { useEffect, useState } from 'react';
import { useRoute, useLocation, Link } from 'wouter';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/contexts/auth-context';
import { useProject } from '@/contexts/project-context';
import { useEditor } from '@/contexts/editor-context';
import { Navbar } from '@/components/layout/navbar';
import { FileExplorer } from '@/components/layout/file-explorer';
import { ProjectSettings } from '@/components/project/project-settings';
import { CodeEditor } from '@/components/ui/code-editor';
import { PreviewPanel } from '@/components/editor/preview-panel';
import { StandalonePreview } from '@/components/editor/standalone-preview';
import { ChatInterface } from '@/components/ai/chat-interface';
import { DeploymentOptions } from '@/components/deployment/deployment-options';
import { Button } from '@/components/ui/button';

const Editor: React.FC = () => {
  const { t } = useI18n();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [match, params] = useRoute<{ id: string }>('/editor/:id');
  const [view, setView] = useState<'code' | 'preview'>('preview');
  const [sidebarVisible, setSidebarVisible] = useState(true);
  
  const { 
    fetchProject, 
    fetchProjectFiles, 
    currentProject, 
    projectFiles,
    updateFile,
    loadingProject,
    loadingFiles
  } = useProject();
  
  const { 
    activeFile, 
    activeFileContent, 
    updateActiveFileContent, 
    setActiveFile 
  } = useEditor();

  // For development purposes, we're bypassing authentication checks
  useEffect(() => {
    if (!user) {
      console.log('Development mode: Bypassing authentication redirect in editor.tsx');
    } else {
      console.log('User is authenticated:', user);
    }
  }, [user]);

  // Load project and files
  useEffect(() => {
    if (match && params.id) {
      const projectId = parseInt(params.id);
      
      // Only fetch if not already loaded or if it's a different project
      if (!currentProject || currentProject.id !== projectId) {
        console.log('Fetching project data for ID:', projectId);
        
        // Fetch project details
        fetchProject(projectId).then(() => {
          // Fetch project files only after project is fetched
          fetchProjectFiles(projectId);
        }).catch(error => {
          console.error('Failed to load project:', error);
          setLocation('/dashboard');
        });
      } else {
        console.log('Project already loaded:', projectId);
        
        // If project is loaded but files aren't, fetch files
        if (projectFiles.length === 0) {
          console.log('Fetching files for already loaded project');
          fetchProjectFiles(projectId);
        }
      }
    }
  }, [match, params, currentProject, projectFiles.length, fetchProject, fetchProjectFiles, setLocation]);

  // Automatically set the first App.jsx file as active when project loads
  useEffect(() => {
    if (projectFiles.length > 0 && !activeFile) {
      // Find App.jsx
      const appFile = projectFiles.find(file => 
        file.name.toLowerCase() === 'app.jsx' || 
        file.name.toLowerCase() === 'index.jsx'
      );
      
      if (appFile) {
        setActiveFile(appFile);
      } else {
        // If no App.jsx, set the first file
        setActiveFile(projectFiles[0]);
      }
    }
  }, [projectFiles, activeFile, setActiveFile]);

  // Save file content when changed
  const handleSaveFile = async () => {
    if (activeFile && activeFileContent !== activeFile.content) {
      try {
        await updateFile(activeFile.id, { content: activeFileContent });
      } catch (error) {
        console.error('Failed to save file:', error);
      }
    }
  };

  // Determine file language for code editor
  const getFileLanguage = () => {
    if (!activeFile) return 'javascript';
    
    const extension = activeFile.name.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'js':
        return 'javascript';
      case 'jsx':
        return 'javascript';
      case 'ts':
        return 'typescript';
      case 'tsx':
        return 'typescript';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'json':
        return 'json';
      default:
        return 'javascript';
    }
  };

  // Show loading state
  if (loadingProject || (!currentProject && match)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">{t('loading')}</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Loading project and initializing resources...
          </p>
        </div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center p-8 max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <i className="ri-error-warning-line text-5xl text-amber-500 mb-4"></i>
          <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            The project you're looking for doesn't exist or you don't have access to it.
          </p>
          <Link href="/dashboard">
            <a className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
              <i className="ri-arrow-left-line mr-2"></i>
              Back to Dashboard
            </a>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Top Navigation Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-2 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <a className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                <i className="ri-arrow-left-line text-xl"></i>
              </a>
            </Link>
            <h1 className="font-semibold text-lg truncate max-w-[200px]">{currentProject.name}</h1>
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button 
                className={`px-3 py-1 text-sm rounded ${
                  view === 'preview' 
                  ? 'bg-white dark:bg-gray-600 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300'
                }`}
                onClick={() => setView('preview')}
              >
                <i className="ri-eye-line mr-1"></i>
                Preview
              </button>
              <button 
                className={`px-3 py-1 text-sm rounded ${
                  view === 'code' 
                  ? 'bg-white dark:bg-gray-600 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300'
                }`}
                onClick={() => setView('code')}
              >
                <i className="ri-code-line mr-1"></i>
                Code
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              className="text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white p-1"
              onClick={() => setSidebarVisible(!sidebarVisible)}
            >
              <i className={`ri-${sidebarVisible ? 'layout-right-2' : 'layout-left-2'}-line text-lg`}></i>
            </button>
            <button className="text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white p-1">
              <i className="ri-save-line text-lg"></i>
            </button>
            <button className="text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white p-1">
              <i className="ri-share-line text-lg"></i>
            </button>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors">
              Deploy
            </button>
          </div>
        </div>
      </div>
      
      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - File explorer */}
        {sidebarVisible && (
          <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700 p-4">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-sm text-gray-700 dark:text-gray-300">PROJECT FILES</h2>
                <div className="flex space-x-1">
                  <button className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded">
                    <i className="ri-add-line text-sm"></i>
                  </button>
                  <button className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded">
                    <i className="ri-refresh-line text-sm"></i>
                  </button>
                </div>
              </div>
            </div>
            
            {/* File List */}
            <div className="flex-1 overflow-y-auto p-2">
              <FileExplorer />
            </div>
            
            {/* Project settings panel */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-3">
              <button className="w-full flex items-center justify-between p-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <span className="flex items-center">
                  <i className="ri-settings-3-line mr-2"></i>
                  Project Settings
                </span>
                <i className="ri-arrow-right-s-line"></i>
              </button>
            </div>
          </div>
        )}
        
        {/* Main content area - Preview by default */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {view === 'preview' ? (
            <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-850 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden min-h-[calc(100vh-12rem)]">
                <div className="border-b border-gray-200 dark:border-gray-700 py-2 px-4 flex items-center justify-between bg-gray-50 dark:bg-gray-700">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {currentProject.name} - Live Preview
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-sm">
                      <i className="ri-refresh-line"></i>
                    </button>
                    <div className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 rounded">
                      Desktop
                    </div>
                  </div>
                </div>
                <div className="p-2 overflow-auto h-full">
                  <StandalonePreview />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex">
              {/* Code Editor Section */}
              <div className="flex-1 overflow-hidden flex flex-col border-r border-gray-200 dark:border-gray-700">
                {/* Editor tabs */}
                <div className="flex items-center bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                  {activeFile && (
                    <div className="flex items-center px-3 py-2 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                      <i className={`${
                        activeFile.name.endsWith('.jsx') || activeFile.name.endsWith('.tsx') 
                          ? 'ri-reactjs-line text-blue-500' 
                          : activeFile.name.endsWith('.css')
                          ? 'ri-palette-line text-pink-500'
                          : 'ri-file-code-line text-gray-500'
                      } mr-2`}></i>
                      <span className="text-sm font-medium">{activeFile.name}</span>
                      <button 
                        className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        onClick={() => setActiveFile(null)}
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Code editor */}
                <div className="flex-1 overflow-hidden">
                  {activeFile ? (
                    <CodeEditor
                      value={activeFileContent}
                      onChange={updateActiveFileContent}
                      language={getFileLanguage()}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                      <div className="text-center max-w-md p-6">
                        <i className="ri-file-code-line text-5xl mb-4 text-gray-300 dark:text-gray-600"></i>
                        <h3 className="text-xl font-semibold mb-2">No File Selected</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Choose a file from the sidebar to start editing, or create a new file.
                        </p>
                        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                          <i className="ri-add-line mr-1"></i> New File
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Right sidebar - AI chat panel */}
              <div className="w-80 bg-white dark:bg-gray-800 flex flex-col border-l border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="font-semibold text-sm text-gray-700 dark:text-gray-300">AI ASSISTANT</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <ChatInterface />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Editor;
