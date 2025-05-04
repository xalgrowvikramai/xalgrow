import React from 'react';

interface FacebookAppPreviewProps {
  className?: string;
}

/**
 * Facebook-style app preview for projects that mention social features
 */
const FacebookAppPreview: React.FC<FacebookAppPreviewProps> = ({ className = '' }) => {
  return (
    <div className={`p-4 ${className}`}>
      <div className="text-center p-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-medium mb-2 text-blue-800 dark:text-blue-300">Social App Preview</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Generated project files will appear here once created.
        </p>
      </div>
    </div>
  );
};

export { FacebookAppPreview };