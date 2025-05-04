import React, { useState, useEffect } from 'react';
import { useProject } from '@/contexts/project-context';
import { FacebookAppPreview } from './facebook-app-preview';
import { InteractiveAppPreview } from './interactive-app-preview';
import { PhotoGalleryPreview } from './photo-gallery-preview';

interface DynamicAppPreviewProps {
  className?: string;
}

// App types we can detect and render
type AppType = 
  | 'facebook' 
  | 'dating' 
  | 'todo' 
  | 'ecommerce' 
  | 'gallery'
  | 'blog'
  | 'chat'
  | 'dashboard'
  | 'unknown';

/**
 * A component that dynamically selects the appropriate preview based on the project's description
 */
const DynamicAppPreview: React.FC<DynamicAppPreviewProps> = ({ className = '' }) => {
  const { currentProject } = useProject();
  const [appType, setAppType] = useState<AppType>('unknown');
  
  useEffect(() => {
    if (!currentProject || !currentProject.description) {
      setAppType('unknown');
      return;
    }
    
    const description = currentProject.description.toLowerCase();
    
    // Detect app type from description
    if (description.includes('facebook') || description.includes('social')) {
      setAppType('facebook');
    } else if (description.includes('dating') || description.includes('match') || description.includes('maniax')) {
      setAppType('dating');
    } else if (description.includes('todo') || description.includes('task') || description.includes('list')) {
      setAppType('todo');
    } else if (description.includes('ecommerce') || description.includes('shop') || description.includes('store')) {
      setAppType('ecommerce');
    } else if (description.includes('gallery') || description.includes('photo') || description.includes('image')) {
      setAppType('gallery');
    } else if (description.includes('blog') || description.includes('article') || description.includes('content')) {
      setAppType('blog');
    } else if (description.includes('chat') || description.includes('message')) {
      setAppType('chat');
    } else if (description.includes('dashboard') || description.includes('admin')) {
      setAppType('dashboard');
    } else {
      setAppType('unknown');
    }
    
  }, [currentProject]);
  
  // Render the appropriate preview based on app type
  const renderAppPreview = () => {
    switch (appType) {
      case 'facebook':
      case 'dating':
        return <FacebookAppPreview className={className} />;
        
      case 'gallery':
        return <PhotoGalleryPreview className={className} />;
        
      case 'todo':
      case 'unknown':
      default:
        return <InteractiveAppPreview className={className} />;
    }
  };
  
  return (
    <div className={`h-full ${className}`}>
      {renderAppPreview()}
    </div>
  );
};

export { DynamicAppPreview };