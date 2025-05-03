import { create } from 'zustand';

// Supported languages
export type Language = 'en' | 'hi';

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

// Translation dictionary
const translations: Translations = {
  en: {
    // Navbar
    dashboard: 'Dashboard',
    projects: 'Projects',
    templates: 'Templates',
    documentation: 'Documentation',
    yourProfile: 'Your Profile',
    settings: 'Settings',
    signOut: 'Sign Out',
    // Welcome Banner
    welcomeTitle: 'Welcome to Xalgrow!',
    welcomeDescription: 'The AI-powered coding assistant that helps you build full-stack applications with ease. Generate, edit, and preview your code in real-time.',
    newProject: 'New Project',
    tutorials: 'Tutorials',
    // File Explorer
    project: 'Project',
    files: 'Files',
    // Project Settings
    projectSettings: 'Project Settings',
    framework: 'Framework',
    backend: 'Backend',
    aiModel: 'AI Model',
    // Editor
    preview: 'Preview',
    desktop: 'Desktop',
    tablet: 'Tablet',
    mobile: 'Mobile',
    // AI Assistant
    aiAssistant: 'AI Assistant',
    // Deployment
    deployAndShare: 'Deploy & Share',
    github: 'GitHub',
    pushToRepository: 'Push to repository',
    vercel: 'Vercel',
    deployToVercel: 'Deploy to Vercel',
    replit: 'Replit',
    openInReplit: 'Open in Replit',
    download: 'Download',
    exportAsZip: 'Export as ZIP',
    // Templates
    premiumTemplates: 'Premium Templates',
    purchaseTemplates: 'Purchase professionally designed templates for your projects',
    payWithInstamojo: 'Pay with Instamojo',
    payWithUPI: 'Pay with UPI',
    // Auth
    login: 'Login',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    forgotPassword: 'Forgot Password?',
    orContinueWith: 'Or continue with',
    continueWithGoogle: 'Continue with Google',
    dontHaveAccount: 'Don\'t have an account?',
    alreadyHaveAccount: 'Already have an account?',
    createAccount: 'Create Account',
    username: 'Username',
    // Misc
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    create: 'Create',
    update: 'Update',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
  },
  hi: {
    // Navbar
    dashboard: 'डैशबोर्ड',
    projects: 'प्रोजेक्ट्स',
    templates: 'टेम्पलेट्स',
    documentation: 'दस्तावेज़ीकरण',
    yourProfile: 'आपका प्रोफाइल',
    settings: 'सेटिंग्स',
    signOut: 'साइन आउट',
    // Welcome Banner
    welcomeTitle: 'Xalgrow में आपका स्वागत है!',
    welcomeDescription: 'AI-संचालित कोडिंग सहायक जो आपको फुल-स्टैक एप्लिकेशन बनाने में मदद करता है। रियल-टाइम में अपना कोड जनरेट करें, संपादित करें और प्रीव्यू करें।',
    newProject: 'नया प्रोजेक्ट',
    tutorials: 'ट्यूटोरियल',
    // File Explorer
    project: 'प्रोजेक्ट',
    files: 'फाइलें',
    // Project Settings
    projectSettings: 'प्रोजेक्ट सेटिंग्स',
    framework: 'फ्रेमवर्क',
    backend: 'बैकएंड',
    aiModel: 'AI मॉडल',
    // Editor
    preview: 'पूर्वावलोकन',
    desktop: 'डेस्कटॉप',
    tablet: 'टैबलेट',
    mobile: 'मोबाइल',
    // AI Assistant
    aiAssistant: 'AI सहायक',
    // Deployment
    deployAndShare: 'डिप्लॉय और शेयर',
    github: 'GitHub',
    pushToRepository: 'रिपॉजिटरी में पुश करें',
    vercel: 'Vercel',
    deployToVercel: 'Vercel पर डिप्लॉय करें',
    replit: 'Replit',
    openInReplit: 'Replit में खोलें',
    download: 'डाउनलोड',
    exportAsZip: 'ZIP के रूप में निर्यात करें',
    // Templates
    premiumTemplates: 'प्रीमियम टेम्पलेट्स',
    purchaseTemplates: 'अपने प्रोजेक्ट्स के लिए पेशेवर रूप से डिज़ाइन किए गए टेम्पलेट्स खरीदें',
    payWithInstamojo: 'Instamojo से भुगतान करें',
    payWithUPI: 'UPI से भुगतान करें',
    // Auth
    login: 'लॉगिन',
    register: 'रजिस्टर',
    email: 'ईमेल',
    password: 'पासवर्ड',
    confirmPassword: 'पासवर्ड की पुष्टि करें',
    forgotPassword: 'पासवर्ड भूल गए?',
    orContinueWith: 'या जारी रखें',
    continueWithGoogle: 'Google के साथ जारी रखें',
    dontHaveAccount: 'खाता नहीं है?',
    alreadyHaveAccount: 'पहले से ही खाता है?',
    createAccount: 'खाता बनाएं',
    username: 'उपयोगकर्ता नाम',
    // Misc
    save: 'सहेजें',
    cancel: 'रद्द करें',
    edit: 'संपादित करें',
    delete: 'हटाएं',
    create: 'बनाएं',
    update: 'अपडेट करें',
    loading: 'लोड हो रहा है...',
    error: 'त्रुटि',
    success: 'सफलता',
  }
};

// i18n store
interface I18nStore {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

export const useI18n = create<I18nStore>((set, get) => ({
  language: 'en',
  setLanguage: (language) => set({ language }),
  t: (key) => {
    const { language } = get();
    return translations[language]?.[key] || translations.en[key] || key;
  }
}));
