import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { getChatsByUser, createChat, getOrCreateUser } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    // Temporary: Skip authentication for development
    // TODO: Fix Auth0 compatibility with Next.js 15
    const userId = '550e8400-e29b-41d4-a716-446655440000'; // Valid UUID format
    const userEmail = 'temp@example.com';
    
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
    // Temporary: Skip authentication for development
    // TODO: Fix Auth0 compatibility with Next.js 15
    const userId = '550e8400-e29b-41d4-a716-446615440000'; // Valid UUID format
    const userEmail = 'temp@example.com';
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