"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarToggleProps {
  onToggle: () => void;
}

export function SidebarToggle({ onToggle }: SidebarToggleProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onToggle}
      className="h-8 w-8 p-0 border-gray-300 hover:bg-gray-50"
    >
      <Menu className="h-4 w-4" />
    </Button>
  );
}