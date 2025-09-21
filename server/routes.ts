import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertLinkSchema, updateUserProfileSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Public profile route
  app.get("/api/profile/:username", async (req, res, next) => {
    try {
      const { username } = req.params;
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const userLinks = await storage.getUserLinks(user.id);

      // Return public profile data (exclude sensitive fields)
      const publicProfile = {
        username: user.username,
        bio: user.bio,
        profilePicture: user.profilePicture,
        themeColor: user.themeColor,
        links: userLinks.map(link => ({
          id: link.id,
          title: link.title,
          url: link.url,
          icon: link.icon,
        })),
      };

      res.json(publicProfile);
    } catch (error) {
      next(error);
    }
  });

  // Protected routes (require authentication)
  app.use('/api/dashboard/*', (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }
    next();
  });

  // Update user profile
  app.patch("/api/dashboard/profile", async (req, res, next) => {
    try {
      const result = updateUserProfileSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid profile data" });
      }

      const updatedUser = await storage.updateUserProfile(req.user!.id, result.data);
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  });

  // Get user links
  app.get("/api/dashboard/links", async (req, res, next) => {
    try {
      const userLinks = await storage.getUserLinks(req.user!.id);
      res.json(userLinks);
    } catch (error) {
      next(error);
    }
  });

  // Create new link
  app.post("/api/dashboard/links", async (req, res, next) => {
    try {
      const result = insertLinkSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid link data" });
      }

      const newLink = await storage.createLink(req.user!.id, result.data);
      res.status(201).json(newLink);
    } catch (error) {
      next(error);
    }
  });

  // Update link
  app.patch("/api/dashboard/links/:linkId", async (req, res, next) => {
    try {
      const { linkId } = req.params;
      const result = insertLinkSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid link data" });
      }

      const updatedLink = await storage.updateLink(linkId, result.data);
      res.json(updatedLink);
    } catch (error) {
      next(error);
    }
  });

  // Delete link
  app.delete("/api/dashboard/links/:linkId", async (req, res, next) => {
    try {
      const { linkId } = req.params;
      await storage.deleteLink(linkId);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  });

  // Reorder links
  app.patch("/api/dashboard/links/reorder", async (req, res, next) => {
    try {
      const { linkIds } = req.body;
      if (!Array.isArray(linkIds)) {
        return res.status(400).json({ message: "linkIds must be an array" });
      }

      await storage.reorderLinks(req.user!.id, linkIds);
      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
