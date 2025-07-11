import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getChatById, getChatMessages, updateChatTitle, deleteChat } from '@/lib/db/queries';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id!;
    const { id: chatId } = await params;

    // Get chat and verify ownership
    const chat = await getChatById(chatId);
    
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id!;
    const { id: chatId } = await params;
    const body = await request.json();
    const { title } = body;

    // Verify chat ownership
    const chat = await getChatById(chatId);
    if (!chat || chat.userId !== userId) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    const updatedChat = await updateChatTitle(chatId, title);
    
    return NextResponse.json(updatedChat[0]);
  } catch (error) {
    console.error('Error updating chat:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id!;
    const { id: chatId } = await params;

    // Verify chat ownership
    const chat = await getChatById(chatId);
    if (!chat || chat.userId !== userId) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    await deleteChat(chatId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting chat:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}