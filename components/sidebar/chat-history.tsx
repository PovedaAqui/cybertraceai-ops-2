"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ChatItem } from "./chat-item";

interface Chat {
  id: string;
  title: string;
  createdAt: string;
  userId: string;
}

interface GroupedChats {
  "Last 7 days": Chat[];
  "Last 30 days": Chat[];
  "Older": Chat[];
}

interface ChatHistoryProps {
  refreshTrigger?: boolean;
  onSelectChat?: (chatId: string) => void;
  currentChatId?: string | null;
}

export function ChatHistory({ refreshTrigger, onSelectChat, currentChatId }: ChatHistoryProps) {
  const { data: session } = useSession();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchChats();
    }
  }, [session, refreshTrigger]);

  const fetchChats = async () => {
    try {
      const response = await fetch("/api/chats");
      if (response.ok) {
        const data = await response.json();
        setChats(data);
      }
    } catch (error) {
      console.error("Failed to fetch chats:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Remove the chat from the local state
        setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
        
        // If the deleted chat was the current chat, redirect to home
        if (currentChatId === chatId) {
          window.location.href = '/';
        }
      } else {
        console.error("Failed to delete chat");
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  const groupChatsByTime = (chats: Chat[]): GroupedChats => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const groups: GroupedChats = {
      "Last 7 days": [],
      "Last 30 days": [],
      "Older": []
    };

    chats.forEach((chat: Chat) => {
      const chatDate = new Date(chat.createdAt);
      if (chatDate >= sevenDaysAgo) {
        groups["Last 7 days"].push(chat);
      } else if (chatDate >= thirtyDaysAgo) {
        groups["Last 30 days"].push(chat);
      } else {
        groups["Older"].push(chat);
      }
    });

    return groups;
  };

  if (loading) {
    return (
      <div className="py-4">
        <div className="text-sm text-gray-400">Loading chats...</div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="py-4">
        <div className="text-sm text-gray-400">Please sign in to view chat history</div>
      </div>
    );
  }

  const groupedChats = groupChatsByTime(chats);

  return (
    <div className="py-4">
      {Object.entries(groupedChats).map(([period, periodChats]) => {
        if (periodChats.length === 0) return null;
        
        return (
          <div key={period} className="mb-6">
            <h3 className="text-xs font-medium text-gray-400 mb-2 px-2">
              {period}
            </h3>
            <div className="space-y-1">
              {periodChats.map((chat: Chat) => (
                <ChatItem 
                  key={chat.id} 
                  chat={chat} 
                  onSelect={onSelectChat}
                  onDelete={deleteChat}
                  isActive={currentChatId === chat.id}
                />
              ))}
            </div>
          </div>
        );
      })}
      
      {chats.length === 0 && (
        <div className="text-sm text-gray-400 px-2">
          No chat history yet. Start a new conversation!
        </div>
      )}
      
      {chats.length > 0 && (
        <div className="text-xs text-gray-500 px-2 mt-8">
          You have reached the end of your chat history.
        </div>
      )}
    </div>
  );
}