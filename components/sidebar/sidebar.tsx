"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarHeader } from "./sidebar-header";
import { ChatHistory } from "./chat-history";
import { ProfileSection } from "./profile-section";

interface SidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNewChat?: () => void;
  onSelectChat?: (chatId: string) => void;
  currentChatId?: string | null;
  refreshTrigger?: boolean;
}

export function Sidebar({ open, onOpenChange, onNewChat, onSelectChat, currentChatId, refreshTrigger: externalRefreshTrigger }: SidebarProps) {
  const [internalRefreshTrigger, setInternalRefreshTrigger] = useState(false);

  const handleRefreshChats = () => {
    setInternalRefreshTrigger(!internalRefreshTrigger);
  };

  // Combine internal and external refresh triggers
  const combinedRefreshTrigger = internalRefreshTrigger || externalRefreshTrigger;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-80 p-0 bg-gray-900 text-white border-r border-gray-800" hideCloseButton>
        <SheetTitle className="sr-only">Chat Sidebar</SheetTitle>
        <div className="flex flex-col h-full">
          <SidebarHeader onNewChat={onNewChat} onRefreshChats={handleRefreshChats} />
          
          <ScrollArea className="flex-1 px-3">
            <ChatHistory 
              refreshTrigger={combinedRefreshTrigger} 
              onSelectChat={onSelectChat}
              currentChatId={currentChatId}
            />
          </ScrollArea>
          
          <ProfileSection />
        </div>
      </SheetContent>
    </Sheet>
  );
}