"use client";

import { useSession } from "next-auth/react";
import { ChevronUp, LogOut, User, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignInButton } from "@/components/auth/signin-button";
import { signOut } from "next-auth/react";

export function ProfileSection() {
  const { data: session, status } = useSession();
  const { theme, toggleTheme } = useTheme();

  if (status === "loading") {
    return (
      <div className="p-4 border-t border-gray-800">
        <div className="text-sm text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-gray-700 text-gray-300">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="text-sm text-gray-300">Guest</div>
          </div>
          <SignInButton />
        </div>
      </div>
    );
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <div className="p-4 border-t border-gray-800">
      <DropdownMenu>
        <DropdownMenuTrigger className="w-full">
          <div className="flex items-center gap-3 w-full hover:bg-gray-800 p-2 rounded-md transition-colors">
            <Avatar className="h-8 w-8">
              <AvatarImage src={session.user.image || ""} />
              <AvatarFallback className="bg-gray-700 text-gray-300">
                {session.user.name?.charAt(0).toUpperCase() || 
                 session.user.email?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left">
              <div className="text-sm text-gray-300 truncate">
                {session.user.name || session.user.email}
              </div>
            </div>
            <ChevronUp className="h-4 w-4 text-gray-400" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-56 bg-gray-800 border-gray-700"
        >
          <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={toggleTheme}
            className="text-gray-300 hover:bg-gray-700"
          >
            {theme === "light" ? (
              <>
                <Moon className="mr-2 h-4 w-4" />
                Toggle dark mode
              </>
            ) : (
              <>
                <Sun className="mr-2 h-4 w-4" />
                Toggle light mode
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-gray-700" />
          <DropdownMenuItem 
            onClick={handleSignOut}
            className="text-gray-300 hover:bg-gray-700"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}