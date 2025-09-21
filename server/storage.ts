import { users, links, type User, type InsertUser, type Link, type InsertLink, type UpdateUserProfile } from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: Omit<InsertUser, 'id'> & { recoveryHash?: string; recoveryIssuedAt?: Date }): Promise<User>;
  updateUserPassword(id: string, password: string, recoveryHash: string): Promise<void>;
  updateUserRecoveryKey(id: string, recoveryHash: string): Promise<void>;
  updateUserProfile(id: string, profile: UpdateUserProfile): Promise<User>;
  
  getUserLinks(userId: string): Promise<Link[]>;
  createLink(userId: string, link: InsertLink): Promise<Link>;
  updateLink(linkId: string, link: Partial<InsertLink>): Promise<Link>;
  deleteLink(linkId: string): Promise<void>;
  reorderLinks(userId: string, linkIds: string[]): Promise<void>;
  
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: Omit<InsertUser, 'id'> & { recoveryHash?: string; recoveryIssuedAt?: Date }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        updatedAt: new Date(),
      })
      .returning();
    return user;
  }

  async updateUserPassword(id: string, password: string, recoveryHash: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        password, 
        recoveryHash,
        recoveryIssuedAt: new Date(),
        updatedAt: new Date() 
      })
      .where(eq(users.id, id));
  }

  async updateUserRecoveryKey(id: string, recoveryHash: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        recoveryHash,
        recoveryIssuedAt: new Date(),
        updatedAt: new Date() 
      })
      .where(eq(users.id, id));
  }

  async updateUserProfile(id: string, profile: UpdateUserProfile): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        ...profile,
        updatedAt: new Date() 
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getUserLinks(userId: string): Promise<Link[]> {
    return await db
      .select()
      .from(links)
      .where(eq(links.userId, userId))
      .orderBy(asc(links.orderIndex));
  }

  async createLink(userId: string, link: InsertLink): Promise<Link> {
    // Get the next order index
    const existingLinks = await this.getUserLinks(userId);
    const maxOrder = existingLinks.length > 0 
      ? Math.max(...existingLinks.map(l => l.orderIndex)) 
      : -1;

    const [newLink] = await db
      .insert(links)
      .values({
        ...link,
        userId,
        orderIndex: maxOrder + 1,
      })
      .returning();
    return newLink;
  }

  async updateLink(linkId: string, link: Partial<InsertLink>): Promise<Link> {
    const [updatedLink] = await db
      .update(links)
      .set(link)
      .where(eq(links.id, linkId))
      .returning();
    return updatedLink;
  }

  async deleteLink(linkId: string): Promise<void> {
    await db.delete(links).where(eq(links.id, linkId));
  }

  async reorderLinks(userId: string, linkIds: string[]): Promise<void> {
    // Update order indices based on the new order
    for (let i = 0; i < linkIds.length; i++) {
      await db
        .update(links)
        .set({ orderIndex: i })
        .where(eq(links.id, linkIds[i]));
    }
  }
}

export const storage = new DatabaseStorage();
