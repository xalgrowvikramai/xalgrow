import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useProject } from '@/contexts/project-context';
import { Button } from '@/components/ui/button';
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
import { DeploymentPlatform } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface DeploymentOptionsProps {
  className?: string;
}

const DeploymentOptions: React.FC<DeploymentOptionsProps> = ({ className = '' }) => {
  const { t } = useI18n();
  const { currentProject, exportProject } = useProject();
  const { toast } = useToast();
  
  const [selectedPlatform, setSelectedPlatform] = useState<DeploymentPlatform | null>(null);
  const [githubRepoName, setGithubRepoName] = useState('');
  const [vercelProjectName, setVercelProjectName] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [deploying, setDeploying] = useState(false);

  const handleSelectPlatform = (platform: DeploymentPlatform) => {
    setSelectedPlatform(platform);
    
    if (currentProject) {
      if (platform === 'github' || platform === 'vercel') {
        setGithubRepoName(`${currentProject.name.toLowerCase().replace(/\s+/g, '-')}`);
        setVercelProjectName(`${currentProject.name.toLowerCase().replace(/\s+/g, '-')}`);
        setShowDialog(true);
      } else if (platform === 'replit') {
        handleDeployToReplit();
      } else if (platform === 'download') {
        handleDownload();
      }
    }
  };

  const handleGithubDeploy = () => {
    setDeploying(true);
    // In a real implementation, we would call an API to create a GitHub repo and push code
    
    // Simulating API call with timeout
    setTimeout(() => {
      setDeploying(false);
      setShowDialog(false);
      toast({
        title: "GitHub Repository Created",
        description: `Project has been pushed to github.com/username/${githubRepoName}`,
      });
    }, 1500);
  };

  const handleVercelDeploy = () => {
    setDeploying(true);
    // In a real implementation, we would call an API to deploy to Vercel
    
    // Simulating API call with timeout
    setTimeout(() => {
      setDeploying(false);
      setShowDialog(false);
      toast({
        title: "Deployment Started",
        description: `Project is being deployed to ${vercelProjectName}.vercel.app`,
      });
    }, 1500);
  };

  const handleDeployToReplit = () => {
    // In a real implementation, this would redirect to Replit with the project
    toast({
      title: "Opening in Replit",
      description: "Your project is being prepared for Replit",
    });
    
    // Simulating redirection
    setTimeout(() => {
      window.open('https://replit.com/new', '_blank');
    }, 1000);
  };

  const handleDownload = () => {
    if (currentProject) {
      toast({
        title: "Preparing Download",
        description: "Your project is being packaged as a ZIP file",
      });
      
      exportProject(currentProject.id);
    }
  };

  const getDialogContent = () => {
    if (selectedPlatform === 'github') {
      return (
        <>
          <DialogHeader>
            <DialogTitle>Deploy to GitHub</DialogTitle>
            <DialogDescription>
              Create a new GitHub repository for your project.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="repoName" className="text-right">
                Repository Name
              </Label>
              <Input
                id="repoName"
                value={githubRepoName}
                onChange={(e) => setGithubRepoName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <p className="text-xs text-gray-500 col-start-2 col-span-3">
              Your repository will be created at github.com/username/{githubRepoName}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleGithubDeploy} disabled={deploying}>
              {deploying ? (
                <>
                  <i className="ri-loader-4-line animate-spin mr-2"></i>
                  Creating...
                </>
              ) : (
                <>Create Repository</>
              )}
            </Button>
          </DialogFooter>
        </>
      );
    } else if (selectedPlatform === 'vercel') {
      return (
        <>
          <DialogHeader>
            <DialogTitle>Deploy to Vercel</DialogTitle>
            <DialogDescription>
              Deploy your project to Vercel for hosting.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="projectName" className="text-right">
                Project Name
              </Label>
              <Input
                id="projectName"
                value={vercelProjectName}
                onChange={(e) => setVercelProjectName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <p className="text-xs text-gray-500 col-start-2 col-span-3">
              Your project will be deployed at {vercelProjectName}.vercel.app
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleVercelDeploy} disabled={deploying}>
              {deploying ? (
                <>
                  <i className="ri-loader-4-line animate-spin mr-2"></i>
                  Deploying...
                </>
              ) : (
                <>Deploy to Vercel</>
              )}
            </Button>
          </DialogFooter>
        </>
      );
    }
    
    return null;
  };

  return (
    <div className={`mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
      <h3 className="font-medium text-lg mb-3">{t('deployAndShare')}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* GitHub */}
        <button 
          onClick={() => handleSelectPlatform('github')}
          className="p-3 flex items-center gap-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        >
          <div className="w-8 h-8 flex items-center justify-center">
            <i className="ri-github-fill text-2xl"></i>
          </div>
          <div className="text-left">
            <p className="font-medium">{t('github')}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('pushToRepository')}</p>
          </div>
        </button>
        
        {/* Vercel */}
        <button 
          onClick={() => handleSelectPlatform('vercel')}
          className="p-3 flex items-center gap-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        >
          <div className="w-8 h-8 flex items-center justify-center">
            <i className="ri-server-line text-2xl text-black dark:text-white"></i>
          </div>
          <div className="text-left">
            <p className="font-medium">{t('vercel')}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('deployToVercel')}</p>
          </div>
        </button>
        
        {/* Replit */}
        <button 
          onClick={() => handleSelectPlatform('replit')}
          className="p-3 flex items-center gap-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        >
          <div className="w-8 h-8 flex items-center justify-center">
            <i className="ri-code-box-line text-2xl text-[#FF9933]"></i>
          </div>
          <div className="text-left">
            <p className="font-medium">{t('replit')}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('openInReplit')}</p>
          </div>
        </button>
        
        {/* Download */}
        <button 
          onClick={() => handleSelectPlatform('download')}
          className="p-3 flex items-center gap-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        >
          <div className="w-8 h-8 flex items-center justify-center">
            <i className="ri-download-cloud-line text-2xl text-[#138808]"></i>
          </div>
          <div className="text-left">
            <p className="font-medium">{t('download')}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('exportAsZip')}</p>
          </div>
        </button>
      </div>
      
      {/* Deployment Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          {getDialogContent()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { DeploymentOptions };
