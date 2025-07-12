import {
  users,
  projects,
  files,
  templates,
  posts,
  connections,
  type User,
  type InsertUser,
  type Project,
  type InsertProject,
  type File,
  type InsertFile,
  type Template,
  type InsertTemplate,
  type Post,
  type InsertPost,
  type Connection,
  type InsertConnection
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;
  
  // Project operations
  getProject(id: number): Promise<Project | undefined>;
  getProjectsByUserId(userId: number): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, projectData: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  
  // File operations
  getFile(id: number): Promise<File | undefined>;
  getFilesByProjectId(projectId: number): Promise<File[]>;
  createFile(file: InsertFile): Promise<File>;
  updateFile(id: number, fileData: Partial<InsertFile>): Promise<File | undefined>;
  deleteFile(id: number): Promise<boolean>;

  // Post operations
  getPost(id: number): Promise<Post | undefined>;
  getPostsByUserId(userId: number): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, postData: Partial<InsertPost>): Promise<Post | undefined>;
  deletePost(id: number): Promise<boolean>;

  // Connection operations
  getConnection(id: number): Promise<Connection | undefined>;
  getConnectionsByUserId(userId: number): Promise<Connection[]>;
  createConnection(connection: InsertConnection): Promise<Connection>;
  deleteConnection(id: number): Promise<boolean>;
  
  // Template operations
  getTemplate(id: number): Promise<Template | undefined>;
  getAllTemplates(): Promise<Template[]>;
  getPremiumTemplates(): Promise<Template[]>;
  createTemplate(template: InsertTemplate): Promise<Template>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private files: Map<number, File>;
  private templates: Map<number, Template>;
  private posts: Map<number, Post>;
  private connections: Map<number, Connection>;
  
  private userId: number;
  private projectId: number;
  private fileId: number;
  private templateId: number;
  private postId: number;
  private connectionId: number;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.files = new Map();
    this.templates = new Map();
    this.posts = new Map();
    this.connections = new Map();
    
    this.userId = 1;
    this.projectId = 1;
    this.fileId = 1;
    this.templateId = 1;
    this.postId = 1;
    this.connectionId = 1;
    
    // Initialize with sample templates
    this.initializeTemplates();
  }

  private initializeTemplates() {
    const templates: InsertTemplate[] = [
      {
        name: "E-commerce Dashboard",
        description: "Complete store management solution",
        imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
        price: 999,
        files: [],
        isPremium: true
      },
      {
        name: "Blog Platform",
        description: "Modern content publishing system",
        imageUrl: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5",
        price: 799,
        files: [],
        isPremium: true
      },
      {
        name: "SaaS Dashboard",
        description: "User and analytics management",
        imageUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7",
        price: 1499,
        files: [],
        isPremium: true
      }
    ];
    
    templates.forEach(template => this.createTemplate(template));
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    
    // Ensure the properties are set to null instead of undefined
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: now,
      displayName: insertUser.displayName ?? null, 
      photoURL: insertUser.photoURL ?? null 
    };
    
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Project operations
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjectsByUserId(userId: number): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      (project) => project.userId === userId,
    );
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.projectId++;
    const now = new Date();
    
    // Ensure description is set to null instead of undefined
    const project: Project = { 
      ...insertProject, 
      id, 
      createdAt: now, 
      updatedAt: now,
      description: insertProject.description ?? null
    };
    
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: number, projectData: Partial<InsertProject>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const now = new Date();
    const updatedProject: Project = { 
      ...project, 
      ...projectData, 
      updatedAt: now 
    };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }

  // File operations
  async getFile(id: number): Promise<File | undefined> {
    return this.files.get(id);
  }

  async getFilesByProjectId(projectId: number): Promise<File[]> {
    return Array.from(this.files.values()).filter(
      (file) => file.projectId === projectId,
    );
  }

  async createFile(insertFile: InsertFile): Promise<File> {
    const id = this.fileId++;
    const now = new Date();
    const file: File = { ...insertFile, id, createdAt: now, updatedAt: now };
    this.files.set(id, file);
    return file;
  }

  async updateFile(id: number, fileData: Partial<InsertFile>): Promise<File | undefined> {
    const file = this.files.get(id);
    if (!file) return undefined;
    
    const now = new Date();
    const updatedFile: File = { 
      ...file, 
      ...fileData, 
      updatedAt: now 
    };
    this.files.set(id, updatedFile);
    return updatedFile;
  }

  async deleteFile(id: number): Promise<boolean> {
    return this.files.delete(id);
  }

  // Template operations
  async getTemplate(id: number): Promise<Template | undefined> {
    return this.templates.get(id);
  }

  async getAllTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values());
  }

  async getPremiumTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values()).filter(
      (template) => template.isPremium,
    );
  }

  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const id = this.templateId++;
    const now = new Date();
    
    // Ensure description, imageUrl, and isPremium are set properly
    const template: Template = { 
      ...insertTemplate, 
      id, 
      createdAt: now,
      description: insertTemplate.description ?? null,
      imageUrl: insertTemplate.imageUrl ?? null,
      isPremium: insertTemplate.isPremium ?? false
    };
    
    this.templates.set(id, template);
    return template;
  }

  // Post operations
  async getPost(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async getPostsByUserId(userId: number): Promise<Post[]> {
    return Array.from(this.posts.values()).filter(p => p.userId === userId);
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = this.postId++;
    const now = new Date();
    const post: Post = { ...insertPost, id, createdAt: now, updatedAt: now };
    this.posts.set(id, post);
    return post;
  }

  async updatePost(id: number, postData: Partial<InsertPost>): Promise<Post | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;

    const now = new Date();
    const updatedPost: Post = { ...post, ...postData, updatedAt: now };
    this.posts.set(id, updatedPost);
    return updatedPost;
  }

  async deletePost(id: number): Promise<boolean> {
    return this.posts.delete(id);
  }

  // Connection operations
  async getConnection(id: number): Promise<Connection | undefined> {
    return this.connections.get(id);
  }

  async getConnectionsByUserId(userId: number): Promise<Connection[]> {
    return Array.from(this.connections.values()).filter(
      c => c.userId === userId
    );
  }

  async createConnection(insertConn: InsertConnection): Promise<Connection> {
    const id = this.connectionId++;
    const now = new Date();
    const connection: Connection = { ...insertConn, id, createdAt: now };
    this.connections.set(id, connection);
    return connection;
  }

  async deleteConnection(id: number): Promise<boolean> {
    return this.connections.delete(id);
  }
}

export const storage = new MemStorage();
