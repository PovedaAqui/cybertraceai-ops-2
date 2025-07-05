import 'server-only';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { eq } from 'drizzle-orm';
import type { Message } from '@ai-sdk/react';

const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client, { schema });

// Example: Get a user by email
export async function getUser(email: string) {
  try {
    return await db.query.user.findFirst({
      where: eq(schema.user.email, email),
    });
  } catch (error) {
    console.error('Failed to get user by email:', error);
    throw new Error('Database query failed.');
  }
}

// Example: Create a new user
export async function createUser(email: string, passwordHash: string) {
  try {
    return await db
      .insert(schema.user)
      .values({
        email,
        password: passwordHash,
      })
      .returning({ id: schema.user.id, email: schema.user.email });
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
    return await db.insert(schema.chat).values(newChat).returning();
  } catch (error) {
    console.error('Failed to save chat:', error);
    throw new Error('Database query failed.');
  }
}

type NewMessage = Omit<Message, 'id'> & { chatId: string };

// Example: Save messages to a chat
export async function saveMessages(messages: NewMessage[]) {
  try {
    // The 'content' from AI SDK Message maps directly to our schema
    return await db.insert(schema.message).values(messages).returning();
  } catch (error) {
    console.error('Failed to save messages:', error);
    throw new Error('Database query failed.');
  }
} 