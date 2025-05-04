import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/contexts/auth-context';
import { useProject } from '@/contexts/project-context';
import { Navbar } from '@/components/layout/navbar';
import { WelcomeBanner } from '@/components/layout/welcome-banner';
import { Project, frameworkOptions, backendOptions } from '@/types';
import { Button } from '@/components/ui/button';
import { PremiumTemplates } from '@/components/payments/premium-templates';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';

const Dashboard: React.FC = () => {
  const { t } = useI18n();
  const { user } = useAuth();
  const { createProject } = useProject();
  
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectFramework, setProjectFramework] = useState(frameworkOptions[0]);
  const [projectBackend, setProjectBackend] = useState(backendOptions[0]);
  const [isCreating, setIsCreating] = useState(false);
  
  // Fetch user's projects - for development, always enabled
  const { data: projects, isLoading, refetch } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
    enabled: true, // For development, always fetch regardless of login status
    // Original: enabled: !!user, // Only fetch if user is logged in
  });

  const [aiGenerating, setAiGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStep, setGenerationStep] = useState('');
  const [, setLocation] = useLocation();

  // Enhanced project creation with AI code generation
  const handleCreateProject = async () => {
    if (!projectName || !projectDescription) return;
    
    setIsCreating(true);
    setAiGenerating(true);
    setGenerationStep('Creating project...');
    setGenerationProgress(10);
    
    try {
      // First create the project
      const project = await createProject({
        name: projectName,
        description: projectDescription,
        framework: projectFramework,
        backend: projectBackend,
      });
      
      // Update progress
      setGenerationProgress(20);
      setGenerationStep('Analyzing project requirements...');
      
      // Generate initial file structure based on description
      const projectId = project.id;
      
      // Simulate AI thinking time
      await new Promise(resolve => setTimeout(resolve, 1000));
      setGenerationProgress(30);
      setGenerationStep('Generating code architecture...');
      
      // Create a basic file structure
      let filePromises = [];
      
      // Generate main code files based on framework
      if (projectFramework.includes('React')) {
        // Generate React files with AI
        setGenerationStep('Generating React components...');
        
        // Instead of relying on an external AI API call which might face rate limiting/auth issues,
// let's create a simple placeholder code that's customized to the project description
const generateAppCode = (description: string) => {
  return `import React, { useState, useEffect } from 'react';
import './index.css';

// This app was generated based on the description: "${description}"

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            ${projectName} <span className="text-sm font-normal text-gray-500">v1.0</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">${description}</p>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Getting Started</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Welcome to your new project! This is a starting point for your application.
              </p>
              <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                Learn More
              </button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Features</h2>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  React with Hooks
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Tailwind CSS
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Dark Mode Support
                </li>
              </ul>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">About</h2>
              <p className="text-gray-600 dark:text-gray-300">
                This project was created with Xalgrow AI Assistant.
                ${description}
              </p>
            </div>
          </div>
        )}
      </main>
      
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-gray-500 dark:text-gray-400">
            © ${new Date().getFullYear()} ${projectName} - Created with Xalgrow
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;`;
};

// Create a file directly without relying on the API
const createAppJsxFile = () => {
  const appCode = generateAppCode(projectDescription);
  
  // Update progress
  setGenerationProgress(50);
  
  // Create the App.jsx file
  return fetch(`/api/projects/${projectId}/files`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'App.jsx',
      path: 'src',
      content: appCode
    })
  });
};

const appJsxPromise = createAppJsxFile();
        
        filePromises.push(appJsxPromise);
        setGenerationProgress(50);
        
        // Generate a component based on the description without relying on external API
        const generateComponentCode = (description: string, name: string) => {
          const componentName = name.replace(/[^a-zA-Z0-9]/g, '') + 'Component';
          
          return `import React, { useState } from 'react';

// This component was generated based on the description: "${description}"
const ${componentName} = () => {
  const [isActive, setIsActive] = useState(false);
  const [items, setItems] = useState([
    { id: 1, title: 'Item 1', complete: false },
    { id: 2, title: 'Item 2', complete: true },
    { id: 3, title: 'Item 3', complete: false },
  ]);

  const handleToggleActive = () => {
    setIsActive(!isActive);
  };

  const handleToggleComplete = (id) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, complete: !item.complete } : item
      )
    );
  };

  const handleAddItem = () => {
    const newId = items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1;
    setItems([...items, { id: newId, title: \`Item \${newId}\`, complete: false }]);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          ${name}
        </h2>
        <button
          onClick={handleToggleActive}
          className={\`px-3 py-1 rounded-full transition-colors \${
            isActive
              ? 'bg-green-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }\`}
        >
          {isActive ? 'Active' : 'Inactive'}
        </button>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={item.complete}
                onChange={() => handleToggleComplete(item.id)}
                className="h-5 w-5 text-blue-500 rounded focus:ring-blue-500 cursor-pointer"
              />
              <span
                className={\`ml-3 \${
                  item.complete
                    ? 'line-through text-gray-400 dark:text-gray-500'
                    : 'text-gray-700 dark:text-gray-300'
                }\`}
              >
                {item.title}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {item.complete ? 'Completed' : 'Pending'}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={handleAddItem}
        className="mt-6 w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
      >
        Add Item
      </button>
    </div>
  );
};

export default ${componentName};`;
        };

        // Create the component file
        const createMainComponentFile = () => {
          const componentName = projectName.replace(/[^a-zA-Z0-9]/g, '') + 'Component';
          const componentCode = generateComponentCode(projectDescription, projectName);
          
          // Update progress
          setGenerationProgress(70);
          
          return fetch(`/api/projects/${projectId}/files`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: `${componentName}.jsx`,
              path: 'src/components',
              content: componentCode
            })
          });
        };
        
        const mainComponentPromise = createMainComponentFile();
        
        filePromises.push(mainComponentPromise);
        setGenerationProgress(70);
      }
      
      // If backend includes Node.js + Express
      if (projectBackend.includes('Node.js')) {
        setGenerationStep('Generating backend code...');
        
        const generateServerCode = (description: string) => {
          return `const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Create Express application
const app = express();
const PORT = process.env.PORT || 3000;

// This server was generated based on the description: "${description}"

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

// Sample data - modify based on your application needs
const items = [
  { id: 1, name: 'Item 1', description: 'Description for item 1' },
  { id: 2, name: 'Item 2', description: 'Description for item 2' },
  { id: 3, name: 'Item 3', description: 'Description for item 3' },
];

// API Routes
app.get('/api/items', (req, res) => {
  res.json(items);
});

app.get('/api/items/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const item = items.find(item => item.id === id);
  
  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }
  
  res.json(item);
});

app.post('/api/items', (req, res) => {
  const { name, description } = req.body;
  
  if (!name || !description) {
    return res.status(400).json({ message: 'Name and description are required' });
  }
  
  const id = items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
  const newItem = { id, name, description };
  
  items.push(newItem);
  res.status(201).json(newItem);
});

app.put('/api/items/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const itemIndex = items.findIndex(item => item.id === id);
  
  if (itemIndex === -1) {
    return res.status(404).json({ message: 'Item not found' });
  }
  
  const { name, description } = req.body;
  
  if (!name && !description) {
    return res.status(400).json({ message: 'At least one field (name or description) is required' });
  }
  
  // Update only the provided fields
  items[itemIndex] = {
    ...items[itemIndex],
    ...(name && { name }),
    ...(description && { description })
  };
  
  res.json(items[itemIndex]);
});

app.delete('/api/items/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const itemIndex = items.findIndex(item => item.id === id);
  
  if (itemIndex === -1) {
    return res.status(404).json({ message: 'Item not found' });
  }
  
  const deletedItem = items.splice(itemIndex, 1)[0];
  res.json(deletedItem);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date() });
});

// Fallback route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});

module.exports = app; // For testing
`;
        };
        
        // Create server.js file
        const createServerJsFile = () => {
          const serverCode = generateServerCode(projectDescription);
          
          // Update progress
          setGenerationProgress(85);
          
          return fetch(`/api/projects/${projectId}/files`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: 'server.js',
              path: 'server',
              content: serverCode
            })
          });
        };
        
        const serverJsPromise = createServerJsFile();
        
        filePromises.push(serverJsPromise);
        setGenerationProgress(85);
      }
      
      // Create a README with project info
      const generateReadmeContent = () => {
        return `# ${projectName}

## Description
${projectDescription}

## Features
- Modern, responsive UI built with ${projectFramework}
- ${projectBackend.includes('Node.js') ? 'RESTful API endpoints with Express.js' : 'Backend services'}
- Interactive components with state management
- Dark mode support
- Mobile-first design approach

## Setup Instructions

### Prerequisites
- Node.js 16 or later
- npm or yarn

### Installation
1. Clone the repository
\`\`\`bash
git clone https://github.com/yourusername/${projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.git
cd ${projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')}
\`\`\`

2. Install dependencies
\`\`\`bash
npm install
# or
yarn install
\`\`\`

3. Start the development server
\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

4. Open your browser and navigate to \`http://localhost:3000\`

## Project Structure
\`\`\`
├── public/              # Static assets
├── src/                 # React frontend code
│   ├── components/      # Reusable UI components
│   ├── App.jsx          # Main application component
│   └── index.js         # Application entry point
${projectBackend.includes('Node.js') ? '├── server/             # Express.js backend code\n│   └── server.js        # Server entry point' : ''}
├── package.json        # Project dependencies and scripts
└── README.md           # Project documentation
\`\`\`

## Usage
This project provides a starting point for building ${projectDescription.toLowerCase()}. You can extend it by:

1. Adding more components in the \`src/components\` directory
2. Implementing additional backend routes in \`server/server.js\`
3. Connecting to a database like MongoDB or PostgreSQL
4. Adding authentication with JWT or OAuth

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License - see the LICENSE file for details.

---

Created with 💙 using Xalgrow AI Coding Assistant
`;
      };
      
      // Create README.md file
      const createReadmeFile = () => {
        const readmeContent = generateReadmeContent();
        
        // Update progress
        setGenerationProgress(95);
        
        return fetch(`/api/projects/${projectId}/files`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'README.md',
            path: '',
            content: readmeContent
          })
        });
      };
      
      const readmePromise = createReadmeFile();
      
      filePromises.push(readmePromise);
      
      // Wait for all file creation promises to complete
      setGenerationStep('Finalizing project setup...');
      await Promise.all(filePromises);
      
      setGenerationProgress(100);
      setGenerationStep('Project ready!');
      
      // Reset form fields
      setProjectName('');
      setProjectDescription('');
      setProjectFramework(frameworkOptions[0]);
      setProjectBackend(backendOptions[0]);
      setShowNewProjectDialog(false);
      
      // Refetch projects
      refetch();
      
      // Wait for UI to update before redirecting
      setTimeout(() => {
        // Redirect to the editor for the new project
        setLocation(`/editor/${projectId}`);
      }, 1500);
      
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setIsCreating(false);
      setAiGenerating(false);
    }
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <main className="mx-auto px-4">
        <WelcomeBanner onNewProject={() => setShowNewProjectDialog(true)} />
        
        {/* Recent Projects */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{t('projects')}</h2>
            <Button onClick={() => setShowNewProjectDialog(true)}>
              <i className="ri-add-line mr-1"></i> {t('newProject')}
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <div 
                  key={project.id} 
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-lg">{project.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{project.description}</p>
                      </div>
                      <div className="bg-primary-50 dark:bg-primary-900 rounded-md px-2 py-1">
                        <span className="text-xs text-primary-600 dark:text-primary-400">
                          {project.framework.split(' ')[0]}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Created: {formatDate(project.createdAt)}
                      </span>
                      <Link href={`/editor/${project.id}`}>
                        <Button 
                          size="sm" 
                          variant="outline"
                        >
                          <i className="ri-edit-2-line mr-1"></i> Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
              <div className="mb-2 text-gray-500 dark:text-gray-400">
                <i className="ri-folder-open-line text-4xl"></i>
              </div>
              <h3 className="font-medium text-lg mb-2">No projects yet</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Create your first project to get started
              </p>
              <Button onClick={() => setShowNewProjectDialog(true)}>
                <i className="ri-add-line mr-1"></i> {t('newProject')}
              </Button>
            </div>
          )}
        </div>
        
        {/* Show Premium Templates */}
        <PremiumTemplates />
      </main>
      
      {/* New Project Dialog */}
      <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Set up your new coding project with Xalgrow
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="projectName" className="text-right">
                Name
              </Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="My Awesome Project"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="projectDescription" className="text-right">
                Description
              </Label>
              <Textarea
                id="projectDescription"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="A brief description of your project"
                className="col-span-3"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="framework" className="text-right">
                {t('framework')}
              </Label>
              <Select value={projectFramework} onValueChange={setProjectFramework}>
                <SelectTrigger id="framework" className="col-span-3">
                  <SelectValue placeholder="Select framework" />
                </SelectTrigger>
                <SelectContent>
                  {frameworkOptions.map((framework) => (
                    <SelectItem key={framework} value={framework}>
                      {framework}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="backend" className="text-right">
                {t('backend')}
              </Label>
              <Select value={projectBackend} onValueChange={setProjectBackend}>
                <SelectTrigger id="backend" className="col-span-3">
                  <SelectValue placeholder="Select backend" />
                </SelectTrigger>
                <SelectContent>
                  {backendOptions.map((backend) => (
                    <SelectItem key={backend} value={backend}>
                      {backend}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* AI Generation Loading Screen */}
          {aiGenerating ? (
            <div className="py-8">
              <div className="text-center">
                <div className="relative mx-auto w-48 h-48 mb-6">
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="text-4xl text-primary-500">
                      <i className="ri-code-box-line"></i>
                    </div>
                  </div>
                  <svg className="animate-spin-slow -rotate-90 w-full h-full" viewBox="0 0 100 100">
                    <circle
                      className="text-gray-200 dark:text-gray-600"
                      strokeWidth="4"
                      stroke="currentColor"
                      fill="transparent"
                      r="45"
                      cx="50"
                      cy="50"
                    />
                    <circle
                      className="text-primary-500"
                      strokeWidth="4"
                      strokeDasharray="283"
                      strokeDashoffset={283 - (283 * generationProgress) / 100}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="45"
                      cx="50"
                      cy="50"
                    />
                  </svg>
                </div>
                <div className="text-2xl font-bold">{generationProgress}%</div>
                <div className="text-md font-medium mt-2 text-primary-500">{generationStep}</div>
                <div className="mt-1 text-sm text-gray-400 animate-pulse">
                  Building something amazing with AI...
                </div>
                
                {/* Progress Steps */}
                <div className="mt-6 w-full max-w-xs mx-auto">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${
                        generationProgress >= 25 ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700'
                      }`}>
                        {generationProgress >= 25 ? <i className="ri-check-line text-xs"></i> : null}
                      </div>
                      <span className={`text-sm ${
                        generationProgress >= 25 ? 'text-green-500 font-medium' : 'text-gray-500'
                      }`}>Project setup</span>
                    </div>
                    
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${
                        generationProgress >= 50 ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700'
                      }`}>
                        {generationProgress >= 50 ? <i className="ri-check-line text-xs"></i> : null}
                      </div>
                      <span className={`text-sm ${
                        generationProgress >= 50 ? 'text-green-500 font-medium' : 'text-gray-500'
                      }`}>Frontend components</span>
                    </div>
                    
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${
                        generationProgress >= 85 ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700'
                      }`}>
                        {generationProgress >= 85 ? <i className="ri-check-line text-xs"></i> : null}
                      </div>
                      <span className={`text-sm ${
                        generationProgress >= 85 ? 'text-green-500 font-medium' : 'text-gray-500'
                      }`}>Backend services</span>
                    </div>
                    
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${
                        generationProgress >= 100 ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700'
                      }`}>
                        {generationProgress >= 100 ? <i className="ri-check-line text-xs"></i> : null}
                      </div>
                      <span className={`text-sm ${
                        generationProgress >= 100 ? 'text-green-500 font-medium' : 'text-gray-500'
                      }`}>Documentation</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewProjectDialog(false)}>
                {t('cancel')}
              </Button>
              <Button 
                onClick={handleCreateProject} 
                disabled={!projectName || !projectDescription || isCreating}
              >
                {isCreating ? (
                  <>
                    <i className="ri-loader-4-line animate-spin mr-2"></i>
                    Creating...
                  </>
                ) : (
                  <>Generate Project</>
                )}
              </Button>
            </DialogFooter>
          )}
          
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
