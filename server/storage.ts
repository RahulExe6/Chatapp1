import { users, messages, type User, type InsertUser, type Message, type InsertMessage, type Chat } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserOnlineStatus(id: number, isOnline: boolean): Promise<User | undefined>;
  updateUserProfile(id: number, updates: Partial<Pick<User, 'name' | 'profilePicture'>>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // Message methods
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesBetweenUsers(user1Id: number, user2Id: number): Promise<Message[]>;
  
  // Chat methods
  getUserChats(userId: number): Promise<Chat[]>;
  
  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private messages: Map<number, Message>;
  sessionStore: session.Store;
  currentUserId: number;
  currentMessageId: number;

  constructor() {
    this.users = new Map();
    this.messages = new Map();
    this.currentUserId = 1;
    this.currentMessageId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24h, prune expired entries
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      isOnline: true,
      name: insertUser.name || null,
      profilePicture: insertUser.profilePicture || null
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserOnlineStatus(id: number, isOnline: boolean): Promise<User | undefined> {
    const user = this.users.get(id);
    if (user) {
      const updatedUser = { ...user, isOnline };
      this.users.set(id, updatedUser);
      return updatedUser;
    }
    return undefined;
  }
  
  async updateUserProfile(id: number, updates: Partial<Pick<User, 'name' | 'profilePicture'>>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (user) {
      const updatedUser = { ...user, ...updates };
      this.users.set(id, updatedUser);
      return updatedUser;
    }
    return undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = { 
      ...insertMessage, 
      id, 
      timestamp: new Date() 
    };
    this.messages.set(id, message);
    return message;
  }

  async getMessagesBetweenUsers(user1Id: number, user2Id: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (message) => 
        (message.senderId === user1Id && message.receiverId === user2Id) ||
        (message.senderId === user2Id && message.receiverId === user1Id)
    ).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async getUserChats(userId: number): Promise<Chat[]> {
    // Get all unique users this user has chatted with
    const userMessages = Array.from(this.messages.values()).filter(
      message => message.senderId === userId || message.receiverId === userId
    );
    
    // Get unique user IDs from these messages
    const uniqueUserIds = new Set<number>();
    userMessages.forEach(message => {
      const otherId = message.senderId === userId ? message.receiverId : message.senderId;
      uniqueUserIds.add(otherId);
    });

    // Fetch chat info for each user
    const chats: Chat[] = [];
    
    for (const chatUserId of uniqueUserIds) {
      const chatUser = await this.getUser(chatUserId);
      if (!chatUser) continue;

      // Get messages between these users in chronological order
      const messageHistory = await this.getMessagesBetweenUsers(userId, chatUserId);
      
      if (messageHistory.length === 0) continue;
      
      // Get the last message
      const lastMessage = messageHistory[messageHistory.length - 1];
      
      // Count unread messages (messages sent to this user that are after last message sent by this user)
      let lastSentByUser = messageHistory
        .filter(msg => msg.senderId === userId)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
      
      let unread = 0;
      if (lastSentByUser) {
        unread = messageHistory.filter(
          msg => msg.receiverId === userId && msg.timestamp > lastSentByUser.timestamp
        ).length;
      } else {
        unread = messageHistory.filter(msg => msg.receiverId === userId).length;
      }

      chats.push({
        id: chatUserId,
        username: chatUser.username,
        name: chatUser.name,
        profilePicture: chatUser.profilePicture,
        isOnline: chatUser.isOnline,
        lastMessage: lastMessage.content,
        timestamp: lastMessage.timestamp,
        unread: unread
      });
    }

    // Sort by most recent message
    return chats.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
}

export const storage = new MemStorage();
