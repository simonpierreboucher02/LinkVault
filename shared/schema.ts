import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  bio: text("bio"),
  profilePicture: text("profile_picture"),
  themeColor: text("theme_color").default("#8B5CF6"),
  recoveryHash: text("recovery_hash"),
  recoveryIssuedAt: timestamp("recovery_issued_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const links = pgTable("links", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  icon: text("icon").default("fas fa-link"),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  links: many(links),
}));

export const linksRelations = relations(links, ({ one }) => ({
  user: one(users, {
    fields: [links.userId],
    references: [users.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertLinkSchema = createInsertSchema(links).pick({
  title: true,
  url: true,
  icon: true,
}).extend({
  title: z.string().min(1, "Title is required").trim(),
  url: z.string()
    .min(1, "URL is required")
    .trim()
    .refine((url) => {
      try {
        // Allow mailto: and tel: schemes directly
        if (/^(mailto:|tel:)/i.test(url)) {
          return true;
        }
        
        // For other URLs, normalize by adding https:// if no scheme
        const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
        const parsedUrl = new URL(normalizedUrl);
        const allowedSchemes = ['http:', 'https:'];
        return allowedSchemes.includes(parsedUrl.protocol);
      } catch {
        return false;
      }
    }, "Please enter a valid URL (http, https, mailto, or tel)"),
});

export const updateUserProfileSchema = createInsertSchema(users).pick({
  bio: true,
  profilePicture: true,
  themeColor: true,
});

export const passwordResetSchema = z.object({
  username: z.string().min(1),
  recoveryKey: z.string().min(1),
  newPassword: z.string().min(8),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertLink = z.infer<typeof insertLinkSchema>;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;
export type PasswordReset = z.infer<typeof passwordResetSchema>;
export type User = typeof users.$inferSelect;
export type Link = typeof links.$inferSelect;
