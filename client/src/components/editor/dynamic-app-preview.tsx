import React, { useState } from 'react';
import { useProject } from '@/contexts/project-context';
import { SimpleAppPreview } from './simple-app-preview';
import { RuntimePreview } from './runtime-preview';
import { FacebookAppPreview } from './facebook-app-preview';
import { InteractiveAppPreview } from './interactive-app-preview';
import { PhotoGalleryPreview } from './photo-gallery-preview';

interface DynamicAppPreviewProps {
  className?: string;
}

/**
 * A component that dynamically renders the actual project files
 * This is the core preview component for the Xalgrow app
 */
const DynamicAppPreview: React.FC<DynamicAppPreviewProps> = ({ className = '' }) => {
  const { currentProject, projectFiles } = useProject();
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'runtime' | 'mockup'>('runtime');
  
  // If we have project files, use our runtime preview component
  if (projectFiles && projectFiles.length > 0) {
    return (
      <div className={className}>
        <div className="flex justify-between items-center mb-2 px-4 pt-4">
          <h2 className="text-xl font-bold">App Preview</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setPreviewMode('runtime')}
              className={`px-3 py-1 text-sm rounded-md ${
                previewMode === 'runtime' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              Live Runtime
            </button>
            <button
              onClick={() => setPreviewMode('mockup')}
              className={`px-3 py-1 text-sm rounded-md ${
                previewMode === 'mockup' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              Visual Mockup
            </button>
          </div>
        </div>
        
        <div className="h-[calc(100%-40px)]">
          {previewMode === 'runtime' ? (
            <RuntimePreview className="h-full" />
          ) : (
            <SimpleAppPreview className="h-full" />
          )}
        </div>
      </div>
    );
  }
  
  // Otherwise, use our fallback preview based on project description
  if (!currentProject || !currentProject.description) {
    return <InteractiveAppPreview className={className} />;
  }
  
  const description = currentProject.description.toLowerCase();
  
  if (description.includes('facebook') || description.includes('social')) {
    return <FacebookAppPreview className={className} />;
  } else if (description.includes('gallery') || description.includes('photo') || description.includes('image')) {
    return <PhotoGalleryPreview className={className} />;
  } else {
    return <InteractiveAppPreview className={className} />;
  }
};

export { DynamicAppPreview };