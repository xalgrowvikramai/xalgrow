import React from 'react';
import { useProject } from '@/contexts/project-context';
import { SimpleAppPreview } from './simple-app-preview';
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
  const [error, setError] = React.useState<string | null>(null);
  
  // If we have project files, use our simple app preview component
  if (projectFiles && projectFiles.length > 0) {
    return <SimpleAppPreview className={className} />;
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