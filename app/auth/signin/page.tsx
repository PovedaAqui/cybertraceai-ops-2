"use client";

import { getProviders, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface Provider {
  id: string;
  name: string;
}

export default function SignIn() {
  const [providers, setProviders] = useState<Record<string, Provider> | null>(null);

  useEffect(() => {
    const setUpProviders = async () => {
      const response = await getProviders();
      setProviders(response);
    };
    setUpProviders();
  }, []);

  return (
    <div className="flex flex-col justify-center items-center h-screen max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-8">Sign In to CyberTrace AI</h1>
      
      {providers &&
        Object.values(providers).map((provider) => (
          <div key={provider.name} className="w-full mb-4">
            <Button
              onClick={() => signIn(provider.id)}
              className="w-full"
            >
              Sign in with {provider.name}
            </Button>
          </div>
        ))}
    </div>
  );
}