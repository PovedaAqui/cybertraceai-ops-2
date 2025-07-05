import {
  pgTable,
  varchar,
  timestamp,
  uuid,
  text,
  json,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// User table for authentication
export const User = pgTable('user', {
  id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
  email: varchar('email', { length: 64 }),
  password: varchar('password', { length: 64 }),
});

// Chat table to store conversation metadata
export const Chat = pgTable('chat', {
  id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
  createdAt: timestamp('createdAt'),
  title: text('title'),
  userId: uuid('userId').references(() => User.id),
  visibility: varchar('visibility').default('private'),
});

// Message table to store individual messages
export const Message = pgTable('message', {
  id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
  chatId: uuid('chatId').references(() => Chat.id),
  role: varchar('role'),
  parts: json('parts'),
  attachments: json('attachments'),
  createdAt: timestamp('createdAt'),
}); 