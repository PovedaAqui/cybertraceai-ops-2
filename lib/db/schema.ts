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

// NextAuth.js required tables
export const User = pgTable('user', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull(),
  emailVerified: timestamp('emailVerified', { withTimezone: false }),
  image: varchar('image', { length: 255 }),
});

export const Account = pgTable('account', {
  userId: varchar('userId', { length: 255 }).notNull().references(() => User.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 255 }).notNull(),
  provider: varchar('provider', { length: 255 }).notNull(),
  providerAccountId: varchar('providerAccountId', { length: 255 }).notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: text('expires_at'),
  token_type: varchar('token_type', { length: 255 }),
  scope: varchar('scope', { length: 255 }),
  id_token: text('id_token'),
  session_state: varchar('session_state', { length: 255 }),
}, (account) => ({
  primaryKey: [account.provider, account.providerAccountId]
}));

export const Session = pgTable('session', {
  sessionToken: varchar('sessionToken', { length: 255 }).primaryKey(),
  userId: varchar('userId', { length: 255 }).notNull().references(() => User.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { withTimezone: false }).notNull(),
});

export const VerificationToken = pgTable('verificationToken', {
  identifier: varchar('identifier', { length: 255 }).notNull(),
  token: varchar('token', { length: 255 }).notNull(),
  expires: timestamp('expires', { withTimezone: false }).notNull(),
}, (verificationToken) => ({
  primaryKey: [verificationToken.identifier, verificationToken.token]
}));

// Chat table to store conversation metadata
export const Chat = pgTable('chat', {
  id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
  createdAt: timestamp('createdAt', { withTimezone: false }),
  title: text('title'),
  userId: varchar('userId', { length: 255 }).references(() => User.id),
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