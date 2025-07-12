import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { getDb } from "./db";

export function createAuthOptions(): NextAuthOptions {
  return {
    adapter: DrizzleAdapter(getDb()),
    providers: [
      GoogleProvider({
        clientId: process.env.AUTH_GOOGLE_ID!,
        clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      }),
    ],
    session: {
      strategy: "database",
    },
    callbacks: {
      async session({ session, user }) {
        if (user && session.user) {
          session.user.id = user.id;
        }
        return session;
      },
    },
    pages: {
      signIn: "/auth/signin",
      error: "/auth/error",
    },
  };
}

// For backward compatibility, create lazy authOptions
export const authOptions: NextAuthOptions = new Proxy({} as NextAuthOptions, {
  get(target, prop) {
    const options = createAuthOptions();
    return options[prop as keyof NextAuthOptions];
  }
});