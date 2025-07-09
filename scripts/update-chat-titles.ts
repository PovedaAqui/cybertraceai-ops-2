import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { generateChatTitle, shouldUpdateTitle } from '../lib/utils/chat-title';

const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client, { schema });

async function updateChatTitles() {
  console.log('🔍 Finding chats with generic titles...');
  
  try {
    // Find all chats with generic titles
    const chatsToUpdate = await db.query.Chat.findMany({
      where: schema.Chat.title,
      with: {
        messages: {
          orderBy: schema.Message.createdAt,
          limit: 1,
          where: eq(schema.Message.role, 'user')
        }
      }
    });

    console.log(`📊 Found ${chatsToUpdate.length} chats to check`);

    let updatedCount = 0;

    for (const chat of chatsToUpdate) {
      // Check if title should be updated
      if (shouldUpdateTitle(chat.title)) {
        // Get first user message
        const firstUserMessage = chat.messages.find(m => m.role === 'user');
        
        if (firstUserMessage && firstUserMessage.content) {
          const newTitle = generateChatTitle(firstUserMessage.content);
          
          // Update the chat title
          await db
            .update(schema.Chat)
            .set({ title: newTitle })
            .where(eq(schema.Chat.id, chat.id));
          
          console.log(`✅ Updated chat ${chat.id}: "${chat.title}" → "${newTitle}"`);
          updatedCount++;
        } else {
          console.log(`⚠️  Chat ${chat.id} has no user messages, keeping title: "${chat.title}"`);
        }
      }
    }

    console.log(`🎉 Updated ${updatedCount} chat titles`);
  } catch (error) {
    console.error('❌ Error updating chat titles:', error);
  } finally {
    await client.end();
  }
}

// Run the script
updateChatTitles();