"use client";

import { MoreHorizontal, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Chat {
  id: string;
  title: string;
  createdAt: string;
  userId: string;
}

interface ChatItemProps {
  chat: Chat;
  onSelect?: (chatId: string) => void;
  onDelete?: (chatId: string) => void;
  isActive?: boolean;
}

export function ChatItem({ chat, onSelect, onDelete, isActive = false }: ChatItemProps) {
  const handleClick = () => {
    if (onSelect) {
      onSelect(chat.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(chat.id);
    }
  };

  const truncateTitle = (title: string, maxLength: number = 30) => {
    if (title.length <= maxLength) return title;
    return title.slice(0, maxLength) + "...";
  };

  return (
    <div
      onClick={handleClick}
      className={`
        px-2 py-2 rounded-md cursor-pointer transition-colors group flex items-center justify-between
        ${isActive 
          ? "bg-gray-800 text-white" 
          : "hover:bg-gray-800 text-gray-300"
        }
      `}
    >
      <div className="text-sm flex-1 min-w-0" title={chat.title}>
        {truncateTitle(chat.title)}
      </div>
      
      {onDelete && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-700 rounded-sm"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              variant="destructive"
              onClick={handleDelete}
              className="cursor-pointer"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}