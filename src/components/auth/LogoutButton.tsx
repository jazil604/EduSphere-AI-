"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function LogoutButton() {
  const { isAuthenticated, logout, user } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Button
      className="w-full justify-between"
      onClick={() => {
        void logout();
      }}
      variant="secondary"
      type="button"
    >
      <span className="truncate">Sign out{user?.name ? `, ${user.name}` : ""}</span>
      <LogOut aria-hidden className="size-4" />
    </Button>
  );
}

