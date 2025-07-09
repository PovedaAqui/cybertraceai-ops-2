'use client';

import { useSession } from 'next-auth/react';
import { useChat } from '@ai-sdk/react';
import { useEffect, useState } from 'react';
import ChatInput from '@/components/ChatInput';
import MessagesList from '@/components/MessagesList';
import { AuthStatus } from '@/components/auth/auth-status';
import { Sidebar } from '@/components/sidebar/sidebar';
import { SidebarToggle } from '@/components/sidebar/sidebar-toggle';

export default function Chat() {
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [refreshChatHistory, setRefreshChatHistory] = useState(false);
  const { messages, append, status: chatStatus, setMessages } = useChat({
    api: '/api/chat',
    id: currentChatId || undefined,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    onResponse: (response) => {
      console.log('🔄 Chat API Response:', response.status, response.statusText);
    },
    onFinish: (message) => {
      console.log('✅ Chat finished:', message);
      // Refresh chat history to update titles
      setRefreshChatHistory(!refreshChatHistory);
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

  const handleNewChat = async () => {
    try {
      console.log('🆕 Creating new chat...');
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ title: 'New Chat' }),
      });

      if (response.ok) {
        const newChat = await response.json();
        setCurrentChatId(newChat.id);
        setMessages([]);
        setRefreshChatHistory(!refreshChatHistory); // Trigger sidebar refresh
        console.log('✅ New chat created:', newChat.id);
      } else {
        console.error('❌ Failed to create new chat');
      }
    } catch (error) {
      console.error('❌ Error creating new chat:', error);
    }
  };

  const handleSelectChat = async (chatId: string) => {
    try {
      console.log('📂 Loading chat:', chatId);
      const response = await fetch(`/api/chats/${chatId}`);
      if (response.ok) {
        const chatData = await response.json();
        setCurrentChatId(chatId);
        setMessages(chatData.messages || []);
        setSidebarOpen(false); // Close sidebar on mobile
        console.log('✅ Chat loaded:', chatId);
      } else {
        console.error('❌ Failed to load chat:', chatId);
      }
    } catch (error) {
      console.error('❌ Error loading chat:', error);
    }
  };

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
    <div className="flex flex-col w-full h-screen">
      {/* Header with sidebar toggle */}
      <div className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-3 z-10">
        <div className="flex justify-start items-center">
          <SidebarToggle onToggle={() => setSidebarOpen(true)} />
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar 
        open={sidebarOpen} 
        onOpenChange={setSidebarOpen}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        currentChatId={currentChatId}
        refreshTrigger={refreshChatHistory}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col pt-14 pb-24 px-4 max-w-4xl mx-auto w-full">
        <MessagesList messages={messages} status={chatStatus} />
      </div>

      {/* Chat input fixed at the bottom */}
      <div className="fixed bottom-0 left-0 right-0 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
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
    </div>
  );
}