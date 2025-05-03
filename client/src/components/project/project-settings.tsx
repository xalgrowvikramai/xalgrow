import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useProject } from '@/contexts/project-context';
import { 
  frameworkOptions, 
  backendOptions, 
  modelOptions,
  AIModel,
  Project
} from '@/types';
import { useEditor } from '@/contexts/editor-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface ProjectSettingsProps {
  className?: string;
}

const ProjectSettings: React.FC<ProjectSettingsProps> = ({ className = '' }) => {
  const { t } = useI18n();
  const { currentProject, updateProject } = useProject();
  const { selectedModel, setSelectedModel } = useEditor();
  
  const [isEditing, setIsEditing] = useState(false);
  const [projectName, setProjectName] = useState(currentProject?.name || '');
  const [projectDescription, setProjectDescription] = useState(currentProject?.description || '');
  const [projectFramework, setProjectFramework] = useState(currentProject?.framework || frameworkOptions[0]);
  const [projectBackend, setProjectBackend] = useState(currentProject?.backend || backendOptions[0]);

  const handleSaveChanges = () => {
    if (!currentProject) return;
    
    updateProject(currentProject.id, {
      name: projectName,
      description: projectDescription,
      framework: projectFramework,
      backend: projectBackend
    }).then(() => {
      setIsEditing(false);
    });
  };

  const handleModelChange = (value: string) => {
    if (value === 'OpenAI GPT-4' || value === 'OpenAI GPT-3.5') {
      setSelectedModel('openai');
    } else if (value === 'Anthropic Claude') {
      setSelectedModel('anthropic');
    }
  };

  // Map selectedModel to display value
  const getModelDisplayValue = () => {
    if (selectedModel === 'openai') return 'OpenAI GPT-4';
    if (selectedModel === 'anthropic') return 'Anthropic Claude';
    return modelOptions[0];
  };

  return (
    <div className={`p-4 border-t border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-sm mb-3">{t('projectSettings')}</h3>
        {!isEditing && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsEditing(true)}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-sm"
          >
            <i className="ri-edit-line"></i>
          </Button>
        )}
      </div>
      
      <div className="space-y-3">
        {isEditing ? (
          // Edit mode
          <>
            <div>
              <Label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Name
              </Label>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <Label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Description
              </Label>
              <Textarea
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                className="w-full"
                rows={2}
              />
            </div>
            
            <div>
              <Label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                {t('framework')}
              </Label>
              <Select value={projectFramework} onValueChange={setProjectFramework}>
                <SelectTrigger className="w-full">
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
            
            <div>
              <Label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                {t('backend')}
              </Label>
              <Select value={projectBackend} onValueChange={setProjectBackend}>
                <SelectTrigger className="w-full">
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
            
            <div className="flex justify-end space-x-2 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditing(false)}
              >
                {t('cancel')}
              </Button>
              <Button 
                size="sm" 
                onClick={handleSaveChanges}
              >
                {t('save')}
              </Button>
            </div>
          </>
        ) : (
          // View mode
          <>
            {currentProject && (
              <>
                <div>
                  <Label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {t('framework')}
                  </Label>
                  <div className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm p-2">
                    {currentProject.framework}
                  </div>
                </div>
                
                <div>
                  <Label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {t('backend')}
                  </Label>
                  <div className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm p-2">
                    {currentProject.backend}
                  </div>
                </div>
              </>
            )}
            
            <div>
              <Label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                {t('aiModel')}
              </Label>
              <Select value={getModelDisplayValue()} onValueChange={handleModelChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select AI model" />
                </SelectTrigger>
                <SelectContent>
                  {modelOptions.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export { ProjectSettings };
