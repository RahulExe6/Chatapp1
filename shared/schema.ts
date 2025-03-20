import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  name: text("name"),
  profilePicture: text("profile_picture"),
  password: text("password").notNull(),
  isOnline: boolean("is_online").default(false).notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  receiverId: integer("receiver_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  name: true,
  password: true,
  profilePicture: true,
}).extend({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot be more than 30 characters")
    .regex(/^[a-z0-9_]+$/, "Username can only contain lowercase letters, numbers, and underscores")
    .transform(val => val.toLowerCase()),
  name: z.string().optional(),
  profilePicture: z.string().optional(),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  senderId: true,
  receiverId: true,
  content: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type Chat = {
  id: number;
  username: string;
  name: string | null;
  profilePicture: string | null;
  isOnline: boolean;
  lastMessage: string;
  timestamp: Date;
  unread: number;
};
