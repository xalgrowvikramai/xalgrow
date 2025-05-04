// User types
export interface User {
  id: number;
  username: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
}

// Project types
export interface Project {
  id: number;
  name: string;
  description?: string;
  userId: number;
  framework: string;
  backend: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  framework: string;
  backend: string;
}

// File types
export interface ProjectFile {
  id: number;
  name: string;
  content: string;
  path: string;
  projectId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFileInput {
  name: string;
  content: string;
  path: string;
  projectId: number;
}

// Template types
export interface Template {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
  files: any[];
  isPremium: boolean;
  createdAt: Date;
}

// AI model types
export type AIModel = 'openai' | 'anthropic';

// Chat message types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

// Device types for preview
export type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

// Framework and backend options
export const frameworkOptions = [
  'React + Tailwind CSS',
  'React + MUI',
  'Next.js',
  'Vue.js',
  'Angular',
  'Svelte',
];

export const backendOptions = [
  'Node.js + Express',
  'Firebase',
  'Django',
  'Ruby on Rails',
  'Spring Boot',
  'Laravel',
];

export const modelOptions = [
  { value: 'openai', label: 'OpenAI GPT-4' },
  { value: 'anthropic', label: 'Anthropic Claude' },
];

// Deployment options
export type DeploymentPlatform = 'github' | 'vercel' | 'replit' | 'download';
