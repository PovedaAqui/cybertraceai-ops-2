import {
  pgTable,
  varchar,
  timestamp,
  uuid,
  text,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// User table for authentication
export const user = pgTable('User', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  email: varchar('email', { length: 64 }).notNull(),
  password: varchar('password', { length: 255 }), // Increased length for hashed passwords
});

// Chat table to store conversation metadata
export const chat = pgTable('Chat', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  title: text('title').notNull(),
  userId: uuid('userId')
    .notNull()
    .references(() => user.id),
  visibility: varchar('visibility', { enum: ['public', 'private'] })
    .notNull()
    .default('private'),
});

// Message table to store individual messages
export const message = pgTable('Message', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  chatId: uuid('chatId')
    .notNull()
    .references(() => chat.id),
  role: varchar('role', {
    enum: ['user', 'assistant', 'system', 'function', 'data', 'tool'],
  }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
}); 