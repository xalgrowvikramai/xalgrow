import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertProjectSchema, insertFileSchema, insertUserSchema } from "@shared/schema";
import session from "express-session";
import MemoryStore from "memorystore";
import fs from "fs";
import path from "path";
import archiver from "archiver";
import { OpenAI } from "openai";
import Anthropic from "@anthropic-ai/sdk";

// Initialize OpenAI API client
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "dummy-api-key"
});

// Initialize Anthropic API client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "dummy-api-key"
});

export async function registerRoutes(app: Express): Promise<Server> {
  const MemoryStoreSession = MemoryStore(session);
  
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "xalgrow-session-secret",
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false, maxAge: 86400000 }, // 1 day
      store: new MemoryStoreSession({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
    })
  );

  // User authentication APIs
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUserByEmail = await storage.getUserByEmail(userData.email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }
      
      const existingUserByUsername = await storage.getUserByUsername(userData.username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already in use" });
      }
      
      // Create the user
      const user = await storage.createUser(userData);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      req.session.userId = user.id;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to register user" });
    }
  });
  
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      req.session.userId = user.id;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to login" });
    }
  });
  
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
  
  app.get("/api/auth/me", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });
  
  // Firebase Authentication endpoints
  app.post("/api/auth/firebase-login", async (req, res) => {
    try {
      const { idToken } = req.body;
      
      if (!idToken) {
        return res.status(400).json({ message: "ID token is required" });
      }
      
      // In a production environment, we would verify the Firebase ID token here
      // For demo purposes, we'll extract information from the request body
      // In a real app, you'd verify the token with the Firebase Admin SDK
      
      // Extract email from request (for demo)
      // Check if an email was sent in the request body as a fallback
      const email = req.body.email || 'demo@example.com';
      
      console.log(`Authenticating Firebase user with email: ${email}`);
      
      // Find or create the user
      let user = await storage.getUserByEmail(email);
      
      if (!user) {
        // Auto-register new users from Firebase
        const username = email.split('@')[0];
        const displayName = req.body.displayName || username;
        const photoURL = req.body.photoURL || null;
        
        console.log(`Creating new user: ${username}, ${email}, ${displayName}`);
        
        user = await storage.createUser({
          username,
          email,
          password: "firebase-auth", // placeholder, not used for firebase users
          displayName,
          photoURL,
        });
      }
      
      // Set user ID in session
      req.session.userId = user.id;
      console.log(`Setting session userId: ${user.id}`);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Firebase login error:", error);
      res.status(500).json({ message: "Failed to authenticate with Firebase" });
    }
  });
  
  app.post("/api/auth/firebase-register", async (req, res) => {
    try {
      const { idToken, email, displayName, photoURL } = req.body;
      
      if (!idToken || !email) {
        return res.status(400).json({ message: "ID token and email are required" });
      }
      
      console.log(`Registering Firebase user with email: ${email}`);
      
      // In a production environment, we would verify the Firebase ID token here
      // For demo purposes, we'll extract information from the request body
      
      // Check if user already exists
      let user = await storage.getUserByEmail(email);
      
      if (user) {
        console.log(`User already exists with ID: ${user.id}`);
        // User already exists, update session
        req.session.userId = user.id;
        
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        
        return res.status(200).json(userWithoutPassword);
      }
      
      // Create new user
      const username = email.split('@')[0];
      console.log(`Creating new user: ${username}, ${email}, ${displayName || username}`);
      
      user = await storage.createUser({
        username,
        email,
        password: "firebase-auth", // placeholder, not used for firebase users
        displayName: displayName || null,
        photoURL: photoURL || null,
      });
      
      // Set user ID in session
      req.session.userId = user.id;
      console.log(`Setting session userId: ${user.id}`);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Firebase register error:", error);
      res.status(500).json({ message: "Failed to register with Firebase" });
    }
  });
  
  // Project APIs
  app.get("/api/projects", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const projects = await storage.getProjectsByUserId(userId);
      res.status(200).json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to get projects" });
    }
  });
  
  app.post("/api/projects", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const projectData = insertProjectSchema.parse({
        ...req.body,
        userId
      });
      
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create project" });
    }
  });
  
  app.get("/api/projects/:id", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      if (project.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized access to project" });
      }
      
      res.status(200).json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to get project" });
    }
  });
  
  app.put("/api/projects/:id", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      if (project.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized access to project" });
      }
      
      const updatedProject = await storage.updateProject(projectId, req.body);
      res.status(200).json(updatedProject);
    } catch (error) {
      res.status(500).json({ message: "Failed to update project" });
    }
  });
  
  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      if (project.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized access to project" });
      }
      
      await storage.deleteProject(projectId);
      res.status(200).json({ message: "Project deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete project" });
    }
  });
  
  // File APIs
  app.get("/api/projects/:projectId/files", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      if (project.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized access to project" });
      }
      
      const files = await storage.getFilesByProjectId(projectId);
      res.status(200).json(files);
    } catch (error) {
      res.status(500).json({ message: "Failed to get files" });
    }
  });
  
  app.post("/api/projects/:projectId/files", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      if (project.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized access to project" });
      }
      
      const fileData = insertFileSchema.parse({
        ...req.body,
        projectId
      });
      
      const file = await storage.createFile(fileData);
      res.status(201).json(file);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create file" });
    }
  });
  
  app.put("/api/files/:id", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const fileId = parseInt(req.params.id);
      const file = await storage.getFile(fileId);
      
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      
      const project = await storage.getProject(file.projectId);
      
      if (!project || project.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized access to file" });
      }
      
      const updatedFile = await storage.updateFile(fileId, req.body);
      res.status(200).json(updatedFile);
    } catch (error) {
      res.status(500).json({ message: "Failed to update file" });
    }
  });
  
  app.delete("/api/files/:id", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const fileId = parseInt(req.params.id);
      const file = await storage.getFile(fileId);
      
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      
      const project = await storage.getProject(file.projectId);
      
      if (!project || project.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized access to file" });
      }
      
      await storage.deleteFile(fileId);
      res.status(200).json({ message: "File deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete file" });
    }
  });
  
  // AI Code Generation APIs
  app.post("/api/ai/generate", async (req, res) => {
    try {
      const { prompt, model = "openai" } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }
      
      let generatedCode;
      
      if (model === "openai") {
        // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are a coding assistant that generates clean, well-commented code based on user requests. Provide only code without additional explanation."
            },
            {
              role: "user",
              content: prompt
            }
          ],
        });
        
        generatedCode = response.choices[0].message.content;
      } else if (model === "anthropic") {
        // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025. Do not change this unless explicitly requested by the user.
        const response = await anthropic.messages.create({
          model: "claude-3-7-sonnet-20250219",
          max_tokens: 4000,
          system: "You are a coding assistant that generates clean, well-commented code based on user requests. Provide only code without additional explanation.",
          messages: [
            {
              role: "user",
              content: prompt
            }
          ]
        });
        
        generatedCode = response.content[0].text;
      } else {
        return res.status(400).json({ message: "Invalid model specified" });
      }
      
      res.status(200).json({ code: generatedCode });
    } catch (error) {
      console.error("AI API error:", error);
      res.status(500).json({ message: "Failed to generate code" });
    }
  });
  
  // Template APIs
  app.get("/api/templates", async (req, res) => {
    try {
      const templates = await storage.getAllTemplates();
      res.status(200).json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to get templates" });
    }
  });
  
  app.get("/api/templates/premium", async (req, res) => {
    try {
      const templates = await storage.getPremiumTemplates();
      res.status(200).json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to get premium templates" });
    }
  });
  
  app.get("/api/templates/:id", async (req, res) => {
    try {
      const templateId = parseInt(req.params.id);
      const template = await storage.getTemplate(templateId);
      
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      res.status(200).json(template);
    } catch (error) {
      res.status(500).json({ message: "Failed to get template" });
    }
  });
  
  // Project Export API
  app.get("/api/projects/:id/export", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      if (project.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized access to project" });
      }
      
      const files = await storage.getFilesByProjectId(projectId);
      
      // Create a temporary directory
      const tempDir = path.join(__dirname, `../temp/${projectId}`);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      // Create the zip archive
      const zipPath = path.join(__dirname, `../temp/${project.name}.zip`);
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', {
        zlib: { level: 9 }
      });
      
      archive.pipe(output);
      
      // Add files to the archive
      for (const file of files) {
        const filePath = path.join(tempDir, file.path);
        const fileDir = path.dirname(filePath);
        
        if (!fs.existsSync(fileDir)) {
          fs.mkdirSync(fileDir, { recursive: true });
        }
        
        fs.writeFileSync(filePath, file.content);
        archive.file(filePath, { name: file.path });
      }
      
      await archive.finalize();
      
      // Clean up temporary files
      fs.rmSync(tempDir, { recursive: true, force: true });
      
      // Send the zip file
      res.download(zipPath, `${project.name}.zip`, (err) => {
        if (err) {
          console.error("Download error:", err);
        }
        
        // Clean up the zip file
        fs.unlinkSync(zipPath);
      });
    } catch (error) {
      console.error("Export error:", error);
      res.status(500).json({ message: "Failed to export project" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
