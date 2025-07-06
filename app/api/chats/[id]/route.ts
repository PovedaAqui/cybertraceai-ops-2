import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { getChatById, getChatMessages, updateChatTitle, deleteChat } from '@/lib/db/queries';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Temporary: Skip authentication for development
    // TODO: Fix Auth0 compatibility with Next.js 15
    const userId = '550e8400-e29b-41d4-a716-446655440000'; // Valid UUID format
    const chatId = params.id;

    // Get chat and verify ownership
    const chat = await getChatById(chatId, userId);
    
    if (!chat || chat.userId !== userId) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    // Get messages for this chat
    const messages = await getChatMessages(chatId);
    
    return NextResponse.json({
      ...chat,
      messages,
    });
  } catch (error) {
    console.error('Error fetching chat:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Temporary: Skip authentication for development
    // TODO: Fix Auth0 compatibility with Next.js 15
    const userId = '550e8400-e29b-41d4-a716-446655440000'; // Valid UUID format
    const chatId = params.id;
    const body = await request.json();
    const { title } = body;

    // Verify chat ownership
    const chat = await getChatById(chatId, userId);
    if (!chat || chat.userId !== userId) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    const updatedChat = await updateChatTitle(chatId, title, userId);
    
    return NextResponse.json(updatedChat[0]);
  } catch (error) {
    console.error('Error updating chat:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Temporary: Skip authentication for development
    // TODO: Fix Auth0 compatibility with Next.js 15
    const userId = '550e8400-e29b-41d4-a716-446655440000'; // Valid UUID format
    const chatId = params.id;

    // Verify chat ownership
    const chat = await getChatById(chatId, userId);
    if (!chat || chat.userId !== userId) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    await deleteChat(chatId, userId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting chat:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}