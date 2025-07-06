import {
  pgTable,
  varchar,
  timestamp,
  uuid,
  text,
  json,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
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
  createdAt: timestamp('createdAt', { withTimezone: false }),
  title: text('title'),
  userId: uuid('userId').references(() => User.id),
  visibility: varchar('visibility').default('private'),
});

// Message table to store individual messages
export const Message = pgTable('message', {
  id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
  chatId: uuid('chatId').references(() => Chat.id),
  role: varchar('role'),
  content: text('content'),
  parts: json('parts'),
  attachments: json('attachments'),
  createdAt: timestamp('createdAt', { withTimezone: false }),
});

// Relations
export const userRelations = relations(User, ({ many }) => ({
  chats: many(Chat),
}));

export const chatRelations = relations(Chat, ({ one, many }) => ({
  user: one(User, {
    fields: [Chat.userId],
    references: [User.id],
  }),
  messages: many(Message),
}));

export const messageRelations = relations(Message, ({ one }) => ({
  chat: one(Chat, {
    fields: [Message.chatId],
    references: [Chat.id],
  }),
})); 