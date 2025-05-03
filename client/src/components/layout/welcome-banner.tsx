import React from 'react';
import { Link } from 'wouter';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';

interface WelcomeBannerProps {
  onNewProject?: () => void;
}

const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ onNewProject }) => {
  const { t } = useI18n();

  return (
    <div className="relative bg-gradient-to-r from-[#FF9933] via-white to-[#138808] p-4 sm:p-6 overflow-hidden mb-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-gray-900 max-w-2xl">
          <h1 className="text-xl sm:text-2xl font-bold mb-2">{t('welcomeTitle')}</h1>
          <p className="text-sm sm:text-base">{t('welcomeDescription')}</p>
          <div className="mt-4 flex gap-3">
            <Button 
              onClick={onNewProject} 
              className="bg-primary-600 hover:bg-primary-700 text-white"
            >
              <i className="ri-add-line mr-1"></i> {t('newProject')}
            </Button>
            <Button 
              variant="outline" 
              className="bg-white hover:bg-gray-100 text-gray-800 border border-gray-300"
              onClick={() => window.location.href = '/documentation'}
            >
              <i className="ri-book-open-line mr-1"></i> {t('tutorials')}
            </Button>
          </div>
        </div>
        <div className="hidden md:block">
          <svg 
            width="350" 
            height="160" 
            viewBox="0 0 350 160" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="rounded-lg shadow-lg h-32"
          >
            <rect width="350" height="160" rx="8" fill="#F3F4F6"/>
            <path d="M175 30C194.33 30 210 45.67 210 65C210 84.33 194.33 100 175 100C155.67 100 140 84.33 140 65C140 45.67 155.67 30 175 30Z" fill="#4183FF"/>
            <rect x="110" y="110" width="130" height="20" rx="4" fill="#E0EFFF"/>
            <rect x="125" y="120" width="100" height="5" rx="2.5" fill="#71A8FF"/>
            <path d="M245 50C250.523 50 255 54.4772 255 60C255 65.5228 250.523 70 245 70C239.477 70 235 65.5228 235 60C235 54.4772 239.477 50 245 50Z" fill="#FF9933"/>
            <path d="M105 50C110.523 50 115 54.4772 115 60C115 65.5228 110.523 70 105 70C99.4772 70 95 65.5228 95 60C95 54.4772 99.4772 50 105 50Z" fill="#138808"/>
            <rect x="155" y="55" width="40" height="10" rx="5" fill="white"/>
          </svg>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-[#138808] to-transparent opacity-20"></div>
      <div className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-[#FF9933] to-transparent opacity-20"></div>
    </div>
  );
};

export { WelcomeBanner };
