import React from 'react';

interface InteractiveAppPreviewProps {
  className?: string;
}

/**
 * Generic interactive app preview used as fallback for most projects
 */
const InteractiveAppPreview: React.FC<InteractiveAppPreviewProps> = ({ className = '' }) => {
  return (
    <div className={`p-4 ${className}`}>
      <div className="text-center p-8 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <h3 className="text-lg font-medium mb-2 text-green-800 dark:text-green-300">Interactive App Preview</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Generated project files will appear here once created.
        </p>
      </div>
    </div>
  );
};

export { InteractiveAppPreview };