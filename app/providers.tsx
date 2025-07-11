"use client";

import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      basePath="/${PROJECT_NAME}/api/auth"
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      {children}
    </SessionProvider>
  );
}
