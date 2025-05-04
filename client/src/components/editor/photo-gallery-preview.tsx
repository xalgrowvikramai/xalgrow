import React from 'react';

interface PhotoGalleryPreviewProps {
  className?: string;
}

/**
 * Photo gallery preview for projects that mention gallery or images
 */
const PhotoGalleryPreview: React.FC<PhotoGalleryPreviewProps> = ({ className = '' }) => {
  return (
    <div className={`p-4 ${className}`}>
      <div className="text-center p-8 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
        <h3 className="text-lg font-medium mb-2 text-purple-800 dark:text-purple-300">Gallery App Preview</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Generated project files will appear here once created.
        </p>
      </div>
    </div>
  );
};

export { PhotoGalleryPreview };