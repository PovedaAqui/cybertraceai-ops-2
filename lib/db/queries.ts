import 'server-only';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { eq, desc } from 'drizzle-orm';
import type { Message } from '@ai-sdk/react';

let _client: ReturnType<typeof postgres> | null = null;
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

function getDbConnection(): { 
  db: ReturnType<typeof drizzle<typeof schema>>; 
  client: ReturnType<typeof postgres>; 
} {
  if (_db && _client) {
    return { db: _db, client: _client };
  }

  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL environment variable is not set.');
  }

  _client = postgres(process.env.POSTGRES_URL);
  _db = drizzle(_client, { schema });
  
  return { db: _db, client: _client };
}

// Get or create user by UUID
export async function getOrCreateUser(userId: string, email: string) {
  try {
    const { db } = getDbConnection();
    // First try to find existing user
    let user = await db.query.User.findFirst({
      where: eq(schema.User.id, userId),
    });
    
    if (!user) {
      // Create new user with provided UUID
      const result = await db
        .insert(schema.User)
        .values({
          id: userId,
          email: email,
        })
        .returning();
      user = result[0];
    }
    
    return user;
  } catch (error) {
    console.error('Failed to get or create user:', error);
    throw new Error('Database query failed.');
  }
}

// Get a user by email (legacy function)
export async function getUser(email: string) {
  try {
    const { db } = getDbConnection();
    return await db.query.User.findFirst({
      where: eq(schema.User.email, email),
    });
  } catch (error) {
    console.error('Failed to get user by email:', error);
    throw new Error('Database query failed.');
  }
}

// Example: Create a new user
export async function createUser(email: string, name?: string) {
  try {
    const { db } = getDbConnection();
    return await db
      .insert(schema.User)
      .values({
        id: crypto.randomUUID(),
        email,
        name,
      })
      .returning({ id: schema.User.id, email: schema.User.email });
  } catch (error) {
    console.error('Failed to create user:', error);
    throw new Error('Database query failed.');
  }
}

// Example: Save a new chat
export async function saveChat(newChat: {
  userId: string;
  title: string;
  id?: string;
  visibility?: 'public' | 'private';
}) {
  try {
    const { db } = getDbConnection();
    return await db.insert(schema.Chat).values(newChat).returning();
  } catch (error) {
    console.error('Failed to save chat:', error);
    throw new Error('Database query failed.');
  }
}

// Create a new chat
export async function createChat(userId: string, title?: string) {
  try {
    const { db } = getDbConnection();
    const result = await db
      .insert(schema.Chat)
      .values({
        userId,
        title: title || 'New Chat',
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Failed to create chat:', error);
    throw new Error('Database query failed.');
  }
}

// Get chats for a user
export async function getChatsByUser(userId: string) {
  try {
    const { db } = getDbConnection();
    return await db.query.Chat.findMany({
      where: eq(schema.Chat.userId, userId),
      orderBy: [desc(schema.Chat.createdAt)],
    });
  } catch (error) {
    console.error('Failed to get chats by user:', error);
    throw new Error('Database query failed.');
  }
}

// Get a specific chat by ID
export async function getChatById(chatId: string) {
  try {
    const { db } = getDbConnection();
    return await db.query.Chat.findFirst({
      where: eq(schema.Chat.id, chatId),
    });
  } catch (error) {
    console.error('Failed to get chat by ID:', error);
    throw new Error('Database query failed.');
  }
}

// Get messages for a chat
export async function getChatMessages(chatId: string): Promise<Message[]> {
  try {
    const { db } = getDbConnection();
    const messages = await db.query.Message.findMany({
      where: eq(schema.Message.chatId, chatId),
      orderBy: [desc(schema.Message.createdAt)],
    });
    
    // Convert database messages to AI SDK Message format
    return messages.map(msg => ({
      id: msg.id,
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content || '',
      parts: msg.parts as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      createdAt: msg.createdAt || undefined,
    }));
  } catch (error) {
    console.error('Failed to get chat messages:', error);
    throw new Error('Database query failed.');
  }
}

// Save a single message
export async function saveMessage(message: Message & { chatId: string }) {
  try {
    const { db } = getDbConnection();
    return await db
      .insert(schema.Message)
      .values({
        id: message.id, // Include the ID explicitly
        chatId: message.chatId,
        role: message.role,
        content: message.content,
        parts: message.parts,
        attachments: message.experimental_attachments || null,
        createdAt: message.createdAt || new Date(),
      })
      .returning();
  } catch (error) {
    console.error('Failed to save message:', error);
    throw new Error('Database query failed.');
  }
}

// Update chat title
export async function updateChatTitle(chatId: string, title: string) {
  try {
    const { db } = getDbConnection();
    return await db
      .update(schema.Chat)
      .set({ title })
      .where(eq(schema.Chat.id, chatId))
      .returning();
  } catch (error) {
    console.error('Failed to update chat title:', error);
    throw new Error('Database query failed.');
  }
}

// Delete a chat and its messages
export async function deleteChat(chatId: string) {
  try {
    const { db } = getDbConnection();
    // Delete messages first
    await db.delete(schema.Message).where(eq(schema.Message.chatId, chatId));
    
    // Delete chat
    return await db
      .delete(schema.Chat)
      .where(eq(schema.Chat.id, chatId))
      .returning();
  } catch (error) {
    console.error('Failed to delete chat:', error);
    throw new Error('Database query failed.');
  }
}

type NewMessage = Omit<Message, 'id'> & { chatId: string };

// Legacy function: Save messages to a chat
export async function saveMessages(messages: NewMessage[]) {
  try {
    const { db } = getDbConnection();
    const dbMessages = messages.map(msg => ({
      // Let database generate UUID for message ID
      chatId: msg.chatId,
      role: msg.role,
      content: msg.content,
      parts: msg.parts,
      attachments: msg.experimental_attachments || null,
      // Let database handle createdAt with its default
    }));
    
    return await db.insert(schema.Message).values(dbMessages).returning();
  } catch (error) {
    console.error('Failed to save messages:', error);
    throw new Error('Database query failed.');
  }
} 