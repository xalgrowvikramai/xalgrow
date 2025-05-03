import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useProject } from '@/contexts/project-context';
import { useEditor } from '@/contexts/editor-context';
import { ProjectFile } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FileExplorerProps {
  className?: string;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ className = '' }) => {
  const { t } = useI18n();
  const { currentProject, projectFiles, createFile, deleteFile } = useProject();
  const { activeFile, setActiveFile } = useEditor();
  
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFilePath, setNewFilePath] = useState('');

  const handleFileClick = (file: ProjectFile) => {
    setActiveFile(file);
  };

  const handleCreateFile = () => {
    if (!currentProject) return;
    
    if (!newFileName) {
      return; // Validate file name
    }
    
    // Default path if none provided
    const path = newFilePath || `/${newFileName}`;
    
    createFile({
      name: newFileName,
      content: '',
      path,
      projectId: currentProject.id
    }).then((newFile) => {
      setActiveFile(newFile);
      setShowNewFileDialog(false);
      setNewFileName('');
      setNewFilePath('');
    });
  };

  // Group files by folder structure
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (extension === 'jsx' || extension === 'tsx') return 'ri-reactjs-line text-primary-500';
    if (extension === 'js' || extension === 'ts') return 'ri-file-code-line text-accent3';
    if (extension === 'css' || extension === 'scss') return 'ri-file-list-line text-gray-500';
    if (extension === 'json') return 'ri-settings-line text-gray-500';
    if (extension === 'html') return 'ri-html5-line text-orange-500';
    
    return 'ri-file-text-line text-gray-500';
  };

  return (
    <div className={`p-4 ${className}`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-sm">{t('files')}</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowNewFileDialog(true)}
          className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-sm"
        >
          <i className="ri-add-line"></i>
        </Button>
      </div>
      
      {/* File Tree */}
      <div className="space-y-1">
        {projectFiles.length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-400 py-2 text-center">
            No files yet. Create a new file to get started.
          </div>
        ) : (
          projectFiles.map((file) => (
            <div 
              key={file.id} 
              className={`flex items-center p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer ${
                activeFile?.id === file.id ? 'bg-gray-100 dark:bg-gray-700' : ''
              }`}
              onClick={() => handleFileClick(file)}
            >
              <i className={`${getFileIcon(file.name)} mr-2`}></i>
              <span className="text-sm">{file.name}</span>
            </div>
          ))
        )}
      </div>
      
      {/* New File Dialog */}
      <Dialog open={showNewFileDialog} onOpenChange={setShowNewFileDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New File</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fileName" className="text-right">
                Name
              </Label>
              <Input
                id="fileName"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                className="col-span-3"
                placeholder="e.g., App.jsx"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="filePath" className="text-right">
                Path
              </Label>
              <Input
                id="filePath"
                value={newFilePath}
                onChange={(e) => setNewFilePath(e.target.value)}
                className="col-span-3"
                placeholder="e.g., /src/components/"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewFileDialog(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleCreateFile}>
              {t('create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { FileExplorer };
