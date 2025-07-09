"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarHeaderProps {
  onNewChat?: () => void;
  onRefreshChats?: () => void;
}

export function SidebarHeader({ onNewChat, onRefreshChats }: SidebarHeaderProps) {
  const handleNewChat = () => {
    if (onNewChat) {
      onNewChat();
    }
    if (onRefreshChats) {
      onRefreshChats();
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-800">
      <h2 className="text-lg font-semibold">CybertraceAI</h2>
      <Button
        variant="outline"
        size="sm"
        onClick={handleNewChat}
        className="h-8 w-8 p-0 border-gray-600 hover:bg-gray-800"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}