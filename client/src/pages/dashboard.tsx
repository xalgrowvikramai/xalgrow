import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/contexts/auth-context';
import { useProject } from '@/contexts/project-context';
import { Navbar } from '@/components/layout/navbar';
import { WelcomeBanner } from '@/components/layout/welcome-banner';
import { Project, frameworkOptions, backendOptions } from '@/types';
import { Button } from '@/components/ui/button';
import { PremiumTemplates } from '@/components/payments/premium-templates';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';

const Dashboard: React.FC = () => {
  const { t } = useI18n();
  const { user } = useAuth();
  const { createProject } = useProject();
  
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectFramework, setProjectFramework] = useState(frameworkOptions[0]);
  const [projectBackend, setProjectBackend] = useState(backendOptions[0]);
  const [isCreating, setIsCreating] = useState(false);
  
  // Fetch user's projects - for development, always enabled
  const { data: projects, isLoading, refetch } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
    enabled: true, // For development, always fetch regardless of login status
    // Original: enabled: !!user, // Only fetch if user is logged in
  });

  const [aiGenerating, setAiGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStep, setGenerationStep] = useState('');
  const [, setLocation] = useLocation();

  // Enhanced project creation with AI code generation
  const handleCreateProject = async () => {
    if (!projectName || !projectDescription) return;
    
    setIsCreating(true);
    setAiGenerating(true);
    setGenerationStep('Creating project...');
    setGenerationProgress(10);
    
    try {
      // First create the project
      const project = await createProject({
        name: projectName,
        description: projectDescription,
        framework: projectFramework,
        backend: projectBackend,
      });
      
      // Update progress
      setGenerationProgress(20);
      setGenerationStep('Analyzing project requirements...');
      
      // Generate initial file structure based on description
      const projectId = project.id;
      
      // Simulate AI thinking time
      await new Promise(resolve => setTimeout(resolve, 1000));
      setGenerationProgress(30);
      setGenerationStep('Generating code architecture...');
      
      // Create a basic file structure
      let filePromises = [];
      
      // Generate main code files based on framework
      if (projectFramework.includes('React')) {
        // Generate React files with AI
        setGenerationStep('Generating React components...');
        
        const appJsxPromise = fetch('/api/ai/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: `Create a React App.jsx component for: ${projectDescription}. Use modern React with hooks. Make it beautiful with Tailwind CSS.`,
            model: 'openai'  // or 'anthropic'
          })
        }).then(res => res.json())
          .then(data => {
            // Create the App.jsx file
            return fetch(`/api/projects/${projectId}/files`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: 'App.jsx',
                path: 'src',
                content: data.code
              })
            });
          });
        
        filePromises.push(appJsxPromise);
        setGenerationProgress(50);
        
        // Generate a component based on the description
        const mainComponentPromise = fetch('/api/ai/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: `Create a React functional component for: ${projectDescription}. Use Tailwind CSS for styling. Include appropriate state and event handlers.`,
            model: 'openai'  // or 'anthropic'
          })
        }).then(res => res.json())
          .then(data => {
            const componentName = projectName.replace(/[^a-zA-Z0-9]/g, '') + 'Component';
            // Create the component file
            return fetch(`/api/projects/${projectId}/files`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: `${componentName}.jsx`,
                path: 'src/components',
                content: data.code
              })
            });
          });
        
        filePromises.push(mainComponentPromise);
        setGenerationProgress(70);
      }
      
      // If backend includes Node.js + Express
      if (projectBackend.includes('Node.js')) {
        setGenerationStep('Generating backend code...');
        
        const serverJsPromise = fetch('/api/ai/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: `Create an Express.js server setup for: ${projectDescription}. Include appropriate routes and middleware.`,
            model: 'openai'  // or 'anthropic'
          })
        }).then(res => res.json())
          .then(data => {
            // Create the server.js file
            return fetch(`/api/projects/${projectId}/files`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: 'server.js',
                path: 'server',
                content: data.code
              })
            });
          });
        
        filePromises.push(serverJsPromise);
        setGenerationProgress(85);
      }
      
      // Create a README with project info
      const readmePromise = fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Create a detailed README.md for a project named "${projectName}" with this description: "${projectDescription}". Include sections for setup, usage, and features. The project uses ${projectFramework} for the frontend and ${projectBackend} for the backend.`,
          model: 'openai'  // or 'anthropic'
        })
      }).then(res => res.json())
        .then(data => {
          // Create the README.md file
          return fetch(`/api/projects/${projectId}/files`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: 'README.md',
              path: '',
              content: data.code
            })
          });
        });
      
      filePromises.push(readmePromise);
      
      // Wait for all file creation promises to complete
      setGenerationStep('Finalizing project setup...');
      await Promise.all(filePromises);
      
      setGenerationProgress(100);
      setGenerationStep('Project ready!');
      
      // Reset form fields
      setProjectName('');
      setProjectDescription('');
      setProjectFramework(frameworkOptions[0]);
      setProjectBackend(backendOptions[0]);
      setShowNewProjectDialog(false);
      
      // Refetch projects
      refetch();
      
      // Wait for UI to update before redirecting
      setTimeout(() => {
        // Redirect to the editor for the new project
        setLocation(`/editor/${projectId}`);
      }, 1500);
      
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setIsCreating(false);
      setAiGenerating(false);
    }
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <main className="mx-auto px-4">
        <WelcomeBanner onNewProject={() => setShowNewProjectDialog(true)} />
        
        {/* Recent Projects */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{t('projects')}</h2>
            <Button onClick={() => setShowNewProjectDialog(true)}>
              <i className="ri-add-line mr-1"></i> {t('newProject')}
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <div 
                  key={project.id} 
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-lg">{project.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{project.description}</p>
                      </div>
                      <div className="bg-primary-50 dark:bg-primary-900 rounded-md px-2 py-1">
                        <span className="text-xs text-primary-600 dark:text-primary-400">
                          {project.framework.split(' ')[0]}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Created: {formatDate(project.createdAt)}
                      </span>
                      <Link href={`/editor/${project.id}`}>
                        <Button 
                          size="sm" 
                          variant="outline"
                        >
                          <i className="ri-edit-2-line mr-1"></i> Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
              <div className="mb-2 text-gray-500 dark:text-gray-400">
                <i className="ri-folder-open-line text-4xl"></i>
              </div>
              <h3 className="font-medium text-lg mb-2">No projects yet</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Create your first project to get started
              </p>
              <Button onClick={() => setShowNewProjectDialog(true)}>
                <i className="ri-add-line mr-1"></i> {t('newProject')}
              </Button>
            </div>
          )}
        </div>
        
        {/* Show Premium Templates */}
        <PremiumTemplates />
      </main>
      
      {/* New Project Dialog */}
      <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Set up your new coding project with Xalgrow
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="projectName" className="text-right">
                Name
              </Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="My Awesome Project"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="projectDescription" className="text-right">
                Description
              </Label>
              <Textarea
                id="projectDescription"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="A brief description of your project"
                className="col-span-3"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="framework" className="text-right">
                {t('framework')}
              </Label>
              <Select value={projectFramework} onValueChange={setProjectFramework}>
                <SelectTrigger id="framework" className="col-span-3">
                  <SelectValue placeholder="Select framework" />
                </SelectTrigger>
                <SelectContent>
                  {frameworkOptions.map((framework) => (
                    <SelectItem key={framework} value={framework}>
                      {framework}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="backend" className="text-right">
                {t('backend')}
              </Label>
              <Select value={projectBackend} onValueChange={setProjectBackend}>
                <SelectTrigger id="backend" className="col-span-3">
                  <SelectValue placeholder="Select backend" />
                </SelectTrigger>
                <SelectContent>
                  {backendOptions.map((backend) => (
                    <SelectItem key={backend} value={backend}>
                      {backend}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* AI Generation Loading Screen */}
          {aiGenerating ? (
            <div className="py-6">
              <div className="text-center space-y-6">
                <div className="relative mx-auto w-40 h-40 mb-4">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-4xl text-primary-500">
                      <i className="ri-code-box-line"></i>
                    </div>
                  </div>
                  <svg className="animate-spin-slow -rotate-90 w-full h-full" viewBox="0 0 100 100">
                    <circle
                      className="text-gray-200 dark:text-gray-600"
                      strokeWidth="4"
                      stroke="currentColor"
                      fill="transparent"
                      r="45"
                      cx="50"
                      cy="50"
                    />
                    <circle
                      className="text-primary-500"
                      strokeWidth="4"
                      strokeDasharray="283"
                      strokeDashoffset={283 - (283 * generationProgress) / 100}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="45"
                      cx="50"
                      cy="50"
                    />
                  </svg>
                </div>
                <div className="text-2xl font-bold">{generationProgress}%</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{generationStep}</div>
                <div className="mt-3 text-xs text-gray-400 animate-pulse">
                  Building something amazing with AI...
                </div>
              </div>
            </div>
          ) : (
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewProjectDialog(false)}>
                {t('cancel')}
              </Button>
              <Button 
                onClick={handleCreateProject} 
                disabled={!projectName || !projectDescription || isCreating}
              >
                {isCreating ? (
                  <>
                    <i className="ri-loader-4-line animate-spin mr-2"></i>
                    Creating...
                  </>
                ) : (
                  <>Generate Project</>
                )}
              </Button>
            </DialogFooter>
          )}
          
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
