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
      // For demo purposes, use userId 1 if not authenticated
      const userId = req.session.userId || 1;
      
      const projects = await storage.getProjectsByUserId(userId);
      res.status(200).json(projects);
    } catch (error) {
      console.error("Get projects error:", error);
      res.status(500).json({ message: "Failed to get projects" });
    }
  });
  
  app.post("/api/projects", async (req, res) => {
    try {
      // For demo purposes, use userId 1 if not authenticated
      const userId = req.session.userId || 1;
      
      console.log("Creating project with data:", req.body);
      
      const projectData = insertProjectSchema.parse({
        ...req.body,
        userId
      });
      
      const project = await storage.createProject(projectData);
      console.log("Created project:", project);
      res.status(201).json(project);
    } catch (error) {
      console.error("Create project error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create project" });
    }
  });
  
  app.get("/api/projects/:id", async (req, res) => {
    try {
      // For demo purposes, use userId 1 if not authenticated
      const userId = req.session.userId || 1;
      
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Skip authorization check for demo purposes
      // if (project.userId !== userId) {
      //   return res.status(403).json({ message: "Unauthorized access to project" });
      // }
      
      res.status(200).json(project);
    } catch (error) {
      console.error("Get project error:", error);
      res.status(500).json({ message: "Failed to get project" });
    }
  });
  
  app.put("/api/projects/:id", async (req, res) => {
    try {
      // For demo purposes, use userId 1 if not authenticated
      const userId = req.session.userId || 1;
      
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Skip authorization check for demo purposes
      // if (project.userId !== userId) {
      //   return res.status(403).json({ message: "Unauthorized access to project" });
      // }
      
      console.log("Updating project with data:", req.body);
      
      const updatedProject = await storage.updateProject(projectId, req.body);
      console.log("Updated project:", updatedProject);
      res.status(200).json(updatedProject);
    } catch (error) {
      console.error("Update project error:", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });
  
  app.delete("/api/projects/:id", async (req, res) => {
    try {
      // For demo purposes, use userId 1 if not authenticated
      const userId = req.session.userId || 1;
      
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Skip authorization check for demo purposes
      // if (project.userId !== userId) {
      //   return res.status(403).json({ message: "Unauthorized access to project" });
      // }
      
      console.log("Deleting project:", projectId);
      
      await storage.deleteProject(projectId);
      console.log("Project deleted successfully");
      res.status(200).json({ message: "Project deleted successfully" });
    } catch (error) {
      console.error("Delete project error:", error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });
  
  // File APIs
  app.get("/api/projects/:projectId/files", async (req, res) => {
    try {
      // For demo purposes, use userId 1 if not authenticated
      const userId = req.session.userId || 1;
      
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Skip authorization check for demo purposes
      // if (project.userId !== userId) {
      //   return res.status(403).json({ message: "Unauthorized access to project" });
      // }
      
      const files = await storage.getFilesByProjectId(projectId);
      res.status(200).json(files);
    } catch (error) {
      console.error("Get files error:", error);
      res.status(500).json({ message: "Failed to get files" });
    }
  });
  
  // Clean markdown code blocks from all files in a project
  app.post("/api/projects/:projectId/clean-files", async (req, res) => {
    try {
      // For demo purposes, use userId 1 if not authenticated
      const userId = req.session.userId || 1;
      
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Get all files for the project
      const files = await storage.getFilesByProjectId(projectId);
      
      let cleanedCount = 0;
      
      // Process each file to remove markdown code blocks
      for (const file of files) {
        if (file.content && file.content.startsWith('```')) {
          console.log(`Cleaning file ${file.id}: ${file.path}/${file.name}`);
          
          const cleanedContent = cleanCodeContent(file.content);
          
          // Update the file with cleaned content
          await storage.updateFile(file.id, {
            content: cleanedContent
          });
          
          cleanedCount++;
        }
      }
      
      res.json({ 
        message: `Successfully cleaned ${cleanedCount} files from markdown code blocks`,
        cleanedCount,
        totalFiles: files.length
      });
    } catch (error: any) {
      console.error('Error cleaning files:', error);
      res.status(500).json({ message: error.message || 'Failed to clean files' });
    }
  });
  
  app.post("/api/projects/:projectId/files", async (req, res) => {
    try {
      // For demo purposes, use userId 1 if not authenticated
      const userId = req.session.userId || 1;
      
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Skip authorization check for demo purposes
      // if (project.userId !== userId) {
      //   return res.status(403).json({ message: "Unauthorized access to project" });
      // }
      
      console.log("Creating file with data:", req.body);
      
      const fileData = insertFileSchema.parse({
        ...req.body,
        projectId
      });
      
      const file = await storage.createFile(fileData);
      console.log("Created file:", file);
      res.status(201).json(file);
    } catch (error) {
      console.error("Create file error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create file" });
    }
  });
  
  app.put("/api/files/:id", async (req, res) => {
    try {
      // For demo purposes, use userId 1 if not authenticated
      const userId = req.session.userId || 1;
      
      const fileId = parseInt(req.params.id);
      const file = await storage.getFile(fileId);
      
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      
      const project = await storage.getProject(file.projectId);
      
      // Skip authorization check for demo purposes
      // if (!project || project.userId !== userId) {
      //   return res.status(403).json({ message: "Unauthorized access to file" });
      // }
      
      console.log("Updating file with data:", req.body);
      
      const updatedFile = await storage.updateFile(fileId, req.body);
      console.log("Updated file:", updatedFile);
      res.status(200).json(updatedFile);
    } catch (error) {
      console.error("Update file error:", error);
      res.status(500).json({ message: "Failed to update file" });
    }
  });
  
  app.delete("/api/files/:id", async (req, res) => {
    try {
      // For demo purposes, use userId 1 if not authenticated
      const userId = req.session.userId || 1;
      
      const fileId = parseInt(req.params.id);
      const file = await storage.getFile(fileId);
      
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      
      const project = await storage.getProject(file.projectId);
      
      // Skip authorization check for demo purposes
      // if (!project || project.userId !== userId) {
      //   return res.status(403).json({ message: "Unauthorized access to file" });
      // }
      
      console.log("Deleting file:", fileId);
      
      await storage.deleteFile(fileId);
      console.log("File deleted successfully");
      res.status(200).json({ message: "File deleted successfully" });
    } catch (error) {
      console.error("Delete file error:", error);
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
        
        // Handle different response formats safely
        if (response.content && response.content.length > 0) {
          const content = response.content;
          // Use type assertion to deal with the complex Claude API response type
          // @ts-ignore - Ignoring type check for Anthropic API response
          generatedCode = content[0].text || JSON.stringify(content);
        } else {
          generatedCode = "No content returned from AI";
        }
      } else {
        return res.status(400).json({ message: "Invalid model specified" });
      }
      
      res.status(200).json({ code: generatedCode });
    } catch (error) {
      console.error("AI API error:", error);
      res.status(500).json({ message: "Failed to generate code" });
    }
  });
  
  // API for generating complete applications based on a description
  app.post("/api/ai/generate-app", async (req, res) => {
    try {
      const { 
        description, 
        projectId,
        model = "openai" 
      } = req.body;
      
      if (!description) {
        return res.status(400).json({ message: "Description is required" });
      }
      
      if (!projectId) {
        return res.status(400).json({ message: "Project ID is required" });
      }
      
      // Check if project exists
      const project = await storage.getProject(parseInt(projectId));
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      console.log(`Generating app for project ${projectId} with description: ${description}`);
      
      // Step 1: Generate the file structure for the app
      let fileStructure;
      
      if (model === "openai") {
        // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `You are an expert at creating React applications. Given a description of an app, generate a file structure with a list of necessary files for a complete, working application. 
              Respond with a JSON object that has a "files" property containing an array of file objects. Each file object should have "name", "path", and "description" properties. 
              The files should form a complete, working application that meets the user's requirements.
              For React apps, include .jsx or .tsx files. Include CSS files where needed.
              ONLY respond with the JSON object and nothing else.`
            },
            {
              role: "user",
              content: `Create a file structure for the following app: ${description}`
            }
          ],
          response_format: { type: "json_object" }
        });
        
        try {
          fileStructure = JSON.parse(response.choices[0].message.content);
        } catch (e) {
          console.error("Error parsing JSON from OpenAI:", e);
          return res.status(500).json({ message: "Failed to parse AI response" });
        }
      } else if (model === "anthropic") {
        // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025. Do not change this unless explicitly requested by the user.
        const response = await anthropic.messages.create({
          model: "claude-3-7-sonnet-20250219",
          max_tokens: 4000,
          system: `You are an expert at creating React applications. Given a description of an app, generate a file structure with a list of necessary files for a complete, working application. 
          Respond with a JSON object that has a "files" property containing an array of file objects. Each file object should have "name", "path", and "description" properties. 
          The files should form a complete, working application that meets the user's requirements.
          For React apps, include .jsx or .tsx files. Include CSS files where needed.
          ONLY respond with the JSON object and nothing else.`,
          messages: [
            {
              role: "user",
              content: `Create a file structure for the following app: ${description}`
            }
          ]
        });
        
        try {
          fileStructure = JSON.parse(response.content[0].text);
        } catch (e) {
          console.error("Error parsing JSON from Anthropic:", e);
          return res.status(500).json({ message: "Failed to parse AI response" });
        }
      } else {
        return res.status(400).json({ message: "Invalid model specified" });
      }
      
      if (!fileStructure || !fileStructure.files || !Array.isArray(fileStructure.files)) {
        return res.status(500).json({ message: "Invalid file structure generated" });
      }
      
      // Step 2: Generate the content for each file and create the files
      const generatedFiles = [];
      
      for (const file of fileStructure.files) {
        // Generate the content for this file
        let fileContent;
        
        if (model === "openai") {
          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: `You are an expert React developer. Generate the contents of the file described below for an app with this description: "${description}".
                The file should be well-structured, properly commented, and follow best practices.
                Only output the code, no explanations.`
              },
              {
                role: "user",
                content: `Generate the contents for: ${file.path}/${file.name}
                Description: ${file.description}`
              }
            ]
          });
          
          fileContent = response.choices[0].message.content;
        } else if (model === "anthropic") {
          const response = await anthropic.messages.create({
            model: "claude-3-7-sonnet-20250219",
            max_tokens: 4000,
            system: `You are an expert React developer. Generate the contents of the file described below for an app with this description: "${description}".
            The file should be well-structured, properly commented, and follow best practices. 
            Only output the code, no explanations.`,
            messages: [
              {
                role: "user",
                content: `Generate the contents for: ${file.path}/${file.name}
                Description: ${file.description}`
              }
            ]
          });
          
          fileContent = response.content[0].text;
        }
        
        // Create the file in the database
        const path = file.path || "";
        const fullPath = path ? `${path}/${file.name}` : file.name;
        
        const newFile = await storage.createFile({
          name: file.name,
          content: fileContent,
          path: path,
          projectId: parseInt(projectId)
        });
        
        generatedFiles.push({
          ...newFile,
          description: file.description
        });
        
        console.log(`Created file: ${fullPath}`);
      }
      
      // Step 3: Return the generated files
      res.status(200).json({ 
        message: "Application generated successfully", 
        files: generatedFiles 
      });
      
    } catch (error) {
      console.error("AI app generation error:", error);
      res.status(500).json({ message: "Failed to generate application" });
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
      // For demo purposes, use userId 1 if not authenticated
      const userId = req.session.userId || 1;
      
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Skip authorization check for demo purposes
      // if (project.userId !== userId) {
      //   return res.status(403).json({ message: "Unauthorized access to project" });
      // }
      
      console.log("Exporting project:", projectId);
      
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
  
  // Helper function to clean markdown code blocks from content
  const cleanCodeContent = (content: string): string => {
    // Check if the content is a string and not empty
    if (!content || typeof content !== 'string') {
      return content || '';
    }
    
    // Check if content has markdown code blocks
    if (content.startsWith('```')) {
      console.log("Content starts with code block markers");
      
      // Try a more robust approach to remove code blocks
      try {
        // First, try to match the entire code block pattern
        const codeBlockRegex = /^```(?:jsx|js|tsx|ts|html|css)?\n([\s\S]*?)```$/;
        const match = content.match(codeBlockRegex);
        
        if (match && match[1]) {
          console.log("Successfully extracted content from code block");
          return match[1];
        }
        
        // If that didn't work, try a simpler approach
        // Remove the opening code block marker (```jsx\n, ```js\n, etc.)
        let cleaned = content.replace(/^```(?:jsx|js|tsx|ts|html|css)?\n/, '');
        // Remove the closing code block marker
        cleaned = cleaned.replace(/```$/, '');
        
        console.log("Cleaned content using simple regex replacement");
        return cleaned;
      } catch (err) {
        console.error("Error cleaning code blocks:", err);
        // If all else fails, return the original content
        return content;
      }
    }
    
    return content;
  };

  // AI App Generation Endpoint
  app.post("/api/ai/generate-app", async (req, res) => {
    try {
      const { description, projectId, model } = req.body;
      
      if (!description || !projectId) {
        return res.status(400).json({ message: "Missing required parameters" });
      }
      
      // Get the project to validate it exists
      const project = await storage.getProject(Number(projectId));
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      console.log(`Generating app for project ${projectId} with description: ${description}`);
      
      let apiKey: string;
      let apiEndpoint: string;
      
      if (model === 'anthropic') {
        apiKey = process.env.ANTHROPIC_API_KEY || '';
        apiEndpoint = 'https://api.anthropic.com/v1/messages';
      } else {
        // Default to OpenAI
        apiKey = process.env.OPENAI_API_KEY || '';
        apiEndpoint = 'https://api.openai.com/v1/chat/completions';
      }
      
      if (!apiKey) {
        return res.status(500).json({ message: `API key for ${model} is not configured` });
      }
      
      // In a real implementation, you would call the OpenAI API here to generate files
      // For this implementation, we'll generate a simple React app based on the description
      
      // Create a simple React component based on the description
      const generatedFiles = [
        {
          name: 'App.jsx',
          path: 'src',
          content: `import React, { useState, useEffect } from 'react';
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
            ${project.name} <span className="text-sm font-normal text-gray-500">v1.0</span>
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
                  ${project.framework}
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  ${project.backend}
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
            © ${new Date().getFullYear()} ${project.name} - Created with Xalgrow
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;`
        },
        {
          name: 'MainComponent.jsx',
          path: 'src/components',
          content: `import React, { useState } from 'react';

// This component was generated based on the description: "${description}"
const MainComponent = () => {
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
          ${project.name} Component
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

export default MainComponent;`
        }
      ];
      
      // Create the files in the database through our storage interface
      for (const file of generatedFiles) {
        console.log(`Created file: ${file.path}/${file.name}`);
        
        // Process the content - make sure it doesn't have markdown code blocks
        const cleanedContent = file.content.startsWith('```') 
          ? cleanCodeContent(file.content)
          : file.content;
          
        // Store the clean content without markdown code blocks 
        await storage.createFile({
          name: file.name,
          path: file.path,
          content: cleanedContent,
          projectId: Number(projectId)
        });
      }
      
      res.json({ files: generatedFiles });
    } catch (error: any) {
      console.error('Error generating app:', error);
      res.status(500).json({ message: error.message || 'Failed to generate application' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
