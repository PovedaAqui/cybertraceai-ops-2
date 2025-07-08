'use client';

import { useSession } from 'next-auth/react';
import { useChat } from '@ai-sdk/react';
import { useEffect } from 'react';
import ChatInput from '@/components/ChatInput';
import MessagesList from '@/components/MessagesList';
import { AuthStatus } from '@/components/auth/auth-status';

export default function Chat() {
  const { data: session, status } = useSession();
  const { messages, append, status: chatStatus } = useChat({
    api: '/api/chat',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    onResponse: (response) => {
      console.log('🔄 Chat API Response:', response.status, response.statusText);
    },
    onFinish: (message) => {
      console.log('✅ Chat finished:', message);
    },
    onError: (error) => {
      console.error('❌ Chat error:', error);
    }
  });

  useEffect(() => {
    console.log('📊 Chat status changed:', chatStatus);
  }, [chatStatus]);

  useEffect(() => {
    console.log('💬 Messages updated:', messages.length, messages);
  }, [messages]);

  if (status === "loading") {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!session) {
    return (
      <div className="flex flex-col justify-center items-center h-screen max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">Welcome to CyberTrace AI</h1>
        <p className="text-gray-600 mb-8 text-center">
          Please sign in to start chatting with our AI assistant.
        </p>
        <AuthStatus />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-4xl py-24 mx-auto stretch">
      {/* Header with auth status */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b p-4 z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold">CyberTrace AI</h1>
          <AuthStatus />
        </div>
      </div>

      <MessagesList messages={messages} status={chatStatus} />

      {/* Chat input fixed at the bottom */}
      <div className="fixed bottom-0 w-full max-w-4xl mb-8">
        <ChatInput
          onSend={message => {
            if (!session) {
              console.error('❌ No session available');
              return;
            }
            console.log('📤 Sending message:', message);
            append({ role: 'user', content: message }).catch(error => {
              console.error('❌ Failed to send message:', error);
            });
          }}
        />
      </div>
    </div>
  );
}