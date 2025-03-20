import { users, messages, type User, type InsertUser, type Message, type InsertMessage, type Chat } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { db, rtdb, Timestamp, FieldValue, firebaseInitialized } from "./firebase";

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

// Fall back to in-memory storage if Firebase setup fails
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
    
    for (const chatUserId of Array.from(uniqueUserIds)) {
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

// Firebase implementation of the storage interface
export class FirebaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24h, prune expired entries
    });
    
    // Initialize counters in Realtime DB if they don't exist
    this.initializeCounters().catch(err => 
      console.error('Failed to initialize counters:', err)
    );
  }

  private async initializeCounters() {
    try {
      const countersRef = rtdb.ref('counters');
      const snapshot = await countersRef.get();
      
      if (!snapshot.exists()) {
        await countersRef.set({
          userId: 1,
          messageId: 1
        });
        console.log('Initialized counters in Realtime Database');
      }
    } catch (error) {
      console.error('Error initializing counters:', error);
    }
  }

  private async getNextId(counterName: 'userId' | 'messageId'): Promise<number> {
    try {
      const counterRef = rtdb.ref(`counters/${counterName}`);
      const snapshot = await counterRef.get();
      
      if (!snapshot.exists()) {
        throw new Error(`Counter ${counterName} doesn't exist`);
      }
      
      const currentValue = snapshot.val();
      const nextValue = currentValue + 1;
      
      // Update the counter
      await counterRef.set(nextValue);
      
      return currentValue;
    } catch (error) {
      console.error(`Error getting next ${counterName}:`, error);
      throw error;
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      const userDoc = await db.collection('users').doc(id.toString()).get();
      
      if (!userDoc.exists) {
        return undefined;
      }
      
      return {
        ...userDoc.data(),
        id: Number(userDoc.id)
      } as User;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const userSnapshot = await db.collection('users')
        .where('username', '==', username)
        .limit(1)
        .get();
      
      if (userSnapshot.empty) {
        return undefined;
      }
      
      const userDoc = userSnapshot.docs[0];
      
      return {
        ...userDoc.data(),
        id: Number(userDoc.id)
      } as User;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const id = await this.getNextId('userId');
      
      const user: User = {
        ...insertUser,
        id,
        isOnline: true,
        name: insertUser.name || null,
        profilePicture: insertUser.profilePicture || null
      };
      
      // Add user to Firestore
      await db.collection('users').doc(id.toString()).set(user);
      
      // Also update user's online status in Realtime DB for presence system
      await rtdb.ref(`users/${id}/status`).set('online');
      
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUserOnlineStatus(id: number, isOnline: boolean): Promise<User | undefined> {
    try {
      const userRef = db.collection('users').doc(id.toString());
      const userDoc = await userRef.get();
      
      if (!userDoc.exists) {
        return undefined;
      }
      
      const userData = userDoc.data() as User;
      const status = isOnline ? 'online' : 'offline';
      
      // Update in Firestore
      await userRef.update({ isOnline });
      
      // Update in Realtime DB for presence
      await rtdb.ref(`users/${id}/status`).set(status);
      
      return {
        ...userData,
        id: Number(userDoc.id),
        isOnline
      };
    } catch (error) {
      console.error('Error updating user online status:', error);
      return undefined;
    }
  }
  
  async updateUserProfile(id: number, updates: Partial<Pick<User, 'name' | 'profilePicture'>>): Promise<User | undefined> {
    try {
      const userRef = db.collection('users').doc(id.toString());
      const userDoc = await userRef.get();
      
      if (!userDoc.exists) {
        return undefined;
      }
      
      const userData = userDoc.data() as User;
      
      await userRef.update(updates);
      
      return {
        ...userData,
        ...updates,
        id: Number(userDoc.id)
      };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return undefined;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const usersSnapshot = await db.collection('users').get();
      
      return usersSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: Number(doc.id)
      })) as User[];
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    try {
      const id = await this.getNextId('messageId');
      
      const message: Message = {
        ...insertMessage,
        id,
        timestamp: new Date()
      };
      
      // Create message document in Firestore
      await db.collection('messages').doc(id.toString()).set({
        ...message,
        timestamp: FieldValue.serverTimestamp()
      });
      
      // Create chat reference document if it doesn't exist
      const chatId = this.getChatId(message.senderId, message.receiverId);
      await db.collection('chats').doc(chatId).set({
        lastMessageId: id,
        lastMessageTime: FieldValue.serverTimestamp(),
        participants: [message.senderId, message.receiverId]
      }, { merge: true });
      
      return message;
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  }

  // Helper to create consistent chat IDs
  private getChatId(user1Id: number, user2Id: number): string {
    return [Math.min(user1Id, user2Id), Math.max(user1Id, user2Id)].join('_');
  }

  async getMessagesBetweenUsers(user1Id: number, user2Id: number): Promise<Message[]> {
    try {
      const messagesSnapshot = await db.collection('messages')
        .where('senderId', 'in', [user1Id, user2Id])
        .where('receiverId', 'in', [user1Id, user2Id])
        .orderBy('timestamp')
        .get();
      
      return messagesSnapshot.docs
        .map(doc => {
          const data = doc.data();
          // Convert Firebase timestamp to JS Date if present
          const timestamp = data.timestamp ? 
            (data.timestamp instanceof Timestamp ? 
              data.timestamp.toDate() : 
              new Date(data.timestamp)
            ) : new Date();
            
          return {
            ...data,
            id: Number(doc.id),
            timestamp
          } as Message;
        })
        // Additional filter to ensure messages are between these specific users
        .filter(message => 
          (message.senderId === user1Id && message.receiverId === user2Id) ||
          (message.senderId === user2Id && message.receiverId === user1Id)
        );
    } catch (error) {
      console.error('Error getting messages between users:', error);
      return [];
    }
  }

  async getUserChats(userId: number): Promise<Chat[]> {
    try {
      // Get all messages where this user is either sender or receiver
      const [sentMessagesSnapshot, receivedMessagesSnapshot] = await Promise.all([
        db.collection('messages')
          .where('senderId', '==', userId)
          .get(),
        db.collection('messages')
          .where('receiverId', '==', userId)
          .get()
      ]);
      
      // Collect unique user IDs from messages
      const uniqueUserIds = new Set<number>();
      
      sentMessagesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        uniqueUserIds.add(data.receiverId);
      });
      
      receivedMessagesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        uniqueUserIds.add(data.senderId);
      });
      
      // Build chat objects for each unique user
      const chats: Chat[] = [];
      
      for (const chatUserId of Array.from(uniqueUserIds)) {
        const chatUser = await this.getUser(chatUserId);
        if (!chatUser) continue;

        // Get messages between these users
        const messageHistory = await this.getMessagesBetweenUsers(userId, chatUserId);
        
        if (messageHistory.length === 0) continue;
        
        // Get the last message
        const lastMessage = messageHistory[messageHistory.length - 1];
        
        // Count unread messages (messages where this user is the receiver and are newer than their last sent message)
        const lastSentByUser = messageHistory
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
    } catch (error) {
      console.error('Error getting user chats:', error);
      return [];
    }
  }
}

// Initialize the storage system
let storage: IStorage;

if (firebaseInitialized) {
  try {
    // Try to use Firebase storage
    storage = new FirebaseStorage();
    console.log('Using Firebase storage for data persistence');
  } catch (error) {
    // Fall back to in-memory if Firebase setup fails
    console.error('Firebase storage initialization failed, falling back to in-memory storage:', error);
    storage = new MemStorage();
    console.log('Using in-memory storage (Firebase initialization failed)');
  }
} else {
  // Firebase not initialized, use in-memory storage
  storage = new MemStorage();
  console.log('Using in-memory storage (Firebase not initialized)');
}

export { storage };
