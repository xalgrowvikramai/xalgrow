import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Project, frameworkOptions, backendOptions } from '@/types';
import { useProject } from '@/contexts/project-context';
import { useToast } from '@/hooks/use-toast';
import { AppGeneratorDialog } from './app-generator-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface NewProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

/**
 * Dialog for creating a new project with AI generation capabilities
 */
export function NewProjectDialog({ open, onOpenChange, onSuccess }: NewProjectDialogProps) {
  const { createProject } = useProject();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectFramework, setProjectFramework] = useState(frameworkOptions[0]);
  const [projectBackend, setProjectBackend] = useState(backendOptions[0]);
  const [isCreating, setIsCreating] = useState(false);
  
  const [showAppGenerator, setShowAppGenerator] = useState(false);
  const [newProject, setNewProject] = useState<Project | null>(null);
  
  // Basic project creation without AI generation
  const handleCreateBasicProject = async () => {
    if (!projectName || !projectDescription) {
      toast({
        title: "Missing Information",
        description: "Please provide both a name and description for your project.",
        variant: "destructive"
      });
      return;
    }
    
    setIsCreating(true);
    
    try {
      // Create the project
      const project = await createProject({
        name: projectName,
        description: projectDescription,
        framework: projectFramework,
        backend: projectBackend,
      });
      
      toast({
        title: "Project Created",
        description: "Your new project has been created successfully.",
      });
      
      // Store the new project for potential AI generation
      setNewProject(project);
      
      // Ask if the user wants to generate the app with AI
      setShowAppGenerator(true);
      
    } catch (error: any) {
      console.error("Error creating project:", error);
      toast({
        title: "Project Creation Failed",
        description: error.message || "An error occurred while creating the project.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };
  
  // Handle successful app generation
  const handleAppGenerationSuccess = (files: any[]) => {
    toast({
      title: "Application Generated",
      description: `Your application has been generated with ${files.length} files.`,
    });
    
    // Navigate to the editor for the new project
    if (newProject) {
      setLocation(`/editor/${newProject.id}`);
    }
    
    // Close dialogs and reset state
    setShowAppGenerator(false);
    onOpenChange(false);
    setProjectName('');
    setProjectDescription('');
    setProjectFramework(frameworkOptions[0]);
    setProjectBackend(backendOptions[0]);
    setNewProject(null);
    
    // Trigger success callback to refresh projects
    if (onSuccess) {
      onSuccess();
    }
  };
  
  // Cancel app generation
  const handleCancelAppGeneration = () => {
    setShowAppGenerator(false);
    
    // If a project was created but generation was canceled, navigate to it anyway
    if (newProject) {
      setLocation(`/editor/${newProject.id}`);
    }
    
    // Close dialogs and reset state
    onOpenChange(false);
    setProjectName('');
    setProjectDescription('');
    setProjectFramework(frameworkOptions[0]);
    setProjectBackend(backendOptions[0]);
    setNewProject(null);
    
    // Trigger success callback to refresh projects
    if (onSuccess) {
      onSuccess();
    }
  };
  
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Fill in the details for your new project. You'll be able to generate code using AI after creation.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="project-name" className="text-right">
                Name
              </Label>
              <Input
                id="project-name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="col-span-3"
                placeholder="My Awesome Project"
                disabled={isCreating}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="project-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="project-description"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                className="col-span-3"
                placeholder="Create an Ola cab booking app with ride tracking features"
                disabled={isCreating}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="project-framework" className="text-right">
                Framework
              </Label>
              <Select 
                value={projectFramework} 
                onValueChange={setProjectFramework}
                disabled={isCreating}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select framework" />
                </SelectTrigger>
                <SelectContent>
                  {frameworkOptions.map(framework => (
                    <SelectItem key={framework} value={framework}>
                      {framework}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="project-backend" className="text-right">
                Backend
              </Label>
              <Select 
                value={projectBackend} 
                onValueChange={setProjectBackend}
                disabled={isCreating}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select backend" />
                </SelectTrigger>
                <SelectContent>
                  {backendOptions.map(backend => (
                    <SelectItem key={backend} value={backend}>
                      {backend}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateBasicProject}
              disabled={isCreating || !projectName || !projectDescription}
            >
              {isCreating ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Creating...</>
              ) : (
                'Create Project'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* App Generator Dialog */}
      {newProject && (
        <AppGeneratorDialog 
          open={showAppGenerator}
          onOpenChange={(open) => {
            if (!open) handleCancelAppGeneration();
            setShowAppGenerator(open);
          }}
          onSuccess={handleAppGenerationSuccess}
        />
      )}
    </>
  );
}