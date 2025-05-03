import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useI18n } from '@/lib/i18n';
import { useTheme } from '@/components/ui/theme-provider';
import { LanguageSelector } from '@/components/ui/language-selector';
import { useAuth } from '@/contexts/auth-context';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const Navbar: React.FC = () => {
  const { t } = useI18n();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard">
                <a className="flex items-center gap-2">
                  <div className="bg-primary-500 text-white p-1.5 rounded-lg">
                    <i className="ri-code-box-line text-xl"></i>
                  </div>
                  <span className="font-bold text-xl text-primary-700 dark:text-primary-400">Xalgrow</span>
                </a>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/dashboard">
                <a className={`${location === '/dashboard' ? 'border-primary-500 text-gray-900 dark:text-white' : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:border-gray-300'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  {t('dashboard')}
                </a>
              </Link>
              <Link href="/projects">
                <a className={`${location === '/projects' ? 'border-primary-500 text-gray-900 dark:text-white' : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:border-gray-300'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  {t('projects')}
                </a>
              </Link>
              <Link href="/templates">
                <a className={`${location === '/templates' ? 'border-primary-500 text-gray-900 dark:text-white' : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:border-gray-300'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  {t('templates')}
                </a>
              </Link>
              <Link href="/documentation">
                <a className={`${location === '/documentation' ? 'border-primary-500 text-gray-900 dark:text-white' : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:border-gray-300'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  {t('documentation')}
                </a>
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center gap-4">
            {/* Language Selector */}
            <LanguageSelector />
            
            {/* Theme Switcher */}
            <Button 
              variant="outline" 
              size="icon" 
              onClick={toggleTheme}
              className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white focus:outline-none"
            >
              {theme === 'dark' ? (
                <i className="ri-sun-line text-lg"></i>
              ) : (
                <i className="ri-moon-line text-lg"></i>
              )}
            </Button>
            
            {/* Notification button */}
            <Button 
              variant="outline" 
              size="icon" 
              className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white focus:outline-none"
            >
              <i className="ri-notification-3-line text-lg"></i>
            </Button>
            
            {/* Profile dropdown */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <span className="inline-block h-8 w-8 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                      {user.photoURL ? (
                        <img 
                          src={user.photoURL} 
                          alt={user.displayName || user.username} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                          <i className="ri-user-line text-lg"></i>
                        </div>
                      )}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Link href="/profile">
                      <a className="w-full">{t('yourProfile')}</a>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/settings">
                      <a className="w-full">{t('settings')}</a>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>
                    {t('signOut')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth">
                <a>
                  <Button variant="default" size="sm">
                    {t('login')}
                  </Button>
                </a>
              </Link>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded={mobileMenuOpen}
            >
              <i className={`${mobileMenuOpen ? 'ri-close-line' : 'ri-menu-line'} text-xl`}></i>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} sm:hidden`} id="mobile-menu">
        <div className="pt-2 pb-3 space-y-1">
          <Link href="/dashboard">
            <a className={`${location === '/dashboard' ? 'bg-primary-50 dark:bg-gray-800 border-primary-500 text-primary-700 dark:text-white' : 'border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}>
              {t('dashboard')}
            </a>
          </Link>
          <Link href="/projects">
            <a className={`${location === '/projects' ? 'bg-primary-50 dark:bg-gray-800 border-primary-500 text-primary-700 dark:text-white' : 'border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}>
              {t('projects')}
            </a>
          </Link>
          <Link href="/templates">
            <a className={`${location === '/templates' ? 'bg-primary-50 dark:bg-gray-800 border-primary-500 text-primary-700 dark:text-white' : 'border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}>
              {t('templates')}
            </a>
          </Link>
          <Link href="/documentation">
            <a className={`${location === '/documentation' ? 'bg-primary-50 dark:bg-gray-800 border-primary-500 text-primary-700 dark:text-white' : 'border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}>
              {t('documentation')}
            </a>
          </Link>
        </div>
        {user && (
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <span className="inline-block h-10 w-10 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || user.username} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                      <i className="ri-user-line text-lg"></i>
                    </div>
                  )}
                </span>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800 dark:text-white">
                  {user.displayName || user.username}
                </div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {user.email}
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Link href="/profile">
                <a className="block px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                  {t('yourProfile')}
                </a>
              </Link>
              <Link href="/settings">
                <a className="block px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                  {t('settings')}
                </a>
              </Link>
              <button 
                onClick={logout} 
                className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {t('signOut')}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export { Navbar };
