import React, { createContext, useContext, useState } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Project, CreateProjectInput, ProjectFile, CreateFileInput } from '@/types';

interface ProjectContextType {
  currentProject: Project | null;
  projectFiles: ProjectFile[];
  loadingProject: boolean;
  loadingFiles: boolean;
  error: string | null;
  setCurrentProject: (project: Project | null) => void;
  createProject: (projectData: CreateProjectInput) => Promise<Project>;
  updateProject: (id: number, projectData: Partial<CreateProjectInput>) => Promise<Project>;
  deleteProject: (id: number) => Promise<void>;
  fetchProject: (id: number) => Promise<Project>;
  fetchProjectFiles: (projectId: number) => Promise<ProjectFile[]>;
  createFile: (fileData: CreateFileInput) => Promise<ProjectFile>;
  updateFile: (id: number, fileData: Partial<CreateFileInput>) => Promise<ProjectFile>;
  deleteFile: (id: number) => Promise<void>;
  exportProject: (id: number) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType>({
  currentProject: null,
  projectFiles: [],
  loadingProject: false,
  loadingFiles: false,
  error: null,
  setCurrentProject: () => {},
  createProject: async () => ({ id: 0 } as Project),
  updateProject: async () => ({ id: 0 } as Project),
  deleteProject: async () => {},
  fetchProject: async () => ({ id: 0 } as Project),
  fetchProjectFiles: async () => [],
  createFile: async () => ({ id: 0 } as ProjectFile),
  updateFile: async () => ({ id: 0 } as ProjectFile),
  deleteFile: async () => {},
  exportProject: async () => {},
});

export const useProject = () => useContext(ProjectContext);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [loadingProject, setLoadingProject] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const createProject = async (projectData: CreateProjectInput): Promise<Project> => {
    try {
      setLoadingProject(true);
      setError(null);
      
      const response = await apiRequest('POST', '/api/projects', projectData);
      const newProject = await response.json();
      
      setCurrentProject(newProject);
      toast({
        title: "Project created",
        description: `Project "${newProject.name}" has been created successfully`,
      });
      
      return newProject;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to create project';
      setError(errorMsg);
      toast({
        title: "Project creation failed",
        description: errorMsg,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoadingProject(false);
    }
  };

  const updateProject = async (id: number, projectData: Partial<CreateProjectInput>): Promise<Project> => {
    try {
      setLoadingProject(true);
      setError(null);
      
      const response = await apiRequest('PUT', `/api/projects/${id}`, projectData);
      const updatedProject = await response.json();
      
      if (currentProject?.id === id) {
        setCurrentProject(updatedProject);
      }
      
      toast({
        title: "Project updated",
        description: `Project "${updatedProject.name}" has been updated successfully`,
      });
      
      return updatedProject;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to update project';
      setError(errorMsg);
      toast({
        title: "Project update failed",
        description: errorMsg,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoadingProject(false);
    }
  };

  const deleteProject = async (id: number): Promise<void> => {
    try {
      setLoadingProject(true);
      setError(null);
      
      await apiRequest('DELETE', `/api/projects/${id}`);
      
      if (currentProject?.id === id) {
        setCurrentProject(null);
        setProjectFiles([]);
      }
      
      toast({
        title: "Project deleted",
        description: "Project has been deleted successfully",
      });
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to delete project';
      setError(errorMsg);
      toast({
        title: "Project deletion failed",
        description: errorMsg,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoadingProject(false);
    }
  };

  const fetchProject = async (id: number): Promise<Project> => {
    try {
      setLoadingProject(true);
      setError(null);
      
      const response = await apiRequest('GET', `/api/projects/${id}`);
      const project = await response.json();
      
      setCurrentProject(project);
      return project;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to fetch project';
      setError(errorMsg);
      toast({
        title: "Project fetch failed",
        description: errorMsg,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoadingProject(false);
    }
  };

  const fetchProjectFiles = async (projectId: number): Promise<ProjectFile[]> => {
    try {
      setLoadingFiles(true);
      setError(null);
      
      const response = await apiRequest('GET', `/api/projects/${projectId}/files`);
      const files = await response.json();
      
      setProjectFiles(files);
      return files;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to fetch project files';
      setError(errorMsg);
      toast({
        title: "File fetch failed",
        description: errorMsg,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoadingFiles(false);
    }
  };

  const createFile = async (fileData: CreateFileInput): Promise<ProjectFile> => {
    try {
      setLoadingFiles(true);
      setError(null);
      
      const response = await apiRequest('POST', `/api/projects/${fileData.projectId}/files`, fileData);
      const newFile = await response.json();
      
      setProjectFiles(prev => [...prev, newFile]);
      
      toast({
        title: "File created",
        description: `File "${newFile.name}" has been created successfully`,
      });
      
      return newFile;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to create file';
      setError(errorMsg);
      toast({
        title: "File creation failed",
        description: errorMsg,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoadingFiles(false);
    }
  };

  const updateFile = async (id: number, fileData: Partial<CreateFileInput>): Promise<ProjectFile> => {
    try {
      setLoadingFiles(true);
      setError(null);
      
      const response = await apiRequest('PUT', `/api/files/${id}`, fileData);
      const updatedFile = await response.json();
      
      setProjectFiles(prev => 
        prev.map(file => file.id === id ? updatedFile : file)
      );
      
      toast({
        title: "File updated",
        description: `File "${updatedFile.name}" has been updated successfully`,
      });
      
      return updatedFile;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to update file';
      setError(errorMsg);
      toast({
        title: "File update failed",
        description: errorMsg,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoadingFiles(false);
    }
  };

  const deleteFile = async (id: number): Promise<void> => {
    try {
      setLoadingFiles(true);
      setError(null);
      
      await apiRequest('DELETE', `/api/files/${id}`);
      
      setProjectFiles(prev => prev.filter(file => file.id !== id));
      
      toast({
        title: "File deleted",
        description: "File has been deleted successfully",
      });
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to delete file';
      setError(errorMsg);
      toast({
        title: "File deletion failed",
        description: errorMsg,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoadingFiles(false);
    }
  };

  const exportProject = async (id: number): Promise<void> => {
    try {
      setLoadingProject(true);
      setError(null);
      
      // Create a direct link to download the file
      const url = `/api/projects/${id}/export`;
      window.open(url, '_blank');
      
      toast({
        title: "Project export",
        description: "Project export has been initiated",
      });
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to export project';
      setError(errorMsg);
      toast({
        title: "Project export failed",
        description: errorMsg,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoadingProject(false);
    }
  };

  const value = {
    currentProject,
    projectFiles,
    loadingProject,
    loadingFiles,
    error,
    setCurrentProject,
    createProject,
    updateProject,
    deleteProject,
    fetchProject,
    fetchProjectFiles,
    createFile,
    updateFile,
    deleteFile,
    exportProject,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};
