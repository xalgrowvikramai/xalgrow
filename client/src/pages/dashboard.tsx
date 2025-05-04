import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/contexts/auth-context';
import { useProject } from '@/contexts/project-context';
import { Navbar } from '@/components/layout/navbar';
import { WelcomeBanner } from '@/components/layout/welcome-banner';
import { Project } from '@/types';
import { Button } from '@/components/ui/button';
import { PremiumTemplates } from '@/components/payments/premium-templates';
import { NewProjectDialog } from '@/components/project/new-project-dialog';
import { AppGeneratorDialog } from '@/components/project/app-generator-dialog';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Plus, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Dashboard page component for the Xalgrow application
 */
const Dashboard: React.FC = () => {
  const { t } = useI18n();
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const { createProject } = useProject();
  
  // Dialog visibility states
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [showGenerateAppDialog, setShowGenerateAppDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // Fetch user's projects
  const { data: projects, isLoading, refetch } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
    enabled: true, // For development, always fetch regardless of login status
    // Original: enabled: !!user, // Only fetch if user is logged in
  });
  
  // Handle generating an app for an existing project
  const handleGenerateForProject = (project: Project) => {
    setSelectedProject(project);
    setShowGenerateAppDialog(true);
  };
  
  // Handle success from the app generator
  const handleGenerationSuccess = (files: any[]) => {
    // Refresh the project list
    refetch();
    
    // If we have a selected project, navigate to the editor
    if (selectedProject) {
      setLocation(`/editor/${selectedProject.id}`);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <WelcomeBanner />
        
        <div className="my-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold">{t('dashboard.myProjects')}</h1>
          
          <div className="space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setShowGenerateAppDialog(true)}
              className="flex items-center"
            >
              <Sparkles className="mr-2 h-4 w-4" /> {t('dashboard.generateApp')}
            </Button>
            
            <Button 
              onClick={() => setShowNewProjectDialog(true)}
              className="flex items-center"
            >
              <Plus className="mr-2 h-4 w-4" /> {t('dashboard.newProject')}
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : !projects || projects.length === 0 ? (
          <div className="text-center py-16 bg-muted/50 rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">{t('dashboard.noProjects')}</h2>
            <p className="text-muted-foreground mb-6">{t('dashboard.createFirstProject')}</p>
            <Button onClick={() => setShowNewProjectDialog(true)}>
              {t('dashboard.getStarted')}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle>{project.name}</CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="text-sm text-muted-foreground">
                  <div className="space-y-1">
                    <div><span className="font-medium">Framework:</span> {project.framework}</div>
                    <div><span className="font-medium">Backend:</span> {project.backend}</div>
                    <div><span className="font-medium">Created:</span> {new Date(project.createdAt).toLocaleDateString()}</div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => handleGenerateForProject(project)}>
                    <Sparkles className="mr-2 h-4 w-4" /> Generate Code
                  </Button>
                  <Button asChild>
                    <Link href={`/editor/${project.id}`}>Edit Project</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        
        {/* Premium Templates Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">{t('dashboard.premiumTemplates')}</h2>
          <PremiumTemplates />
        </div>
      </main>
      
      {/* Dialogs */}
      <NewProjectDialog 
        open={showNewProjectDialog} 
        onOpenChange={setShowNewProjectDialog}
        onSuccess={() => {
          refetch();
        }}
      />
      
      <AppGeneratorDialog
        open={showGenerateAppDialog}
        onOpenChange={setShowGenerateAppDialog}
        onSuccess={handleGenerationSuccess}
      />
    </div>
  );
};

export default Dashboard;