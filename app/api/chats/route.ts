import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getChatsByUser, createChat, getOrCreateUser } from '@/lib/db/queries';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id!;
    const userEmail = session.user.email!;
    
    // Ensure user exists in database
    await getOrCreateUser(userId, userEmail);
    
    const chats = await getChatsByUser(userId);
    
    return NextResponse.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id!;
    const userEmail = session.user.email!;
    const body = await request.json();
    const { title } = body;

    // Ensure user exists in database
    await getOrCreateUser(userId, userEmail);
    
    const chat = await createChat(userId, title);
    
    return NextResponse.json(chat);
  } catch (error) {
    console.error('Error creating chat:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}