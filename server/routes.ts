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

  const httpServer = createServer(app);
  return httpServer;
}
