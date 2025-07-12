"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="flex flex-col justify-center items-center h-screen max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-red-600">Authentication Error</h1>
      
      <p className="text-gray-600 mb-8 text-center">
        {error ? `Error: ${error}` : "An error occurred during authentication."}
      </p>
      
      <Link href="/auth/signin">
        <Button>Try Again</Button>
      </Link>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense fallback={
      <div className="flex flex-col justify-center items-center h-screen max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-red-600">Authentication Error</h1>
        <p className="text-gray-600 mb-8 text-center">Loading...</p>
        <Link href="/auth/signin">
          <Button>Try Again</Button>
        </Link>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}