"use client";

import { useSession } from "next-auth/react";
import { SignInButton } from "./signin-button";
import { SignOutButton } from "./signout-button";

export function AuthStatus() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <span>Welcome, {session.user?.name || session.user?.email}</span>
        <SignOutButton />
      </div>
    );
  }

  return <SignInButton />;
}