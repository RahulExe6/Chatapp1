import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { User } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // Chat API routes
  app.get("/api/users", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const users = await storage.getAllUsers();
      // Don't return the current user and remove passwords
      const filteredUsers = users
        .filter(user => user.id !== (req.user as any).id)
        .map(user => {
          const { password, ...userWithoutPassword } = user;
          return userWithoutPassword;
        });
      
      res.json(filteredUsers);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/chats", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const userId = (req.user as any).id;
      const chats = await storage.getUserChats(userId);
      res.json(chats);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/messages/:userId", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const currentUserId = (req.user as any).id;
      const otherUserId = parseInt(req.params.userId);
      
      const messages = await storage.getMessagesBetweenUsers(currentUserId, otherUserId);
      res.json(messages);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/messages", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const senderId = (req.user as any).id;
      const { receiverId, content } = req.body;
      
      if (!receiverId || !content) {
        return res.status(400).send("Missing required fields");
      }
      
      const message = await storage.createMessage({
        senderId,
        receiverId,
        content
      });
      
      res.status(201).json(message);
    } catch (err) {
      next(err);
    }
  });
  
  // Update user profile
  app.patch("/api/user/profile", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const userId = (req.user as any).id;
      const { name, profilePicture } = req.body;
      
      // Only allow updating name and profilePicture
      const updates: Partial<Pick<User, 'name' | 'profilePicture'>> = {};
      if (name !== undefined) updates.name = name;
      if (profilePicture !== undefined) updates.profilePicture = profilePicture;
      
      const updatedUser = await storage.updateUserProfile(userId, updates);
      if (!updatedUser) {
        return res.status(404).send("User not found");
      }
      
      // Remove password before sending to client
      const userWithoutPassword = { ...updatedUser } as any;
      delete userWithoutPassword.password;
      
      res.json(userWithoutPassword);
    } catch (err) {
      next(err);
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
